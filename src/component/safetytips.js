import React, { useState, useEffect }from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import {FormattedMessage} from 'react-intl'


export default function SafetyTipsPage (props) {
  const [open, setOpen] = useState(props.open)

  useEffect( () => {
    setOpen(props.open)
  }, [props.open])

  // const handleClose = () => {
  //     setOpen(false);
  // }

  const onClose = e => {
    props.onClose && props.onClose(e);
    setOpen(false);
  }

  // const descriptionElementRef = React.useRef(null);
  // React.useEffect(() => {
  //     if (open) {
  //     const { current: descriptionElement } = descriptionElementRef;
  //     if (descriptionElement !== null) {
  //         descriptionElement.focus();
  //     }
  //     }
  // }, [open]);

  return (
    <Dialog
    open={open}
    onClose={onClose}
    scroll={'paper'}
    aria-labelledby="scroll-dialog-title"
    aria-describedby="scroll-dialog-description"
    >
    <DialogTitle id="scroll-dialog-title">Safety Tips</DialogTitle>
    <DialogContent dividers={true}>
      <DialogContentText
        id="scroll-dialog-description"
        // ref={descriptionElementRef}
        tabIndex={-1}
        style={{fontSize: 12}}
      >
        <p><FormattedMessage id='safety_tips1' /></p>
        <p><FormattedMessage id='safety_tips2' /></p>
        <p><FormattedMessage id='safety_tips3' /></p>
        <p><FormattedMessage id='safety_tips4' /></p>

      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="secondary">
        Cancel
      </Button>
    </DialogActions>
    </Dialog>
  )
}  