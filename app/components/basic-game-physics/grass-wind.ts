import * as THREE from 'three'

/** Tunables for blade animation; world units and seconds. */
export const GRASS_WIND_SETTINGS = {
  /** Distance from the character within which blades bend away. */
  pushRadius: 1.6,
  /** Horizontal bend at the blade tip when the character stands on it. */
  pushStrength: 0.35,
  /** Ambient sway amplitude at the tip. */
  swayAmplitude: 0.04,
  swaySpeed: 1.6,
  swayWavelength: 0.45,
  /** Tip brightness over the base, so blades read as shaded grass. */
  /** Blades collapse to the ground between these camera distances, keeping far terrain cheap to shade. */
  fadeStart: 45,
  fadeEnd: 75,
  baseShade: 0.45,
  tipShade: 1.2,
}

const FAR_AWAY = 1e6

/** One owner (the character controller) writes these each frame; every blade material reads them. */
export const GRASS_WIND = {
  player: { value: new THREE.Vector3(FAR_AWAY, FAR_AWAY, FAR_AWAY) },
  time: { value: 0 },
}

export function resetGrassWind() {
  GRASS_WIND.player.value.set(FAR_AWAY, FAR_AWAY, FAR_AWAY)
}

const { pushRadius, pushStrength, swayAmplitude, swaySpeed, swayWavelength, baseShade, tipShade, fadeStart, fadeEnd } = GRASS_WIND_SETTINGS
const f = (value: number) => value.toFixed(4)

export function applyGrassWind(shader: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }) {
  shader.uniforms.uGrassPlayer = GRASS_WIND.player
  shader.uniforms.uGrassTime = GRASS_WIND.time
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>
uniform vec3 uGrassPlayer;
uniform float uGrassTime;
varying float vGrassTip;`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
vGrassTip = position.y;`)
    .replace('#include <project_vertex>', `
vec4 mvPosition = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
mvPosition = instanceMatrix * mvPosition;
#endif
vec4 grassWorld = modelMatrix * mvPosition;
vec4 grassBase = modelMatrix * (
#ifdef USE_INSTANCING
instanceMatrix *
#endif
vec4(0.0, 0.0, 0.0, 1.0));
vec2 away = grassBase.xz - uGrassPlayer.xz;
float awayLength = max(length(away), 0.0001);
float push = (1.0 - smoothstep(0.0, ${f(pushRadius)}, awayLength)) * step(abs(grassBase.y - uGrassPlayer.y), 2.0);
float tipWeight = vGrassTip * vGrassTip;
float grassFade = 1.0 - smoothstep(${f(fadeStart)}, ${f(fadeEnd)}, distance(grassBase.xyz, cameraPosition));
grassWorld.xz += away / awayLength * push * ${f(pushStrength)} * tipWeight;
grassWorld.x += sin(uGrassTime * ${f(swaySpeed)} + (grassBase.x + grassBase.z) * ${f(swayWavelength)}) * ${f(swayAmplitude)} * tipWeight;
grassWorld.xyz = mix(grassBase.xyz, grassWorld.xyz, grassFade);
mvPosition = viewMatrix * grassWorld;
gl_Position = projectionMatrix * mvPosition;`)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>
varying float vGrassTip;`)
    .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
normal = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);`)
    .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb *= mix(${f(baseShade)}, ${f(tipShade)}, vGrassTip);`)
}
