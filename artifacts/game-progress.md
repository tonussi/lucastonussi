# Game progress

## Current intent

- Preserve the generic JSON-backed Three.js/Rapier engine and make the default procedural recipe evoke rural Nepal roughly thirty years ago.
- Player fantasy: explore highland villages, forests and walkable hills; gather useful objects and help people or farm animals solve small local problems.
- Distant Himalayan/Everest-like peaks are visual landmarks, not reachable gameplay terrain.
- Reuse existing procedural houses, trees, mountains, paths, pickups and terrain before adding external assets.

## Core loop contract

Player explores trails and settlements to find requested items while terrain and distance create navigation choices; collecting the needed items changes inventory state and prepares a future help interaction. This slice proves exploration and collection but does not yet implement NPC dialogue, quest completion, failure or rewards.

## Level plan

- Spawn on walkable highland ground near trails.
- One or more clustered rural villages provide landmarks.
- Varied forest density and walkable mounds create exploration routes.
- Medicinal plants are deterministic pickups distributed through the playable area.
- Blue-white Himalayan ranges sit well beyond the playable area with collision disabled.

## Current slice

- Nepal procedural recipe and Inspector parameters.
- Rural house clusters, varied tree populations and medicinal pickup types.
- Non-colliding Himalayan landmarks.

## Remaining defects and next work

- No NPC, animal, dialogue, quest journal, recipe or objective-completion system yet.
- House visuals are the existing generic procedural house kit; no dedicated Nepal architecture kit yet.
- Browser/WebGL appearance, collision, spawn alignment and frame cost still require live validation.
