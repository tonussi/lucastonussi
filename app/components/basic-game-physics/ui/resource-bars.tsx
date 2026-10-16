import { RESOURCES } from '../../game-engine/character-stats'
import { resourceMaxima, type CharacterRuntimeState } from '../../game-engine/character-runtime'

export default function ResourceBars({ state }: { state: CharacterRuntimeState }) {
  const maxima = resourceMaxima(state.attributes)
  return (
    <div className="pointer-events-none absolute top-3 left-3 z-40 flex w-56 flex-col gap-1">
      {RESOURCES.map(({ id, label, color }) => (
        <div key={id} className="flex items-center gap-2 text-[10px] text-white">
          <span className="w-5">{label}</span>
          <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={maxima[id]}
            aria-valuenow={Math.round(state.resources[id])}
            className="h-2 flex-1 overflow-hidden rounded bg-black/60"
          >
            <div
              className="h-full"
              style={{ width: `${(state.resources[id] / maxima[id]) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
