const { React, getModuleByDisplayName } = require('powercord/webpack')
const Tooltip = getModuleByDisplayName('Tooltip', false)
const Cake = require('./svg/Cake')

const Lodash = window._

module.exports = React.memo((props) => {
   const locationKey = Lodash.upperFirst(Lodash.camelCase(props.location))
   const { getSetting } = props

   console.log(locationKey)

   if (!getSetting(`icon${locationKey}`, true)) {
      return null
   }

   return (
      <div id='user-birthday'>
         <Tooltip text='Birthday' hideOnClick={false}>
            {props => <Cake {...props} />}
         </Tooltip>
      </div>
   )
})
