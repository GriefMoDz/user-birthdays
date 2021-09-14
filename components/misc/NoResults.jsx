const { React, getModule, i18n: { Messages } } = require('powercord/webpack')
const classes = getModule(['emptyResultsWrap'], false)

module.exports = () => {
   return (
      <div className={classes.emptyResultsWrap}>
         <div className={classes.emptyResultsContent} style={{ paddingBottom: '0px' }}>
            <div className={classes.noResultsImage} />
            <div className={classes.emptyResultsText}>
               {Messages.UB_DATE_USERS_MODAL_NOT_FOUND}
            </div>
         </div>
      </div>
   )
}