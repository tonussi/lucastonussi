# Web Game Engine Development Guide

These repository instructions extend the shared frontend and backend guidance. Preserve the existing React, react-three-fiber, Three.js, and Rapier world when adding engine capabilities; extend it through data and focused systems instead of replacing the scene.

## Central invariant: keep the game fluid and lightweight

- Game mode owns only gameplay work. Editor panels, selection raycasts, transform controls, outlines, observers, and editor keyboard shortcuts must be absent or inactive in game mode.
- Keep frame and physics hot paths allocation-light. Reuse vectors, matrices, raycasters, geometry, materials, textures, and object pools; do not create arrays or Three.js objects in `useFrame` unless measurement justifies it.
- Make update ownership explicit. Each frame task, input intent, physics step, camera update, animation mixer, and temporary effect must have one owner and deterministic cleanup.
- Prefer shared geometry/material instances and instancing for repeated static props. Dispose resources created at runtime, but never dispose loader-cached or shared resources from one consumer.
- Treat draw calls, triangles, texture memory, lights, shadows, physics bodies, and sensors as budgets. Keep bounded DPR, modest shadow maps, collision proxies, and debug rendering unless current evidence supports a change.
- Load large models, textures, animations, and editor-only code lazily. Preserve useful Suspense/loading states and avoid blocking unrelated information on one asset.
- World JSON is data, not executable code. Persist stable IDs, transforms, appearance/rule identifiers, and JSON-safe properties. Resolve behavior identifiers through runtime registries; never serialize functions.

## Editor and runtime boundaries

- `EngineProject` is the source of truth for persisted world state. Runtime edits must update it through typed callbacks so save/export and reload round-trips match what is visible.
- Selection and transform gizmos are editor-only. Game controls win in play mode, and entering play mode must not leave editor input handlers active.
- Keep object components declarative. A selected object may use a temporary editor representation, but play mode must restore the correct physics body/collider from persisted data.
- Add schema normalization or migration when extending persisted JSON so older local drafts remain loadable.

## Verification before performance claims

- Run focused tests, typecheck, and a production build for engine changes.
- Check affected editor and game states in a real browser, including console/network errors and production-preview asset paths where practical.
- Before claiming a performance improvement, measure active gameplay FPS/frame time and memory, plus relevant renderer metrics and physics counts. Compare the same scene, viewport, DPR, and revision before and after.
- State explicitly when browser behavior, a physical device, production hosting, or measured FPS/memory was not verified.
