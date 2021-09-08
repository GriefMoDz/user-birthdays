const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { SwitchItem, Category, TextInput, RadioGroup } = require('powercord/components/settings')
const { settings } = require('../../lib/Constants')

const { tabBar, tabBarItem } = getModule(['tabBar', 'tabBarItem'], false)

const TabBar = getModuleByDisplayName('TabBar', false)

const getLanguageKey = (key) => {
   return Messages[key]
}

module.exports = class Settings extends React.Component {
   constructor(props) {
      super(props)

      this.settings = powercord.api.settings._fluxProps('user-birthdays')

      this.state = {
         visibility: false
      }
   }

   render() {
      const { getSetting, updateSetting, toggleSetting } = this.settings
      const { visibility } = this.state

      return (
         <React.Fragment>
            <TabBar
               className={['ub-settings-tab-bar', tabBar].filter(Boolean).join(' ')}
               selectedItem='SETTINGS'
               look={TabBar.Looks.BRAND}
               type={TabBar.Types.TOP}
            >
               <TabBar.Item className={tabBarItem} id='SETTINGS'>
                  {Messages.SETTINGS}
               </TabBar.Item>
               <TabBar.Item className={tabBarItem} id='CUSTOMIZE'>
                  {Messages.UB_SETTINGS_CUSTOMIZE_TAB}
               </TabBar.Item>
               <TabBar.Item className={tabBarItem} id='MISC'>
                  {Messages.UB_SETTINGS_MISCELLANEOUS_TAB}
               </TabBar.Item>
            </TabBar>
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
                        note={getLanguageKey(`UB_SWITCH_${note.replace(/\%/gmi, '')}`)}
                     >
                        {getLanguageKey(`UB_SWITCH_${title.replace(/\%/gmi, '')}`)}
                     </SwitchItem>
                  )
               })}
            </Category>
            <TextInput
               defaultValue={getSetting('customMessage', 'Happy birthday!')}
               onChange={p => updateSetting('customMessage', !p ? 'Happy birthday!' : p)}
            >
               Customized message
            </TextInput>
         </React.Fragment>
      )
   }
}