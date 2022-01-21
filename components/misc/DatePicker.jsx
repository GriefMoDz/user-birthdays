const { React, getModule, getModuleByDisplayName, i18n: { _chosenLocale } } = require('powercord/webpack')

const BirthdayStore = require('../../lib/Store')

const { default: DefaultCalendarPicker, default: { defaultProps } } = getModule(['CalendarContainer'], false)
const { getUser } = getModule(['getCurrentUser', 'getUser'], false)
const classes = getModule(['calendar'], false)

const VoiceUserSummaryItem = getModuleByDisplayName('VoiceUserSummaryItem', false)

const state = {}

module.exports = React.memo((props) => {
   const minDate = React.useMemo(() => props.minDate?.toDate?.() ?? void 0, [props.minDate])
   const maxDate = React.useMemo(() => props.maxDate?.toDate?.() ?? void 0, [props.maxDate])

   const datePickerRef = React.useRef(null)
   const customProps = global._.cloneDeep({
      ...props,
      calendarClassName: 'ub-date-picker',
      inline: true,
      fixedHeight: true,
      locale: _chosenLocale,
      minDate,
      maxDate
   })

   const preserveSelection = React.useCallback((newDate, callback) => {
      props.onSelect === null || props.onSelect(newDate, callback)
      state.lastSelectedDate = newDate
   }, [props.onSelect])

   if (props.preserveSelection) {
      customProps.onSelect = preserveSelection
      customProps.openToDate = state.lastSelectedDate

      delete state.lastSelectedDate
   }

   if (props.avatars) {
      customProps.calendarClassName += ' ub-date-picker-avatars'

      const __oldRenderDayContents = defaultProps.renderDayContents
      customProps.renderDayContents = (...args) => {
         let res = __oldRenderDayContents(...args)

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

   return <div className={classes.calendarPicker} ref={datePickerRef}>
      <DefaultCalendarPicker {...customProps} />
   </div>
})
