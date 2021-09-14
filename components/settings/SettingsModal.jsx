const { React, Flux, getModule } = require('powercord/webpack')
const { Modal } = require('powercord/components/modal')
const { close: closeModal } = require('powercord/modal')
const { FormTitle } = require('powercord/components')
const { header } = getModule(['tabBarContainer'], false)


class SettingsModal extends React.Component {
   render() {
      return (
         <Modal size={Modal.Sizes.LARGE} style={{ borderRadius: '8px' }}>
            <Modal.Header className={header}>
               <FormTitle tag='h4'>
                  Settings for {this.props.children}
               </FormTitle>
               <Modal.CloseButton onClick={closeModal} />
            </Modal.Header>
            <Modal.Content>
               {this.props.manager.renderSectionSettings(this.props.setting.settings, true)}
            </Modal.Content>
         </Modal>
      )
   }
}

module.exports = Flux.connectStores([powercord.api.settings.store], () => { })(SettingsModal)
