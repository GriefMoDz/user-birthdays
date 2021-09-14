const { React, getModule } = require('powercord/webpack')
const { icon, iconWrapper, clickable } = getModule(['iconWrapper', 'clickable'], false)
const { Tooltip } = require('powercord/components')
const Cake = require('./svg/Cake')

module.exports = React.memo((props) =>
   <div className={[iconWrapper, clickable].join(' ')} {...props}>
      <Tooltip text='Birthdays' position='bottom'>
         <Cake className={icon} />
      </Tooltip>
   </div>
)
