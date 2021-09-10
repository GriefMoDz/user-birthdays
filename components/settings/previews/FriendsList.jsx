const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const FriendRow = getModuleByDisplayName('FriendRow', false)
const { getCurrentUser } = getModule(['getCurrentUser'], false)
const { getActivities } = getModule(['getActivities'], false)
const { getStatus } = getModule(['getStatus'], false)

module.exports = class FriendsList extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <div className='ub-settings-friends-list-preview'>
            <FriendRow
               user={user}
               onContextMenu={() => { }}
               status={getStatus(user.id)}
               activities={getActivities(user.id)}
            />
            <Divider />
            {this.props.children}
         </div>
      )
   }
}