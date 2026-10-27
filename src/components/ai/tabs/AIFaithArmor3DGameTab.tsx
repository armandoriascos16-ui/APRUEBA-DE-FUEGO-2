import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Award, Sparkles, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const AIFaithArmor3DGameTab: React.FC = () => {
  const { currentUser, awardQuizPoints } = useApp();

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'victory' | 'gameover'>('title');
  const [score, setScore] = useState(0);
  const [faithEnergy, setFaithEnergy] = useState(100);
  const [armorPiecesCollected, setArmorPiecesCollected] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mutable refs for 60fps render loop
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    actionJustPressed: false,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Web Audio Procedural Synth Sound Generator (Zero External 404 dependencies)
  const playSynthSound = (type: 'collect' | 'hit' | 'victory' | 'shield') => {
    if (isMutedRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'collect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'victory') {
        // Fanfare chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.15, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.55);
        });
      }
    } catch (e) {
      // AudioContext blocked
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputRef.current.forward = true;
      if (key === 's' || key === 'arrowdown') inputRef.current.backward = true;
      if (key === 'a' || key === 'arrowleft') inputRef.current.left = true;
      if (key === 'd' || key === 'arrowright') inputRef.current.right = true;
      if (key === ' ' || key === 'spacebar') {
        inputRef.current.actionJustPressed = true;
      }
      if (key === 'escape') {
        setGameState(prev => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputRef.current.forward = false;
      if (key === 's' || key === 'arrowdown') inputRef.current.backward = false;
      if (key === 'a' || key === 'arrowleft') inputRef.current.left = false;
      if (key === 'd' || key === 'arrowright') inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Three.js Game World Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 480;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 7, 12);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfbbf24, 2.2);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // 3. Terrain: Procedural Grid Pathway
    const pathGeometry = new THREE.PlaneGeometry(16, 80, 16, 40);
    pathGeometry.rotateX(-Math.PI / 2);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    pathMesh.receiveShadow = !isSoftwareGl;
    scene.add(pathMesh);

    // Lateral glowing pillars / path borders
    for (let z = -35; z <= 35; z += 10) {
      [-7, 7].forEach(x => {
        const pillarGeom = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.3,
          metalness: 0.7,
        });
        const pillar = new THREE.Mesh(pillarGeom, pillarMat);
        pillar.position.set(x, 1.25, z);
        pillar.castShadow = !isSoftwareGl;
        scene.add(pillar);
      });
    }

    // 4. Player: Composite 6-part Procedural Hero Model (THREE.Group)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 8);

    // Body / Breastplate (Coraza de Justicia)
    const bodyGeom = new THREE.BoxGeometry(0.8, 1.1, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.35;
    playerGroup.add(body);

    // Helmet (Yelmo de la Salvación)
    const headGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.1, metalness: 0.9 });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 2.15;
    playerGroup.add(head);

    // Shield of Faith (Escudo de la Fe)
    const shieldGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 16);
    shieldGeom.rotateX(Math.PI / 2);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.6 });
    const shield = new THREE.Mesh(shieldGeom, shieldMat);
    shield.position.set(-0.65, 1.35, 0.2);
    playerGroup.add(shield);

    // Sword of the Spirit (Espada de la Verdad)
    const swordBladeGeom = new THREE.BoxGeometry(0.08, 1.2, 0.08);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });
    const sword = new THREE.Mesh(swordBladeGeom, swordMat);
    sword.position.set(0.65, 1.35, 0.2);
    playerGroup.add(sword);

    // Legs / Boots
    const legGeom = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.2 });
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.25, 0.4, 0);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.25, 0.4, 0);
    playerGroup.add(leftLeg);
    playerGroup.add(rightLeg);

    scene.add(playerGroup);

    // 5. Collectible Armor Pieces along the road
    const ARMOR_DATA = [
      { id: 'cinturon', name: 'Cinturón de la Verdad', z: 0, x: -1.5, color: 0x10b981 },
      { id: 'coraza', name: 'Coraza de Justicia', z: -8, x: 2, color: 0xf59e0b },
      { id: 'calzado', name: 'Calzado de la Paz', z: -16, x: -2, color: 0x3b82f6 },
      { id: 'escudo', name: 'Escudo de la Fe', z: -24, x: 1.5, color: 0x06b6d4 },
      { id: 'yelmo', name: 'Yelmo de la Salvación', z: -32, x: 0, color: 0xa855f7 },
      { id: 'espada', name: 'Espada del Espíritu', z: -40, x: 0, color: 0xec4899 },
    ];

    const collectibles: Array<{ mesh: THREE.Mesh; data: typeof ARMOR_DATA[0]; collected: boolean }> = [];

    ARMOR_DATA.forEach(data => {
      const geom = new THREE.OctahedronGeometry(0.55);
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.1,
        metalness: 0.9,
        emissive: data.color,
        emissiveIntensity: 0.4,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(data.x, 1.2, data.z);
      scene.add(mesh);
      collectibles.push({ mesh, data, collected: false });
    });

    // 6. Obstacles: fiery darts of doubt
    const darts: Array<{ mesh: THREE.Mesh; speed: number; direction: number }> = [];
    for (let i = 0; i < 6; i++) {
      const dartGeom = new THREE.ConeGeometry(0.3, 1.2, 8);
      dartGeom.rotateX(Math.PI / 2);
      const dartMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
      const dart = new THREE.Mesh(dartGeom, dartMat);
      dart.position.set((Math.random() - 0.5) * 8, 1.0, -10 - i * 5);
      scene.add(dart);
      darts.push({ mesh: dart, speed: 1.5 + Math.random() * 2, direction: 1 });
    }

    // 7. 60fps Game Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const gameLoop = () => {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Delta time clamped

      if (gameStateRef.current === 'playing') {
        const speed = 7.0;
        const input = inputRef.current;

        // Player movement
        if (input.forward) playerGroup.position.z -= speed * dt;
        if (input.backward) playerGroup.position.z += speed * dt;
        if (input.left) playerGroup.position.x -= speed * dt;
        if (input.right) playerGroup.position.x += speed * dt;

        // Boundaries clamp
        playerGroup.position.x = Math.max(-5.5, Math.min(5.5, playerGroup.position.x));
        playerGroup.position.z = Math.max(-46, Math.min(10, playerGroup.position.z));

        // Smooth camera follow
        camera.position.x = THREE.MathUtils.damp(camera.position.x, playerGroup.position.x, 4, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, playerGroup.position.z + 7, 5, dt);
        camera.lookAt(playerGroup.position.x, 1.5, playerGroup.position.z - 2);

        // Animate collectibles
        collectibles.forEach(col => {
          if (!col.collected) {
            col.mesh.rotation.y += dt * 2.0;
            col.mesh.position.y = 1.2 + Math.sin(clock.getElapsedTime() * 3 + col.data.z) * 0.15;

            // Collision check
            const dist = playerGroup.position.distanceTo(col.mesh.position);
            if (dist < 1.2) {
              col.collected = true;
              scene.remove(col.mesh);
              playSynthSound('collect');
              setScore(s => s + 500);
              setArmorPiecesCollected(prev => [...prev, col.data.name]);

              // Check victory
              if (collectibles.every(c => c.collected)) {
                setGameState('victory');
                playSynthSound('victory');
                awardQuizPoints(300, 'Juego 3D: La Armadura de Dios completada');
              }
            }
          }
        });

        // Animate obstacles (fiery darts)
        darts.forEach(dart => {
          dart.mesh.position.x += dart.direction * dart.speed * dt;
          if (dart.mesh.position.x > 5.5) dart.direction = -1;
          if (dart.mesh.position.x < -5.5) dart.direction = 1;

          // Collision with player
          const dist = playerGroup.position.distanceTo(dart.mesh.position);
          if (dist < 1.0) {
            // Did player use shield action?
            if (input.actionJustPressed) {
              playSynthSound('shield');
              setScore(s => s + 100);
              dart.mesh.position.y = -10; // Deflected
            } else {
              playSynthSound('hit');
              setFaithEnergy(e => {
                const next = Math.max(0, e - 25);
                if (next === 0) {
                  setGameState('gameover');
                }
                return next;
              });
              dart.mesh.position.y = -10; // Destroyed on impact
            }
          }
        });

        // Reset edge-triggered action
        input.actionJustPressed = false;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const resetGame = () => {
    setScore(0);
    setFaithEnergy(100);
    setArmorPiecesCollected([]);
    setGameState('playing');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl backdrop-blur-md">
      
      {/* Top Game Shell Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              La Armadura de Dios 3D
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Efesios 6:10-18
              </span>
            </h3>
            <p className="text-xs text-slate-400">Juego 3D interactivo con Three.js a 60fps y síntesis de sonido procedural</p>
          </div>
        </div>

        {/* HUD Cluster */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
            <span className="text-slate-400 mr-1.5">Puntos:</span>
            <span className="font-bold text-amber-400 tabular-nums">{score}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5">
            <span className="text-slate-400">Fe:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  faithEnergy > 50 ? 'bg-emerald-400' : faithEnergy > 25 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${faithEnergy}%` }}
              />
            </div>
            <span className="text-slate-200 tabular-nums">{faithEnergy}%</span>
          </div>

          <button
            onClick={() => setIsMuted(m => !m)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
            title={isMuted ? 'Activar Sonido Sintético' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 3D Game Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[480px]">
        
        {/* Three.js Canvas Mount */}
        <div ref={containerRef} className="w-full h-full" />

        {/* HUD Overlay (Unobstructed Playfield) */}
        <div className="absolute top-3 left-3 pointer-events-none text-xs text-slate-300 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl font-medium">
          Piezas recolectadas: <span className="text-amber-400 font-bold">{armorPiecesCollected.length}/6</span>
        </div>

        {/* State Overlays */}
        {gameState === 'title' && (
          <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center z-20 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/30">
              <Shield className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">LA ARMADURA DE DIOS 3D</h2>
              <p className="text-xs text-amber-300/90 mt-1 max-w-md mx-auto">
                «Vestíos de toda la armadura de Dios, para que podáis estar firmes contra las asechanzas del enemigo.»
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 max-w-sm space-y-1">
              <div><strong className="text-amber-400">WASD o Flechas:</strong> Mover al paladín cristiano</div>
              <div><strong className="text-amber-400">Espacio:</strong> Activar Escudo de la Fe ante dardos de fuego</div>
              <div><strong className="text-amber-400">Objetivo:</strong> Reúne las 6 piezas sagradas de la armadura</div>
            </div>

            <button
              onClick={() => setGameState('playing')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm transition shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>INICIAR MISIÓN</span>
            </button>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">¡VICTORIA EN CRISTO!</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Has revestido tu espíritu con la Verdad, la Justicia, el Evangelio de la Paz, la Fe, la Salvación y la Espada de la Palabra.
            </p>
            <div className="text-lg font-mono font-bold text-amber-400">
              Puntos Ganados: +300 JA
            </div>
            <button
              onClick={resetGame}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar de Nuevo
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
            <h2 className="text-2xl font-black text-rose-500">LA FE FUE DEBILITADA</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Los dardos de fuego hicieron mella. Levanta de nuevo el escudo de la fe y persevera en oración.
            </p>
            <button
              onClick={resetGame}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        )}

        {/* Collapsible Flat Control Hint Line (Desktop) */}
        <div className="hidden sm:block absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/90 border border-slate-800/80 px-4 py-1.5 rounded-full text-[11px] font-mono text-slate-400">
          WASD / Flechas Mover · Espacio Escudo · Esc Pausa
        </div>

        {/* Mobile On-Screen Touch Controls */}
        {gameState === 'playing' && (
          <div className="sm:hidden absolute inset-x-3 bottom-3 flex items-end justify-between pointer-events-none z-10">
            {/* D-Pad */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 pointer-events-auto">
              <div />
              <button
                onTouchStart={() => { inputRef.current.forward = true; }}
                onTouchEnd={() => { inputRef.current.forward = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center font-bold"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />
              <button
                onTouchStart={() => { inputRef.current.left = true; }}
                onTouchEnd={() => { inputRef.current.left = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onTouchStart={() => { inputRef.current.backward = true; }}
                onTouchEnd={() => { inputRef.current.backward = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center font-bold"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onTouchStart={() => { inputRef.current.right = true; }}
                onTouchEnd={() => { inputRef.current.right = false; }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center font-bold"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Shield Action Button */}
            <button
              onTouchStart={() => { inputRef.current.actionJustPressed = true; }}
              className="w-14 h-14 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex flex-col items-center justify-center pointer-events-auto"
            >
              <Shield className="w-6 h-6" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Escudo</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
