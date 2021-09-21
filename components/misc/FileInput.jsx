const { FormItem } = require('powercord/components/settings')
const { React } = require('powercord/webpack')

const CustomFileInput = require('./CustomFileInput')

module.exports = React.memo((props) => {
   const { children: title, note, required } = props
   const [filename, setFilename] = React.useState(props.filename ?? null)

   const FileInput = <CustomFileInput
      filename={filename}
      filters={props.filters}
      onFileSelect={(file) => {
         if (!file || props.type && !file.type.startsWith(`${props.type}/`)) return

         setFilename(file.name)
         props.onFileSelect && props.onFileSelect(file)
      }}
      onFileRemove={() => {
         if (typeof props.onFileRemove === 'function') props.onFileRemove()

         setFilename('')
         props.onFileSelect(null)
      }}
   />

   return (
      <FormItem title={title} note={note} required={required}>
         {note ? (
            <div className='ub-settings-file-input'>
               {FileInput}
            </div>
         ) : FileInput}
      </FormItem>
   )
})
