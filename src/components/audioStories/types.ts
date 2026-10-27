/**
 * Tipos para la función de Estados con Audio y Música Cristiana Inteligente
 * A Prueba de Fuego (Módulo Aditivo y Aislado)
 */

export type ChristianMusicCategory = 
  | 'adoracion'
  | 'alabanza'
  | 'instrumental'
  | 'piano'
  | 'oracion'
  | 'esperanza'
  | 'gratitud'
  | 'reflexion'
  | 'juvenil'
  | 'versiculos';

export type SpiritualMood = 
  | 'paz'
  | 'fe'
  | 'esperanza'
  | 'gratitud'
  | 'amor'
  | 'fortaleza'
  | 'oracion'
  | 'adoracion'
  | 'alabanza'
  | 'perdon'
  | 'consuelo'
  | 'confianza';

export interface ChristianTrack {
  id: string;
  title: string;
  artist: string;
  category: ChristianMusicCategory;
  categoryLabel: string;
  moods: SpiritualMood[];
  duration: number; // en segundos (máximo 30s para estados o pre-cortado)
  audioUrl: string;
  license: string;
  licenseType: 'dominio_publico' | 'creative_commons' | 'autorizada' | 'liturgica_libre';
  attribution: string;
  sourceUrl: string;
  canTrim: boolean;
  canSyncWithImage: boolean;
  description: string;
  tempo?: 'tranquilo' | 'moderado' | 'alegre';
}

export interface ExternalAudioSource {
  id: string;
  name: string;
  organization: string;
  description: string;
  officialUrl: string;
  licenseTerms: string;
  allowsStateEmbed: boolean;
  requiredAttribution: string;
  statusNotice: string;
}

export interface SmartRecommendationResult {
  primaryRecommendation: ChristianTrack | null;
  alternatives: ChristianTrack[];
  detectedMoods: SpiritualMood[];
  detectedThemes: string[];
  explanation: string;
  confidenceScore: number; // 0 - 100
}

export interface AudioDraftState {
  audioUrl: string;
  duration: number;
  type: 'recording' | 'upload' | 'catalog' | 'external';
  title: string;
  artist?: string;
  license?: string;
  attribution?: string;
  category?: string;
  mood?: string;
  sourceUrl?: string;
  trimStart: number;
  trimEnd: number;
  volume: number; // 0.0 a 1.0
}
