const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack')
const { close: closeModal } = require('powercord/modal')
const { Flex, Text } = require('powercord/components')

const Modal = getModule(['ModalRoot'], false)
const Header = getModule(m => m?.displayName === 'Header' && m?.Sizes, false)

class SettingsModal extends React.Component {
   render() {
      return (
         <Modal.ModalRoot size={Modal.ModalSize.MEDIUM} style={{ borderRadius: 8 }} transitionState={1}>
            <Modal.ModalHeader>
               <Flex.Child>
                  <Header tag='h2' size={Header.Sizes.SIZE_20}>
                     {Messages.SETTINGS}
                  </Header>
                  <Text size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_SECONDARY}>
                     {this.props.children}
                  </Text>
               </Flex.Child>
               <Flex.Child grow={0}>
                  <Modal.ModalCloseButton onClick={closeModal} />
               </Flex.Child>
            </Modal.ModalHeader>
            <Modal.ModalContent className='ub-modal-content'>
               {this.props.manager.renderSectionSettings(this.props.setting.settings, true)}
            </Modal.ModalContent>
         </Modal.ModalRoot>
      )
   }
}

module.exports = Flux.connectStores([powercord.api.settings.store], () => { })(SettingsModal)
