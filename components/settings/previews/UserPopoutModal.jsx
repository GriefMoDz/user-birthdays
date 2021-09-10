const { React, getModule } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const { getCurrentUser } = getModule(['getCurrentUser'], false)
const { UserPopoutInfo, UserPopoutAvatar } = getModule(['UserPopoutInfo'], false)

module.exports = class UserPopoutModal extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <div className='ub-settings-user-popout-preview'>
            <UserPopoutAvatar user={user} />
            <UserPopoutInfo user={user} />
            <Divider />
            {this.props.children}
         </div>
      )
   }
}