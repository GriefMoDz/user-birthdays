const { FormTitle } = require('powercord/components')
const { close: closeModal, closeAll } = require('powercord/modal')
const { React, getModule } = require('powercord/webpack')
const { Modal } = require('powercord/components/modal')
const Birthdays = require('../../lib/Manager')

const NoResults = require('../misc/NoResults')
const Card = require('../misc/Card')

const { AnimatedAvatar } = getModule([ 'AnimatedAvatar' ], false)

const SearchBar = getModule(m => m.defaultProps?.useKeyboardNavigation, false)
const { getUser } = getModule(['getUser', 'getCurrentUser'], false)
const ChannelStore = getModule(['openPrivateChannel'], false)
const classes = getModule(['tabBarContainer'], false)

module.exports = class DateUsers extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         search: ''
      }
   }

   render() {
      const { date } = this.props
      const users = Birthdays.getBirthdays()

      const birthdays = Object.keys(users).map(user => {
         if (Birthdays.isBirthday(user, new Date(date))) return user
         return null
      }).filter(Boolean)

      const fetched = birthdays.map(u => getUser(u))

      return (
         <Modal className='date-users' size={Modal.Sizes.LARGE} style={{ borderRadius: '8px' }}>
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
                     if (!f.username.includes(this.state.search)) return false
                  }

                  return true
               }).map(u =>
                  <Card
                     name={u.tag}
                     user={u}
                     icon={(props) => <AnimatedAvatar
                        src={u.getAvatarURL()}
                        size='SIZE_32'
                        {...props}
                     />}
                     style={{ cursor: 'pointer' }}
                     onClick={() => {
                        ChannelStore.openPrivateChannel(u.id)
                        closeAll()
                     }}
                  />
               ) : <NoResults />}
            </Modal.Content>
         </Modal>
      )
   }
}