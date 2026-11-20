 'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import countriesTopo from 'world-atlas/countries-110m.json';

type RouteId =
  | 'all'
  | 'CN-CMB'
  | 'CN-DXB'
  | 'CN-USA'
  | 'CN-EU'
  | 'CN-UK'
  | 'CN-JPN'
  | 'CN-MY'
  | 'CN-AU'
  | 'CMB-DXB';

interface HubPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  color: number;
}

interface TradeRoute {
  id: Exclude<RouteId, 'all'>;
  buttonLabel: string;
  from: string;
  to: string;
  color: number;
  transitTime: string;
  airRate: string;
}

const HUBS: HubPoint[] = [
  { id: 'China', label: 'Guangzhou Hub', lat: 23.1291, lng: 113.2644, color: 0x4f46e5 },
  { id: 'Colombo', label: 'Colombo Hub', lat: 6.9271, lng: 79.8612, color: 0x10b981 },
  { id: 'Dubai', label: 'Dubai Hub', lat: 25.2048, lng: 55.2708, color: 0x7c3aed },
  { id: 'Malaysia', label: 'Kuala Lumpur', lat: 3.139, lng: 101.6869, color: 0x059669 },
  { id: 'EU', label: 'Rotterdam (EU)', lat: 51.9244, lng: 4.4777, color: 0x2563eb },
  { id: 'UK', label: 'London (UK)', lat: 51.5074, lng: -0.1278, color: 0x6366f1 },
  { id: 'Japan', label: 'Tokyo (Japan)', lat: 35.6762, lng: 139.6503, color: 0x8b5cf6 },
  { id: 'USA', label: 'Los Angeles (US)', lat: 34.0522, lng: -118.2437, color: 0xf97316 },
  { id: 'Australia', label: 'Sydney (AU)', lat: -33.8688, lng: 151.2093, color: 0x0ea5e9 },
];

const TRADE_ROUTES: TradeRoute[] = [
  { id: 'CN-CMB', buttonLabel: 'China → Colombo', from: 'China', to: 'Colombo', color: 0x10b981, transitTime: '2–4 Days Air', airRate: 'From $4.80/kg' },
  { id: 'CN-DXB', buttonLabel: 'China → Dubai', from: 'China', to: 'Dubai', color: 0x7c3aed, transitTime: '3–5 Days Air', airRate: 'From $5.20/kg' },
  { id: 'CN-USA', buttonLabel: 'China → USA', from: 'China', to: 'USA', color: 0xf97316, transitTime: '4–6 Days Air', airRate: 'From $6.90/kg' },
  { id: 'CN-EU', buttonLabel: 'China → EU', from: 'China', to: 'EU', color: 0x2563eb, transitTime: '4–7 Days Air', airRate: 'From $6.40/kg' },
  { id: 'CN-UK', buttonLabel: 'China → UK', from: 'China', to: 'UK', color: 0x4f46e5, transitTime: '3–6 Days Air', airRate: 'From $6.10/kg' },
  { id: 'CN-JPN', buttonLabel: 'China → Japan', from: 'China', to: 'Japan', color: 0x8b5cf6, transitTime: '1–3 Days Air', airRate: 'From $3.90/kg' },
  { id: 'CN-MY', buttonLabel: 'China → Malaysia', from: 'China', to: 'Malaysia', color: 0x059669, transitTime: '2–3 Days Air', airRate: 'From $3.50/kg' },
  { id: 'CN-AU', buttonLabel: 'China → Australia', from: 'China', to: 'Australia', color: 0x0ea5e9, transitTime: '3–5 Days Air', airRate: 'From $5.60/kg' },
  { id: 'CMB-DXB', buttonLabel: 'Colombo → Dubai', from: 'Colombo', to: 'Dubai', color: 0x6366f1, transitTime: '1–2 Days Air', airRate: 'From $3.20/kg' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function computeFocusAnglesForPoint(pointOnSphere: THREE.Vector3): { rotX: number; rotY: number } {
  const dir = pointOnSphere.clone().normalize();
  const rotY = Math.atan2(dir.x, dir.z);
  const horizontalLen = Math.hypot(dir.x, dir.z);
  const rotX = Math.atan2(dir.y, horizontalLen);
  return {
    rotX: THREE.MathUtils.clamp(rotX * 0.75, -0.45, 0.55),
    rotY,
  };
}

function drawGeoJsonRings(
  ctx: CanvasRenderingContext2D,
  rings: number[][][],
  width: number,
  height: number
) {
  ctx.beginPath();
  rings.forEach((ring) => {
    ring.forEach((coord, idx) => {
      const lng = coord[0];
      const lat = coord[1];
      if (typeof lng !== 'number' || typeof lat !== 'number') return;
      const px = ((lng + 180) / 360) * width;
      const py = ((90 - lat) / 180) * height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
  });

  const landGrad = ctx.createLinearGradient(0, 0, 0, height);
  landGrad.addColorStop(0, '#c7d2fe'); // Indigo-200
  landGrad.addColorStop(0.5, '#a5b4fc'); // Indigo-300
  landGrad.addColorStop(1, '#818cf8'); // Indigo-400
  ctx.fillStyle = landGrad;
  ctx.fill('evenodd');

  ctx.strokeStyle = '#4f46e5'; // Indigo-600 border
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function createRealWorldMapTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Clean ocean surface matching Swiftline white/indigo palette
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#e0e7ff');
  oceanGrad.addColorStop(0.5, '#f8fafc');
  oceanGrad.addColorStop(1, '#dbeafe');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Extract real GeoJSON countries from world-atlas TopoJSON
  const topology = countriesTopo as unknown as Parameters<typeof topojson.feature>[0];
  const countriesObj = (countriesTopo as unknown as { objects: { countries: Parameters<typeof topojson.feature>[1] } }).objects.countries;
  const geo = topojson.feature(topology, countriesObj) as unknown as {
    features: Array<{
      geometry?: {
        type: string;
        coordinates: unknown;
      };
    }>;
  };

  geo.features.forEach((feature) => {
    const geom = feature.geometry;
    if (!geom) return;

    if (geom.type === 'Polygon') {
      drawGeoJsonRings(ctx, geom.coordinates as number[][][], width, height);
    } else if (geom.type === 'MultiPolygon') {
      const multi = geom.coordinates as number[][][][];
      multi.forEach((poly) => {
        drawGeoJsonRings(ctx, poly, width, height);
      });
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export default function GlobalHubsGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const focusLabelRef = useRef<HTMLDivElement>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteId>('all');
  const selectedRouteRef = useRef<RouteId>('all');
  const targetFocusRef = useRef<{ rotX: number; rotY: number } | null>(null);

  const activeRouteData =
    selectedRoute === 'all' ? null : TRADE_ROUTES.find((r) => r.id === selectedRoute) ?? null;

  useEffect(() => {
    selectedRouteRef.current = selectedRoute;

    if (selectedRoute === 'all') {
      targetFocusRef.current = null;
      return;
    }

    const route = TRADE_ROUTES.find((r) => r.id === selectedRoute);
    if (!route) return;

    const origHub = HUBS.find((h) => h.id === route.from);
    const destHub = HUBS.find((h) => h.id === route.to);
    if (!origHub || !destHub) return;

    const vStart = latLngToVector3(origHub.lat, origHub.lng, 92);
    const vEnd = latLngToVector3(destHub.lat, destHub.lng, 92);
    const corridorCenter = vStart.clone().add(vEnd).multiplyScalar(0.5);
    targetFocusRef.current = computeFocusAnglesForPoint(corridorCenter);
  }, [selectedRoute]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 278;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = 'globe__canvas';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 92;

    // 1. Real World Map Sphere
    const worldTexture = createRealWorldMapTexture();
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 72, 72);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: worldTexture,
      shininess: 16,
      specular: new THREE.Color(0xe0e7ff),
      transparent: true,
      opacity: 0.99,
    });
    globeGroup.add(new THREE.Mesh(sphereGeometry, sphereMaterial));

    // 2. Soft Outer Atmosphere Glow
    const rimGeometry = new THREE.SphereGeometry(GLOBE_RADIUS + 3.2, 48, 48);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    globeGroup.add(new THREE.Mesh(rimGeometry, rimMaterial));

    const hubVectors: Record<string, THREE.Vector3> = {};
    const hubVisuals: { hubId: string; ring: THREE.Mesh }[] = [];

    HUBS.forEach((hub) => {
      const isPrimary = hub.id === 'China' || hub.id === 'Colombo' || hub.id === 'Dubai';
      const pos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS + 0.7);
      hubVectors[hub.id] = pos;

      const markerGeo = new THREE.SphereGeometry(isPrimary ? 2.5 : 1.8, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      globeGroup.add(marker);

      const ringGeo = new THREE.RingGeometry(isPrimary ? 3.7 : 2.5, isPrimary ? 5.5 : 3.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isPrimary ? 0.9 : 0.65,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring);

      hubVisuals.push({ hubId: hub.id, ring });
    });

    const arcObjects: {
      route: TradeRoute;
      material: THREE.MeshBasicMaterial;
      curve: THREE.QuadraticBezierCurve3;
      pulseMesh: THREE.Mesh;
      pulseMat: THREE.MeshBasicMaterial;
      phaseOffset: number;
    }[] = [];

    TRADE_ROUTES.forEach((route, idx) => {
      const start = hubVectors[route.from];
      const end = hubVectors[route.to];
      if (!start || !end) return;

      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(distance * 0.22, 28));

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tubeGeometry = new THREE.TubeGeometry(curve, 56, 0.6, 8, false);
      const arcMaterial = new THREE.MeshBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.88,
      });
      globeGroup.add(new THREE.Mesh(tubeGeometry, arcMaterial));

      const pulseGeo = new THREE.SphereGeometry(1.5, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      globeGroup.add(pulseMesh);

      arcObjects.push({
        route,
        material: arcMaterial,
        curve,
        pulseMesh,
        pulseMat,
        phaseOffset: idx * 0.13,
      });
    });

    scene.add(new THREE.AmbientLight(0xffffff, 1.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(120, 140, 180);
    scene.add(dirLight);

    const initialFocus = computeFocusAnglesForPoint(
      latLngToVector3(18, 95, GLOBE_RADIUS)
    );
    globeGroup.rotation.y = initialFocus.rotY;
    globeGroup.rotation.x = initialFocus.rotX;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      targetFocusRef.current = null;
      renderer.domElement.style.cursor = 'grabbing';
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };
      globeGroup.rotation.y += deltaMove.x * 0.0055;
      globeGroup.rotation.x = THREE.MathUtils.clamp(
        globeGroup.rotation.x + deltaMove.y * 0.0055,
        -0.8,
        0.8
      );
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const tempVec = new THREE.Vector3();
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const activeId = selectedRouteRef.current;
      const activeRouteObj =
        activeId === 'all' ? undefined : TRADE_ROUTES.find((r) => r.id === activeId);

      arcObjects.forEach(({ route, material, curve, pulseMesh, pulseMat, phaseOffset }) => {
        const isSelected = activeId === 'all' || route.id === activeId;
        material.opacity = isSelected ? (activeId === 'all' ? 0.85 : 1.0) : 0.08;

        const t = (elapsed * 0.34 + phaseOffset) % 1;
        const pt = curve.getPointAt(t);
        pulseMesh.position.copy(pt);
        pulseMesh.visible = isSelected;
        pulseMat.color.setHex(activeId === 'all' ? route.color : 0xffffff);
        pulseMesh.scale.setScalar(activeId === 'all' ? 1.0 : 1.45);
      });

      const ringPulse = 1 + Math.sin(elapsed * 3.2) * 0.14;
      hubVisuals.forEach(({ hubId, ring }) => {
        const ringMat = ring.material as THREE.MeshBasicMaterial;
        if (!activeRouteObj) {
          const primary = hubId === 'China' || hubId === 'Colombo' || hubId === 'Dubai';
          ringMat.opacity = primary ? 0.92 : 0.65;
          ring.scale.setScalar(primary ? ringPulse : 1);
        } else {
          const isEndpoint = hubId === activeRouteObj.from || hubId === activeRouteObj.to;
          ringMat.opacity = isEndpoint ? 1.0 : 0.12;
          ring.scale.setScalar(isEndpoint ? ringPulse * 1.2 : 1);
        }
      });

      if (!isDragging) {
        if (targetFocusRef.current) {
          let deltaY = targetFocusRef.current.rotY - globeGroup.rotation.y;
          deltaY = Math.atan2(Math.sin(deltaY), Math.cos(deltaY));
          globeGroup.rotation.y += deltaY * 0.07;
          globeGroup.rotation.x += (targetFocusRef.current.rotX - globeGroup.rotation.x) * 0.07;
        } else {
          globeGroup.rotation.y += 0.0012;
        }
      }

      if (focusLabelRef.current) {
        if (activeRouteObj && hubVectors[activeRouteObj.from] && hubVectors[activeRouteObj.to]) {
          tempVec
            .copy(hubVectors[activeRouteObj.from])
            .add(hubVectors[activeRouteObj.to])
            .multiplyScalar(0.5);
        } else if (hubVectors['China']) {
          tempVec.copy(hubVectors['China']);
        }

        globeGroup.localToWorld(tempVec);
        const isFrontFacing = tempVec.z > 0;
        tempVec.project(camera);

        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const sx = (tempVec.x * 0.5 + 0.5) * cw;
        const sy = (-tempVec.y * 0.5 + 0.5) * ch;

        focusLabelRef.current.style.transform = `translate3d(${sx + 10}px, ${sy - 14}px, 0)`;
        focusLabelRef.current.style.opacity = isFrontFacing ? '1' : '0';
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
      worldTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center lg:items-start">
      <div className="relative w-full h-[430px] sm:h-[490px] lg:h-[500px] flex items-center justify-center">
        <div className="absolute w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div ref={mountRef} className="w-full h-full" />

        <div
          ref={focusLabelRef}
          className="absolute top-0 left-0 pointer-events-none transition-opacity duration-200 select-none bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-indigo-200 shadow-md"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-extrabold text-slate-900 leading-tight">
              {activeRouteData ? activeRouteData.buttonLabel : 'Guangzhou Hub'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-indigo-600 leading-tight mt-0.5">
            {activeRouteData
              ? `${activeRouteData.transitTime} • ${activeRouteData.airRate}`
              : 'Global Sourcing Origin'}
          </div>
        </div>
      </div>

      {/* Active Corridor Telemetry Strip */}
      <div className="w-full mb-3 p-3.5 rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
            {activeRouteData ? 'FOCUSED TRADE CORRIDOR' : 'GLOBAL NETWORK TELEMETRY'}
          </div>
          <div className="text-sm font-extrabold text-slate-900">
            {activeRouteData ? activeRouteData.buttonLabel : '9 Active China & Regional Corridors'}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[9px]">TRANSIT</span>
            <span className="font-bold text-slate-800">
              {activeRouteData ? activeRouteData.transitTime : '1–6 Days Air'}
            </span>
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="text-emerald-700 block text-[9px]">EST. RATE</span>
            <span className="font-bold text-emerald-700">
              {activeRouteData ? activeRouteData.airRate : 'From $3.20/kg'}
            </span>
          </div>
        </div>
      </div>

      {/* Highlight a global route */}
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-900">Highlight a global route</span>
          <span className="text-[11px] font-mono text-slate-400">Click route to focus</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedRoute('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
              selectedRoute === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            All routes
          </button>
          {TRADE_ROUTES.map((route) => {
            const active = selectedRoute === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRoute(route.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white/95 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {route.buttonLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}