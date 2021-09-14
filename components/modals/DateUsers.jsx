const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { open: openModal, close: closeModal, closeAll } = require('powercord/modal')
const { Modal } = require('powercord/components/modal')
const { FormTitle, Flex, Icon } = require('powercord/components')

const DatePicker = require('../misc/DatePicker')
const NoResults = require('../misc/NoResults')
const Card = require('../misc/Card')

const SearchBar = getModule(m => m.defaultProps?.useKeyboardNavigation, false)
const { getUser } = getModule(['getUser', 'getCurrentUser'], false)
const { AnimatedAvatar } = getModule(['AnimatedAvatar'], false)
const ChannelStore = getModule(['openPrivateChannel'], false)
const moment = getModule(['createFromInputFallback'], false)
const FormText = getModuleByDisplayName('FormText', false)
const { getStatus } = getModule(['getStatus'], false)
const classes = getModule(['tabBarContainer'], false)

module.exports = class DateUsers extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         search: ''
      }
   }

   render() {
      const { date, manager: Birthdays } = this.props
      const users = Birthdays.getBirthdays()

      const birthdays = Object.keys(users).map(user => {
         if (Birthdays.isBirthday(user, new Date(date))) return user
         return null
      }).filter(Boolean)

      const fetched = birthdays.map(u => getUser(u))

      return (
         <Modal className='ub-date-users' size={Modal.Sizes.LARGE} style={{ borderRadius: '8px' }}>
            <Modal.Header className={classes.header}>
               <FormTitle tag='h4' className='date-users-header'>
                  Birthdays for {this.props.date.format('D MMMM')}
               </FormTitle>
               <SearchBar
                  className={'date-users-search'}
                  size={SearchBar.Sizes.MEDIUM}
                  autofocus={false}
                  placeholder='Search'
                  onQueryChange={query => this.setState({ search: query })}
                  onClear={() => this.setState({ search: '' })}
                  query={this.state.search} />
               <Modal.CloseButton onClick={closeModal} />
            </Modal.Header>
            <Modal.Content>
               {fetched.length ? fetched.filter(f => {
                  if (this.state.search != '') {
                     if (!f.username.toLowerCase().includes(this.state.search.toLowerCase())) return false
                  }

                  return true
               }).map(u =>
                  <Card
                     name={u.tag}
                     user={u}
                     icon={(props) => <AnimatedAvatar
                        src={u.getAvatarURL()}
                        size='SIZE_32'
                        status={getStatus(u.id)}
                        {...props}
                     />}
                     style={{ cursor: 'pointer' }}
                     buttons={[
                        {
                           type: 'button',
                           name: Messages.UB_DATE_USERS_EDIT_BIRTHDAY,
                           onClick: () => {
                              return openModal(() => <DatePicker
                                 minDate={moment().startOf('year')}
                                 maxDate={moment().endOf('year')}
                                 selected={new Date(date)}
                                 dateFormatCalendar='LLLL'
                                 onSelect={(v) => {
                                    closeModal()
                                    Birthdays.setUser(u.id, v.valueOf())
                                 }}
                              />)
                           }
                        },
                        {
                           type: 'button',
                           name: Messages.UB_DATE_USERS_REMOVE_BIRTHDAY,
                           color: 'colorDanger',
                           onClick: () => {
                              Birthdays.removeUser(u.id)
                              this.forceUpdate()
                           }
                        }
                     ]}
                     onClick={() => {
                        ChannelStore.openPrivateChannel(u.id)
                        closeAll()
                     }}
                  />
               ) : <NoResults />}
            </Modal.Content>
            <Modal.Footer>
               <Flex>
                  <FormText>
                     <Icon className='ub-date-users-tip' name='Info' />
                     {Messages.UB_DATE_USERS_TIP}
                  </FormText>
               </Flex>
            </Modal.Footer>
         </Modal>
      )
   }
}