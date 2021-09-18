const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { Button } = require('powercord/components')

const classes = getModule(['fileUpload', 'fileUploadInput'], false)
const FileInput = getModuleByDisplayName('FileInput', false)

module.exports = class CustomFileInput extends React.Component {
  constructor(props) {
    super(props)

    this.handleOnFileChange = (e) => {
      const file = e.currentTarget.files[0]
      props.onFileSelect(file)
    }
  }

  render() {
    return (
      <div className={classes.fileUpload}>
        <input
          className={classes.fileUploadInput}
          tabIndex={-1}
          placeholder={Messages.GUILD_STICKER_UPLOAD_FILE_PLACEHOLDER}
          type='text'
          value={this.props.filename}
        />
        <Button size={Button.Sizes.MIN} className={classes.fileUploadButton}>
          {Messages.GUILD_STICKER_UPLOAD_FILE_BUTTON}
          <FileInput
            tabIndex={-1}
            onChange={this.handleOnFileChange}
            multiple={false}
            filters={this.props.filters}
          />
        </Button>
      </div>
    )
  }
}
