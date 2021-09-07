const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')

const { ConfettiCannon, ConfettiCanvas } = getModule(['ConfettiCannon'], false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)
const Button = getModule(m => m.ButtonLink, false).default
const CannonClasses = getModule(['cannonWrapper'], false)

const AppLayer = getModuleByDisplayName('AppLayer', false)
const Header = getModuleByDisplayName('Header', false)

module.exports = class BirthdayAlert extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         cannonRef: null
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
         sprites: ['/assets/b1d4c5e276e3aaa8ec41e6014dd572b2.svg'],
         colors: ['#FFC0FF', '#FFD836', '#FF9A15', '#A5F7DE', '#51BC9D', '#AEC7FF', '#3E70DD'],
         fireCount: 50,
         count: 10
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
         <div className='user-birthday-alert-avatar'>
            <AnimatedAvatar
               src={this.props.user.getAvatarURL()}
               size='SIZE_120'
            />
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
               color={Button.Colors.BRAND}
               onClick={() => void 0}
               {...defaultProps}
            >
               Send them a personalized message
            </Button>
            <Button
               color={Button.Colors.GREY}
               onClick={() => void 0}
               {...defaultProps}
            >
               Dismiss
            </Button>
         </div>
      )
   }

   renderText() {
      return (
         <Header className='user-birthday-alert-text'>
            It's eternal#1000's birthday today!
         </Header>
      )
   }
}
