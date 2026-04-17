import React, { useEffect, useState } from 'react'
import { QuitConfirmDialog } from '../components/SystemNoticeDialogs'

const QuitConfirm = (): React.ReactElement => {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  useEffect(() => {
    globalThis.api.system
      .getQuitConfirmPreference()
      .then((showConfirm) => {
        setDontAskAgain(!showConfirm)
      })
      .catch((error) => {
        console.warn('Failed to load quit confirmation preference:', error)
      })
  }, [])

  return (
    <QuitConfirmDialog
      dontAskAgain={dontAskAgain}
      onDontAskAgainChange={setDontAskAgain}
      onCancel={globalThis.api.system.cancelQuit}
      onConfirm={() => globalThis.api.system.confirmQuit(dontAskAgain)}
      isWindowFrame
    />
  )
}

export default QuitConfirm
