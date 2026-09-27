"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "@/components/ui/webgl-error-boundary";
import { collectionItems } from "@/data/collectionItems";

const PORTRAIT_ASPECT = 3 / 4;

const liquidGlassCarouselDefaultItems = collectionItems;

// Refined luxury smoky/silver optical crystal glass parameters
const LENS = {
  sizeX: 0.565,
  sizeY: 1,
  posX: 0.5,
  posY: 0.5,
  rotation: 65,
  spin: 0,
  zoom: 0,
  dispersion: 8.5,        // Subtle chromatic dispersion around glass edges
  blur: 0,
  glow: 2.6,              // Reduced glow for sophisticated editorial restraint
  whiteGlow: 0.18,        // Clean, crisp specular highlight
  novaSize: 10,
  blueRing: 2.0,          // Toned down by ~67% — subtle smoky silver rim reflection
  ringRadius: 0.49,
  ringWidth: 0.012,
  shimmer: true,
  shimmerFreq: 10,
  shimmerSpeed: 2.2,      // Slower, organic shimmer
  shimmerDepth: 0.08,     // Subtle depth fluctuation
  rimStart: 0.578,
  rimTangential: 0.55,
  rimInward: 0,
  rimFreq1: 2,
  rimFreq2: 1,
  blueColor: "#deded9",   // Neutral silver / warm pearl specular rim
  rimLine: 0.75,          // Reduced from 1.4 for a hairline optical edge
  rimLinePos: 0.488,
  rimLineWidth: 0.0025,
  vignette: 0,
  vignetteSize: 0.3,
  samples: 16,
};

const FOCUS = {
  cardDuration: 0.7,
  focusDuration: 0.85,
  cardEase: "power4.out",
  focusEase: "power3.out",
  stagger: 0.05,
  dropDist: 1.4,
  centerScale: 1.16,
  lensFade: 0.85,
};

// Subtle editorial entry animation
const ENTRY = {
  delay: 0.35,
  startH: 150,            // Cards begin with substantial editorial height
  riseDuration: 0.85,     // Crisp, responsive rise
  stagger: 0.05,
  riseEase: "power3.out",
  fromBelow: 0.40,        // Subtle entrance from just below resting line
  growDelay: 0.15,
  growDuration: 1.4,      // Elegant, restrained grow
  growEase: "power3.out",
  growStagger: 0.06,
  lensBloom: 1.0,
  lensBloomEase: "power2.out",
};

const LENS_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const LENS_FRAGMENT = /* glsl */ `
#define PI 3.14159265
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uSizeX;
uniform float uSizeY;
uniform float uAspect;
uniform float uZoom;
uniform float uDispersion;
uniform float uBlur;
uniform float uGlow;
uniform float uWhiteGlow;
uniform float uNovaSize;
uniform float uBlueRing;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uShimmer;
uniform float uShimmerFreq;
uniform float uShimmerSpeed;
uniform float uShimmerDepth;
uniform float uTime;
uniform float uRimStart;
uniform float uRimTangential;
uniform float uRimInward;
uniform float uRimFreq1;
uniform float uRimFreq2;
uniform vec3 uBlueColor;
uniform float uRimLine;
uniform float uRimLinePos;
uniform float uRimLineWidth;
uniform float uVignette;
uniform float uVignetteSize;
uniform float uShape;
uniform float uSquareRound;
uniform float uRotation;
uniform int uSamples;

const int MAX_SAMPLES = 16;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 discLens(vec2 center, float aspectCorrect, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;

  float maskND;
  if (uShape > 0.5) {
    float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
    float sd = sdRoundBox(p, halfSize, corner);
    maskND = 1.0 + sd / min(uSizeX, uSizeY);
  } else {
    maskND = dist;
  }
  if (maskND > 1.0) return vec3(0.0);

  float shapeND = clamp(maskND, 0.0, 1.0);
  float nd = clamp(dist, 0.0, 1.0);
  vec2 offset = vUv - center;
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 rimPull = -radialDir * rimStrength * rScreen * uRimInward;

  vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask;
  int N = uSamples;
  if (N < 2) N = 2;
  if (N > MAX_SAMPLES) N = MAX_SAMPLES;
  vec3 col = vec3(0.0);
  vec3 caW = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= N) break;
    float t = float(i) / float(N - 1);
    vec2 sUV = baseUV + dispDir * (t - 0.5);
    vec3 s = texture2D(uTex, sUV).rgb;
    vec3 w = vec3(
      exp(-pow((t - 0.00) / 0.38, 2.0)),
      exp(-pow((t - 0.50) / 0.38, 2.0)),
      exp(-pow((t - 1.00) / 0.38, 2.0))
    );
    col += s * w;
    caW += w;
  }
  col /= max(caW, vec3(0.001));

  float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
  if (uBlur > 0.01 && blurFade > 0.01) {
    vec2 blurRad = vec2(uBlur) / uRes * blurFade;
    vec3 bcol = vec3(0.0);
    float btw = 0.0;
    for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
      for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
        vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
        float w = 1.0 - rr * 0.38;
        bcol += texture2D(uTex, baseUV + o).rgb * w;
        btw += w;
      }
    }
    col = mix(bcol / btw, col, rimMask);
  }

  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shapeND));

  float r2 = shapeND * shapeND * 0.25;
  float gs = max(uNovaSize * uGlow * 0.003, 0.004);
  float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
  nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
  col += vec3(nova);

  float dC = shapeND * 0.5;
  float tR = clamp(uRingRadius, 0.1, 0.49);
  float rW = max(uRingWidth, 0.003);
  float ring = exp(-pow((dC - tR) / rW, 2.0));
  ring *= uBlueRing * (uGlow / 17.0) * 1.8;
  if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
  float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uBlueRing * (uGlow / 17.0);
  col += uBlueColor * (ring + ringAura);
  col += vec3(exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine);

  outA = smoothstep(1.0, 0.93, maskND);
  return col;
}

void main(){
  vec3 base = texture2D(uTex, vUv).rgb;
  vec3 outc = base;
  float a = 0.0;
  vec3 c = discLens(uCenter, uAspect, a);
  outc = mix(outc, c, a);
  if (uVignette > 0.001) {
    vec2 vc = vUv - 0.5;
    vc.x *= uAspect;
    float d = length(vc) / max(uVignetteSize, 0.0001);
    float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
    outc *= clamp(vig, 0.0, 1.0);
  }

  // Subtle luxury editorial tonal normalization (contrast ~1.02, saturation ~0.96)
  float luma = dot(outc, vec3(0.2126, 0.7152, 0.0722));
  outc = mix(vec3(luma), outc, 0.96);
  outc = (outc - 0.5) * 1.02 + 0.5;
  outc = clamp(outc, 0.0, 1.0);

  gl_FragColor = vec4(outc, 1.0);
}
`;

const LENS_FX_KEYS = [
  "uDispersion",
  "uBlueRing",
  "uRimLine",
  "uVignette",
  "uZoom",
  "uRimTangential",
  "uRimInward",
];

const REPEATS = 4;
const CLICK_SLOP = 6;
const TOUCH_CLICK_SLOP = 12;
const FLICK_IDLE_MS = 90;

function at(list, index) {
  const item = list[index];
  if (item === undefined) {
    throw new Error("Index out of range.");
  }
  return item;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hexToNumber(background) {
  const value = background.trim();
  if (value.startsWith("#") && (value.length === 7 || value.length === 4)) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;
    const parsed = Number.parseInt(hex.slice(1), 16);
    return Number.isFinite(parsed) ? parsed : 0xf3f3ef;
  }
  return 0xf3f3ef;
}

function createCarousel(mount, cursorElement, options) {
  const reduced = prefersReducedMotion();
  const entryOn = options.entry && !reduced;
  const items = options.items;
  if (items.length === 0) return null;

  let W = Math.max(1, mount.clientWidth);
  let H = Math.max(1, mount.clientHeight);

  // Responsive panel height calculation:
  // Desktop (>= 1024px): approx 450px height
  // Tablet (768px-1023px): approx 380px height
  // Mobile (< 768px): approx 290px height
  const panelHFor = () => {
    if (W >= 1024) {
      return Math.min(Math.round(W * 0.34), Math.round(H * 0.74), options.panelHeight);
    } else if (W >= 768) {
      return Math.min(Math.round(W * 0.42), Math.round(H * 0.70), 380);
    } else {
      return Math.min(Math.round(W * 0.66), Math.round(H * 0.66), 290);
    }
  };


  let PANEL_H = panelHFor();
  const GAP = options.gap;
  const EASE = reduced ? 0.28 : 0.09;
  const SNAP_EASE = reduced ? 0.22 : 0.05;
  const WHEEL = 1.4;
  const DRAG = 1.6;
  const TOUCH_DRAG = 1.25;
  const TOUCH_EASE = 0.22;
  const FRICTION = 0.865;
  const SNAP_IDLE_MS = 120;
  const SHRINK_MAX = 60;
  const SHRINK_ATTACK = 0.25;
  const SHRINK_DECAY = 0.06;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (err) {
    console.warn("WebGL initialization failed", err);
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(hexToNumber(options.background), 1);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "pan-y"; // Native vertical page scroll
  renderer.domElement.style.userSelect = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -W / 2,
    W / 2,
    H / 2,
    -H / 2,
    -100,
    100
  );
  camera.position.z = 10;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const sources = items.map((img) => {
    const s = {
      tex: null,
      aspect: img.aspect || PORTRAIT_ASPECT,
      locked: img.aspect != null,
    };

    const applyTexture = (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.colorSpace = THREE.SRGBColorSpace;

      // UV mapping for true aspect ratio preservation (object-fit: cover)
      if (tex.image && tex.image.width && tex.image.height) {
        const targetAspect = PORTRAIT_ASPECT;
        const imgAspect = tex.image.width / tex.image.height;
        const posY = img.objectPositionY !== undefined ? img.objectPositionY : 0.5;
        const posX = img.objectPositionX !== undefined ? img.objectPositionX : 0.5;

        if (imgAspect < targetAspect) {
          // Taller than 3:4 — fit width, crop height with vertical alignment bias
          const repeatY = imgAspect / targetAspect;
          tex.repeat.set(1, repeatY);
          tex.offset.set(0, (1 - repeatY) * (1 - posY));
        } else if (imgAspect > targetAspect) {
          // Wider than 3:4 — fit height, crop width with horizontal alignment bias
          const repeatX = targetAspect / imgAspect;
          tex.repeat.set(repeatX, 1);
          tex.offset.set((1 - repeatX) * posX, 0);
        } else {
          tex.repeat.set(1, 1);
          tex.offset.set(0, 0);
        }
        tex.needsUpdate = true;
      }

      s.aspect = PORTRAIT_ASPECT;
      s.tex = tex;
      recomputeTotal();
      if (!userInteracted) {
        scroll = centerForIndex(0);
        target = scroll;
      }
    };


    loader.load(
      img.src,
      applyTexture,
      undefined,
      () => {
        // Fallback to local project asset if external URL encounters an error
        if (img.localSrc) {
          loader.load(img.localSrc, applyTexture, undefined, () => {
            s.aspect = s.aspect || PORTRAIT_ASPECT;
          });
        } else {
          s.aspect = s.aspect || PORTRAIT_ASPECT;
        }
      }
    );
    return s;
  });

  function slotWidth(srcIndex) {
    return at(sources, srcIndex).aspect * PANEL_H + GAP;
  }

  let offsets = [];
  let totalWidth = 0;
  function recomputeTotal() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      offsets.push(acc);
      acc += slotWidth(i);
    }
    totalWidth = acc;
  }
  recomputeTotal();

  function centerForIndex(idx) {
    const N = sources.length;
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return at(offsets, s) + slotWidth(s) / 2 - GAP / 2 + loop * totalWidth;
  }

  function nearestIndex(value) {
    if (!totalWidth) return 0;
    const N = sources.length;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = i + k * N;
      }
    }
    return best;
  }

  function centerIndex(value) {
    if (!totalWidth) return 0;
    let bestI = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sources.length; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        bestI = i;
      }
    }
    return bestI;
  }

  let lastCenter = -1;
  const pool = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < sources.length; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, mat, srcIndex: i, bound: false });
    }
  }

  let scroll = centerForIndex(0);
  let target = scroll;
  let userInteracted = false;
  let velocity = 0;
  let prevScroll = 0;
  let scrollEnergy = 0;
  let pendingFocus = null;
  let lastInput = performance.now();
  let snapped = false;

  const rt = new THREE.WebGLRenderTarget(W * dpr, H * dpr);
  const lensScene = new THREE.Scene();
  const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lensUniforms = {
    uTex: { value: rt.texture },
    uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uSizeX: { value: LENS.sizeX },
    uSizeY: { value: LENS.sizeY },
    uShape: { value: 0 },
    uSquareRound: { value: 0 },
    uRotation: { value: 0 },
    uAspect: { value: W / H },
    uZoom: { value: LENS.zoom },
    uDispersion: { value: LENS.dispersion },
    uBlur: { value: LENS.blur },
    uGlow: { value: LENS.glow },
    uWhiteGlow: { value: LENS.whiteGlow },
    uNovaSize: { value: LENS.novaSize },
    uBlueRing: { value: LENS.blueRing },
    uRingRadius: { value: LENS.ringRadius },
    uRingWidth: { value: LENS.ringWidth },
    uShimmer: { value: reduced || !LENS.shimmer ? 0 : 1 },
    uShimmerFreq: { value: LENS.shimmerFreq },
    uShimmerSpeed: { value: LENS.shimmerSpeed },
    uShimmerDepth: { value: LENS.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: LENS.rimStart },
    uRimTangential: { value: LENS.rimTangential },
    uRimInward: { value: LENS.rimInward },
    uRimFreq1: { value: LENS.rimFreq1 },
    uRimFreq2: { value: LENS.rimFreq2 },
    uBlueColor: { value: new THREE.Color(LENS.blueColor) },
    uRimLine: { value: LENS.rimLine },
    uRimLinePos: { value: LENS.rimLinePos },
    uRimLineWidth: { value: LENS.rimLineWidth },
    uVignette: { value: LENS.vignette },
    uVignetteSize: { value: LENS.vignetteSize },
    uSamples: { value: LENS.samples },
  };
  const lensMat = new THREE.ShaderMaterial({
    uniforms: lensUniforms,
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
  });
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensScene.add(lensQuad);

  const focusState = {
    active: false,
    srcIndex: -1,
    poolIdx: -1,
    lensFx: entryOn ? 0 : 1,
    anim: null,
  };
  const drop = new Array(REPEATS * sources.length).fill(0);
  let focusScale = 1;
  const lastCenterX = new Array(REPEATS * sources.length);
  const pEntry = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryActive = entryOn;
  let entrySettled = false;
  const growArr = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryAnim = null;

  const lensFxFull = {
    uDispersion: lensUniforms.uDispersion.value,
    uBlueRing: lensUniforms.uBlueRing.value,
    uRimLine: lensUniforms.uRimLine.value,
    uVignette: lensUniforms.uVignette.value,
    uZoom: lensUniforms.uZoom.value,
    uRimTangential: lensUniforms.uRimTangential.value,
    uRimInward: lensUniforms.uRimInward.value,
  };

  let panelRects = [];
  let centeredPanel = null;

  function layout() {
    panelRects = [];
    centeredPanel = null;
    let centeredDist = Infinity;
    const half = W / 2;
    const buffer = PANEL_H;
    pool.forEach((p, poolIdx) => {
      const rep = Math.floor(poolIdx / sources.length);
      const i = p.srcIndex;
      const src = at(sources, i);
      const slotCenterInLoop = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      let x = slotCenterInLoop - scroll;
      x = ((x % totalWidth) + totalWidth) % totalWidth;
      x += (rep - Math.floor(REPEATS / 2)) * totalWidth;
      if (x > half + totalWidth) x -= totalWidth * REPEATS;

      const centerX = x;
      const inEntry = entryActive || entrySettled;
      if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
        p.mesh.visible = false;
        lastCenterX[poolIdx] = undefined;
        return;
      }
      lastCenterX[poolIdx] = centerX;

      const shrink = 1 - 0.25 * scrollEnergy;
      const h = PANEL_H * shrink;
      const wPx = src.aspect * PANEL_H * shrink;

      if (src.tex && !p.bound) {
        p.mat.map = src.tex;
        p.mat.color.set(0xffffff);
        p.mat.needsUpdate = true;
        p.bound = true;
      }

      let y = 0;
      const isFocused = focusState.active && focusState.poolIdx === poolIdx;
      const d = drop[poolIdx] || 0;
      let drawW = wPx;
      let drawH = h;
      if (isFocused) {
        drawW = wPx * focusScale;
        drawH = h * focusScale;
      } else if (d > 0) {
        y = -d * H * FOCUS.dropDist;
      }

      p.mesh.visible = true;
      let finalX = centerX;
      let finalY = y;
      let finalW = drawW;
      let finalH = drawH;
      if (entryActive || entrySettled) {
        const pe = pEntry[poolIdx] || 0;
        const g = growArr[poolIdx] || 0;
        const curH = ENTRY.startH + (drawH - ENTRY.startH) * g;
        finalH = curH;
        finalW = curH * src.aspect;

        const cSrc = centerIndex(scroll);
        let di = i - cSrc;
        if (di > sources.length / 2) di -= sources.length;
        if (di < -sources.length / 2) di += sources.length;
        const N = sources.length;
        const midRep = Math.floor(REPEATS / 2);
        if (rep !== midRep) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const slotH = (s) => {
          const gg = growArr[midRep * N + s] || 0;
          return ENTRY.startH + (PANEL_H - ENTRY.startH) * gg;
        };
        let off = 0;
        if (di > 0) {
          for (let k = 0; k < di; k++) {
            const sa = (((cSrc + k) % N) + N) % N;
            const sb = (((cSrc + k + 1) % N) + N) % N;
            off +=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        } else if (di < 0) {
          for (let k = 0; k < -di; k++) {
            const sa = (((cSrc - k) % N) + N) % N;
            const sb = (((cSrc - k - 1) % N) + N) % N;
            off -=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        }
        finalX = off;
        if (finalX < -half - buffer || finalX > half + buffer) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const below = -H * ENTRY.fromBelow;
        finalY = below + (y - below) * pe;
      }

      p.mesh.position.set(finalX, finalY, 0);
      p.mesh.scale.set(finalW, finalH, 1);

      const sx = centerX + W / 2;
      const sy = H / 2 - y;
      panelRects.push({
        left: sx - drawW / 2,
        right: sx + drawW / 2,
        top: sy - drawH / 2,
        bottom: sy + drawH / 2,
        poolIdx,
        srcIndex: i,
        centerX,
      });

      if (Math.abs(centerX) < centeredDist) {
        centeredDist = Math.abs(centerX);
        centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx };
      }
    });
  }

  function panelAtPointer(px, py) {
    for (const r of panelRects) {
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
        return r;
      }
    }
    return null;
  }

  function localPoint(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const el = renderer.domElement;
  let dragging = false;
  let dragPointerId = null;
  let dragLastX = 0;
  let dragDist = 0;
  let dragVel = 0;
  let dragMoveT = 0;
  let suppressClick = false;
  let dragPointerType = "mouse";
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let pointerInside = false;
  let lastPointerType = "mouse";

  // Touch intent tracking
  let touchStartX = 0;
  let touchStartY = 0;
  let touchLocked = false;
  let touchCancelled = false;

  if (cursorElement) {
    gsap.set(cursorElement, {
      xPercent: 20,
      yPercent: 30,
      scale: 0,
      autoAlpha: 0,
    });
  }
  const moveX = cursorElement
    ? gsap.quickTo(cursorElement, "x", { duration: 0.5, ease: "power3.out" })
    : null;
  const moveY = cursorElement
    ? gsap.quickTo(cursorElement, "y", { duration: 0.5, ease: "power3.out" })
    : null;

  let overPanel = false;
  let hoverPanel = false;
  let cursorNow = "";
  function setCursor(v) {
    if (v === cursorNow) return;
    cursorNow = v;
    el.style.cursor = v;
  }

  function updateCursor() {
    if (focusState.active || entryActive || entrySettled) return setCursor("");
    if (dragging) return setCursor("grabbing");
    if (!hoverPanel) return setCursor("");
    return setCursor("grab");
  }

  function setHover(on) {
    hoverPanel = on;
    setView(on);
  }

  function refreshHover() {
    if (!pointerInside || lastPointerType !== "mouse") return;
    if (!Number.isFinite(lastPointerX)) return;
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
  }

  function setView(on) {
    if (entryActive || entrySettled) on = false;
    if (dragging) on = false;
    if (on === overPanel) {
      updateCursor();
      return;
    }
    overPanel = on;
    updateCursor();
    if (!cursorElement) return;
    gsap.killTweensOf(cursorElement, "scale,autoAlpha,opacity,visibility");
    gsap.to(cursorElement, {
      scale: on ? 1 : 0,
      autoAlpha: on ? 1 : 0,
      duration: on ? 0.35 : 0.25,
      ease: on ? "power3.out" : "power3.in",
    });
  }

  function inputLocked() {
    return focusState.active || entryActive || entrySettled;
  }

  /**
   * Refined Wheel Behavior:
   * 1. If user strongly scrolls vertically (Math.abs(deltaY) > 40 and predominantly vertical),
   *    do NOT call preventDefault: page scrolls down naturally.
   * 2. If horizontal gesture (trackpad horizontal swipe or shiftKey): scrub carousel horizontally.
   * 3. Scoped strictly to carousel canvas element; leaving canvas restores normal page scroll.
   */
  function onWheel(e) {
    if (inputLocked()) {
      if (focusState.active) e.preventDefault();
      return;
    }

    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const isHorizontal = absX > absY || e.shiftKey;

    if (isHorizontal) {
      e.preventDefault();
      userInteracted = true;
      pendingFocus = null;
      target += (e.deltaX || e.deltaY) * WHEEL;
      lastInput = performance.now();
      snapped = false;
      return;
    }

    // If gentle wheel scroll while directly hovering a card, provide subtle scrub
    if (hoverPanel && absY <= 35) {
      e.preventDefault();
      userInteracted = true;
      pendingFocus = null;
      target += e.deltaY * (WHEEL * 0.8);
      lastInput = performance.now();
      snapped = false;
    }
    // Otherwise: normal vertical scroll flows to the page unobstructed!
  }

  function onPointerDown(e) {
    suppressClick = false;
    if (inputLocked()) return;
    if (dragging) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const p = localPoint(e);
    dragLastX = p.x;
    lastPointerX = p.x;
    lastPointerY = p.y;
    dragDist = 0;
    dragVel = 0;
    dragMoveT = performance.now();
    dragPointerType = e.pointerType || "mouse";
    dragPointerId = e.pointerId;

    if (e.pointerType === "touch") {
      touchStartX = p.x;
      touchStartY = p.y;
      touchLocked = false;
      touchCancelled = false;
      // Do not capture pointer yet — wait for horizontal intent!
    } else {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      dragging = true;
    }

    setView(false);
    velocity = 0;
    pendingFocus = null;
    userInteracted = true;
    snapped = false;
    lastInput = dragMoveT;
  }

  function onPointerMove(e) {
    const p = localPoint(e);

    // Touch horizontal intent detection
    if (e.pointerType === "touch") {
      if (touchCancelled) return;

      if (!touchLocked) {
        const dx = Math.abs(p.x - touchStartX);
        const dy = Math.abs(p.y - touchStartY);

        if (dy > 8 && dy > dx) {
          // User is scrolling vertically down the page — cancel horizontal drag!
          touchCancelled = true;
          dragging = false;
          return;
        } else if (dx > 8 && dx > dy * 1.2) {
          // Confirmed horizontal swipe intent!
          touchLocked = true;
          dragging = true;
          try {
            el.setPointerCapture(e.pointerId);
          } catch {}
        } else {
          return; // Still determining intent
        }
      }
    }

    if (dragging && e.pointerId === dragPointerId) {
      const sens = dragPointerType === "mouse" ? DRAG : TOUCH_DRAG;
      const dx = p.x - dragLastX;
      dragLastX = p.x;
      dragDist += Math.abs(dx);
      target -= dx * sens;
      dragVel = dragVel * 0.6 + -dx * sens * 0.4;
      dragMoveT = performance.now();
      lastInput = dragMoveT;
      snapped = false;
    }

    lastPointerX = p.x;
    lastPointerY = p.y;
    lastPointerType = e.pointerType || "mouse";
    pointerInside = true;

    if (e.pointerType !== "mouse") return;
    if (moveX) moveX(p.x);
    if (moveY) moveY(p.y);
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(p.x, p.y) !== null);
  }

  function onPointerUp(e) {
    if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;

    if (dragPointerId !== null) {
      try {
        el.releasePointerCapture(dragPointerId);
      } catch {}
      dragPointerId = null;
    }

    touchLocked = false;
    touchCancelled = false;

    if (!dragging) return;
    dragging = false;

    velocity =
      performance.now() - dragMoveT > FLICK_IDLE_MS ? 0 : dragVel;
    dragVel = 0;
    lastInput = performance.now();
    snapped = false;
    suppressClick =
      dragDist >
      (dragPointerType === "mouse" ? CLICK_SLOP : TOUCH_CLICK_SLOP);

    if (dragPointerType === "mouse") {
      setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
    } else {
      updateCursor();
    }
  }

  function onEnter(e) {
    pointerInside = true;
    lastPointerType = e.pointerType || "mouse";
  }
  function onLeave() {
    pointerInside = false;
    setHover(false);
  }

  function onClick(e) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (inputLocked()) return;
    const p = localPoint(e);
    const hit = panelAtPointer(p.x, p.y);
    if (!hit) return;
    if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
      pendingFocus = null;
      openFocus();
      return;
    }
    userInteracted = true;
    velocity = 0;
    target = centerForIndex(nearestIndex(scroll + hit.centerX));
    snapped = true;
    pendingFocus = { srcIndex: hit.srcIndex };
    setView(false);
  }

  function openFocus() {
    if (focusState.active || !centeredPanel) return;
    const src = sources[centeredPanel.srcIndex];
    if (!src?.tex) return;

    focusState.active = true;
    focusState.srcIndex = centeredPanel.srcIndex;
    const focusPoolIdx = centeredPanel.poolIdx;
    focusState.poolIdx = focusPoolIdx;
    target = centerForIndex(nearestIndex(scroll));

    const focusX = lastCenterX[focusPoolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.idx !== focusPoolIdx && o.x !== undefined)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => a.dist - b.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && o.dist - prevDist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    for (const key of LENS_FX_KEYS) {
      lensFxFull[key] = lensUniforms[key].value;
    }

    if (focusState.anim) focusState.anim.kill();

    // Dynamically clamp focus scale so it never overflows viewport height or width
    const currentH = centeredPanel.h || PANEL_H;
    const currentW = centeredPanel.wPx || (PANEL_H * src.aspect);
    const maxScaleByHeight = (H * 0.80) / Math.max(1, currentH);
    const maxScaleByWidth = (W * 0.85) / Math.max(1, currentW);
    const targetScale = Math.min(FOCUS.centerScale, maxScaleByHeight, maxScaleByWidth);


    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline();
    tl.to(focusState, { lensFx: 0, duration: FOCUS.lensFade, ease: "power3.out" }, 0);
    tl.to(
      scaleProxy,
      {
        v: targetScale,
        duration: FOCUS.focusDuration,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
        },
      },
      0
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        { [o.idx]: 1, duration: FOCUS.cardDuration, ease: FOCUS.cardEase },
        o.rank * FOCUS.stagger
      );
    });
    focusState.anim = tl;
    setView(false);
    options.onFocusChange(true);
  }

  function closeFocus() {
    if (!focusState.active) return;
    if (focusState.anim) focusState.anim.kill();

    const focusX = lastCenterX[focusState.poolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => b.dist - a.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && prevDist - o.dist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    options.onFocusChange(false);
    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline({
      onComplete: () => {
        focusState.active = false;
        focusState.srcIndex = -1;
        updateCursor();
      },
    });
    tl.to(
      focusState,
      { lensFx: 1, duration: FOCUS.lensFade * 0.8, ease: "power3.inOut" },
      0
    );
    tl.to(
      scaleProxy,
      {
        v: 1,
        duration: FOCUS.focusDuration * 0.85,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
        },
      },
      0
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        {
          [o.idx]: 0,
          duration: FOCUS.cardDuration * 0.85,
          ease: FOCUS.cardEase,
        },
        o.rank * FOCUS.stagger * 0.7
      );
    });
    focusState.anim = tl;
  }

  function playEntry() {
    if (!entryOn) {
      options.onEntryDone(true);
      return;
    }
    if (entryAnim) entryAnim.kill();
    for (let k = 0; k < pEntry.length; k++) pEntry[k] = 0;
    entryActive = true;
    entrySettled = false;
    options.onEntryDone(false);
    for (let k = 0; k < growArr.length; k++) growArr[k] = 0;
    focusState.lensFx = 0;
    target = centerForIndex(nearestIndex(scroll));
    scroll = target;
    velocity = 0;
    snapped = true;
    layout();
    const visibleCards = [];
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] !== undefined) visibleCards.push(k);
    }
    const tl = gsap.timeline({ delay: ENTRY.delay });
    const spread = ENTRY.stagger * Math.max(visibleCards.length - 1, 1);
    let lastRiseEnd = 0;
    visibleCards.forEach((idx) => {
      const atPos = Math.random() * spread;
      lastRiseEnd = Math.max(lastRiseEnd, atPos + ENTRY.riseDuration);
      tl.to(
        pEntry,
        { [idx]: 1, duration: ENTRY.riseDuration, ease: ENTRY.riseEase },
        atPos
      );
    });
    tl.call(
      () => {
        entryActive = false;
        entrySettled = true;
      },
      [],
      lastRiseEnd
    );
    const cSrcG = centerIndex(scroll);
    const Ng = sources.length;
    const midRepG = Math.floor(REPEATS / 2);
    const growList = [];
    let maxRank = 0;
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] === undefined) continue;
      if (Math.floor(k / Ng) !== midRepG) continue;
      let di = (k % Ng) - cSrcG;
      if (di > Ng / 2) di -= Ng;
      if (di < -Ng / 2) di += Ng;
      const r = Math.abs(di);
      maxRank = Math.max(maxRank, r);
      growList.push({ idx: k, rank: r });
    }
    const growRanked = growList.map((v) => ({
      idx: v.idx,
      rank: maxRank - v.rank,
    }));
    const growStart = lastRiseEnd + ENTRY.growDelay;
    let growEnd = growStart;
    tl.to(
      focusState,
      { lensFx: 1, duration: ENTRY.lensBloom, ease: ENTRY.lensBloomEase },
      growStart
    );
    growRanked.forEach((o) => {
      const atPos = growStart + o.rank * ENTRY.growStagger;
      growEnd = Math.max(growEnd, atPos + ENTRY.growDuration);
      tl.to(
        growArr,
        { [o.idx]: 1, duration: ENTRY.growDuration, ease: ENTRY.growEase },
        atPos
      );
    });
    tl.call(
      () => {
        entrySettled = false;
        for (let k = 0; k < growArr.length; k++) growArr[k] = 1;
        options.onEntryDone(true);
        updateCursor();
      },
      [],
      growEnd
    );
    entryAnim = tl;
  }

  function step(direction) {
    if (inputLocked()) return;
    userInteracted = true;
    velocity = 0;
    pendingFocus = null;
    target = centerForIndex(nearestIndex(scroll) + direction);
    snapped = true;
    lastInput = performance.now();
  }

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("click", onClick);

  let raf = 0;
  let running = true;
  let isVisible = true;

  function tick() {
    if (!running) return;
    if (!isVisible || document.hidden) {
      raf = 0;
      return;
    }
    if (!dragging) {
      target += velocity;
      velocity *= FRICTION;
      if (Math.abs(velocity) < 0.05) velocity = 0;
      if (
        !snapped &&
        !focusState.active &&
        performance.now() - lastInput > SNAP_IDLE_MS
      ) {
        target = centerForIndex(nearestIndex(scroll));
        snapped = true;
      }
    }
    const follow =
      dragging && dragPointerType !== "mouse"
        ? TOUCH_EASE
        : snapped && !pendingFocus
          ? SNAP_EASE
          : EASE;
    scroll += (target - scroll) * follow;

    const ci = centerIndex(scroll);
    if (ci !== lastCenter) {
      lastCenter = ci;
      options.onActiveChange(ci);
    }

    const rawSpeed = scroll - prevScroll;
    prevScroll = scroll;
    const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, SHRINK_MAX));
    const k = norm > scrollEnergy ? SHRINK_ATTACK : SHRINK_DECAY;
    scrollEnergy += (norm - scrollEnergy) * k;

    layout();
    refreshHover();

    if (pendingFocus && !focusState.active) {
      if (Math.abs(target - scroll) < 0.5) {
        const pf = pendingFocus;
        pendingFocus = null;
        if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex) {
          openFocus();
        }
      }
    }

    lensUniforms.uCenter.value.set(LENS.posX, LENS.posY);
    lensUniforms.uAspect.value = W / H;
    lensUniforms.uTime.value = performance.now() * 0.001;
    const rad = (a) => (a * Math.PI) / 180;
    lensUniforms.uRotation.value =
      rad(LENS.rotation) + rad(LENS.spin) * (performance.now() * 0.001);
    const fx = focusState.lensFx;
    for (const key of LENS_FX_KEYS) {
      lensUniforms[key].value = lensFxFull[key] * fx;
    }

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(lensScene, lensCam);
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!running || raf) return;
    raf = requestAnimationFrame(tick);
  }

  startLoop();
  if (entryOn) playEntry();
  else options.onEntryDone(true);

  function onResize() {
    W = Math.max(1, mount.clientWidth);
    H = Math.max(1, mount.clientHeight);
    PANEL_H = panelHFor();
    recomputeTotal();
    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    rt.setSize(W * ratio, H * ratio);
    lensUniforms.uRes.value.set(W * ratio, H * ratio);
    if (!userInteracted) {
      scroll = centerForIndex(0);
      target = scroll;
    }
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(mount);
  const intersection = new IntersectionObserver(([entry]) => {
    const box = entry?.boundingClientRect;
    if (!box || (box.width === 0 && box.height === 0)) return;
    isVisible = entry?.isIntersecting ?? true;
    if (isVisible) startLoop();
  });
  intersection.observe(mount);
  const onVisibility = () => {
    if (!document.hidden) startLoop();
  };
  document.addEventListener("visibilitychange", onVisibility);

  function destroy() {
    running = false;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("click", onClick);
    if (focusState.anim) focusState.anim.kill();
    if (entryAnim) entryAnim.kill();
    if (cursorElement) gsap.killTweensOf(cursorElement);
    renderer.dispose();
    rt.dispose();
    lensQuad.geometry.dispose();
    lensMat.dispose();
    pool.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mat.dispose();
    });
    sources.forEach((s) => {
      s.tex?.dispose();
    });
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return {
    closeFocus,
    next: () => step(1),
    previous: () => step(-1),
    destroy,
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * LiquidGlassCarousel
 * Infinite luxury fashion image row with real-time liquid-glass WebGL refraction.
 */
export function LiquidGlassCarousel({
  items = liquidGlassCarouselDefaultItems,
  panelHeight = 450,
  gap = 22,
  background = "#f3f3ef",
  entry = true,
  className,
  style,
  onActiveChange,
  onFocusChange,
}) {
  const mountRef = useRef(null);
  const cursorRef = useRef(null);
  const engineRef = useRef(null);
  const titleRef = useRef(null);
  const counterRef = useRef(null);
  const metaRef = useRef(null);
  const revealPlayedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [entryDone, setEntryDone] = useState(!entry);
  const [failed, setFailed] = useState(false);
  const labelId = useId();
  const liveId = useId();
  const current = items[active] ?? items[0];
  const onActiveChangeRef = useRef(onActiveChange);
  const onFocusChangeRef = useRef(onFocusChange);
  onActiveChangeRef.current = onActiveChange;
  onFocusChangeRef.current = onFocusChange;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || items.length === 0) return;

    const engine = createCarousel(mount, cursorRef.current, {
      items,
      panelHeight,
      gap,
      background,
      entry,
      onActiveChange: (index) => {
        setActive(index);
        onActiveChangeRef.current?.(index);
      },
      onFocusChange: (open) => {
        setFocused(open);
        onFocusChangeRef.current?.(open);
      },
      onEntryDone: setEntryDone,
    });
    if (!engine) {
      setFailed(true);
      return;
    }
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [items, panelHeight, gap, background, entry]);

  useEffect(() => {
    const title = titleRef.current;
    const counter = counterRef.current;
    const meta = metaRef.current;
    if (!title || !counter) return;
    const reduced = prefersReducedMotion();
    gsap.set(title, { xPercent: -50 });
    gsap.set(counter, { xPercent: -50 });
    if (meta) gsap.set(meta, { xPercent: -50 });

    if (!entryDone && entry && !reduced) {
      gsap.set([title, counter, meta].filter(Boolean), { autoAlpha: 0 });
      revealPlayedRef.current = false;
      return;
    }

    const y = focused ? window.innerHeight * -0.035 : 0;
    if (entryDone && !focused && !revealPlayedRef.current) {
      revealPlayedRef.current = true;
      gsap.fromTo(
        title,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduced ? 0 : 1.2, ease: "power2.out" }
      );
      if (meta) {
        gsap.fromTo(
          meta,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduced ? 0 : 1.2, ease: "power2.out", delay: 0.08 }
        );
      }
      gsap.fromTo(
        counter,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: reduced ? 0 : 1.2,
          ease: "power2.out",
          delay: reduced ? 0 : 0.16,
        }
      );
      return;
    }

    gsap.to(title, {
      y,
      autoAlpha: 1,
      duration: reduced ? 0 : 0.35,
      ease: "power3.out",
    });
    if (meta) {
      gsap.to(meta, {
        y,
        autoAlpha: focused ? 0.95 : 0.72,
        duration: reduced ? 0 : 0.35,
        ease: "power3.out",
      });
    }
    gsap.to(counter, {
      autoAlpha: focused ? 0 : 1,
      duration: reduced ? 0 : 0.35,
      ease: "power3.out",
    });
  }, [focused, entryDone, entry]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      engineRef.current?.next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      engineRef.current?.previous();
    } else if (event.key === "Escape") {
      event.preventDefault();
      engineRef.current?.closeFocus();
    }
  };

  return (
    <div
      className={cn(
        "relative h-full min-h-[440px] w-full overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-black/25",
        className
      )}
      style={{
        background,
        color: "#111111",
        position: "relative",
        width: "100%",
        minHeight: "440px",
        overflow: "hidden",
        outline: "none",
        ...style,
      }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onKeyDown={onKeyDown}
    >
      <p id={labelId} className="sr-only">
        Liquid glass editorial fashion carousel
      </p>
      <p id={liveId} className="sr-only" aria-live="polite">
        {current?.title ?? ""}, {pad(active + 1)} of {pad(items.length)}
        {focused ? ", focused" : ""}
      </p>

      <WebGLErrorBoundary
        items={items}
        fallback={<WebGLFallback items={items} className="absolute inset-0" />}
      >
        {failed ? (
          <WebGLFallback items={items} className="absolute inset-0" />
        ) : (
          <div ref={mountRef} className="absolute inset-0" style={{ position: "absolute", inset: 0 }} />
        )}
      </WebGLErrorBoundary>

      {/* Editorial Title & Category */}
      <div
        ref={titleRef}
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: "50%",
          top: "3.2%",
          zIndex: 10,
          textAlign: "center",
          opacity: 0,
          transform: "translateX(-50%)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "clamp(14px, 1.35vw, 17px)",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "#111111",
            textTransform: "uppercase",
            fontFamily: "var(--font-sans, sans-serif)",
            whiteSpace: "nowrap",
          }}
        >
          {current?.title}
        </p>
        <p
          ref={metaRef}
          style={{
            margin: "4px 0 0 0",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.14em",
            color: "#666660",
            textTransform: "uppercase",
            fontFamily: "var(--font-sans, sans-serif)",
            whiteSpace: "nowrap",
          }}
        >
          {current?.category} &nbsp;·&nbsp; {current?.price}
        </p>
      </div>

      {/* Carousel Index Counter */}
      <p
        ref={counterRef}
        style={{
          pointerEvents: "none",
          position: "absolute",
          bottom: "4.8%",
          left: "50%",
          zIndex: 10,
          margin: 0,
          textAlign: "center",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "#444440",
          opacity: 0,
          transform: "translateX(-50%)",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        {pad(active + 1)} &nbsp;/&nbsp; {pad(items.length)}
      </p>

      {/* Hover Floating Cursor Badge (desktop only) */}
      <div
        ref={cursorRef}
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 20,
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#ffffff",
          backgroundColor: "rgba(17, 17, 17, 0.85)",
          padding: "6px 12px",
          borderRadius: "100px",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
        className="hidden md:block"
      >
        EXPLORE
      </div>

      {/* Close button during focus state */}
      <button
        type="button"
        onClick={() => engineRef.current?.closeFocus()}
        aria-label="Close focused look"
        style={{
          position: "absolute",
          right: "4%",
          top: "3.5%",
          zIndex: 25,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#111111",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "100px",
          cursor: "pointer",
          padding: "8px 16px",
          opacity: focused ? 1 : 0,
          pointerEvents: focused ? "auto" : "none",
          transition: "all 0.3s ease",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        CLOSE [ESC]
      </button>

      {/* Focus state View Product CTA */}
      {focused && current?.slug && (
        <a
          href={`/product/${current.slug}`}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "4.5%",
            transform: "translateX(-50%)",
            zIndex: 25,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#ffffff",
            backgroundColor: "#111111",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "100px",
            padding: "9px 20px",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-sans, sans-serif)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
          aria-label={`View product details for ${current.title}`}
        >
          VIEW PRODUCT &rarr;
        </a>
      )}

      {/* Navigation cues */}
      <div
        style={{
          position: "absolute",
          left: "4%",
          bottom: "4.8%",
          zIndex: 15,
          display: "flex",
          gap: "14px",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.14em",
          color: "#888880",
          textTransform: "uppercase",
          pointerEvents: "none",
          opacity: focused ? 0 : 0.85,
          transition: "opacity 0.3s ease",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        <span>DRAG TO SCRUB</span>
        <span>·</span>
        <span>CLICK TO FOCUS</span>
      </div>
    </div>
  );
}

export default LiquidGlassCarousel;
