const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { Button, Icon } = require('powercord/components')

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
          disabled={true}
        />
        {this.props.filename?.length > 0 &&
          <Button
            size={Button.Sizes.MIN}
            color={Button.Colors.RED}
            className={classes.fileUploadButton}
            onClick={this.props.onFileRemove ?? (() => { })}
          >
            <Icon width={18} height={18} name='Close' />
          </Button>
        }
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
