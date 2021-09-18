const { React, getModule } = require('powercord/webpack')
const classes = getModule(['emptyResultsWrap'], false)

module.exports = (props) => {
   return (
      <div className={classes.emptyResultsWrap}>
         <div className={classes.emptyResultsContent} style={{ paddingBottom: 0 }}>
            <div className={classes.noResultsImage} />
            <div className={classes.emptyResultsText}>
               {props.message}
            </div>
         </div>
      </div>
   )
}