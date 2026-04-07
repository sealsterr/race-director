import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { SessionFlagBarState } from './sessionOverlayUtils'
import { getSessionFlagBarTone } from './sessionOverlayUtils'

interface SessionFlagIndicatorProps {
  readonly flagBarState: SessionFlagBarState
}

export function SessionFlagIndicator({ flagBarState }: SessionFlagIndicatorProps): ReactElement {
  const tone = getSessionFlagBarTone(flagBarState)
  const isChequered = flagBarState === 'chequered'

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        backgroundColor: tone.fill,
        boxShadow: `0 0 18px ${tone.glow}`
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        height: 6,
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{ opacity: isChequered ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(135deg, rgba(15,23,42,0.96) 0 10px, rgba(248,250,252,0.98) 10px 20px)',
          mixBlendMode: 'multiply'
        }}
      />
      <motion.div
        animate={{ borderBottomColor: tone.border }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          borderBottom: '1px solid transparent'
        }}
      />
    </motion.div>
  )
}
