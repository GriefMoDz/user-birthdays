const { React, getModuleByDisplayName } = require('powercord/webpack')
const SwitchItem = getModuleByDisplayName('SwitchItem', false)

module.exports = React.memo((props) => {
   const Switch = (<SwitchItem {...props} />).type(props)

   const children = Switch.props.children
   delete children[children.length - 1]

   Switch.props.className += ' ub-settings-plain-switch'

   return Switch
})