const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { findInReactTree, getOwnerInstance } = require('powercord/util')
const { HeaderBar, Menu } = require('powercord/components')
const { inject, uninject } = require('powercord/injector')
const { close: closeModal } = require('powercord/modal')
const { Plugin } = require('powercord/entities')

const moment = getModule(['createFromInputFallback'], false)

const { getDefaultMethodByKeyword, openDatePicker, openDateUsersModal } = require('./lib/Util')
const { ComponentsToFix } = require('./lib/Constants')

const BirthdayStore = require('./lib/Store')
const Manager = require('./lib/Manager')
const i18n = require('./i18n')

const BirthdayIcon = require('./components/icons/Birthday')
const Settings = require('./components/settings/Settings')
const Cake = require('./components/icons/svg/Cake')

module.exports = class UserBirthdays extends Plugin {
   startPlugin() {
      this.settings = powercord.api.settings._fluxProps('user-birthdays')
      this.loadStylesheet('style.scss')

      powercord.api.i18n.loadAllStrings(i18n)
      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'User Birthdays',
         render: (props) => <Settings {...props} main={this} />
      })

      this.interval = setInterval(() => Manager.checkBirthdays(), 1.8e+6)
      this.store = BirthdayStore
      this.manager = Manager

      Manager.checkBirthdays()

      this.patchSettingsPage()
      this.patchBirthdayIcons()
      //this.patchContextMenus()
      this.patchToolbar()
   }

   async patchToolbar() {
      const HeaderBarContainer = getModuleByDisplayName('HeaderBarContainer', false)

      const _this = this
      this.patch('ub-header-bar', HeaderBarContainer.prototype, 'render', function (_, res) {
         const { getSetting } = _this.settings

         const toolbar = res.props.toolbar
         const isFriends = findInReactTree(this.props, r => r?.props?.children == Messages.FRIENDS)

         if (
            toolbar && getSetting('toolbarIcon', true) &&
            ((getSetting('friendsToolbarIcon', false) && isFriends) || !getSetting('friendsToolbarIcon', false))
         ) {
            const children = toolbar.props.children
            const index = children?.findIndex(i => i?.type?.displayName === 'RecentsButton')

            if (index > -1) children.splice(index, 0,
               <HeaderBar.Icon tooltip={Messages.UB_BIRTHDAYS_HEADER_TOOLTIP} icon={Cake} onClick={() => openDatePicker({
                  avatars: true,
                  preserveSelection: true,
                  minDate: moment().startOf('year'),
                  maxDate: moment().endOf('year'),
                  onSelect: (date) => openDateUsersModal(date)
               })} />
            )
         }

         return res
      })

      const classes = getModule(['title', 'chatContent'], false)
      const toolbar = document.querySelector(`.${classes.title}`)

      if (toolbar) {
         getOwnerInstance(toolbar)?.forceUpdate?.()
      }
   }

   patchBirthdayIcons() {
      const MessageHeader = getModule(m => getDefaultMethodByKeyword(m, 'showTimestampOnHover'), false)
      this.patch('ub-message-header1', MessageHeader, 'default', ([{ message: { author: user } }], res) => {
         const defaultProps = { user, location: 'message-headers' }
         const header = findInReactTree(res, n =>
            Array.isArray(n?.props?.children) &&
            n.props.children.find(c => c?.props?.message)
         )

         if (header?.props?.children?.[0]?.props) {
            header.props.children[0].props.user_birthdays = defaultProps
         }

         return res
      })

      const ConnectedBirthdayIcon = Flux.connectStores([powercord.api.settings.store, BirthdayStore], (props) => ({
         ...powercord.api.settings._fluxProps('user-birthdays'),
         isBirthday: props.user?.id ? BirthdayStore.isBirthday(props.user.id) : false
      }))(BirthdayIcon)

      const UsernameHeader = getModule(m => getDefaultMethodByKeyword(m, 'withMentionPrefix'), false)
      this.patch('ub-message-header2', UsernameHeader, 'default', ([{ user_birthdays: defaultProps }], res) => {
         if (defaultProps) {
            res.props.children.splice(2, 0, [
               <ConnectedBirthdayIcon {...defaultProps} forceBirthday={defaultProps.user?.forceBirthday} />
            ])
         }

         return res
      })

      ComponentsToFix.forEach(component => {
         const mdl = getModule(m => m.type?.displayName === component, false)
         if (mdl) {
            this.patch(`ub-message-header-fix-${component}`, mdl, 'type', (_, res) => {
               if (res.props.childrenHeader) {
                  res.props.childrenHeader.type.type = MessageHeader.default
               }

               return res
            })

            mdl.type.displayName = component
         }
      })

      const MemberListItem = getModuleByDisplayName('MemberListItem', false)
      this.patch('ub-member-list', MemberListItem.prototype, 'renderDecorators', function (_, res) {
         const defaultProps = { user: this.props.user, location: 'members-list' }

         res.props.children.unshift([
            <ConnectedBirthdayIcon {...defaultProps} forceBirthday={this.props.forceBirthday} />
         ])

         return res
      })

      const DiscordTag = getModule(m => m.default?.displayName === 'DiscordTag', false)
      this.patch('ub-name-tag1', DiscordTag, 'default', ([{ user }], res) => {
         res.props.user = user

         return res
      })

      DiscordTag.default.displayName = 'DiscordTag'

      const userStore = getModule(['getCurrentUser', 'getUser'], false)
      const NameTag = getModule(m => m.default?.displayName === 'NameTag', false)
      this.patch('ub-name-tag2', NameTag, 'default', ([props], res) => {
         const user = props.user || userStore.findByTag(props.name, props.discriminator)
         const defaultProps = { user, location: 'user-popout-modal' }

         if (props.className?.includes('discordTag')) defaultProps.location = 'friends-list'

         res.props.children.splice(2, 0, [
            <ConnectedBirthdayIcon {...defaultProps} forceBirthday={user?.forceBirthday} />
         ])

         return res
      })

      NameTag.default.displayName = 'NameTag'

      const PrivateChannel = getModuleByDisplayName('PrivateChannel', false)
      this.patch('ub-dm-channel', PrivateChannel.prototype, 'render', function (_, res) {
         if (!this.props.user) return res

         const defaultProps = { user: this.props.user, location: 'direct-messages' }
         const decorators = Array.isArray(res.props.decorators) ? res.props.decorators : [res.props.decorators]

         res.props.decorators = [
            <ConnectedBirthdayIcon {...defaultProps} forceBirthday={this.props.forceBirthday} />,
            ...decorators
         ]

         return res
      })
   }

   patchContextMenus() {
      const DMContextMenu = getModule(m => m.default?.displayName == 'DMUserContextMenu', false)
      this.patch('ud-context-menu-dm', DMContextMenu, 'default', this.processContextMenu.bind(this))
      DMContextMenu.default.displayName = 'DMUserContextMenu'

      const UserGenericContextMenu = getModule(m => m.default?.displayName == 'UserGenericContextMenu', false)
      this.patch('ud-context-menu-generic', UserGenericContextMenu, 'default', this.processContextMenu.bind(this))
      UserGenericContextMenu.default.displayName = 'UserGenericContextMenu'

      const GuildUserContextMenu = getModule(m => m.default?.displayName == 'GuildChannelUserContextMenu', false)
      this.patch('ud-context-menu-guild', GuildUserContextMenu, 'default', this.processContextMenu.bind(this))
      GuildUserContextMenu.default.displayName = 'GuildChannelUserContextMenu'
   }

   processContextMenu([args], res) {
      const user = args.user
      const noteGroup = findInReactTree(res, r => Array.isArray(r) && r.find(g => g?.props?.id == 'note'))

      if (user && noteGroup) {
         const index = noteGroup.findIndex(r => r?.props?.id == 'note')
         const birthday = BirthdayStore.getBirthday(user.id)

         const showToast = (type) => {
            const toasts = Object.keys(powercord.api.notices.toasts)

            if (!toasts.find(t => t == `ud-${type}-birthday`)) {
               powercord.api.notices.sendToast(`ud-${type}-birthday`, {
                  type: 'success',
                  timeout: 5000,
                  header: 'Success!',
                  content: `${Messages.UB_BIRTHDAY_TEXT} ${type}.`
               })
            }
         }

         const defaultDatePickerProps = {
            minDate: moment('1970-01-01'),
            maxDate: moment().endOf('year'),
            dropdownMode: 'select',
            showMonthDropdown: true,
            showYearDropdown: true
         }

         noteGroup.splice(index + 1, 0, birthday ?
            <Menu.MenuItem
               id='has-birthday'
               key='has-birthday'
               label={`${Messages.UB_BIRTHDAY_TEXT} (${moment(birthday).format('D MMM')})`}
            >
               <Menu.MenuItem
                  id='Edit-birthday'
                  key='Edit-birthday'
                  label={Messages.EDIT}
                  action={() =>
                     openDatePicker({
                        ...defaultDatePickerProps,
                        selected: new Date(birthday),
                        onSelect: (v) => {
                           closeModal()
                           Manager.setBirthday(user.id, v.valueOf())
                           showToast(Messages.MESSAGE_EDITED)
                        }
                     })
                  }
               />
               <Menu.MenuItem
                  id='remove-birthday'
                  key='remove-birthday'
                  label={Messages.REMOVE}
                  color='colorDanger'
                  action={() => Manager.removeBirthday(user.id)}
               />
            </Menu.MenuItem>
            :
            <Menu.MenuItem
               id='add-birthday'
               key='add-birthday'
               label={Messages.UB_ADD_BIRTHDAY}
               action={() =>
                  openDatePicker({
                     ...defaultDatePickerProps,
                     onSelect: (v) => {
                        closeModal()
                        showToast(Messages.UB_MESSAGE_ADDED)
                        Manager.setBirthday(user.id, v.valueOf())
                     }
                  })
               }
            />
         )
      }

      return res
   }


   async patchSettingsPage() {
      const ErrorBoundary = require('../pc-settings/components/ErrorBoundary')

      const FormSection = getModuleByDisplayName('FormSection', false)
      const SettingsView = await getModuleByDisplayName('SettingsView')
      this.patch('ub-settings-page', SettingsView.prototype, 'getPredicateSections', (_, sections) => {
         const changelog = sections.find(category => category.section === 'changelog')
         if (changelog) {
            const SettingsPage = sections.find(category => category.section === this.entityID)
            if (SettingsPage) {
               const SettingsElement = powercord.api.settings.tabs[this.entityID].render
               const getSectionTitle = () => (
                  <React.Fragment>
                     <Cake className='ub-settings-cake-icon' />
                     {this.manifest.name}
                  </React.Fragment>
               )

               SettingsPage.element = () => (
                  <ErrorBoundary>
                     <FormSection title={getSectionTitle()} tag='h1'>
                        <SettingsElement />
                     </FormSection>
                  </ErrorBoundary>
               )
            }
         }

         return sections
      })
   }

   pluginWillUnload() {
      if (this.interval) clearInterval(this.interval)
      for (const patch of this.patches ?? []) uninject(patch)
      powercord.api.settings.unregisterSettings(this.entityID)
      if (this.manager.alertSound) this.manager.alertSound.pause()
   }

   patch(...args) {
      if (!args || !args[0] || typeof args[0] !== 'string') return
      if (!this.patches) this.patches = []
      this.patches.push(args[0])
      return inject(...args)
   }
}
