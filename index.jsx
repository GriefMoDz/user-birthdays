const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { close: closeModal } = require('powercord/modal')
const { findInReactTree, getOwnerInstance } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')
const { Plugin } = require('powercord/entities')

const moment = getModule(['createFromInputFallback'], false)
const { MenuItem } = getModule(['MenuItem'], false)

const { getDefaultMethodByKeyword } = require('./lib/Util')
const { ComponentsToFix } = require('./lib/Constants')
const Birthdays = require('./lib/Manager')
const i18n = require('./i18n')

const BirthdayIcon = require('./components/icons/Birthday')
const Settings = require('./components/settings/Settings')
const ToolbarIcon = require('./components/icons/Toolbar')
const Cake = require('./components/icons/svg/Cake')

module.exports = class UserBirthdays extends Plugin {
   startPlugin() {
      this.loadStylesheet('style.scss')
      powercord.api.i18n.loadAllStrings(i18n)

      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'User Birthdays',
         render: Settings
      })

      this.interval = setInterval(() => Birthdays.check(), 1.8e+6)
      this.manager = Birthdays
      Birthdays.check()

      this.patchSettingsPage()
      this.patchBirthdayIcons()
      this.patchContextMenus()
      this.patchToolbar()
   }

   async patchToolbar() {
      const HeaderBarContainer = getModule(m => m.default?.displayName == 'HeaderBarContainer', false)

      this.patch('ub-header-bar', HeaderBarContainer.default.prototype, 'render', (_, res) => {
         let toolbar = res.props.toolbar
         if (toolbar) {
            const children = toolbar.props.children
            const index = children?.indexOf(children.find(i => i?.type?.toString?.()?.includes('Unreads')))

            if (index > -1) children.splice(index, 0,
               <ToolbarIcon onClick={() => Birthdays.openDatePicker()} />
            )
         }

         return res
      })

      HeaderBarContainer.default.displayName = 'HeaderBarContainer'

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
         const header = findInReactTree(res, n => Array.isArray(n?.props?.children) && n.props.children.find(c => c?.props?.message))

         if (header?.props?.children?.[0]?.props) {
            header.props.children[0].props.user_birthdays = defaultProps
         }

         return res
      })

      const ConnectedBirthdayIcon = powercord.api.settings.connectStores('user-birthdays')(BirthdayIcon)

      const UsernameHeader = getModule(m => getDefaultMethodByKeyword(m, 'withMentionPrefix'), false)
      this.patch('ub-message-header2', UsernameHeader, 'default', ([{ user_birthdays: defaultProps }], res) => {
         if (defaultProps && (Birthdays.isBirthday(defaultProps.user) || defaultProps.user?.forceBirthday)) {
            res.props.children.splice(2, 0, [
               <ConnectedBirthdayIcon {...defaultProps} />
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

         if (Birthdays.isBirthday(this.props.user) || this.props.user?.forceBirthday) {
            res.props.children.unshift([
               <ConnectedBirthdayIcon {...defaultProps} />
            ])
         }

         return res
      })

      const DiscordTag = getModule(m => m.default?.displayName === 'DiscordTag', false)
      this.patch('ub-name-tag1', DiscordTag, 'default', ([{ user }], res) => {
         res.props.user = user

         return res
      })

      DiscordTag.default.displayName = 'DiscordTag'

      const NameTag = getModule(m => m.default?.displayName === 'NameTag', false)
      this.patch('ub-name-tag2', NameTag, 'default', ([props], res) => {
         const user = props.user || userStore.findByTag(props.name, props.discriminator)
         const defaultProps = { user, location: 'user-popout-modal' }

         if (props.className.includes('discordTag')) defaultProps.location = 'friends-list'

         if (Birthdays.isBirthday(user) || user?.forceBirthday) {
            res.props.children.splice(2, 0, [
               <ConnectedBirthdayIcon {...defaultProps} />
            ])
         }

         return res
      })

      NameTag.default.displayName = 'NameTag'

      const PrivateChannel = getModuleByDisplayName('PrivateChannel', false)
      this.patch('ub-dm-channel', PrivateChannel.prototype, 'render', function (_, res) {
         if (!this.props.user) {
            return res
         }

         if (Birthdays.isBirthday(this.props.user) || this.props.user?.forceBirthday) {
            const defaultProps = { user: this.props.user, location: 'direct-messages' }

            const old = res.props.decorators
            res.props.decorators = [
               <ConnectedBirthdayIcon {...defaultProps} />
            ]

            if (old) res.props.decorators.push(...old)
         }

         return res
      })
   }

   patchContextMenus() {
      const DMContextMenu = getModule(m => m.default?.displayName == 'DMUserContextMenu', false)
      this.patch('ud-context-menu-dm', DMContextMenu, 'default', this.processContextMenu.bind(this))
      DMContextMenu.default.displayName = 'DMUserContextMenu'

      const GuildUserContextMenu = getModule(m => m.default?.displayName == 'GuildChannelUserContextMenu', false)
      this.patch('ud-context-menu-guild', GuildUserContextMenu, 'default', this.processContextMenu.bind(this))
      GuildUserContextMenu.default.displayName = 'GuildChannelUserContextMenu'
   }

   processContextMenu([args], res) {
      const user = args.user
      const note = findInReactTree(res, r => Array.isArray(r) && r.find(g => g?.props?.id == 'note'))

      if (user && note) {
         const index = note.indexOf(note.find(r => r?.props?.id == 'note'))
         const hasBday = Birthdays.getUser(user.id)

         const toast = (type) => {
            const toasts = Object.keys(powercord.api.notices.toasts)

            if (!toasts.find(t => t == `ud-${type}-birthday`)) {
               powercord.api.notices.sendToast(`ud-${type}-birthday`, {
                  type: 'success',
                  timeout: 5000,
                  header: 'Success',
                  content: `Birthday ${type}.`
               })
            }
         }

         note.splice(index + 1, 0, hasBday ?
            <MenuItem
               id='has-birthday'
               key='has-birthday'
               label={`Birthday (${moment(hasBday).format('D MMM')})`}
            >
               <MenuItem
                  id='Edit-birthday'
                  key='Edit-birthday'
                  label='Edit'
                  action={() =>
                     Birthdays.openDatePicker({
                        avatars: false,
                        selected: new Date(hasBday),
                        onSelect: (v) => {
                           closeModal()
                           Birthdays.setUser(user.id, v.valueOf())
                           toast('edited')
                        }
                     })
                  }
               />
               <MenuItem
                  id='remove-birthday'
                  key='remove-birthday'
                  label='Remove'
                  color='colorDanger'
                  action={() => Birthdays.removeUser(user.id)}
               />
            </MenuItem>
            :
            <MenuItem
               id='add-birthday'
               key='add-birthday'
               label='Add birthday'
               action={() =>
                  Birthdays.openDatePicker({
                     onSelect: (v) => {
                        closeModal()
                        toast('added')
                        Birthdays.setUser(user.id, v.valueOf())
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
      const SettingsView = getModuleByDisplayName('SettingsView', false)
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
   }

   patch(...args) {
      if (!args || !args[0] || typeof args[0] !== 'string') return
      if (!this.patches) this.patches = []
      this.patches.push(args[0])
      return inject(...args)
   }

   unpatch(id) {
      uninject(id)
      if (!this.patches) return
      let index = this.patches.indexOf(id)
      if (!index) return
      return this.patches.splice(index, 1)
   }
}
