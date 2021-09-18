const { React, FluxDispatcher, getModule, i18n: { Messages } } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { FluxActions } = require('./Constants')

const BirthdayStore = require('./Store')
const BirthdayAlert = require('../components/modals/BirthdayAlert')

const ChannelStore = getModule(['openPrivateChannel'], false)
const { getUser } = getModule(['getUser'], false)

const settings = powercord.api.settings._fluxProps('user-birthdays')
const birthdaySettings = powercord.api.settings._fluxProps('Birthdays')
const customAlertSettings = powercord.api.settings._fluxProps('user-birthdays-custom-alert')

const dismissedBirthdays = birthdaySettings.getSetting('dismissed', {})

class Manager {
   constructor() {
      this.state = { isAlertPlaying: false }

      const alertSoundBase64 = customAlertSettings.getSetting('file', '')
      if (alertSoundBase64.length === 0)
         settings.updateSetting('alertSound', '')
      else {
         this.alertSound = new Audio(alertSoundBase64)
         this.alertSound.volume = 0.1
         this.alertSound.onplay = () => this.state.isAlertPlaying = true
         this.alertSound.onpause = () => this.state.isAlertPlaying = false
         this.alertSound.onended = () => this.state.isAlertPlaying = false
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
      const birthdays = Object.keys(BirthdayStore.getBirthdays()).filter(userId =>
         BirthdayStore.isBirthday(userId) && !BirthdayStore.isBirthdayDismissed(userId)
      )

      for (const userId of birthdays) {
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

         if (alertPopup && ((document.hasFocus() && popupOnFocus) || (!document.hasFocus() && popupOnNonFocus))) {
            if (popupPlaySound) this.playAlertSound()

            openModal(() =>
               React.createElement(BirthdayAlert, {
                  remainingAlerts: birthdays.indexOf(userId) - 1,
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
                     onClick: () => this.dismissBirthday(user.id, moment().year())
                  }
               ],
               callback: () => this.alertSound?.pause?.()
            })
         }
      }
   }

   playAlertSound() {
      if (this.state.isAlertPlaying) return

      const alertSound = customAlertSettings.getSetting('file', '')
      if (this.alertSound?.src !== alertSound) this.alertSound.src = alertSound

      this.alertSound.play()
   }
}

module.exports = new Manager()
