const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings')
const { Icon, Text } = require('powercord/components')
const { SettingsSections } = require('../../lib/Constants')
const Previews = require('./previews')

const { tabBar, tabBarItem } = getModule(['tabBar', 'tabBarItem'], false)

const TabBar = getModuleByDisplayName('TabBar', false)
const SettingsCard = require('./SettingsCard')
const FileInput = require('../misc/FileInput')
const PlainSwitch = require('./PlainSwitch')

const getLanguageKey = (key) => {
   return Messages[key]
}

module.exports = class Settings extends React.Component {
   constructor(props) {
      super(props)

      this.settings = powercord.api.settings._fluxProps('user-birthdays')

      this.state = {
         selectedTabItem: 'SETTINGS',
         currentSettingsSection: null
      }
   }

   renderSettings() {
      return Object.keys(SettingsSections).map(section => {
         const { name, icon, settings } = SettingsSections[section]

         return <SettingsCard
            buttonText='View Settings'
            hasNextSection={true}
            onButtonClick={() => this.setState({ currentSettingsSection: section })}
            name={name}
            details={[{ text: `${Object.keys(settings).length} ${Messages.SETTINGS}` }]}
            icon={(props) => <Icon name={icon} {...props} />}
         />
      })
   }

   renderCustomize() {
      const { getSetting, updateSetting } = this.settings

      return <>
         <TextInput
            defaultValue={getSetting('customMessage', 'Happy birthday!')}
            onChange={p => updateSetting('customMessage', !p ? 'Happy birthday!' : p)}
         >
            Customized message
         </TextInput>
         {(getSetting('popupPlaySound', false) || getSetting('toastsPlaySound', false)) &&
            <Text>Custom alert sounds are temporarily disabled due to unexpected behaviour.</Text>
            // <FileInput
            //    onFileSelect={(file) => {
            //       console.log(file)
            //    }}
            // >
            //    {Messages.UB_SETTINGS_CUSTOMIZE_TAB_SOUND_TITLE}
            // </FileInput>
         }
      </>
   }

   renderSectionSettings(section, custom = false) {
      const { getSetting, toggleSetting, updateSetting } = this.settings

      const elements = []

      let settings
      if (!custom) {
         settings = SettingsSections[section].settings
      } else {
         settings = section
      }

      Object.keys(settings).forEach(key => {
         const setting = settings[key]

         switch (setting.type) {
            case 'radio':
               return elements.push(<RadioGroup
                  options={setting.options}
                  note={getLanguageKey(`UB_RADIO_${setting.note.replace(/\%/gmi, '')}`)}
                  value={getSetting(key, setting.defaultValue)}
                  onChange={(e) => updateSetting(key, e.value)}
               >{getLanguageKey(`UB_RADIO_${setting.title.replace(/\%/gmi, '')}`)}</RadioGroup>)
            case 'switch':
               const Type = setting.preview ? PlainSwitch : SwitchItem
               const Component = (
                  <Type
                     note={getLanguageKey(`UB_SWITCH_${setting.note.replace(/\%/gmi, '')}`)}
                     value={getSetting(key, setting.defaultValue)}
                     manager={this}
                     setting={setting}
                     onChange={typeof setting.onChange === 'function' ? setting.onChange : () => toggleSetting(key, setting.defaultValue)}
                     disabled={typeof setting.disabled === 'function' ? setting.disabled() : setting.disabled}
                  >
                     {getLanguageKey(`UB_SWITCH_${setting.title.replace(/\%/gmi, '')}`)}
                  </Type>
               )

               if (setting.preview) {
                  const Preview = Previews[Object.keys(Previews).find(p => key.toLowerCase().includes(p.toLowerCase()))] || 'div'

                  return elements.push(
                     <div className='ub-settings-preview-card'>
                        <Preview setting={setting}>
                           {Component}
                        </Preview>
                     </div>
                  )
               } else {
                  return elements.push(Component)
               }
         }
      })

      return elements
   }

   renderContent() {
      const { selectedTabItem, currentSettingsSection } = this.state

      if (Object.keys(SettingsSections).includes(currentSettingsSection)) {
         return this.renderSectionSettings(currentSettingsSection)
      }

      if (selectedTabItem === 'SETTINGS')
         return this.renderSettings()
      else if (selectedTabItem === 'CUSTOMIZE')
         return this.renderCustomize()
   }

   render() {
      return (
         <React.Fragment>
            <TabBar
               className={['ub-settings-tab-bar', tabBar].filter(Boolean).join(' ')}
               selectedItem={this.state.selectedTabItem}
               onItemSelect={(item) => this.setState({ selectedTabItem: item, currentSettingsSection: null })}
               look={TabBar.Looks.BRAND}
               type={TabBar.Types.TOP}
            >
               <TabBar.Item className={tabBarItem} id='SETTINGS'>
                  {Messages.SETTINGS}
               </TabBar.Item>
               <TabBar.Item className={tabBarItem} id='CUSTOMIZE'>
                  {Messages.UB_SETTINGS_CUSTOMIZE_TAB}
               </TabBar.Item>
            </TabBar>

            {this.renderContent()}
         </React.Fragment>
      )
   }
}