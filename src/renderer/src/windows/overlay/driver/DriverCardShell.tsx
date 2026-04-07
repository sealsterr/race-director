import type { ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'

export function DriverCardShell({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <motion.div
      layout
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: 'fit-content',
        minHeight: 272,
        padding: 10,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'inline-block',
        color: '#f8fafc',
        background: 'linear-gradient(180deg, rgba(12,14,20,0.985), rgba(8,10,15,0.99))',
        border: '1px solid rgba(120,129,151,0.22)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.018)',
        fontFamily: "'Oxanium', 'Inter', sans-serif"
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 0%, rgba(138,31,31,0.16), transparent 24%), radial-gradient(circle at 100% 100%, rgba(62,74,111,0.16), transparent 24%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          minHeight: 248,
          width: 'fit-content'
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
