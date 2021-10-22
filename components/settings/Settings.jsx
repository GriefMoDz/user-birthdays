const { React, getModule, getModuleByDisplayName, constants, i18n: { Messages } } = require('powercord/webpack')
const { FormItem, RadioGroup, SwitchItem, TextAreaInput, Category } = require('powercord/components/settings')
const { Text, Icon } = require('powercord/components')
const { close: closeModal } = require('powercord/modal')

const { SettingsSections, PersonalizedMessageVariables: { modifiers, ...variables } } = require('../../lib/Constants')
const Previews = require('./previews')

const { tabBar, tabBarItem } = getModule(['tabBar', 'tabBarItem'], false)
const { readFileAsBase64 } = getModule(['readFileAsBase64'], false)
const { getCurrentUser } = getModule(['getNullableCurrentUser'], false)
const { classifyFile } = getModule(['classifyFile'], false)

const TabBar = getModuleByDisplayName('TabBar', false)

const SettingsCard = require('./SettingsCard')
const FileInput = require('../misc/FileInput')
const PlainSwitch = require('./PlainSwitch')

const { getPersonalizedMessage } = require('../../lib/Util')

const getLanguageKey = (key) => {
   return Messages[key]
}

module.exports = class Settings extends React.Component {
   constructor(props) {
      super(props)

      this.currentUser = getCurrentUser()
      this.customAlertStore = powercord.api.settings._fluxProps('user-birthdays-custom-alert')
      this.settings = powercord.api.settings._fluxProps('user-birthdays')

      this.state = {
         tab: 'SETTINGS',
         section: null,
         variables: false
      }
   }

   renderSettings() {
      return Object.keys(SettingsSections).map(section => {
         const { name, icon, settings } = SettingsSections[section]

         return <SettingsCard
            buttonText='View Settings'
            hasNextSection={true}
            onButtonClick={() => this.setState({ section: section })}
            name={name}
            details={[{ text: `${Object.keys(settings).length} ${Messages.SETTINGS}` }]}
            icon={(props) => <Icon name={icon} {...props} />}
         />
      })
   }

   renderCustomize() {
      const { currentUser } = this
      const { getSetting, updateSetting } = this.settings

      const customMessage = getSetting('customMessage')
      const MessageHeaderPreview = Previews['MessageHeaders']

      return <>
         {MessageHeaderPreview && <MessageHeaderPreview
            className='ub-settings-customize-message-preview'
            messageContent={getPersonalizedMessage({
               user: currentUser,
               birthday: currentUser.createdAt.getTime(),
               preview: true
            })}
         />}
         <TextAreaInput
            autosize={true}
            value={customMessage || ''}
            onChange={value => updateSetting('customMessage', value)}
            maxLength={this.currentUser.premiumType === 2 ? constants.MAX_MESSAGE_LENGTH_PREMIUM : constants.MAX_MESSAGE_LENGTH}
            placeholder={Messages.UB_SETTINGS_PERSONALIZED_MESSAGE_PLACEHOLDER}
            note={Messages.USER_SETTINGS_ABOUT_ME_DETAILS}
         >
            {Messages.UB_SETTINGS_PERSONALIZED_MESSAGE}
         </TextAreaInput>
         <Category
            name={Messages.UB_VARIABLES}
            description={Messages.UB_SETTINGS_VARIABLES_DESC}
            opened={this.state.variables}
            onChange={() => this.setState({ variables: !this.state.variables })}
         >
            {Object.keys(variables).map(variable => {
               const { note, supportsTernary } = variables[variable]

               return <FormItem title={variable}>
                  <Text>{note}</Text>

                  {modifiers[variable] && <div className='ub-settings-available-modifiers'>
                     <Text color={Text.Colors.HEADER_SECONDARY}>{Messages.UB_SETTINGS_VARIABLES_AVAILABLE_MODIFIERS}</Text>
                     {Object.keys(modifiers[variable]).map(modifier => {
                        const { note } = modifiers[variable][modifier]

                        return <Text>
                           <code>{`:${modifier}`}</code>{` — ${note} e.g.`} <code>{`{${variable}:${modifier}}`}</code>
                        </Text>
                     })}
                  </div>}

                  {supportsTernary && supportsTernary === true && <Text className='ub-settings-ternary-support-text'>
                     <Text color={Text.Colors.HEADER_SECONDARY}>{Messages.UB_SETTINGS_VARIABLES_AVAILABLE_FEATURES}</Text>
                     {Messages.UB_SETTINGS_VARIABLE_TERNARY_SUPPORT_TEXT}<br />
                     <code>{`{${variable} ? The value exists and is {${variable}} : The value does not exist}`}</code>
                  </Text>}
               </FormItem>
            })}
         </Category>
         {(getSetting('popupPlaySound', false) || getSetting('toastsPlaySound', false)) && (
            <FileInput
               type='audio'
               filters={[{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }]}
               filename={getSetting('alertSound', '')}
               note={Messages.UB_SETTINGS_CUSTOMIZE_TAB_SOUND_DESC}
               onFileSelect={async (file) => {
                  if (!file) return updateSetting('alertSound')
                  if (classifyFile(file) === 'audio') {
                     this.customAlertStore.updateSetting('file', await readFileAsBase64(file))
                     updateSetting('alertSound', file.name)
                     this.props.main.manager.loadAlertSound()
                  }
               }}
               onFileRemove={() => {
                  delete this.props.main.manager.alertSound
                  this.customAlertStore.updateSetting('file')
                  updateSetting('alertSound')
               }}
            >
               {Messages.UB_SETTINGS_CUSTOMIZE_TAB_SOUND_TITLE}
            </FileInput>
         )}
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
         const getTranslationString = (prefix, key) => getLanguageKey(`${prefix}_${key.replace(/\%/gmi, '')}`)

         switch (setting.type) {
            case 'radio':
               return elements.push(<RadioGroup
                  options={setting.options}
                  note={getTranslationString('UB_RADIO', setting.note)}
                  value={getSetting(key, setting.defaultValue)}
                  onChange={(e) => updateSetting(key, e.value)}
               >{getTranslationString('UB_RADIO', setting.title)}</RadioGroup>)
            case 'switch':
               const Type = setting.preview ? PlainSwitch : SwitchItem
               const noteWithCustomizeClick = (
                  setting.note.includes('SOUND_DESC') &&
                  getTranslationString('UB_SWITCH', setting.note).format({
                     onCustomizeClick: () => {
                        this.setState({ section: null, tab: 'CUSTOMIZE' })
                        closeModal()
                     }
                  })
               )

               const Component = (
                  <Type
                     note={noteWithCustomizeClick || getTranslationString('UB_SWITCH', setting.note)}
                     value={getSetting(key, setting.defaultValue)}
                     manager={this}
                     setting={setting}
                     onChange={typeof setting.onChange === 'function' ? setting.onChange : () => toggleSetting(key, setting.defaultValue)}
                     disabled={typeof setting.disabled === 'function' ? setting.disabled() : setting.disabled}
                  >
                     {getTranslationString('UB_SWITCH', setting.title)}
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
      const { tab, section } = this.state

      if (Object.keys(SettingsSections).includes(section)) {
         return this.renderSectionSettings(section)
      }

      if (tab === 'SETTINGS')
         return this.renderSettings()
      else if (tab === 'CUSTOMIZE')
         return this.renderCustomize()
   }

   render() {
      return (
         <React.Fragment>
            <TabBar
               className={['ub-settings-tab-bar', tabBar].filter(Boolean).join(' ')}
               selectedItem={this.state.tab}
               onItemSelect={(item) => this.setState({ tab: item, section: null })}
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