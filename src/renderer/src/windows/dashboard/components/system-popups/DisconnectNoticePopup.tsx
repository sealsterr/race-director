import React from 'react'
import { DisconnectNoticeDialog } from '../../../system/components/SystemNoticeDialogs'

interface DisconnectNoticePopupProps {
  onDismiss: () => void | Promise<void>
  isBusy?: boolean
  errorMessage?: string | null
}

const DisconnectNoticePopup = (props: DisconnectNoticePopupProps): React.ReactElement => (
  <DisconnectNoticeDialog {...props} />
)

export default DisconnectNoticePopup
