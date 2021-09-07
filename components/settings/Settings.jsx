const { React, i18n: { Messages } } = require('powercord/webpack')
const { SwitchItem, Category, TextInput, RadioGroup } = require('powercord/components/settings')
const { settings } = require('../../lib/Constants')

const getLanguageKey = (key) => {
   return Messages[key]
}

module.exports = class Settings extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         visibility: false
      }
   }

   render() {
      const { getSetting, updateSetting, toggleSetting } = this.props

      const { visibility } = this.state

      return (
         <Category
            name='Visibility'
            description='Manage the visibility of the birthday icon'
            opened={visibility}
            onChange={() => this.setState({ visibility: !visibility })}
         >
            {Object.entries(settings.visibility).map(([id, props]) => {
               const { title, note, defaultValue } = props

               return (
                  <SwitchItem
                     value={getSetting(id, defaultValue)}
                     onChange={() => toggleSetting(id, defaultValue)}
                     note={note}
                  >
                     {title}
                  </SwitchItem>
               )
            })}
         </Category>
      )
   }
}