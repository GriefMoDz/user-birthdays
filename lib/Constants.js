module.exports = {
   StoreEmitters: ['setUser', 'removeUser'],
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