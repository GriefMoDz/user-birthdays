const { React, FluxDispatcher, getModule, i18n: { Messages } } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { FluxActions } = require('./Constants')

const BirthdayStore = require('./Store')
const BirthdayAlert = require('../components/modals/BirthdayAlert')

const humanize = getModule(['humanize'], false)
const ChannelStore = getModule(['openPrivateChannel'], false)
const { getUser } = getModule(['getCurrentUser', 'getUser'], false)

const settings = powercord.api.settings._fluxProps('user-birthdays')
const birthdaySettings = powercord.api.settings._fluxProps('Birthdays')
const customAlertSettings = powercord.api.settings._fluxProps('user-birthdays-custom-alert')

const dismissedBirthdays = birthdaySettings.getSetting('dismissed', {})

class Manager {
   constructor() {
      this.state = {
         isAlertPlaying: false,
         remainingAlerts: 0
      }

      const alertSoundBase64 = customAlertSettings.getSetting('file', '')
      if (alertSoundBase64.length === 0) {
         settings.updateSetting('alertSound', '')
      } else {
         this.loadAlertSound()
      }
   }

   setBirthday(userId, date = Date.now()) {
      birthdaySettings.updateSetting(userId, date)

      delete dismissedBirthdays[userId]
      birthdaySettings.updateSetting('dismissed', dismissedBirthdays)

      FluxDispatcher.dirtyDispatch({
         type: FluxActions.BIRTHDAY_SET,
         userId,
         date
      })
   }

   removeBirthday(userId) {
      birthdaySettings.updateSetting(userId)

      delete dismissedBirthdays[userId]
      birthdaySettings.updateSetting('dismissed', dismissedBirthdays)

      FluxDispatcher.dirtyDispatch({
         type: FluxActions.BIRTHDAY_REMOVE,
         userId
      })
   }

   dismissBirthday(userId, year = new Date().getFullYear()) {
      dismissedBirthdays[userId] = year
      birthdaySettings.updateSetting('dismissed', dismissedBirthdays)

      FluxDispatcher.dirtyDispatch({
         type: FluxActions.BIRTHDAY_DISMISS,
         userId,
         year
      })
   }

   async checkBirthdays() {
      const { getSetting } = settings
      const birthdays = Object.entries(BirthdayStore.getBirthdays()).filter(([userId]) =>
         BirthdayStore.isBirthday(userId) && !BirthdayStore.isBirthdayDismissed(userId)
      )

      for (const [userId, birthday] of birthdays) {
         const user = await getUser(userId).catch(() => null)
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

         const birthdayYear = new Date(birthday).getFullYear()
         const currentYear = new Date().getFullYear()

         const age = birthdayYear <= (currentYear - 13) ? currentYear - birthdayYear : null
         const message = age
            ? Messages.UB_BIRTHDAY_ALERT_WITH_AGE_TEXT.format({ username: user.username, age: humanize.ordinal(age)})
            : Messages.UB_BIRTHDAY_ALERT_TEXT.format({ username: user.username })

         if (alertPopup && ((document.hasFocus() && popupOnFocus) || (!document.hasFocus() && popupOnNonFocus))) {
            if (popupPlaySound) this.playAlertSound()

            this.state.remainingAlerts += 1

            const currentAlertIndex = Object.keys(Object.fromEntries(birthdays)).indexOf(userId)

            openModal(() =>
               React.createElement(BirthdayAlert, {
                  message,
                  currentAlertIndex,
                  manager: this,
                  birthday,
                  user
               })
            )
         }

         if (alertDesktop && ((document.hasFocus() && desktopOnFocus) || (!document.hasFocus() && desktopOnNonFocus))) {
            let notification = new Notification(Messages.UB_BIRTHDAY_DESKTOP_TITLE, {
               body: message,
               icon: user.getAvatarURL?.()
            })

            notification.onclick = () => this.dismissBirthday(user.id)
         }

         const toasts = Object.keys(powercord.api.notices.toasts)
         if (
            !toasts.find(t => t == `ub-birthday-${user.id}`) && alertToasts &&
            ((document.hasFocus() && toastOnFocus) || (!document.hasFocus() && toastOnNonFocus))
         ) {
            if (toastsPlaySound) this.playAlertSound()

            powercord.api.notices.sendToast(`ub-birthday-${user.id}`, {
               header: Messages.UB_BIRTHDAY_TOAST_TITLE,
               content: message,
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
                     onClick: () => this.dismissBirthday(user.id)
                  }
               ],
               callback: () => this.alertSound?.pause?.()
            })
         }
      }
   }

   loadAlertSound() {
      const alertSound = customAlertSettings.getSetting('file', '')
      if (alertSound.length === 0) return

      if (this.alertSound && this.alertSound.src !== alertSound) return this.alertSound.src = alertSound

      this.alertSound = new Audio(alertSound)
      this.alertSound.volume = 0.1
      this.alertSound.onplay = () => this.state.isAlertPlaying = true
      this.alertSound.onpause = () => this.state.isAlertPlaying = false
      this.alertSound.onended = () => this.state.isAlertPlaying = false
   }

   playAlertSound() {
      if (this.state.isAlertPlaying || !this.alertSound) return

      this.alertSound.play()
   }
}

module.exports = new Manager()
