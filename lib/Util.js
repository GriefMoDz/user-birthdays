const { React, getModule } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')

const DatePicker = require('../components/misc/DatePicker')
const DateUsers = require('../components/modals/DateUsers')

const moment = getModule(['createFromInputFallback'], false)

module.exports = class Util {
   static getDefaultMethodByKeyword(mdl, keyword) {
      const defaultMethod = mdl.__powercordOriginal_default ?? mdl.default
      return typeof defaultMethod === 'function' ? defaultMethod.toString().includes(keyword) : null
   }

   static openDateUsersModal(date) {
      date?.getTime && openModal(() =>
         React.createElement(DateUsers, {
            date: moment(date.getTime())
         })
      )
   }

   static openDatePicker(options) {
      return openModal(() =>
         React.createElement(DatePicker, {
            ...options
         })
      )
   }
}