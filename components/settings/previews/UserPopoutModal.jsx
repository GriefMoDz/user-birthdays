const { React, getModule } = require('powercord/webpack')
const { Divider } = require('powercord/components')
const Lodash = window._

const { getCurrentUser } = getModule(['getCurrentUser'], false)
const UserPopout = getUserPopout()

module.exports = class UserPopoutModal extends React.Component {
   render() {
      const user = Lodash.cloneDeep(getCurrentUser())
      user.forceBirthday = true

      const type = (<UserPopout
         channelId={null}
         closePopout={() => { }}
         isPositioned={true}
         position='right'
         guildId={null}
         user={user}
      />).type


      return (
         <div>
            <UserPopout
               user={user}
            />
            <Divider />
            {this.props.children}
         </div>
      )
   }
}

function getUserPopout() {
   const userStore = getModule(['getCurrentUser'], false)
   const fnUserPopOut = getModule((m) => m.type?.displayName === 'UserPopoutContainer', false)
   const Internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current
   const ogUseMemo = Internals.useMemo
   const ogUseState = Internals.useState
   const ogUseEffect = Internals.useEffect
   const ogUseLayoutEffect = Internals.useLayoutEffect
   const ogUseRef = Internals.useRef
   const ogUseCallback = Internals.useCallback

   Internals.useMemo = (f) => f()
   Internals.useState = (v) => [v, () => void 0]
   Internals.useEffect = () => null
   Internals.useLayoutEffect = () => null
   Internals.useRef = () => ({})
   Internals.useCallback = (c) => c

   const ogGetCurrentUser = userStore.getCurrentUser
   userStore.getCurrentUser = () => ({ id: '0' })
   let UserPopOut
   try {
      UserPopOut = fnUserPopOut.type({ user: { isNonUserBot: () => void 0 } }).type
   } finally {
      userStore.getCurrentUser = ogGetCurrentUser
   }

   Internals.useMemo = ogUseMemo
   Internals.useState = ogUseState
   Internals.useEffect = ogUseEffect
   Internals.useLayoutEffect = ogUseLayoutEffect
   Internals.useRef = ogUseRef
   Internals.useCallback = ogUseCallback

   return UserPopOut
}