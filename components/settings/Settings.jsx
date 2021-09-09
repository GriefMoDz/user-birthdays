const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { SwitchItem, TextInput, RadioGroup } = require('powercord/components/settings')
const { Icon } = require('powercord/components')
const { SettingsSections } = require('../../lib/Constants')

const { tabBar, tabBarItem } = getModule(['tabBar', 'tabBarItem'], false)

const TabBar = getModuleByDisplayName('TabBar', false)
const SettingsCard = require('./SettingsCard')

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
            onButtonClick={() => this.setState({ currentSettingsSection: section })}
            name={name}
            details={[ { text: `${Object.keys(settings).length} ${Messages.SETTINGS}` } ]}
            icon={(props) => React.createElement(Icon, { name: icon, ...props })}
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
      </>
   }

   renderMiscellaneous() {
      const { getSetting, toggleSetting } = this.settings

      return <>
         {/* <SwitchItem
            value={getSetting('hideHeaderBarIcon', false)}
            onChange={() => toggleSetting('hideHeaderBarIcon', false)}
            note='Removes the cake icon within the header bar.'
         >
            Hide Header Bar Icon
         </SwitchItem> */}
      </>
   }

   renderSectionSettings(section) {
      const { getSetting, toggleSetting, updateSetting } = this.settings

      const elements = []
      const { settings } = SettingsSections[section]

      Object.keys(settings).forEach(key => {
        const setting = settings[key]

        switch (setting.type) {
          case 'radio':
            return elements.push(React.createElement(RadioGroup, {
              options: setting.options,
              note: getLanguageKey(`UB_RADIO_${setting.note.replace(/\%/gmi, '')}`),
              value: getSetting(key, setting.defaultValue),
              onChange: (e) => updateSetting(key, e.value)
            }, getLanguageKey(`UB_RADIO_${setting.title.replace(/\%/gmi, '')}`)))
          case 'switch':
            elements.push(React.createElement(SwitchItem, {
              note: getLanguageKey(`UB_SWITCH_${setting.note.replace(/\%/gmi, '')}`),
              value: getSetting(key, setting.defaultValue),
              onChange: typeof setting.onChange === 'function' ? setting.onChange : () => toggleSetting(key, setting.defaultValue),
              disabled: setting.disabled !== void 0
                ? (typeof setting.disabled === 'function' ? setting.disabled() : setting.disabled)
                : false
            }, getLanguageKey(`UB_SWITCH_${setting.title.replace(/\%/gmi, '')}`)))
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
      else if (selectedTabItem === 'MISC')
         return this.renderMiscellaneous()
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
               <TabBar.Item className={tabBarItem} id='MISC'>
                  {Messages.UB_SETTINGS_MISCELLANEOUS_TAB}
               </TabBar.Item>
            </TabBar>

            {this.renderContent()}
         </React.Fragment>
      )
   }
}