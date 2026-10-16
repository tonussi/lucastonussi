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

## Procedural objects in the Manager list

- Every object added to the Manager's ADD OBJECT list must be designed with parameters that randomly modify it: at minimum a persisted `seed`, plus the count, size, or shape parameters that make two instances differ.
- Generation lives in a pure, deterministic, seeded function (same settings produce the same result) in `app/components/game-engine`, separate from the renderer. Clamp every parameter to explicit limits and normalize missing settings in `project-model.ts`.
- New instances start with a random seed, and the Inspector exposes every parameter plus a Regenerate control that draws a new seed.
- Render repeated parts with instancing or a single merged geometry, and keep generated counts bounded by the limits.
- Add focused tests for determinism per seed, parameter clamping, and the save/load round trip.
- Plain primitives (cube, sphere) and the editor-only light are exempt, as are fixed catalog GLB models, unless the user asks for variation.

## Asset organization

- Static game assets live in `public/assets`, split into `consolidated` and `backlog`.
- `public/assets/consolidated` holds only what the game uses today, in structured folders by purpose: `characters`, `animations`, `props`, `vehicles`, and a new folder when none fits. Every URL in code must point here.
- `public/assets/backlog` holds downloaded packs and files not used yet. It is git-ignored and no code may reference it.
- When an asset starts being used, move only the files it needs (model, its `.bin` and textures, license/attribution) into `consolidated` and update the paths in `model-catalog.ts` and any loader. Leave the rest of the pack in `backlog`.
- Keep license and attribution files next to the assets they cover.
- Move assets with `mv`/`git mv`; never delete a pack to reorganize.
- Everything in `public/` is copied into the production build, including `backlog`; keep that in mind for build size.

## Verification before performance claims

- Run focused tests, typecheck, and a production build for engine changes.
- Check affected editor and game states in a real browser, including console/network errors and production-preview asset paths where practical.
- Before claiming a performance improvement, measure active gameplay FPS/frame time and memory, plus relevant renderer metrics and physics counts. Compare the same scene, viewport, DPR, and revision before and after.
- State explicitly when browser behavior, a physical device, production hosting, or measured FPS/memory was not verified.
