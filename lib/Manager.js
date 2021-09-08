const { React, getModule } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')

const BirthdayAlert = require('../components/modals/BirthdayAlert')

const moment = getModule(['createFromInputFallback'], false)
const { getUser } = getModule(['getUser'], false)

class Manager {
   constructor() {
      this.store = powercord.api.settings._fluxProps('Birthdays')

      this.settings = this.store.settings
   }

   getBirthdays() {
      const settings = { ...this.settings }
      delete settings.dismissed
      return settings
   }

   getUser(user) {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         return this.settings[user] ?? null
      } else if (user?.id) {
         return this.settings[user.id] ?? null
      }

      return null
   }

   setUser(user, birthday = Date.now()) {
      if (!user) throw 'No user provided!'

      const dismissed = this.store.getSetting('dismissed', {})
      if (typeof user == 'string') {
         this.store.updateSetting(user, birthday)
         delete dismissed[user]
         this.store.updateSetting('dismissed', dismissed)
         return true
      } else if (user?.id) {
         this.store.updateSetting(user.id, birthday)
         delete dismissed[user.id]
         this.store.updateSetting('dismissed', dismissed)
         return true
      }

      return false
   }

   removeUser(user) {
      if (!user) throw 'No user provided!'

      const dismissed = this.store.getSetting('dismissed', {})
      if (typeof user == 'string') {
         this.store.updateSetting(user)
         delete dismissed[user]
         this.store.updateSetting('dismissed', dismissed)
         return true
      } else if (user?.id) {
         this.store.updateSetting(user.id)
         delete dismissed[user.id]
         this.store.updateSetting(`dismissed`, dismissed)
         return true
      }

      return false
   }

   addDismiss(user, year) {
      const dismissed = this.store.getSetting('dismissed', {})
      dismissed[user] = year
      this.store.updateSetting('dismissed', dismissed)
   }

   isBirthday(user, date = new Date()) {
      if (!user) throw 'No user provided!'

      let birthday = this.getUser(user)

      if (birthday && typeof birthday == 'number' && (birthday = new Date(birthday))) {

         if (
            date.getDate() == birthday.getDate() &&
            date.getMonth() == birthday.getMonth()
         ) {
            return true
         }
      }

      return false
   }

   async check() {
      const birthdays = this.getBirthdays()

      for (let user of Object.keys(birthdays)) {
         if (this.isBirthday(user) && this.getDismissed()[user] != (moment().year())) {
            user = await getUser(user).catch(() => null)
            if (!user) return

            openModal(() =>
               React.createElement('div', {
                  style: {
                     width: '100%',
                     height: '100%'
                  }
               }, React.createElement(BirthdayAlert, {
                  manager: this,
                  user: user
               }))
            )
         }
      }
   }

   getDismissed() {
      return this.store.getSetting('dismissed', {})
   }
}

module.exports = new Manager()