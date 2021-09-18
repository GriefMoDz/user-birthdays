const { React, getModule, messages, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { Icon } = require('powercord/components')
const { close: closeModal } = require('powercord/modal')

const { ConfettiCannon, ConfettiCanvas } = getModule(['ConfettiCannon'], false)
const { default: Button } = getModule(m => m.ButtonLink, false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)

const AppLayer = getModuleByDisplayName('AppLayer', false)
const CannonClasses = getModule(['cannonWrapper'], false)
const Header = getModuleByDisplayName('Header', false)
const DM = getModule(['ensurePrivateChannel'], false)

const Hat = require('../icons/svg/PartyHat')

module.exports = class BirthdayAlert extends React.Component {
   constructor(props) {
      super(props)

      this.manager = props.manager
      this.settings = powercord.api.settings._fluxProps('user-birthdays')

      this.state = {
         cannonRef: null,
         sent: false,
         failed: false
      }

      this.ref = React.createRef()
   }

   componentWillUnmount() {
      if (this.props.remainingAlerts === 0) this.manager.alertSound?.pause?.()
   }

   render() {
      return (
         <AppLayer>
            <React.Fragment>
               <div className='user-birthday-alert-container'>
                  {this.renderAvatar()}
                  {this.renderText()}
                  {this.renderButtons()}
               </div>

               {this.renderConfetti()}
            </React.Fragment>
         </AppLayer>
      )
   }

   renderConfetti() {
      const defaultProps = {
         sprites: [
            ...Array(10).fill('/assets/b1d4c5e276e3aaa8ec41e6014dd572b2.svg'), // Boost icon
            '/assets/70275fe3104cf1d3388586ad8ffd478e.svg', // Triangle
            // '/assets/c6ce0010471b65c0faeda6c53ab297bd.svg', // Star
            // '/assets/e843c51c0eec3801b70cae5c45ad343f.svg', // Moon
            // '/assets/7d883ba72b5dbc0229f5d1980205ee34.svg' // Rectangle
         ],
         colors: [
            '#FFC0FF',
            '#FFD836',
            '#FF9A15',
            '#A5F7DE',
            '#51BC9D',
            '#AEC7FF',
            '#3E70DD',
            '#FF8C8A'
         ],
         fireCount: Infinity,
         interval: 100,
         firing: true,
         count: 20,
         size: 10
      }

      return (
         <div className={CannonClasses.cannonWrapper} ref={this.ref}>
            {this.ref ? <ConfettiCanvas className={CannonClasses.cannon}>
               {(props) => <React.Fragment>
                  <ConfettiCannon
                     position={{
                        x: 0,
                        y: 50
                     }}
                     angle={160}
                     {...defaultProps}
                     {...props}
                  />
                  <ConfettiCannon
                     position={{
                        x: 100,
                        y: 50
                     }}
                     angle={-160}
                     {...defaultProps}
                     {...props}
                  />
               </React.Fragment>}
            </ConfettiCanvas> : null}
         </div>
      )
   }

   renderAvatar() {
      return (
         <div style={{ textAlign: 'center' }}>
            <Hat className='user-birthday-alert-hat' width={250} height={250} />
            <div className='user-birthday-alert-avatar'>
               <AnimatedAvatar
                  src={this.props.user.getAvatarURL()}
                  size='SIZE_120'
               />
            </div>
         </div>
      )
   }

   renderButtons() {
      const { getSetting } = this.settings
      const { user } = this.props

      const defaultProps = {
         size: Button.Sizes.LARGE,
         look: Button.Looks.GHOST
      }

      return (
         <div className='user-birthday-alert-buttons'>
            <Button
               color={this.state.sent ? this.state.failed ? Button.Colors.RED : Button.Colors.GREEN : Button.Colors.BRAND}
               onClick={async () => {
                  if (this.state.sent) return

                  const dm = await DM.ensurePrivateChannel([user.id])
                  if (dm) {
                     const error = await messages.sendMessage(dm, {
                        content: getSetting('customMessage', 'Happy birthday!'),
                        invalidEmojis: [],
                        tts: false,
                        validNonShortcutEmojis: []
                     }).catch(() => null)

                     this.manager.dismissBirthday(user.id)

                     if (error?.ok) return this.setState({ sent: true })
                  }

                  this.setState({ sent: true, failed: true })
               }}
               {...defaultProps}
            >
               {this.state.sent == true ? this.state.failed ?
                  <Icon name='Close' /> : <Icon name='Checkmark' /> :
                  Messages.UB_BIRTHDAY_ALERT_SEND_BUTTON
               }
            </Button>
            <Button
               color={Button.Colors.GREY}
               onClick={() => {
                  this.manager.dismissBirthday(user.id)
                  closeModal()
               }}
               {...defaultProps}
            >
               {Messages.UB_BIRTHDAY_ALERT_DISMISS_BUTTON}
            </Button>
         </div>
      )
   }

   renderText() {
      const { username } = this.props.user
      return (
         <Header className='user-birthday-alert-text'>
            {Messages.UB_BIRTHDAY_ALERT_TEXT.format({ username })}
         </Header>
      )
   }
}
