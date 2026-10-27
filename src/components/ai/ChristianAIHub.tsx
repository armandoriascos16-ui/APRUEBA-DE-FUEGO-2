import React, { useState } from 'react';
import { 
  Bot, 
  Globe, 
  MapPin, 
  Sparkles, 
  Film, 
  Music, 
  Mic, 
  Radio, 
  Dna, 
  Shield,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { AIChatCounselorTab } from './tabs/AIChatCounselorTab';
import { AISearchGroundingTab } from './tabs/AISearchGroundingTab';
import { AIMapsGroundingTab } from './tabs/AIMapsGroundingTab';
import { AIImageStudioTab } from './tabs/AIImageStudioTab';
import { AIVideoStudioTab } from './tabs/AIVideoStudioTab';
import { AIMusicLyriaTab } from './tabs/AIMusicLyriaTab';
import { AITranscribeTab } from './tabs/AITranscribeTab';
import { AILiveVoiceTab } from './tabs/AILiveVoiceTab';
import { AIBioscienceCreationTab } from './tabs/AIBioscienceCreationTab';
import { AIFaithArmor3DGameTab } from './tabs/AIFaithArmor3DGameTab';

type AITab = 
  | 'chat'
  | 'search'
  | 'maps'
  | 'image'
  | 'video'
  | 'music'
  | 'transcribe'
  | 'live'
  | 'bioscience'
  | 'game';

export const ChristianAIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AITab>('chat');

  const TABS_CONFIG = [
    { id: 'chat', label: 'Consejería & Chat', icon: Bot, badge: 'Argon/Flash' },
    { id: 'search', label: 'Búsqueda en Vivo', icon: Globe, badge: 'Search' },
    { id: 'maps', label: 'Templos & Sedes', icon: MapPin, badge: 'Maps' },
    { id: 'image', label: 'Imágenes Bíblicas', icon: Sparkles, badge: 'Nano Banana' },
    { id: 'video', label: 'Videos & Animación', icon: Film, badge: 'Omni Flash' },
    { id: 'music', label: 'Alabanzas Lyria', icon: Music, badge: 'Lyria Pro' },
    { id: 'transcribe', label: 'Transcriptor Voz', icon: Mic, badge: 'Transcribe' },
    { id: 'live', label: 'Voz en Vivo', icon: Radio, badge: 'Live API' },
    { id: 'bioscience', label: 'Bio-Ciencias 3D', icon: Dna, badge: 'Creación' },
    { id: 'game', label: 'Armadura 3D Game', icon: Shield, badge: 'Three.js' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      
      {/* Master Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-900/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              CENTRO DE INTELIGENCIA CRISTIANA INTEGRAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              IA A PRUEBA DE FUEGO <span className="text-amber-400">STUDIO</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Todas las capacidades de Inteligencia Artificial reunidas en una sola suite espiritual: Diálogo pastoral multi-turno, Search & Maps Grounding, creación y edición de arte bíblico con Nano Banana, animación cinematográfica con Omni Flash, himnos con Lyria, transcripción, voz en tiempo real con Live API, bio-ciencias y juego 3D interactivo.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-1.5 shrink-0 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              10 Módulos Unificados
            </span>
            <span className="text-xs text-amber-400 font-mono font-medium">@google/genai & Three.js</span>
            <span className="text-[11px] text-slate-500">Firebase Auth & Firestore Sync</span>
          </div>
        </div>

        {/* Horizontal Navigation Pills Dock */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS_CONFIG.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AITab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800/90'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="transition-all duration-300">
        {activeTab === 'chat' && <AIChatCounselorTab />}
        {activeTab === 'search' && <AISearchGroundingTab />}
        {activeTab === 'maps' && <AIMapsGroundingTab />}
        {activeTab === 'image' && <AIImageStudioTab />}
        {activeTab === 'video' && <AIVideoStudioTab />}
        {activeTab === 'music' && <AIMusicLyriaTab />}
        {activeTab === 'transcribe' && <AITranscribeTab />}
        {activeTab === 'live' && <AILiveVoiceTab />}
        {activeTab === 'bioscience' && <AIBioscienceCreationTab />}
        {activeTab === 'game' && <AIFaithArmor3DGameTab />}
      </div>

    </div>
  );
};
