import { ATTRIBUTE_LIMITS, ATTRIBUTES, DERIVED_STATS, RESOURCES, scaledStatValue } from '../../game-engine/character-stats'
import type { CharacterRuntime } from '../use-character-runtime'
import DialogFrame from './dialog-frame'

interface StatsDialogProps {
  runtime: CharacterRuntime
  onClose: () => void
}

export default function StatsDialog({ runtime, onClose }: StatsDialogProps) {
  const { attributes, unspentPoints } = runtime.state
  return (
    <DialogFrame label="Character stats" onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-sm">
        <span>Attributes</span>
        <span className="text-amber-400">Points: {unspentPoints}</span>
      </div>
      <ul className="divide-y divide-white/10">
        {ATTRIBUTES.map(({ id, label, description }) => (
          <li key={id} className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1">
              <div className="text-sm">{label}</div>
              <div className="text-xs text-white/50">{description}</div>
            </div>
            <span className="w-8 text-right tabular-nums">{attributes[id]}</span>
            <button
              type="button"
              aria-label={`Increase ${label}`}
              disabled={unspentPoints <= 0 || attributes[id] >= ATTRIBUTE_LIMITS.max}
              className="h-7 w-7 rounded border border-white/20 disabled:opacity-30"
              onClick={() => runtime.spendPoint(id)}
            >
              +
            </button>
          </li>
        ))}
      </ul>
      <ul className="space-y-1 border-t border-white/10 px-3 py-2 text-xs text-white/70">
        {[...RESOURCES, ...DERIVED_STATS].map((stat) => (
          <li key={stat.id} className="flex justify-between">
            <span>{stat.label}</span>
            <span className="tabular-nums">{scaledStatValue(stat, attributes)}</span>
          </li>
        ))}
      </ul>
    </DialogFrame>
  )
}
