const { React, getModuleByDisplayName, getModule } = require('powercord/webpack')
const CalendarPicker = getModuleByDisplayName('CalendarPicker', false)
const { getUser } = getModule(['getUser', 'getCurrentUser'], false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)
const Birthdays = require('../../lib/Manager')


module.exports = class DatePicker extends React.Component {
   render() {
      const res = <CalendarPicker {...this.props} />

      const old = res.type
      res.type = (...args) => {
         const res = old(...args)
         const picker = res.props.children
         picker.props = {
            ...picker.props,
            ...this.props
         }

         if (this.props.avatars) {
            picker.props.calendarClassName = 'ub-date-picker-avatars'

            const old = picker.props.renderDayContents
            picker.props.renderDayContents = (...args) => {
               let res = old(...args)

               const date = args[1].valueOf()
               const users = Birthdays.getBirthdays()
               const birthdays = Object.keys(users).map(user => {
                  if (Birthdays.isBirthday(user, new Date(date))) return user
                  return null
               }).filter(Boolean)

               if (!Array.isArray(res)) res = [
                  <div className='date-number'>
                     {res}
                  </div>
               ]
               const fetched = birthdays.map(u => getUser(u))
               res.push(...fetched.map(user =>
                  <AnimatedAvatar
                     src={user.getAvatarURL()}
                     size='SIZE_32'
                  />
               ))

               return res
            }
         }

         return res
      }

      return res
   }
}