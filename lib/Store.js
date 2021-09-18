const { Flux, FluxDispatcher } = require('powercord/webpack')
const { FluxActions } = require('./Constants')

const birthdays = powercord.api.settings._fluxProps('Birthdays').settings

/* Action Handlers */
function handleSetBirthday(userId, date) {
   if (!userId) throw 'Missing user id!'

   birthdays[userId] = date
   delete birthdays.dismissed[userId]
}

function handleRemoveBirthday(userId) {
   if (!userId) throw 'Missing user id!'

   delete birthdays[userId]
   delete birthdays.dismissed[userId]
}

function handleDismissBirthday(userId, year) {
   birthdays.dismissed[userId] = year
}

class BirthdayStore extends Flux.Store {
   getBirthdays() {
      return Object.keys(birthdays).filter(key => key !== 'dismissed').reduce((newBirthdays, userId) => {
         return ({ [userId]: birthdays[userId], ...newBirthdays })
      }, {})
   }

   getBirthday(userId) {
      if (!userId) return console.error('Missing user id!')

      return this.getBirthdays()[userId] ?? null
   }

   isBirthdayDismissed(userId, year = new Date().getFullYear()) {
      return birthdays.dismissed[userId] == year
   }

   isBirthday(userId, date = new Date()) {
      if (!userId) return console.error('Missing user id!')

      let birthday = this.getBirthday(userId)
      if (birthday && typeof birthday == 'number') {
         birthday = new Date(birthday);

         return date.getDate() == birthday.getDate() && date.getMonth() == birthday.getMonth()
      }

      return false
   }
}

module.exports = new BirthdayStore(FluxDispatcher, {
   [FluxActions.BIRTHDAY_SET]: ({ userId, date }) => handleSetBirthday(userId, date),
   [FluxActions.BIRTHDAY_REMOVE]: ({ userId }) => handleRemoveBirthday(userId),
   [FluxActions.BIRTHDAY_DISMISS]: ({ userId, year }) => handleDismissBirthday(userId, year)
})
