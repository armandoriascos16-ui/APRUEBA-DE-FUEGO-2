import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Dna, Sparkles, BookOpen, Atom, Eye, Layers } from 'lucide-react';

interface BioTopic {
  id: string;
  title: string;
  category: string;
  biblicalVerse: string;
  scientificInsight: string;
  details: string[];
}

const BIO_TOPICS: BioTopic[] = [
  {
    id: 'dna',
    title: 'La Doble Hélice del ADN: Código de la Vida',
    category: 'Genómica & Creación',
    biblicalVerse: '«Porque tú formaste mis entrañas; me hiciste en el vientre de mi madre. Te alabaré, porque formidables y maravillosas son tus obras.» — Salmos 139:13-14',
    scientificInsight: 'El genoma humano contiene más de 3.200 millones de pares de bases de información digital altamente comprimida y sincronizada con mecanismos de autocorrección molecular de extrema precisión.',
    details: [
      'Empaquetamiento en histonas con una densidad de almacenamiento que supera a cualquier chip de silicio moderno.',
      'Sistemas de verificación de replicación (ADN polimerasa) con margen de error inferior a 1 en mil millones.',
      'Testimonio biológico de diseño e inteligencia previa en el origen de los seres vivos.',
    ],
  },
  {
    id: 'atp',
    title: 'El Motor Molecular: ATP Sintasa',
    category: 'Bioenergética Celular',
    biblicalVerse: '«Las cosas invisibles de él, su eterno poder y deidad, se hacen claramente visibles desde la creación del mundo.» — Romanos 1:20',
    scientificInsight: 'Un nanomagnífico motor rotatorio que gira a más de 9.000 revoluciones por minuto para sintetizar trifosfato de adenosina (ATP), la moneda energética de todas las células vivas.',
    details: [
      'Compuesto por un rotor, estator y canal de protones en escala nanométrica.',
      'Eficiencia termodinámica cercana al 100%, insuperable por la ingeniería humana.',
      'Complejidad irreducible: requiere todas sus subunidades proteicas coordinadas simultáneamente para funcionar.',
    ],
  },
  {
    id: 'chlorophyll',
    title: 'Fotosíntesis & Clorofila: El Aliento del Edén',
    category: 'Botánica & Bioquímica',
    biblicalVerse: '«Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género... Y fue así.» — Génesis 1:11',
    scientificInsight: 'Mecanismo cuántico por el cual los complejos antena de los cloroplastos capturan fotones solares para disociar moléculas de agua y liberar oxígeno puro a la atmósfera.',
    details: [
      'Estructura de anillo de porfirina coordinado con un ion central de magnesio (Mg²⁺).',
      'Mantenimiento del balance ecológico y la atmósfera respirable de la Tierra.',
      'Perfecta sincronía entre el reino vegetal y el reino animal descrita en la Creación.',
    ],
  },
];

export const AIBioscienceCreationTab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<BioTopic>(BIO_TOPICS[0]);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambient = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfbbf24, 2.5); // Warm gold key
    keyLight.position.set(5, 8, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8); // Cool blue rim
    rimLight.position.set(-6, -4, -6);
    scene.add(rimLight);

    // 3. Build Procedural 3D DNA Model (3-12 parts composite with THREE.Group)
    const dnaGroup = new THREE.Group();

    const strandRadius = 2.2;
    const heightSpan = 14;
    const turns = 2.5;
    const pointsCount = 40;

    const backboneMaterial1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.6,
      roughness: 0.2,
    });

    const backboneMaterial2 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.6,
      roughness: 0.2,
    });

    const pairMaterialA = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.3, roughness: 0.4 });
    const pairMaterialB = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.3, roughness: 0.4 });

    const sphereGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const rungsGroup = new THREE.Group();

    for (let i = 0; i < pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * heightSpan;

      const x1 = Math.cos(angle) * strandRadius;
      const z1 = Math.sin(angle) * strandRadius;
      const x2 = Math.cos(angle + Math.PI) * strandRadius;
      const z2 = Math.sin(angle + Math.PI) * strandRadius;

      // Strand 1 node
      const node1 = new THREE.Mesh(sphereGeom, backboneMaterial1);
      node1.position.set(x1, y, z1);
      dnaGroup.add(node1);

      // Strand 2 node
      const node2 = new THREE.Mesh(sphereGeom, backboneMaterial2);
      node2.position.set(x2, y, z2);
      dnaGroup.add(node2);

      // Base pair bridge (Cylinder)
      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);
      const dist = p1.distanceTo(p2);

      const cylinderGeom = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
      const cylinderMat = i % 2 === 0 ? pairMaterialA : pairMaterialB;
      const rung = new THREE.Mesh(cylinderGeom, cylinderMat);

      rung.position.copy(p1).add(p2).multiplyScalar(0.5);
      rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      rungsGroup.add(rung);
    }

    dnaGroup.add(rungsGroup);
    scene.add(dnaGroup);

    // 4. Animation loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      dnaGroup.rotation.y += delta * 0.45 * rotationSpeed;
      dnaGroup.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.12;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
  }, [rotationSpeed]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Dna className="w-5 h-5 text-amber-400" />
            Bio-Ciencias & Creación: El Diseño Inteligente de la Vida
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Exploración científica de la biología molecular, genómica y estructuras 3D que revelan la gloria del Creador.
          </p>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl overflow-x-auto">
          {BIO_TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedTopic.id === topic.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {topic.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive 3D Molecular Canvas */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner relative">
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Atom className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              Visualizador Molecular 3D (Three.js PBR Engine)
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Rotación:</span>
              <button
                onClick={() => setRotationSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-0.5 rounded border border-slate-700 transition"
              >
                {rotationSpeed}x
              </button>
            </div>
          </div>

          {/* Canvas Mount Container */}
          <div ref={mountRef} className="w-full h-[380px] cursor-grab active:cursor-grabbing" />

          <div className="p-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Doble Hélice B-DNA: 10 pares por vuelta · 34 Å de paso</span>
            <span className="text-amber-400 font-mono">Render PBR 60fps</span>
          </div>
        </div>

        {/* Right: Scientific & Biblical Inspector */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                {selectedTopic.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                Evidencia Científica
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">{selectedTopic.title}</h4>

            {/* Biblical Scripture */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-200/90 italic leading-relaxed">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 inline mr-1.5" />
              {selectedTopic.biblicalVerse}
            </div>

            {/* Scientific Insight */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTopic.scientificInsight}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Claves del Diseño Biológico:
            </span>
            <ul className="space-y-1.5">
              {selectedTopic.details.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ciencia y Fe en Armonía
            </span>
            <span className="text-slate-500">A PRUEBA DE FUEGO</span>
          </div>

        </div>

      </div>

    </div>
  );
};
