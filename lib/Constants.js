module.exports = {
   ComponentsToFix: ['ChannelMessage', 'InboxMessage'],
   StoreEmitters: ['setUser', 'removeUser'],
   ActionTypes: {
      ADD_DISMISSED: 'UB_DIMISSED_BIRTHDAY',
      REMOVE_USER: 'UB_REMOVE_USER',
      SET_USER: 'UB_SET_USER'
   },
   settings: {
      visibility: {
         'iconMessageHeaders': {
            title: '%ICON_MESSAGE_HEADERS%',
            note: '%ICON_MESSAGE_HEADERS_DESC%',
            defaultValue: true,
            needsForceUpdate: true
         },
         'iconMembersList': {
            title: '%ICON_MEMBERS_LIST%',
            note: '%ICON_MEMBERS_LIST_DESC%',
            defaultValue: true,
            needsForceUpdate: true
         },
         'iconDirectMessages': {
            title: '%ICON_DIRECT_MESSAGES%',
            note: '%ICON_DIRECT_MESSAGES_DESC%',
            defaultValue: true,
            needsForceUpdate: true
         },
         'iconUserPopoutModal': {
            title: '%ICON_USER_POPOUT%',
            note: '%ICON_USER_POPOUT_DESC%',
            defaultValue: true,
            needsForceUpdate: true
         }
      }
   }
}