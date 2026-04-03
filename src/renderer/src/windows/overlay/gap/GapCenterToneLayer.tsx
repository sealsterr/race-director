import type { ReactElement } from 'react'
import { motion } from 'framer-motion'

export function GapCenterToneLayer({
  children,
  active
}: {
  readonly children: ReactElement
  readonly active: boolean
}): ReactElement {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={layerStyle}
    >
      {children}
    </motion.div>
  )
}

const layerStyle = {
  gridArea: '1 / 1'
}
