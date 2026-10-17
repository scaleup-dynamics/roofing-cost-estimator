import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoofMaterial, RoofPitch, Stories, ExtraAddonKey } from '../../types';
import {
  createAsphaltShingleTexture,
  createStandingSeamTexture,
  createClayTileTexture,
  createFlatTPOTexture,
  createWallTexture,
  createCedarWoodTexture,
} from './textureGenerator';
import { Maximize2, Play, Pause, Compass, Sparkles } from 'lucide-react';

interface RoofVisualizer3DProps {
  material: RoofMaterial;
  pitch: RoofPitch;
  stories: Stories;
  extras: ExtraAddonKey[];
  height?: string;
  interactive?: boolean;
}

export const RoofVisualizer3D: React.FC<RoofVisualizer3DProps> = ({
  material,
  pitch,
  stories,
  extras,
  height = 'h-72 sm:h-96',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'perspective' | 'overhead' | 'front'>('perspective');

  // Stable refs for event loop and direct control access
  const autoRotateRef = useRef<boolean>(true);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const houseGroupRef = useRef<THREE.Group | null>(null);

  // Mesh and component refs
  const roofMeshRef = useRef<THREE.Mesh | null>(null);
  const ridgeCapMeshRef = useRef<THREE.Mesh | null>(null);
  const gableFrontMeshRef = useRef<THREE.Mesh | null>(null);
  const gableBackMeshRef = useRef<THREE.Mesh | null>(null);
  const parapetGroupRef = useRef<THREE.Group | null>(null);
  const guttersGroupRef = useRef<THREE.Group | null>(null);
  const skylightMeshRef = useRef<THREE.Mesh | null>(null);
  const wallsMeshRef = useRef<THREE.Mesh | null>(null);
  const secondFloorMeshRef = useRef<THREE.Group | null>(null);
  const fasciaMeshRef = useRef<THREE.Mesh | null>(null);

  // Material resources cache for clean GPU disposal
  const resourcesRef = useRef<any[]>([]);

  // Synchronize autoRotate state with ref and controls
  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup - optimal architectural 3/4 beauty angle
    const width = container.clientWidth || 360;
    const heightPx = container.clientHeight || 280;
    const camera = new THREE.PerspectiveCamera(36, width / heightPx, 0.1, 100);
    camera.position.set(11.2, 7.8, 12.0);
    cameraRef.current = camera;

    // 3. Renderer setup with high dynamic range and natural exposure
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02; // Balanced exposure - eliminates washed-out white clipping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    renderer.domElement.style.touchAction = 'pan-y';

    // 4. Balanced Studio Environment & Architectural Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // Key directional light: Warm Texas golden-hour sunlight with crisp contact shadows
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.65);
    sunLight.position.set(13, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = isMobile ? 512 : 1024;
    sunLight.shadow.mapSize.height = isMobile ? 512 : 1024;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 9;
    sunLight.shadow.camera.bottom = -9;
    scene.add(sunLight);

    // Fill light: Cool sky ambient for rich, readable shadow tones
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x3d2c1f, 0.65);
    scene.add(hemiLight);

    // Rim light: Crisp architectural cyan-blue rim light on shadow side for dramatic silhouette
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-12, 10, -12);
    scene.add(rimLight);

    // Front soft fill
    const frontFill = new THREE.DirectionalLight(0xffeedd, 0.35);
    frontFill.position.set(0, 4, 14);
    scene.add(frontFill);

    // 5. OrbitControls configuration
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6.0;
    controls.maxDistance = 24;
    controls.target.set(0, 2.2, 0);

    // Direct auto-rotation binding - no mouse hover interference
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.4;

    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.enableZoom = !isMobile;
    controlsRef.current = controls;

    // 6. Presentation Plinth & Manicured Lawn
    // Dark architectural pedestal
    const plinthGeo = new THREE.CylinderGeometry(8.2, 8.6, 0.35, isMobile ? 32 : 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0a1017,
      roughness: 0.5,
      metalness: 0.3,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.18;
    plinth.receiveShadow = true;
    scene.add(plinth);
    resourcesRef.current.push(plinthGeo, plinthMat);

    // Deep manicured lawn
    const lawnGeo = new THREE.CylinderGeometry(7.9, 8.0, 0.05, isMobile ? 32 : 64);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x142b1a, // rich deep emerald lawn
      roughness: 0.95,
      metalness: 0.02,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.y = 0.02;
    lawn.receiveShadow = true;
    scene.add(lawn);
    resourcesRef.current.push(lawnGeo, lawnMat);

    // Luxury amber perimeter ambient ring
    const ringGeo = new THREE.RingGeometry(7.85, 8.05, isMobile ? 32 : 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    scene.add(ring);
    resourcesRef.current.push(ringGeo, ringMat);

    // Modern stone walkway pavers leading to entrance
    for (let p = 0; p < 4; p++) {
      const paverGeo = new THREE.BoxGeometry(0.85, 0.04, 0.42);
      const paverMat = new THREE.MeshStandardMaterial({
        color: 0x8a97a8, // bluestone architectural pavers
        roughness: 0.8,
        metalness: 0.1,
      });
      const paver = new THREE.Mesh(paverGeo, paverMat);
      paver.position.set(0, 0.05, 3.8 + p * 0.62);
      paver.receiveShadow = true;
      scene.add(paver);
      resourcesRef.current.push(paverGeo, paverMat);
    }

    // 7. Assemble 3D House Group
    const houseGroup = new THREE.Group();
    houseGroupRef.current = houseGroup;
    scene.add(houseGroup);

    // Procedural PBR textures
    const asphaltTex = createAsphaltShingleTexture();
    const metalTex = createStandingSeamTexture();
    const tileTex = createClayTileTexture();
    const tpoTex = createFlatTPOTexture();
    const wallTex = createWallTexture();
    const cedarTex = createCedarWoodTexture();

    // Foundation: Dark Charcoal Architectural Chamfered Plinth
    const baseGeo = new THREE.BoxGeometry(5.4, 0.4, 6.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x161c24, // dark basalt cut-stone foundation
      roughness: 0.85,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    houseGroup.add(base);
    resourcesRef.current.push(baseGeo, baseMat);

    // First Floor Wall Material: Austin Hand-Hewn Limestone Masonry
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex.map,
      bumpMap: wallTex.bumpMap,
      bumpScale: 0.08,
      color: 0xa89e90, // warm natural limestone with rich contrast
      roughness: 0.78,
      metalness: 0.05,
    });
    resourcesRef.current.push(wallMat);

    const wallHeight = stories === 1 ? 2.5 : stories === 2 ? 3.9 : 5.2;
    const wallGeo = new THREE.BoxGeometry(5.2, wallHeight, 6.2);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = wallHeight / 2 + 0.2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);
    wallsMeshRef.current = walls;
    resourcesRef.current.push(wallGeo);

    // Luxury Cedar Wood Siding for Upper Cantilever & Accent Wing
    const cedarMat = new THREE.MeshStandardMaterial({
      map: cedarTex.map,
      bumpMap: cedarTex.bumpMap,
      bumpScale: 0.06,
      color: 0x944921, // rich western red cedar
      roughness: 0.65,
      metalness: 0.08,
    });
    resourcesRef.current.push(cedarMat);

    // Second Floor Cantilever Architectural Wing
    const secondFloorGroup = new THREE.Group();
    secondFloorMeshRef.current = secondFloorGroup;
    houseGroup.add(secondFloorGroup);

    const cantileverGeo = new THREE.BoxGeometry(5.35, 1.45, 3.4);
    const cantilever = new THREE.Mesh(cantileverGeo, cedarMat);
    cantilever.position.set(0, wallHeight - 0.65, 1.55);
    cantilever.castShadow = true;
    cantilever.receiveShadow = true;
    secondFloorGroup.add(cantilever);
    resourcesRef.current.push(cantileverGeo);

    // Dark bronze shadow reveal trim underneath cantilever
    const revealGeo = new THREE.BoxGeometry(5.38, 0.08, 3.42);
    const revealMat = new THREE.MeshStandardMaterial({ color: 0x0f141c, roughness: 0.4 });
    const reveal = new THREE.Mesh(revealGeo, revealMat);
    reveal.position.set(0, wallHeight - 1.4, 1.55);
    secondFloorGroup.add(reveal);
    resourcesRef.current.push(revealGeo, revealMat);

    secondFloorGroup.visible = stories >= 2;

    // Front Entrance Portico & Modern Walnut Door
    const porticoRoofGeo = new THREE.BoxGeometry(1.6, 0.12, 1.0);
    const darkBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x141a22,
      roughness: 0.35,
      metalness: 0.75,
    });
    const porticoRoof = new THREE.Mesh(porticoRoofGeo, darkBronzeMat);
    porticoRoof.position.set(0, 2.35, 3.55);
    porticoRoof.castShadow = true;
    houseGroup.add(porticoRoof);
    resourcesRef.current.push(porticoRoofGeo, darkBronzeMat);

    // Walnut entry door with dark frame & brass handle
    const doorFrameGeo = new THREE.BoxGeometry(1.15, 2.1, 0.1);
    const doorFrame = new THREE.Mesh(doorFrameGeo, darkBronzeMat);
    doorFrame.position.set(0, 1.25, 3.12);
    houseGroup.add(doorFrame);

    const doorGeo = new THREE.BoxGeometry(0.95, 1.95, 0.08);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x3d1705, // rich dark walnut
      roughness: 0.4,
      metalness: 0.1,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.25, 3.14);
    houseGroup.add(door);
    resourcesRef.current.push(doorFrameGeo, doorGeo, doorMat);

    // Satin brass vertical door pull
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
    });
    const handle = new THREE.Mesh(handleGeo, brassMat);
    handle.position.set(0.35, 1.25, 3.2);
    houseGroup.add(handle);
    resourcesRef.current.push(handleGeo, brassMat);

    // Warm welcoming porch light sconce
    const sconceLight = new THREE.PointLight(0xffe2b8, 1.8, 4.0);
    sconceLight.position.set(0.7, 1.85, 3.25);
    houseGroup.add(sconceLight);

    // Windows with dark bronze architectural frames & warm glowing interior light
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      emissive: 0xffe89e, // warm glowing interior home light
      emissiveIntensity: 0.28,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.6,
      reflectivity: 0.85,
    });
    resourcesRef.current.push(glassMat);

    const windowSpecs = [
      { x: -1.6, y: 1.45, z: 3.12, w: 1.15, h: 1.35 },
      { x: 1.6, y: 1.45, z: 3.12, w: 1.15, h: 1.35 },
      { x: -2.62, y: 1.45, z: 0.6, w: 1.25, h: 1.2, rotY: Math.PI / 2 },
      { x: 2.62, y: 1.45, z: 0.6, w: 1.25, h: 1.2, rotY: Math.PI / 2 },
      { x: 0, y: 3.05, z: 3.26, w: 1.85, h: 0.95 }, // 2nd floor panoramic picture window
    ];

    windowSpecs.forEach((spec) => {
      const frameGeo = new THREE.BoxGeometry(spec.w + 0.12, spec.h + 0.12, 0.08);
      const frame = new THREE.Mesh(frameGeo, darkBronzeMat);
      frame.position.set(spec.x, spec.y, spec.z);
      if (spec.rotY) frame.rotation.y = spec.rotY;
      houseGroup.add(frame);

      const glassGeo = new THREE.BoxGeometry(spec.w, spec.h, 0.04);
      const pane = new THREE.Mesh(glassGeo, glassMat);
      pane.position.set(spec.x, spec.y, spec.z + (spec.rotY ? 0 : 0.02));
      if (spec.rotY) pane.rotation.y = spec.rotY;
      houseGroup.add(pane);

      resourcesRef.current.push(frameGeo, glassGeo);
    });

    // 8. ROOF MATERIALS & GEOMETRY GENERATOR
    // Real roofing materials library with distinct colors, bump maps, and reflectivity
    const materialsLibrary: Record<RoofMaterial, THREE.MeshStandardMaterial> = {
      asphalt: new THREE.MeshStandardMaterial({
        map: asphaltTex.map,
        bumpMap: asphaltTex.bumpMap,
        bumpScale: 0.12,
        roughness: 0.78,
        metalness: 0.18,
        color: 0x242d38, // rich architectural slate-charcoal
      }),
      metal: new THREE.MeshStandardMaterial({
        map: metalTex.map,
        roughnessMap: metalTex.roughnessMap,
        roughness: 0.22,
        metalness: 0.88,
        color: 0x16202c, // deep architectural standing seam navy-slate
      }),
      tile: new THREE.MeshStandardMaterial({
        map: tileTex.map,
        bumpMap: tileTex.bumpMap,
        bumpScale: 0.16,
        roughness: 0.58,
        metalness: 0.06,
        color: 0xb84728, // rich Andalusian Spanish terracotta clay
      }),
      flat_tpo: new THREE.MeshStandardMaterial({
        map: tpoTex.map,
        bumpMap: tpoTex.bumpMap,
        bumpScale: 0.04,
        roughness: 0.35,
        metalness: 0.1,
        color: 0x8392a2, // cool industrial slate-pewter membrane (NOT washed out white!)
      }),
    };

    // Helper: Build pitched roof geometry with realistic eaves overhang
    function buildPitchedRoofGeo(p: RoofPitch): THREE.BufferGeometry {
      const peakH = p === 'low' ? 0.95 : p === 'medium' ? 1.75 : 2.65;
      const rWidth = 5.9; // 35cm eaves overhang past walls
      const rDepth = 6.9; // 35cm front & back rake overhang
      const halfW = rWidth / 2;

      const shape = new THREE.Shape();
      shape.moveTo(-halfW, 0);
      shape.lineTo(0, peakH);
      shape.lineTo(halfW, 0);
      shape.lineTo(-halfW, 0);

      const geo = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        depth: rDepth,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 2,
      });
      geo.center();
      geo.computeVertexNormals();
      return geo;
    }

    // Triangular Gable End Wall Enclosure (fills gap under the roof so it's never open/empty)
    function buildGableTriangleGeo(p: RoofPitch): THREE.BufferGeometry {
      const peakH = p === 'low' ? 0.95 : p === 'medium' ? 1.75 : 2.65;
      const halfW = 5.2 / 2;

      const shape = new THREE.Shape();
      shape.moveTo(-halfW, 0);
      shape.lineTo(0, peakH);
      shape.lineTo(halfW, 0);
      shape.closePath();

      const geo = new THREE.ShapeGeometry(shape);
      geo.computeVertexNormals();
      return geo;
    }

    // Initial Roof Construction
    const initialRoofGeo = buildPitchedRoofGeo(pitch);
    const roof = new THREE.Mesh(initialRoofGeo, materialsLibrary[material]);
    roof.castShadow = true;
    roof.receiveShadow = true;
    const roofY = wallHeight + 0.2 + (pitch === 'low' ? 0.48 : pitch === 'medium' ? 0.88 : 1.33);
    roof.position.y = roofY;
    houseGroup.add(roof);
    roofMeshRef.current = roof;
    resourcesRef.current.push(initialRoofGeo);

    // Architectural Ridge Cap running along the roof apex (key roofing hallmark)
    const ridgeCapGeo = new THREE.BoxGeometry(0.24, 0.12, 6.95);
    const ridgeCap = new THREE.Mesh(ridgeCapGeo, materialsLibrary[material]);
    ridgeCap.castShadow = true;
    const peakHeightVal = pitch === 'low' ? 0.95 : pitch === 'medium' ? 1.75 : 2.65;
    ridgeCap.position.set(0, wallHeight + 0.2 + peakHeightVal + 0.05, 0);
    houseGroup.add(ridgeCap);
    ridgeCapMeshRef.current = ridgeCap;
    resourcesRef.current.push(ridgeCapGeo);

    // Gable End Enclosures (Front & Back)
    const gableFrontGeo = buildGableTriangleGeo(pitch);
    const gableFront = new THREE.Mesh(gableFrontGeo, cedarMat);
    gableFront.position.set(0, wallHeight + 0.2, 3.1);
    gableFront.castShadow = true;
    houseGroup.add(gableFront);
    gableFrontMeshRef.current = gableFront;

    const gableBackGeo = buildGableTriangleGeo(pitch);
    const gableBack = new THREE.Mesh(gableBackGeo, cedarMat);
    gableBack.position.set(0, wallHeight + 0.2, -3.1);
    gableBack.rotation.y = Math.PI;
    gableBack.castShadow = true;
    houseGroup.add(gableBack);
    gableBackMeshRef.current = gableBack;
    resourcesRef.current.push(gableFrontGeo, gableBackGeo);

    // 9. Modern Parapet Wall for Flat/TPO roofs
    const parapetGroup = new THREE.Group();
    parapetGroupRef.current = parapetGroup;
    houseGroup.add(parapetGroup);

    // Parapet coping caps (dark bronze architectural cap)
    const parapetCapMat = new THREE.MeshStandardMaterial({
      color: 0x181e26,
      metalness: 0.8,
      roughness: 0.3,
    });
    resourcesRef.current.push(parapetCapMat);

    // Left and Right parapets
    const sideParapetGeo = new THREE.BoxGeometry(0.22, 0.45, 6.3);
    const leftParapet = new THREE.Mesh(sideParapetGeo, parapetCapMat);
    leftParapet.position.set(-2.6, wallHeight + 0.4, 0);
    const rightParapet = new THREE.Mesh(sideParapetGeo, parapetCapMat);
    rightParapet.position.set(2.6, wallHeight + 0.4, 0);

    // Front and Back parapets
    const frontParapetGeo = new THREE.BoxGeometry(5.42, 0.45, 0.22);
    const frontParapet = new THREE.Mesh(frontParapetGeo, parapetCapMat);
    frontParapet.position.set(0, wallHeight + 0.4, 3.1);
    const backParapet = new THREE.Mesh(frontParapetGeo, parapetCapMat);
    backParapet.position.set(0, wallHeight + 0.4, -3.1);

    // Flat TPO deck
    const flatDeckGeo = new THREE.BoxGeometry(5.2, 0.1, 6.2);
    const flatDeck = new THREE.Mesh(flatDeckGeo, materialsLibrary.flat_tpo);
    flatDeck.position.set(0, wallHeight + 0.2, 0);
    flatDeck.receiveShadow = true;

    parapetGroup.add(leftParapet, rightParapet, frontParapet, backParapet, flatDeck);
    resourcesRef.current.push(sideParapetGeo, frontParapetGeo, flatDeckGeo);

    // Visibility toggles between pitched and flat
    const isFlat = material === 'flat_tpo';
    roof.visible = !isFlat;
    ridgeCap.visible = !isFlat;
    gableFront.visible = !isFlat;
    gableBack.visible = !isFlat;
    parapetGroup.visible = isFlat;

    // 10. Architectural Fascia & Eaves Trim
    const fasciaGeo = new THREE.BoxGeometry(5.75, 0.18, 6.75);
    const fascia = new THREE.Mesh(fasciaGeo, darkBronzeMat);
    fascia.position.y = wallHeight + 0.15;
    houseGroup.add(fascia);
    fasciaMeshRef.current = fascia;
    resourcesRef.current.push(fasciaGeo);

    // 11. Gutters & Downspouts
    const guttersGroup = new THREE.Group();
    guttersGroupRef.current = guttersGroup;
    houseGroup.add(guttersGroup);

    const gutterMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.85,
      roughness: 0.25,
    });
    resourcesRef.current.push(gutterMat);

    const gutterChannelGeo = new THREE.BoxGeometry(0.15, 0.15, 6.8);
    const leftGutter = new THREE.Mesh(gutterChannelGeo, gutterMat);
    leftGutter.position.set(-2.92, wallHeight + 0.12, 0);
    const rightGutter = new THREE.Mesh(gutterChannelGeo, gutterMat);
    rightGutter.position.set(2.92, wallHeight + 0.12, 0);
    guttersGroup.add(leftGutter, rightGutter);
    resourcesRef.current.push(gutterChannelGeo);

    const downspoutGeo = new THREE.CylinderGeometry(0.045, 0.045, wallHeight, 12);
    const leftSpout = new THREE.Mesh(downspoutGeo, gutterMat);
    leftSpout.position.set(-2.92, wallHeight / 2 + 0.2, 3.25);
    const rightSpout = new THREE.Mesh(downspoutGeo, gutterMat);
    rightSpout.position.set(2.92, wallHeight / 2 + 0.2, 3.25);
    guttersGroup.add(leftSpout, rightSpout);
    resourcesRef.current.push(downspoutGeo);

    guttersGroup.visible = extras.includes('gutters') && !isFlat;

    // 12. Skylight Feature
    const skylightGeo = new THREE.BoxGeometry(0.95, 0.14, 1.3);
    const skylight = new THREE.Mesh(skylightGeo, glassMat);
    skylight.position.set(1.4, wallHeight + 0.2 + (pitch === 'low' ? 0.6 : 1.0), 0.8);
    skylight.rotation.z = pitch === 'low' ? -0.32 : pitch === 'medium' ? -0.55 : -0.78;
    houseGroup.add(skylight);
    skylightMeshRef.current = skylight;
    skylight.visible = extras.includes('skylight') && !isFlat;
    resourcesRef.current.push(skylightGeo);

    // 13. Modern Architectural Stone Chimney
    const chimneyGeo = new THREE.BoxGeometry(0.75, 2.6, 0.75);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46, // modern graphite zinc / basalt chimney
      roughness: 0.7,
      metalness: 0.2,
    });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(-1.6, wallHeight + 1.4, -1.3);
    chimney.castShadow = true;
    houseGroup.add(chimney);
    resourcesRef.current.push(chimneyGeo, chimneyMat);

    // 14. Responsive Animation Loop & Visibility Control
    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // OrbitControls handles smooth continuous auto-rotation reliably
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotateRef.current;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      resourcesRef.current.forEach((res) => {
        if (res && typeof res.dispose === 'function') {
          res.dispose();
        }
      });
    };
  }, []);

  // Dynamic Updates: Material Change
  useEffect(() => {
    if (!roofMeshRef.current || !parapetGroupRef.current || !ridgeCapMeshRef.current) return;

    const asphaltTex = createAsphaltShingleTexture();
    const metalTex = createStandingSeamTexture();
    const tileTex = createClayTileTexture();
    const tpoTex = createFlatTPOTexture();

    const materialsLibrary: Record<RoofMaterial, THREE.MeshStandardMaterial> = {
      asphalt: new THREE.MeshStandardMaterial({
        map: asphaltTex.map,
        bumpMap: asphaltTex.bumpMap,
        bumpScale: 0.12,
        roughness: 0.78,
        metalness: 0.18,
        color: 0x242d38,
      }),
      metal: new THREE.MeshStandardMaterial({
        map: metalTex.map,
        roughnessMap: metalTex.roughnessMap,
        roughness: 0.22,
        metalness: 0.88,
        color: 0x16202c,
      }),
      tile: new THREE.MeshStandardMaterial({
        map: tileTex.map,
        bumpMap: tileTex.bumpMap,
        bumpScale: 0.16,
        roughness: 0.58,
        metalness: 0.06,
        color: 0xb84728,
      }),
      flat_tpo: new THREE.MeshStandardMaterial({
        map: tpoTex.map,
        bumpMap: tpoTex.bumpMap,
        bumpScale: 0.04,
        roughness: 0.35,
        metalness: 0.1,
        color: 0x8392a2,
      }),
    };

    const isFlat = material === 'flat_tpo';

    roofMeshRef.current.material = materialsLibrary[material];
    roofMeshRef.current.visible = !isFlat;

    ridgeCapMeshRef.current.material = materialsLibrary[material];
    ridgeCapMeshRef.current.visible = !isFlat;

    if (gableFrontMeshRef.current) gableFrontMeshRef.current.visible = !isFlat;
    if (gableBackMeshRef.current) gableBackMeshRef.current.visible = !isFlat;
    if (parapetGroupRef.current) parapetGroupRef.current.visible = isFlat;
    if (skylightMeshRef.current) skylightMeshRef.current.visible = extras.includes('skylight') && !isFlat;
    if (guttersGroupRef.current) guttersGroupRef.current.visible = extras.includes('gutters') && !isFlat;
  }, [material, extras]);

  // Dynamic Updates: Pitch, Stories, & Extras Height Adjustments
  useEffect(() => {
    if (
      !roofMeshRef.current ||
      !wallsMeshRef.current ||
      !ridgeCapMeshRef.current ||
      !gableFrontMeshRef.current ||
      !gableBackMeshRef.current
    )
      return;

    const wallHeight = stories === 1 ? 2.5 : stories === 2 ? 3.9 : 5.2;
    const peakH = pitch === 'low' ? 0.95 : pitch === 'medium' ? 1.75 : 2.65;
    const isFlat = material === 'flat_tpo';

    // 1. Scale walls to match stories
    wallsMeshRef.current.scale.y = stories === 1 ? 1.0 : stories === 2 ? 1.56 : 2.08;
    wallsMeshRef.current.position.y = wallHeight / 2 + 0.2;

    if (secondFloorMeshRef.current) {
      secondFloorMeshRef.current.visible = stories >= 2;
      secondFloorMeshRef.current.position.y = wallHeight - 3.9;
    }

    if (fasciaMeshRef.current) {
      fasciaMeshRef.current.position.y = wallHeight + 0.15;
    }

    // 2. Rebuild pitched roof geometry for new pitch
    const rWidth = 5.9;
    const rDepth = 6.9;
    const halfW = rWidth / 2;

    const shape = new THREE.Shape();
    shape.moveTo(-halfW, 0);
    shape.lineTo(0, peakH);
    shape.lineTo(halfW, 0);
    shape.lineTo(-halfW, 0);

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: rDepth,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 2,
    });
    geo.center();
    geo.computeVertexNormals();

    roofMeshRef.current.geometry.dispose();
    roofMeshRef.current.geometry = geo;
    const roofY = wallHeight + 0.2 + (pitch === 'low' ? 0.48 : pitch === 'medium' ? 0.88 : 1.33);
    roofMeshRef.current.position.y = roofY;
    roofMeshRef.current.visible = !isFlat;

    // 3. Update Ridge Cap Position
    ridgeCapMeshRef.current.position.set(0, wallHeight + 0.2 + peakH + 0.05, 0);
    ridgeCapMeshRef.current.visible = !isFlat;

    // 4. Update Gable End Geometry
    const gHalfW = 5.2 / 2;
    const gShape = new THREE.Shape();
    gShape.moveTo(-gHalfW, 0);
    gShape.lineTo(0, peakH);
    gShape.lineTo(gHalfW, 0);
    gShape.closePath();

    const gGeo = new THREE.ShapeGeometry(gShape);
    gGeo.computeVertexNormals();

    gableFrontMeshRef.current.geometry.dispose();
    gableFrontMeshRef.current.geometry = gGeo;
    gableFrontMeshRef.current.position.set(0, wallHeight + 0.2, 3.1);
    gableFrontMeshRef.current.visible = !isFlat;

    const gBackGeo = gGeo.clone();
    gableBackMeshRef.current.geometry.dispose();
    gableBackMeshRef.current.geometry = gBackGeo;
    gableBackMeshRef.current.position.set(0, wallHeight + 0.2, -3.1);
    gableBackMeshRef.current.visible = !isFlat;

    // 5. Update Flat Roof Parapet position
    if (parapetGroupRef.current) {
      parapetGroupRef.current.position.y = wallHeight - 2.5;
      parapetGroupRef.current.visible = isFlat;
    }

    // 6. Extras: Gutters & Skylight
    if (guttersGroupRef.current) {
      guttersGroupRef.current.visible = extras.includes('gutters') && !isFlat;
      guttersGroupRef.current.position.y = wallHeight - 2.5;
    }

    if (skylightMeshRef.current) {
      skylightMeshRef.current.visible = extras.includes('skylight') && !isFlat;
      skylightMeshRef.current.position.y = wallHeight + 0.2 + (pitch === 'low' ? 0.6 : 1.0);
      skylightMeshRef.current.rotation.z = pitch === 'low' ? -0.32 : pitch === 'medium' ? -0.55 : -0.78;
    }
  }, [pitch, stories, extras, material]);

  // Camera angles
  const handleSetView = (view: 'perspective' | 'overhead' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCurrentView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (view === 'overhead') {
      camera.position.set(0, 16, 7.5);
    } else if (view === 'front') {
      camera.position.set(0, 3.6, 13.5);
    } else {
      camera.position.set(11.2, 7.8, 12.0);
    }
    controls.target.set(0, 2.2, 0);
    controls.update();
  };

  const handleReset = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    cameraRef.current.position.set(11.2, 7.8, 12.0);
    controlsRef.current.target.set(0, 2.2, 0);
    controlsRef.current.update();
    setCurrentView('perspective');
  };

  // Direct toggle auto-rotation with instant feedback
  const handleToggleAutoRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAutoRotate((prev) => !prev);
  };

  return (
    <div
      className={`relative w-full ${height} rounded-3xl bg-gradient-to-b from-[#081320] via-[#0D1D30] to-[#050C15] border border-slate-700/80 shadow-2xl overflow-hidden group select-none touch-pan-y`}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" />

      {/* Top Floating Badge & Action Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold tracking-tight">Luxury 3D Simulator</span>
        </div>

        {/* Action Controls: Auto-Rotate Toggle & Camera Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Functional Auto-Rotate Button with Clear State Indicator */}
          <button
            type="button"
            onClick={handleToggleAutoRotate}
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold transition flex items-center gap-1.5 min-h-[38px] cursor-pointer shadow-lg active:scale-95 ${
              autoRotate
                ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/40 ring-2 ring-orange-400/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
            }`}
            title={autoRotate ? 'Pause 3D auto rotation' : 'Enable 3D auto rotation'}
            aria-label={autoRotate ? 'Pause 3D auto rotation' : 'Enable 3D auto rotation'}
          >
            {autoRotate ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
                <span className="text-[11px] font-extrabold tracking-wide">Rotate: ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-orange-400" />
                <span className="text-[11px] font-semibold text-slate-300">Rotate: OFF</span>
              </>
            )}
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shadow-lg active:scale-95"
            title="Reset 3D Perspective"
            aria-label="Reset 3D perspective"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Camera angle quick switches */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 pointer-events-auto z-10">
        <button
          type="button"
          onClick={() => handleSetView('perspective')}
          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition backdrop-blur-md cursor-pointer ${
            currentView === 'perspective'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/85 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          Perspective
        </button>
        <button
          type="button"
          onClick={() => handleSetView('overhead')}
          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition backdrop-blur-md cursor-pointer ${
            currentView === 'overhead'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/85 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          Aerial
        </button>
        <button
          type="button"
          onClick={() => handleSetView('front')}
          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition backdrop-blur-md cursor-pointer ${
            currentView === 'front'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/85 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          Elevation
        </button>
      </div>

      {/* Bottom Right Live Specs Overlay */}
      <div className="absolute bottom-2.5 right-3 pointer-events-none hidden xs:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-[11px] text-slate-300 shadow-lg z-10">
        <span className="text-orange-400 font-bold uppercase">{material.replace('_', ' ')}</span>
        <span>•</span>
        <span className="capitalize">{pitch} pitch</span>
        <span>•</span>
        <span>{stories} {stories === 1 ? 'story' : 'stories'}</span>
      </div>

      {/* Subtle interaction guidance on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-sm border border-slate-700/70 text-[10px] sm:text-xs text-slate-200 font-medium tracking-wide shadow-2xl flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-orange-400 animate-spin-slow" />
          <span>Drag to rotate • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
