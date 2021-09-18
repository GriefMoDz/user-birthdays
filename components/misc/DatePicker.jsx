const { React, getModuleByDisplayName, getModule } = require('powercord/webpack')
const { getUser } = getModule(['getUser', 'getCurrentUser'], false)

const BirthdayStore = require('../../lib/Store')

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
               const users = BirthdayStore.getBirthdays()
               const birthdays = Object.keys(users).map(userId =>
                  BirthdayStore.isBirthday(userId, new Date(date)) ? userId : null
               ).filter(Boolean)

               const fetched = birthdays.map(getUser).filter(Boolean)
               if (!Array.isArray(res)) res = [
                  <div className='ub-date-picker-day'>
                     <span className='ub-date-picker-number'>{res}</span>
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