const { React, Flux, FluxDispatcher, getModule } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { SETTINGS_FOLDER } = require('powercord/constants')

const { existsSync, readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const { ActionTypes } = require('./Constants')
const birthdaysPath = join(SETTINGS_FOLDER, '/Birthdays.json')

const BirthdayAlert = require('../components/modals/BirthdayAlert')

const moment = getModule(['createFromInputFallback'], false)
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

      this.addChangeListener(this._persist.bind(this))
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
      FluxDispatcher.dispatch({
         type: ActionTypes.SET_USER,
         user,
         birthday
      })
   }

   removeUser(user) {
      FluxDispatcher.dispatch({
         type: ActionTypes.REMOVE_USER,
         user
      })
   }

   addDismiss(user, year) {
      FluxDispatcher.dispatch({
         type: ActionTypes.ADD_DISMISSED,
         user,
         year
      })
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
               <div style={{ width: '100%', height: '100%' }}>
                  <BirthdayAlert manager={this} user={user} />
               </div>
            )
         }
      }
   }

   getDismissed() {
      return birthdays['dismissed'] ?? {}
   }

   _persist() {
      writeFileSync(birthdaysPath, JSON.stringify(birthdays, null, 3))
   }
}

module.exports = new BirthdayStore(FluxDispatcher, {
   [ActionTypes.ADD_DISMISSED]: ({ user, year }) => {
      if (!birthdays['dismissed']) birthdays['dismissed'] = {}
      birthdays['dismissed'][user] = year
   },

   [ActionTypes.REMOVE_USER]: ({ user }) => {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         delete birthdays[user]
         delete birthdays['dismissed']?.[user]
         return true
      } else if (user?.id) {
         delete birthdays[user.id]
         delete birthdays['dismissed']?.[user.id]
         return true
      }

      return false
   },

   [ActionTypes.SET_USER]: ({ user, birthday }) => {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         birthdays[user] = birthday
         delete birthdays['dismissed']?.[user]
         return birthdays[user]
      } else if (user?.id) {
         birthdays[user.id] = birthday
         delete birthdays['dismissed']?.[user.id]
         return birthdays[user.id]
      }

      return null
   }
})