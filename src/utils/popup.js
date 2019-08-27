import { Message, MessageBox, Notification } from 'element-ui'

export function notify_success(message) {
  Notification({
    title: 'Success',
    message: message || 'Success',
    position: 'bottom-right',
    type: 'success'
  })
}

export function notify_failure(message) {
  Notification({
    title: 'Failed',
    message: message || 'Failed',
    position: 'bottom-right',
    type: 'error'
  })
}

export function confirm(context, message) {
  MessageBox(message, context, {
    distinguishCancelAndClose: true,
    confirmButtonText: context,
    showCancelButton: false,
    type: 'warning',
    center: true
  }).catch(() => {
  })
}

export function pop_error(message) {
  Message.error('Error: ' + message + '!')
}
