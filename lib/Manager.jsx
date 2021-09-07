const { React, Flux, FluxDispatcher, getModule } = require('powercord/webpack')
const { open: openModal, close: closeModal } = require('powercord/modal')
const { SETTINGS_FOLDER } = require('powercord/constants')

const { existsSync, readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const { StoreEmitters } = require('./Constants')
const birthdaysPath = join(SETTINGS_FOLDER, '/Birthdays.json')

const BirthdayAlert = require('../components/alert/BirthdayAlert')

const { getUser } = getModule(['getUser'], false)

if (!existsSync(birthdaysPath)) {
   writeFileSync(birthdaysPath, JSON.stringify({}))
}

let birthdays = (() => {
   try {
      let data = JSON.parse(readFileSync(birthdaysPath), 'utf8')

      return data
   } catch (e) {
      return {}
   }
})()

class BirthdayStore extends Flux.Store {
   constructor(Dispatcher, handlers) {
      super(Dispatcher, handlers)

      this._persist = global._.debounce(this._persist.bind(this), 1000)
      this.addChangeListener(this._persist)

      StoreEmitters.forEach(e => {
         const old = this[e]
         this[e] = (...args) => {
            const res = old.bind(this)(...args)
            this.emitChange()
            return res
         }
      })
   }

   getBirthdays() {
      return birthdays
   }

   getUser(user) {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         return birthdays[user] ?? null
      } else if (user?.id) {
         return birthdays[user.id] ?? null
      }

      return null
   }

   setUser(user, birthday = Date.now()) {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         birthdays[user] = birthday
         return birthdays[user]
      } else if (user?.id) {
         birthdays[user.id] = birthday
         return birthdays[user.id]
      }

      return null
   }

   removeUser(user) {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         delete birthdays[user]
         return true
      } else if (user?.id) {
         delete birthdays[user.id]
         return true
      }

      return false
   }

   isBirthday(user) {
      if (!user) throw 'No user provided!'

      let birthday = this.getUser(user)

      if (birthday && typeof birthday == 'number' && (birthday = new Date(birthday))) {
         const today = new Date()

         if (
            today.getDate() == birthday.getDate() &&
            today.getMonth() == birthday.getMonth()
         ) {
            return true
         }
      }

      return false
   }

   async check() {
      const birthdays = this.getBirthdays()

      for (let user of Object.keys(birthdays)) {
         if (this.isBirthday(user)) {
            user = await getUser(user).catch(() => null)
            if (!user) return

            openModal(() =>
               <div style={{ width: '100%', height: '100%' }}>
                  <BirthdayAlert user={user} />
               </div>
            )
         }
      }
   }

   _persist() {
      console.log('Saved')
      writeFileSync(birthdaysPath, JSON.stringify(birthdays, null, 3))
   }
}

module.exports = new BirthdayStore(FluxDispatcher, {})