const { React, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const Tooltip = getModuleByDisplayName('Tooltip', false)
const Cake = require('./svg/Cake')

const Lodash = window._

module.exports = React.memo((props) => {
   const locationKey = Lodash.upperFirst(Lodash.camelCase(props.location))
   const { getSetting } = props

   if (!getSetting(`icon${locationKey}`, true)) {
      return null
   }

   return (
      <div id='user-birthday'>
         <Tooltip text={Messages.UB_BIRTHDAY_ICON_TOOLTIP} hideOnClick={false}>
            {props => <Cake {...props} />}
         </Tooltip>
      </div>
   )
})
