const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { Icon } = require('powercord/components')
const { close } = require('powercord/modal')

const { ConfettiCannon, ConfettiCanvas } = getModule(['ConfettiCannon'], false)
const { default: Button } = getModule(m => m.ButtonLink, false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)
const AppLayer = getModuleByDisplayName('AppLayer', false)
const CannonClasses = getModule(['cannonWrapper'], false)
const Header = getModuleByDisplayName('Header', false)

const Hat = require('../icons/svg/PartyHat')

module.exports = class BirthdayAlert extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         cannonRef: null,
         sentSuccess: Button.Colors.BRAND
      }

      this.ref = React.createRef()
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
            '#ff8c8a'
         ],
         fireCount: Infinity,
         count: 20,
         size: 10
      }

      return (
         <div className={CannonClasses.cannonWrapper} ref={this.ref}>
            {this.ref ? <ConfettiCanvas className={CannonClasses.cannon}>
               {(props) => <React.Fragment>
                  <ConfettiCannon
                     firing={true}
                     position={{
                        x: 0,
                        y: 50
                     }}
                     angle={160}
                     interval={100}
                     {...defaultProps}
                     {...props}
                  />
                  <ConfettiCannon
                     firing={true}
                     position={{
                        x: 100,
                        y: 50
                     }}
                     angle={-160}
                     interval={100}
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
      const defaultProps = {
         size: Button.Sizes.LARGE,
         look: Button.Looks.GHOST
      }

      return (
         <div className='user-birthday-alert-buttons'>
            <Button
               color={this.state.sentSuccess}
               onClick={() => {
                  if (this.state.sentSuccess == Button.Colors.GREEN) return
                  this.setState({ sentSuccess: Button.Colors.GREEN })
               }}
               {...defaultProps}
            >
               {this.state.sentSuccess == Button.Colors.BRAND ?
                  Messages.UB_BIRTHDAY_ALERT_SEND_BUTTON :
                  <Icon name='Checkmark' />
               }
            </Button>
            <Button
               color={Button.Colors.GREY}
               onClick={close}
               {...defaultProps}
            >
               {Messages.UB_BIRTHDAY_ALERT_DISMISS_BUTTON}
            </Button>
         </div>
      )
   }

   renderText() {
      return (
         <Header className='user-birthday-alert-text'>
            {Messages.UB_BIRTHDAY_ALERT_TEXT.format({ username: this.props.user.username })}
         </Header>
      )
   }
}
