import React from 'react'
import { QuitConfirmDialog } from '../../../system/components/SystemNoticeDialogs'

interface QuitConfirmPopupProps {
  dontAskAgain: boolean
  isBusy?: boolean
  errorMessage?: string | null
  onDontAskAgainChange: (value: boolean) => void
  onCancel: () => void | Promise<void>
  onConfirm: () => void | Promise<void>
}

const QuitConfirmPopup = (props: QuitConfirmPopupProps): React.ReactElement => (
  <QuitConfirmDialog {...props} />
)

export default QuitConfirmPopup
