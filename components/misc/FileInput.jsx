const { FormItem } = require('powercord/components/settings')
const { React, getModule } = require('powercord/webpack')
const { findInReactTree } = require('powercord/util')

function getFilePicker() {
   const { StickerUploadModal } = getModule(['StickerUploadModal'], false)
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

   const res = StickerUploadModal({})

   Internals.useMemo = ogUseMemo
   Internals.useState = ogUseState
   Internals.useEffect = ogUseEffect
   Internals.useLayoutEffect = ogUseLayoutEffect
   Internals.useRef = ogUseRef
   Internals.useCallback = ogUseCallback

   const mdl = findInReactTree(res, r => r?.props?.onFileSelect)
   console.log(mdl)
   return mdl?.type
}

const Component = getFilePicker()

module.exports = class extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         filename: null
      }
   }

   render() {
      const { children: title, note, required } = this.props

      return (
         <FormItem title={title} note={note} required={required}>
            <Component
               filename={this.state.filename ?? this.props.filename}
               onFileSelect={(file) => {
                  file && this.setState({ filename: file.name })
                  this.forceUpdate()
                  this.props.onFileSelect && this.props.onFileSelect(file)
               }}
            />
         </FormItem>
      )
   }
}