const { React, getModuleByDisplayName, getModule } = require('powercord/webpack')
const { getUser } = getModule(['getUser', 'getCurrentUser'], false)
const Birthdays = require('../../lib/Manager')

const CalendarPicker = getModuleByDisplayName('CalendarPicker', false)
const VoiceUserSummaryItem = getModuleByDisplayName('VoiceUserSummaryItem', false)

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

               const fetched = birthdays.map(u => getUser(u))
               if (!Array.isArray(res)) res = [
                  <div className={fetched.length ? null : 'ub-date-number'}>
                     <p style={{ margin: '0' }} className='ub-date-number-p'>{res}</p>
                     <VoiceUserSummaryItem
                        className='ub-date-picker-birthday-users'
                        users={fetched}
                        max={3}
                     />
                  </div>
               ]

               return res
            }
         }

         return res
      }

      return res
   }
}