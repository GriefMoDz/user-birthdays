const { React, getModuleByDisplayName, getModule } = require('powercord/webpack')
const CalendarPicker = getModuleByDisplayName('CalendarPicker', false)
const moment = getModule(['createFromInputFallback'], false)

module.exports = class DatePicker extends React.Component {
   render() {
      const res = <CalendarPicker {...this.props} />

      const old = res.type
      res.type = (...args) => {
         const res = old(...args)
         const picker = res.props.children

         console.log(picker.props)

         picker.props = {
            ...picker.props,
            ...this.props
         }


         return res
      }

      return res
   }
}