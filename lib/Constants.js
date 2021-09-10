module.exports = {
   ComponentsToFix: ['ChannelMessage', 'InboxMessage'],
   SettingsSections: {
      visibility: {
         name: 'Visibility',
         icon: 'Eye',
         settings: {
            'iconMessageHeaders': {
               title: '%ICON_MESSAGE_HEADERS%',
               note: '%ICON_MESSAGE_HEADERS_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch'
            },
            'iconMembersList': {
               title: '%ICON_MEMBERS_LIST%',
               note: '%ICON_MEMBERS_LIST_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch'
            },
            'iconDirectMessages': {
               title: '%ICON_DIRECT_MESSAGES%',
               note: '%ICON_DIRECT_MESSAGES_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch'
            },
            'iconUserPopoutModal': {
               title: '%ICON_USER_POPOUT%',
               note: '%ICON_USER_POPOUT_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch'
            }
         }
      },
      alerts: {
         name: 'Alerts',
         icon: 'Alert',
         settings: {}
      },
      miscellaneous: {
         name: 'Miscellaneous',
         icon: 'PlusAlt',
         settings: {}
      }
   }
}