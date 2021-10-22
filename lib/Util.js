const { React, getModule } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')

const { PersonalizedMessageVariables: { modifiers, ...variables } } = require('./Constants')

const DatePicker = require('../components/misc/DatePicker')
const DateUsers = require('../components/modals/DateUsers')

const moment = getModule(['createFromInputFallback'], false)
const settings = powercord.api.settings._fluxProps('user-birthdays')

module.exports = class Util {
   static calculateAge(birthday) {
      if (!birthday) return null

      return moment().diff(birthday, 'years')
   }

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

   static getPersonalizedMessage(args) {
      let customMessage = settings.getSetting('customMessage', 'Happy birthday!')
      if (customMessage === '') customMessage = 'Happy birthday!'

      const singleVariableRegEx = /{[\w?: ]+}/
      const variableRegEx = /{(\w+)(?:\:(\w+))?}/gm
      const ternaryRegEx = /{(\w+)(?:\:(\w+))?(?: \? (.+) : ([^}]+}?))}/gm

      const variableValues = Object.keys(variables).reduce((variableValues, selector) => {
         const variable = variables[selector]

         if (selector === 'age') {
            const age = moment().diff(args.birthday, 'years')
            args.age = age
         }

         if (variable.predictor?.(args) === false) {
            return variableValues
         }

         const value = variable.callback?.(args)

         if (modifiers[selector]) {
            Object.keys(modifiers[selector]).forEach(modifier => {
               const modifierValue = modifiers[selector][modifier].callback?.(args)
               variableValues[`${selector}:${modifier}`] = modifierValue
            })
         }

         variableValues[selector] = value

         return variableValues
      }, {})

      const formatString = (string, skipTernaries) => {
         if (singleVariableRegEx.test(string)) {
            const variableMatches = [...string.matchAll(variableRegEx)].filter(([_, selector, modifier]) =>
               modifier ? modifiers[selector]?.[modifier] : variables[selector]
            )

            variableMatches.forEach(([match, selector, modifier]) => {
               const replacement = variableValues[modifier ? `${selector}:${modifier}` : selector]

               if (!replacement && variables[selector]?.emptyIfInvalid === true) {
                  string = string.replace(new RegExp(`( )?${match}( )?`), '$1')
               } else {
                  string = string.replace(match, replacement)
               }
            })

            if (skipTernaries) return string

            const ternaryMatches = [...string.matchAll(ternaryRegEx)].filter(([_, selector]) =>
               variables[selector]?.supportsTernary === true
            )

            ternaryMatches.forEach(([match, selector, modifier, ...replacements]) => {
               replacements = replacements.filter(Boolean)

               if (replacements.length === 2) {
                  const variableValue = variableValues[modifier ? `${selector}:${modifier}` : selector]
                  const replacement = variableValue ? replacements[0] : replacements[1]

                  string = string.replace(match, replacement === 'null' ? '' : formatString(replacement, true))
               }
            })
         }

         return string
      }

      return formatString(customMessage)
   }
}