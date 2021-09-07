const { React, getModuleByDisplayName } = require('powercord/webpack')
const CalendarPicker = getModuleByDisplayName('CalendarPicker', false)

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


         return res
      }

      return res
   }
}