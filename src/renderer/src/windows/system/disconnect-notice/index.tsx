import React from 'react'
import { DisconnectNoticeDialog } from '../components/SystemNoticeDialogs'

const DisconnectNotice = (): React.ReactElement => (
  <DisconnectNoticeDialog onDismiss={globalThis.api.system.ackDisconnect} isWindowFrame />
)

export default DisconnectNotice
