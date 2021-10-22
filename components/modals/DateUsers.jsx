const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { open: openModal, close: closeModal, closeAll } = require('powercord/modal')
const { Flex, Text, Icon } = require('powercord/components')

const DatePicker = require('../misc/DatePicker')
const NoResults = require('../misc/NoResults')
const Cake = require('../icons/svg/Cake')
const Card = require('../misc/Card')

const SearchBar = getModule(m => m.defaultProps?.useKeyboardNavigation, false)
const { getUser } = getModule(['getNullableCurrentUser'], false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)
const ChannelStore = getModule(['openPrivateChannel'], false)
const moment = getModule(['createFromInputFallback'], false)
const FormText = getModuleByDisplayName('FormText', false)
const { getStatus } = getModule(['getStatus'], false)

const BirthdayStore = require('../../lib/Store')
const Manager = require('../../lib/Manager')

const Modal = getModule(['ModalRoot'], false)
const Header = getModule(m => m?.displayName === 'Header' && m?.Sizes, false)

const { getDefaultAvatarURL } = getModule(['getDefaultAvatarURL'], false)

module.exports = class DateUsers extends React.Component {
   constructor(props) {
      super(props)

      this.utils = require('../../lib/Util')
      this.state = {
         search: ''
      }
   }

   render() {
      const { date } = this.props
      const users = BirthdayStore.getBirthdays()

      const birthdays = Object.keys(users).map(userId =>
         BirthdayStore.isBirthday(userId, new Date(date)) ? userId : null
      ).filter(Boolean)

      const fetched = birthdays.map(getUser).filter(f => {
         if (this.state.search != '') {
            if (!f.username.toLowerCase().includes(this.state.search.toLowerCase())) return false
         }

         return true
      }).filter(Boolean)

      const defaultDatePickerProps = {
         minDate: moment('1970-01-01'),
         maxDate: moment().endOf('year'),
         dropdownMode: 'select',
         showMonthDropdown: true,
         showYearDropdown: true
      }

      return (
         <Modal.ModalRoot className='ub-date-users' size={Modal.ModalSize.MEDIUM} style={{ borderRadius: 8 }} transitionState={1}>
            <Modal.ModalHeader>
               <Flex.Child>
                  <Header tag='h2' size={Header.Sizes.SIZE_20}>
                     {Messages.UB_BIRTHDAYS_HEADER_TOOLTIP}
                  </Header>
                  <Text size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_SECONDARY}>
                     {this.props.date.format('D MMMM')}
                  </Text>
               </Flex.Child>
               <Flex.Child>
                  <SearchBar
                     className='date-users-search'
                     size={SearchBar.Sizes.MEDIUM}
                     autofocus={false}
                     placeholder={Messages.SEARCH}
                     onQueryChange={query => this.setState({ search: query })}
                     onClear={() => this.setState({ search: '' })}
                     query={this.state.search}
                  />
               </Flex.Child>
               <Flex.Child grow={0}>
                  <Modal.ModalCloseButton onClick={closeModal} />
               </Flex.Child>
            </Modal.ModalHeader>
            <Modal.ModalContent className='ub-modal-content'>
               {fetched.length ? fetched.map(u => {
                  const birthday = BirthdayStore.getBirthday(u.id)
                  const age = this.utils.calculateAge(birthday)

                  const hasBirthdayPassed = new Date(birthday).getTime() < new Date(date).getTime()

                  return <Card
                     name={u?.tag || Messages.UNKNOWN_USER}
                     user={u}
                     icon={(props) => <AnimatedAvatar
                        src={u?.getAvatarURL() || getDefaultAvatarURL()}
                        size='SIZE_32'
                        status={getStatus(u?.id)}
                        {...props}
                     />}
                     style={{ cursor: 'pointer' }}
                     details={age > 0 ? [{ icon: Cake, text: `They ${hasBirthdayPassed ? 'turned' : 'will be turning'} ${age}.` }] : []}
                     buttons={[
                        {
                           type: 'button',
                           name: Messages.UB_DATE_USERS_EDIT_BIRTHDAY,
                           onClick: () => {
                              return openModal(() => <DatePicker
                                 {...defaultDatePickerProps}
                                 selected={new Date(users[u?.id])}
                                 onSelect={(v) => {
                                    closeModal()
                                    Manager.setBirthday(u?.id, v.valueOf())
                                 }}
                              />)
                           }
                        },
                        {
                           type: 'button',
                           name: Messages.UB_DATE_USERS_REMOVE_BIRTHDAY,
                           color: 'colorDanger',
                           onClick: () => {
                              Manager.removeBirthday(u?.id)
                              this.forceUpdate()
                           }
                        }
                     ]}
                     onClick={() => {
                        ChannelStore.openPrivateChannel(u?.id)
                        closeAll()
                     }}
                  />
               }) : <NoResults message={this.state.search != '' ? Messages.SEARCH_NO_RESULTS : Messages.UB_DATE_USERS_MODAL_NOT_FOUND} />}
            </Modal.ModalContent>
            <Modal.ModalFooter>
               <Flex>
                  <FormText>
                     <Icon className='ub-date-users-tip' name='Info' />
                     {Messages.UB_DATE_USERS_TIP}
                  </FormText>
               </Flex>
            </Modal.ModalFooter>
         </Modal.ModalRoot>
      )
   }
}