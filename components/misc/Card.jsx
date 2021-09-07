const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')
const { Card, Flex } = require('powercord/components')

const IntegrationInfo = getModuleByDisplayName('IntegrationInfo', false)
const classes = getModule(['card', 'clickable'], false)

module.exports = React.memo(props => {
   return (
      <div>
         <Card {...props} editable={true} className={['ub-card', classes.card].join(' ')}>
            <Flex>
               <IntegrationInfo {...props} />
            </Flex>
         </Card>
      </div>
   )
})
