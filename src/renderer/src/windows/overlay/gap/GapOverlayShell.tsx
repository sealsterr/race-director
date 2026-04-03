import type { ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { withAlpha } from './gapOverlayUtils'

export function GapOverlayShell({
  children,
  accentColor
}: {
  readonly children: ReactNode
  readonly accentColor: string
}): ReactElement {
  return (
    <motion.div
      layout
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: 'fit-content',
        padding: 28,
        display: 'inline-block',
        fontFamily: "'Oxanium', 'Inter', sans-serif"
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${withAlpha(accentColor, '1f')}, transparent 30%), radial-gradient(circle at 50% 50%, rgba(12,16,24,0.55), transparent 72%)`,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          width: 'fit-content'
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
