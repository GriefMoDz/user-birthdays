const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const MemberListItem = getModuleByDisplayName('MemberListItem', false)
const { getCurrentUser } = getModule(['getNullableCurrentUser'], false)
const { getActivities } = getModule(['getActivities'], false)
const { getStatus } = getModule(['isMobileOnline'], false)

module.exports = class MembersList extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())

      return (
         <React.Fragment>
            <MemberListItem
               user={user}
               isOwner={true}
               isTyping={true}
               status={getStatus(user.id)}
               activities={getActivities(user.id)}
               forceBirthday={true}
            />
            <Divider />
            {this.props.children}
         </React.Fragment>
      )
   }
}