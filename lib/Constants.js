const { getSetting } = powercord.api.settings._fluxProps('user-birthdays')

module.exports = {
   FluxActions: {
      BIRTHDAY_SET: 'UB_BIRTHDAY_SET',
      BIRTHDAY_REMOVE: 'UB_BIRTHDAY_REMOVE',
      BIRTHDAY_DISMISS: 'UB_BIRTHDAY_DISMISS'
   },
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
            'iconFriendsList': {
               title: '%ICON_FRIENDS_LIST%',
               note: '%ICON_FRIENDS_LIST_DESC%',
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
         settings: {
            'alertToasts': {
               title: '%ALERT_TOASTS%',
               note: '%ALERT_TOASTS_DESC%',
               defaultValue: false,
               preview: true,
               type: 'switch',
               settings: {
                  'toastOnNonFocus': {
                     title: '%ALERT_TOASTS_NO_FOCUS%',
                     note: '%ALERT_TOASTS_NO_FOCUS_DESC%',
                     defaultValue: false,
                     type: 'switch'
                  },
                  'toastOnFocus': {
                     title: '%ALERT_TOASTS_FOCUS%',
                     note: '%ALERT_TOASTS_FOCUS_DESC%',
                     defaultValue: true,
                     type: 'switch'
                  },
                  'toastsPlaySound': {
                     title: '%ALERT_TOASTS_SOUND%',
                     note: '%ALERT_TOASTS_SOUND_DESC%',
                     defaultValue: false,
                     type: 'switch'
                  }
               }
            },
            'alertDesktop': {
               title: '%ALERT_DESKTOP%',
               note: '%ALERT_DESKTOP_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch',
               settings: {
                  'desktopOnNonFocus': {
                     title: '%ALERT_DESKTOP_NO_FOCUS%',
                     note: '%ALERT_DESKTOP_NO_FOCUS_DESC%',
                     defaultValue: true,
                     type: 'switch'
                  },
                  'desktopOnFocus': {
                     title: '%ALERT_DESKTOP_FOCUS%',
                     note: '%ALERT_DESKTOP_FOCUS_DESC%',
                     defaultValue: false,
                     type: 'switch'
                  }
               }
            },
            'alertPopup': {
               title: '%ALERT_POPUP%',
               note: '%ALERT_POPUP_DESC%',
               defaultValue: true,
               preview: true,
               type: 'switch',
               settings: {
                  'popupOnNonFocus': {
                     title: '%ALERT_POPUP_NO_FOCUS%',
                     note: '%ALERT_POPUP_NO_FOCUS_DESC%',
                     defaultValue: true,
                     type: 'switch'
                  },
                  'popupOnFocus': {
                     title: '%ALERT_POPUP_FOCUS%',
                     note: '%ALERT_POPUP_FOCUS_DESC%',
                     defaultValue: true,
                     type: 'switch'
                  },
                  'popupPlaySound': {
                     title: '%ALERT_POPUP_SOUND%',
                     note: '%ALERT_POPUP_SOUND_DESC%',
                     defaultValue: false,
                     type: 'switch'
                  }
               }
            }
         }
      },
      miscellaneous: {
         name: 'Miscellaneous',
         icon: 'PlusAlt',
         settings: {
            'toolbarIcon': {
               title: '%TOOLBAR_TITLE%',
               note: '%TOOLBAR_NOTE%',
               defaultValue: true,
               type: 'switch'
            },
            'friendsToolbarIcon': {
               disabled: () => !getSetting('toolbarIcon', true),
               title: '%FRIENDS_TOOLBAR_TITLE%',
               note: '%FRIENDS_TOOLBAR_NOTE%',
               defaultValue: false,
               type: 'switch'
            }
         }
      }
   }
}