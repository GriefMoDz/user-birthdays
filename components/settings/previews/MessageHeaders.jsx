const { React, getModule } = require('powercord/webpack')
const Lodash = window._

const Message = getModule(m => m.prototype?.getReaction && m.prototype.isSystemDM, false)
const { default: ChannelMessage } = getModule(['getElementFromMessageId'], false)
const { getCurrentUser } = getModule(['getCurrentUser'], false)
const Channel = getModule(m => m.prototype?.isDM, false)

const { Divider } = require('powercord/components')

module.exports = class MessageHeaders extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      return (
         <React.Fragment>
            <div className='ub-settings-message-header-preview'>
               <ChannelMessage
                  id={`chat-messages-user-birthdays-preview`}
                  groupId='user-birthdays-preview'
                  message={new Message({
                     id: 'user-birthdays-preview',
                     author: user,
                     content: 'This is a message header preview.'
                  })}
                  channel={new Channel({ id: 'user-birthdays-preview' })}
               />
            </div>
            <Divider />
            {this.props.children}
         </React.Fragment>
      )
   }
}