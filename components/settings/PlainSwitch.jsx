const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { Icon, Clickable } = require('powercord/components')
const { findInReactTree } = require('powercord/util')

const SwitchItem = getModuleByDisplayName('SwitchItem', false)
const { actionIcon } = getModule(['actionIcon'], false)
const { labelRow } = getModule(['labelRow'], false)
const SettingsModal = require('./SettingsModal')

module.exports = React.memo((props) => {
   const setting = props.setting
   delete props.setting

   const Switch = (<SwitchItem {...props} />).type(props)

   const children = Switch.props.children
   delete children[children.length - 1]

   Switch.props.className += ' ub-settings-plain-switch'

   const LabelRow = findInReactTree(Switch, p => p?.props?.className == labelRow)
   if (setting.settings && LabelRow) {
      LabelRow.props.children.splice(1, 0,
         <Clickable onClick={() => openModal(() => <SettingsModal setting={setting} {...props} />)}>
            <Icon className={`${actionIcon} ub-settings-switch-icon`} name='Gear' />
         </Clickable>
      )
   }

   return Switch
})