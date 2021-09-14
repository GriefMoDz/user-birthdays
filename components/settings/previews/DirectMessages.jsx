const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const PrivateChannel = getModuleByDisplayName('PrivateChannel', false)
const { getCurrentUser } = getModule(['getCurrentUser'], false)
const { getActivities } = getModule(['getActivities'], false)
const Channel = getModule(m => m.prototype?.isDM, false)
const { getStatus } = getModule(['getStatus'], false)

module.exports = class DirectMessages extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <div>
            <PrivateChannel
               user={user}
               isOwner={true}
               isTyping={true}
               channel={new Channel({ type: 0 })}
               channelName={user.username}
               status={getStatus(user.id)}
               activities={getActivities(user.id)}
            />
            <Divider />
            {this.props.children}
         </div>
      )
   }
}