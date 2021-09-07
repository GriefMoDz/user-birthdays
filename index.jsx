const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const { findInReactTree, sleep } = require('powercord/util')
const { Plugin } = require('powercord/entities')
const { open: openModal, close: closeModal } = require('powercord/modal')

const { getDefaultMethodByKeyword } = require('./lib/Util')
const i18n = require('./i18n')

const BirthdayAlert = require('./components/alert/BirthdayAlert')
const BirthdayIcon = require('./components/icons/Birthday')
const Settings = require('./components/settings/Settings')

module.exports = class UserBirthdays extends Plugin {
   async startPlugin() {
      this.loadStylesheet('style.scss')
      await sleep(1000)
      openModal(() => {
         return (
            <div style={{ "width": "100%", "height": "100%" }}>
               <BirthdayAlert user={getModule(['getCurrentUser'], false).getCurrentUser()} />
            </div>
         )
      })
      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'User Birthdays',
         render: Settings
      })

      powercord.api.i18n.loadAllStrings(i18n)

      const MessageHeader = getModule(m => getDefaultMethodByKeyword(m, 'showTimestampOnHover'), false)
      this.patch('ub-message-header1', MessageHeader, 'default', ([{ message: { author: user } }], res) => {
         const defaultProps = { user, location: 'message-headers' }
         const usernameHeader = findInReactTree(res, n => Array.isArray(n?.props?.children) && n.props.children.find(c => c?.props?.message))

         if (usernameHeader?.props?.children && usernameHeader?.props?.children[0] && usernameHeader?.props?.children[0].props) {
            usernameHeader.props.children[0].props.__ubDefaultProps = defaultProps
         }

         return res
      })

      const ConnectedBirthdayIcon = this.settings.connectStore(BirthdayIcon)

      const UsernameHeader = getModule(m => getDefaultMethodByKeyword(m, 'withMentionPrefix'), false)
      this.patch('ub-message-header2', UsernameHeader, 'default', ([{ __ubDefaultProps: defaultProps }], res) => {
         res.props.children.splice(2, 0, [
            <ConnectedBirthdayIcon {...defaultProps} />]
         )

         return res
      });

      ['ChannelMessage', 'InboxMessage'].forEach(component => {
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
            <ConnectedBirthdayIcon {...defaultProps} />
         ])

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

         res.props.children.splice(2, 0, [
            <ConnectedBirthdayIcon {...defaultProps} />
         ])

         return res
      })

      NameTag.default.displayName = 'NameTag'

      const PrivateChannel = getModuleByDisplayName('PrivateChannel', false)
      this.patch('ub-dm-channel', PrivateChannel.prototype, 'render', function (_, res) {
         if (!this.props.user) {
            return res
         }

         const defaultProps = { user: this.props.user, location: 'direct-messages' }

         const old = res.props.decorators
         res.props.decorators = [
            <ConnectedBirthdayIcon {...defaultProps} />
         ]

         if (old) res.props.decorators.push(...old)

         return res
      })
   }

   pluginWillUnload() {
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
