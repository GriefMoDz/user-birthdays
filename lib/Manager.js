const { join } = require('path')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const { SETTINGS_FOLDER } = require('powercord/constants')
const { Flux, FluxDispatcher } = require('powercord/webpack')
const birthdaysPath = join(SETTINGS_FOLDER, '/Birthdays.json')

if (!existsSync(logsPath)) {
   writeFileSync(logsPath, JSON.stringify(DefaultCache))
}

let birthdays = (() => {
   try {
      let data = JSON.parse(readFileSync(logsPath), 'utf8')

      return data
   } catch (e) {
      return {}
   }
})()

class SettingsStore extends Flux.Store {
   constructor(Dispatcher, handlers) {
      super(Dispatcher, handlers)

      this._persist = global._.debounce(this._persist.bind(this), 1000)
      this.addChangeListener(this._persist)
   }

   getBirthdays() {
      return birthdays
   }

   _persist() {
      let data = {}

      data = JSON.stringify(data, null, 3)

      writeFileSync(birthdaysPath, data)
   }
}

module.exports = new SettingsStore(FluxDispatcher)