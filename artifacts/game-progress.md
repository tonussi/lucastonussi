# Experimental World Engine

## Intent and constraints

- Preserve the existing React Three Fiber/Rapier world and build an authoring shell around it.
- Keep project settings and procedural generation snapshots serializable as versioned JSON.
- Provide a central live viewport, scene manager, inspector, and React Flow game-logic graph.
- Keep procedural content deliberately neutral until its eventual purpose is chosen.

## Current slice

- Engine workbench layout and live viewport.
- Local save plus JSON import/export.
- Deterministic seeded marker scatter and generation history.
- Editable React Flow nodes, edges, and positions persisted with the project.

## Verification

- Production build completed successfully.
- Browser pass confirmed the preserved physics world inside the central viewport.
- Browser interaction confirmed generation history, seed advancement, and local save status.
- Site navigation, footer, Leva controls, and performance HUD are isolated from editor mode.

## Non-goals

- No replacement of existing world objects, physics, controls, ocean, or pirate ship.
- No claim that the flow graph executes gameplay logic yet.
- No backend/cloud project storage in this experimental slice.
