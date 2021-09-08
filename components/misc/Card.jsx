const { React, getModule, getModuleByDisplayName, contextMenu: { openContextMenu }, } = require('powercord/webpack')
const { Card, Flex, ContextMenu, Icons: { Overflow } } = require('powercord/components')

const IntegrationInfo = getModuleByDisplayName('IntegrationInfo', false)
const Clickable = getModuleByDisplayName('Clickable', false)
const classes = getModule(['card', 'clickable'], false)
const { iconItem } = getModule(['iconItem'], false)

module.exports = React.memo(props => {
   return (
      <div>
         <Card {...props} editable={true} className={['ub-card', classes.card].join(' ')}>
            <Flex>
               <IntegrationInfo {...props} />

               {props.buttons ?
                  <Flex.Child shrink={0} grow={0}>
                     <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END}>
                        <Clickable className={iconItem} style={{ display: 'block' }}>
                           <Overflow width={32} height={32} className={classes.caret} onClick={e => openOverflowMenu(e, props)} onContextMenu={e => openOverflowMenu(e, props)} />
                        </Clickable>
                     </Flex>
                  </Flex.Child> : null
               }
            </Flex>
         </Card>
      </div>
   )
})

function openOverflowMenu(e, props) {
   openContextMenu(e, () =>
      React.createElement(ContextMenu, {
         width: '50px',
         itemGroups: [props.buttons]
      })
   )
}