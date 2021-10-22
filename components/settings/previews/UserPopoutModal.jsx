const { React, getModule } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const { getCurrentUser } = getModule(['getNullableCurrentUser'], false)
const { UserPopoutInfo, UserPopoutAvatar } = getModule(['UserPopoutInfo'], false)
const { UserBannerTypes, default: UserBanner } = getModule(['UserBannerTypes'], false)

module.exports = class UserPopoutModal extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <React.Fragment>
            <div className='ub-settings-user-popout-preview'>
               <UserBanner user={user} bannerType={UserBannerTypes.SETTINGS} allowEdit={false} />
               <UserPopoutAvatar user={user} disableUserProfileLink={true} />
               <UserPopoutInfo user={user} />
            </div>
            <Divider />
            {this.props.children}
         </React.Fragment>
      )
   }
}