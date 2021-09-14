const { React, getModule, i18n: { Messages } } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')

const BirthdayAlert = require('../components/modals/BirthdayAlert')
const DatePicker = require('../components/misc/DatePicker')
const DateUsers = require('../components/modals/DateUsers')

const ChannelStore = getModule(['openPrivateChannel'], false)
const moment = getModule(['createFromInputFallback'], false)
const { getUser } = getModule(['getUser'], false)

class Manager {
   constructor() {
      this.store = powercord.api.settings._fluxProps('Birthdays')

      this.birthdays = this.store.settings
      this.settings = powercord.api.settings._fluxProps('user-birthdays')
   }

   getBirthdays() {
      const settings = { ...this.birthdays }
      delete settings.dismissed
      return settings
   }

   getUser(user) {
      if (!user) throw 'No user provided!'

      if (typeof user == 'string') {
         return this.birthdays[user] ?? null
      } else if (user?.id) {
         return this.birthdays[user.id] ?? null
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
         this.store.updateSetting('dismissed', dismissed)
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

      if (
         birthday &&
         typeof birthday == 'number' &&
         (birthday = new Date(birthday)) &&
         date.getDate() == birthday.getDate() &&
         date.getMonth() == birthday.getMonth()
      ) return true

      return false
   }

   async check() {
      const { getSetting } = this.settings
      console.log(this.settings)
      const birthdays = this.getBirthdays()

      for (let user of Object.keys(birthdays)) {
         const year = moment().year()
         const isDismissed = this.getDismissed()[user] == year

         if (this.isBirthday(user) && !isDismissed) {
            user = await getUser(user).catch(() => null)
            if (!user) return

            const alertPopup = getSetting('alertPopup', true)
            const popupOnNonFocus = getSetting('popupOnNonFocus', true)
            const popupOnFocus = getSetting('popupOnFocus', true)
            const popupPlaySound = getSetting('popupPlaySound', true)

            const alertDesktop = getSetting('alertDesktop', true)
            const desktopOnNonFocus = getSetting('desktopOnNonFocus', true)
            const desktopOnFocus = getSetting('desktopOnFocus', false)

            const alertToasts = getSetting('alertToasts', false)
            const toastOnNonFocus = getSetting('toastOnNonFocus', false)
            const toastOnFocus = getSetting('toastOnFocus', false)
            const toastsPlaySound = getSetting('toastsPlaySound', false)

            if (alertPopup && ((document.hasFocus() && popupOnFocus) || (!document.hasFocus() && popupOnNonFocus))) {
               openModal(() =>
                  React.createElement(BirthdayAlert, {
                     manager: this,
                     user: user
                  })
               )
            }

            if (alertDesktop && ((document.hasFocus() && desktopOnFocus) || (!document.hasFocus() && desktopOnNonFocus))) {
               let notification = new Notification(Messages.UB_BIRTHDAY_DESKTOP_TITLE, {
                  body: Messages.UB_BIRTHDAY_ALERT_TEXT.format({ username: user.username }),
                  icon: user.getAvatarURL?.()
               })

               notification.onclick = () => this.addDismiss(user.id, moment().year())
            }

            const toasts = Object.keys(powercord.api.notices.toasts)
            if (
               !toasts.find(t => t == `ub-birthday-${user.id}`) && alertToasts &&
               ((document.hasFocus() && toastOnFocus) || (!document.hasFocus() && toastOnNonFocus))
            ) {
               powercord.api.notices.sendToast(`ub-birthday-${user.id}`, {
                  header: Messages.UB_BIRTHDAY_TOAST_TITLE,
                  content: Messages.UB_BIRTHDAY_ALERT_TEXT.format({ username: user.username }),
                  buttons: [
                     {
                        text: Messages.UB_BIRTHDAY_TOAST_OPEN_DM,
                        color: 'brand',
                        size: 'small',
                        look: 'outlined',
                        onClick: () => ChannelStore.openPrivateChannel(user.id)
                     },
                     {
                        text: Messages.UB_BIRTHDAY_ALERT_DISMISS_BUTTON,
                        color: 'red',
                        size: 'small',
                        look: 'outlined',
                        onClick: () => this.addDismiss(user.id, moment().year())
                     }
                  ]
               })
            }
         }
      }
   }

   openDatePicker(options = {
      avatars: true,
      minDate: moment().startOf('year'),
      maxDate: moment().endOf('year'),
      selected: new Date(),
      dateFormatCalendar: 'LLLL',
      onSelect: (v) => this.openDate(v)
   }) {
      return openModal(() =>
         React.createElement(DatePicker, {
            ...options,
            manager: this
         })
      )
   }

   openDate(date) {
      date?.getTime && openModal(() =>
         React.createElement(DateUsers, {
            date: moment(date.getTime()),
            manager: this
         })
      )
   }

   getDismissed() {
      return this.store.getSetting('dismissed', {})
   }
}

module.exports = new Manager()