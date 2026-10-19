import { createContext, useContext, useMemo } from 'react'
import type { Vector3 } from 'three'
import { createVegetationMask } from '../game-engine/vegetation-footprint'
import type { EngineSceneObject } from '../game-engine/types'

type Mask = (point: Vector3) => boolean
const VegetationContext = createContext<Mask>(() => false)
export const useVegetationMask = () => useContext(VegetationContext)

/** Rebuild only after scene edits, never every frame. */
export function VegetationMask({ objects, children }: { objects: EngineSceneObject[]; children: React.ReactNode }) {
  const blocked = useMemo(() => createVegetationMask(objects), [objects])
  return <VegetationContext.Provider value={blocked}>{children}</VegetationContext.Provider>
}
