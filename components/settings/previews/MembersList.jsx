const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const MemberListItem = getModuleByDisplayName('MemberListItem', false)
const { getCurrentUser } = getModule(['getCurrentUser'], false)
const { getActivities } = getModule(['getActivities'], false)
const { getStatus } = getModule(['getStatus'], false)

module.exports = class MembersList extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <div>
            <MemberListItem
               user={user}
               isOwner={true}
               isTyping={true}
               status={getStatus(user.id)}
               activities={getActivities(user.id)}
            />
            <Divider />
            {this.props.children}
         </div>
      )
   }
}