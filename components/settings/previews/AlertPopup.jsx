const { Divider } = require('powercord/components')
const { React } = require('powercord/webpack')

module.exports = class AlertToasts extends React.Component {
   render() {
      return (
         <>
            <div className='ub-settings-image-preview-container'>
               <img className='ub-settings-image-preview' src='https://media.wtf/72828348' />
            </div>
            <Divider />
            {this.props.children}
         </>
      )
   }
}