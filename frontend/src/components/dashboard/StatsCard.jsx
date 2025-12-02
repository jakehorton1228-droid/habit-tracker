import { motion } from 'framer-motion'

export default function StatsCard({ title, value }) {
  return (
    <motion.div
      className="stats-card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="stats-title">{title}</div>
      <div className="stats-value">{value}</div>
    </motion.div>
  )
}
