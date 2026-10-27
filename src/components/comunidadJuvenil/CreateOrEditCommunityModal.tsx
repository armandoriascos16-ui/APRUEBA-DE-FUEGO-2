import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Lock, 
  Globe, 
  Calendar, 
  Clock, 
  Video, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon,
  BookOpen,
  Users
} from 'lucide-react';
import { 
  ChurchCommunity, 
  CommunityMember, 
  CommunityThemeCategory, 
  MeetingModality 
} from './types';
import { useApp } from '../../context/AppContext';

interface CreateOrEditCommunityModalProps {
  isOpen: boolean;
  communityToEdit?: ChurchCommunity | null;
  onClose: () => void;
  onSave: (data: Omit<ChurchCommunity, 'id' | 'createdAt' | 'members' | 'pendingRequests'>, communityId?: string) => void;
}

const THEME_CATEGORIES: { id: CommunityThemeCategory; label: string; icon: string; description?: string }[] = [
  // Temáticas existentes preservadas
  { id: 'jovenes', label: 'Jóvenes Adventistas (JA)', icon: '🔥', description: 'Sociedad de jóvenes, liderazgo y desarrollo espiritual' },
  { id: 'estudio_biblico', label: 'Estudio Bíblico', icon: '📖', description: 'Profundización bíblica, doctrinas y profecías' },
  { id: 'oracion', label: 'Oración e Intercesión', icon: '🙏', description: 'Cadenas de oración, vigilias y comunión' },
  { id: 'musica_cristiana', label: 'Música y Coros', icon: '🎵', description: 'Alabanza, coros eclesiásticos e instrumental' },
  { id: 'evangelismo', label: 'Evangelismo y Misión', icon: '🌍', description: 'Misión urbana, discipulado y testimonio' },
  { id: 'grupos_pequenos', label: 'Grupos Pequeños', icon: '🏡', description: 'Comunión en hogares y estudio en grupos reducidos' },
  { id: 'familias', label: 'Familias y Hogar', icon: '👨‍👩‍👧', description: 'Fortalecimiento del hogar y relaciones cristianas' },
  { id: 'servicio_comunitario', label: 'Servicio Comunitario', icon: '🤝', description: 'Acción solidaria y bienestar para la comunidad' },

  // Nuevas temáticas solicitadas
  { id: 'deportes', label: 'Deportes', icon: '⚽', description: 'Fútbol, baloncesto, voleibol, caminatas, actividades físicas y otros deportes' },
  { id: 'capacitacion_formacion', label: 'Capacitaciones y formación', icon: '🎓', description: 'Cursos, talleres, aprendizaje de habilidades, formación laboral y desarrollo personal' },
  { id: 'educacion_estudios', label: 'Educación y estudios', icon: '📚', description: 'Grupos de estudio, apoyo académico, lectura y aprendizaje' },
  { id: 'emprendimiento_negocios', label: 'Emprendimiento y negocios', icon: '💼', description: 'Ideas de negocio, proyectos, administración y desarrollo de emprendimientos' },
  { id: 'tecnologia_informatica', label: 'Tecnología e informática', icon: '💻', description: 'Programación, herramientas digitales, informática y aprendizaje tecnológico' },
  { id: 'arte_cultura', label: 'Arte y cultura', icon: '🎨', description: 'Dibujo, pintura, teatro, fotografía y actividades culturales' },
  { id: 'musica_canto', label: 'Música y canto', icon: '🎙️', description: 'Coros, instrumentos, técnica vocal y grupos musicales' },
  { id: 'salud_bienestar', label: 'Salud y bienestar', icon: '🍎', description: 'Hábitos saludables, bienestar integral y actividades recreativas' },
  { id: 'servicio_voluntariado', label: 'Servicio comunitario y voluntariado', icon: '❤️', description: 'Proyectos sociales, ayuda a la comunidad y actividades solidarias' },
  { id: 'familia_convivencia', label: 'Familia y convivencia', icon: '👨‍👩‍👧‍👦', description: 'Relaciones familiares, comunicación y actividades de integración' },
  { id: 'idiomas', label: 'Idiomas', icon: '🌐', description: 'Aprendizaje y práctica de otros idiomas' },
  { id: 'medio_ambiente', label: 'Medio ambiente', icon: '🌱', description: 'Cuidado de la naturaleza, reciclaje y actividades ecológicas' },
  { id: 'otra', label: 'Otras temáticas', icon: '✨', description: 'Temática personalizada escrita por el creador' },
];

const SUGGESTED_COVERS = [
  { label: 'Culto y Alabanza', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80' },
  { label: 'Biblia y Estudio', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80' },
  { label: 'Juventud Unida', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80' },
  { label: 'Oración y Esperanza', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80' },
  { label: 'Liderazgo JA', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80' },
];

const COMMON_REQUIREMENTS = [
  'Biblia física o digital',
  'Cuaderno de notas y bolígrafo',
  'Himnario Adventista',
  'Deseo sincero de servir',
  'Guardar respeto y reverencia cristiana'
];

export const CreateOrEditCommunityModal: React.FC<CreateOrEditCommunityModalProps> = ({
  isOpen,
  communityToEdit,
  onClose,
  onSave
}) => {
  const { currentUser } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [church, setChurch] = useState('');
  const [district, setDistrict] = useState('Distrito Central');
  const [city, setCity] = useState('Buenaventura');
  const [theme, setTheme] = useState('');
  const [themeCategory, setThemeCategory] = useState<CommunityThemeCategory>('jovenes');
  const [customThemeCategory, setCustomThemeCategory] = useState('');
  const [specificTopicsInput, setSpecificTopicsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(SUGGESTED_COVERS[0].url);
  const [isPrivate, setIsPrivate] = useState(false);
  const [meetingDays, setMeetingDays] = useState('Sábados por la tarde');
  const [meetingTime, setMeetingTime] = useState('4:30 PM - 6:30 PM');
  const [modality, setModality] = useState<MeetingModality>('presencial');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [virtualMeetingUrl, setVirtualMeetingUrl] = useState('');
  const [requiredMaterials, setRequiredMaterials] = useState<string[]>(['Biblia física o digital', 'Cuaderno de notas y bolígrafo']);
  const [customMaterial, setCustomMaterial] = useState('');
  const [membershipRequirements, setMembershipRequirements] = useState('');
  const [rules, setRules] = useState([
    'Mantener reverencia, respeto mutuo y amor cristiano en todas las publicaciones.',
    'Todo contenido debe estar fundamentado en las Sagradas Escrituras.',
    'Cero spam, mensajes comerciales o debates destructivos.',
    'Proteger la privacidad de los hermanos y menores de edad.'
  ]);
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (communityToEdit) {
      setName(communityToEdit.name);
      setDescription(communityToEdit.description);
      setChurch(communityToEdit.church);
      setDistrict(communityToEdit.district);
      setCity(communityToEdit.city);
      setTheme(communityToEdit.theme);
      setThemeCategory(communityToEdit.themeCategory || 'jovenes');
      setCustomThemeCategory(communityToEdit.customThemeCategory || '');
      setSpecificTopicsInput(communityToEdit.specificTopics?.join(', ') || '');
      setImageUrl(communityToEdit.imageUrl);
      setIsPrivate(communityToEdit.isPrivate);
      setMeetingDays(communityToEdit.meetingDays || 'Sábados');
      setMeetingTime(communityToEdit.meetingTime || '4:30 PM - 6:30 PM');
      setModality(communityToEdit.modality || 'presencial');
      setMeetingPlace(communityToEdit.meetingPlace || '');
      setVirtualMeetingUrl(communityToEdit.virtualMeetingUrl || '');
      setRequiredMaterials(communityToEdit.requiredMaterials || ['Biblia física o digital']);
      setMembershipRequirements(communityToEdit.membershipRequirements || '');
      setRules(communityToEdit.rules || []);
    } else {
      setName('');
      setDescription('');
      setChurch(currentUser.church || 'Iglesia Adventista Central de Buenaventura');
      setDistrict(currentUser.district || 'Distrito Central');
      setCity('Buenaventura');
      setTheme('Comunión y Misión Juvenil');
      setThemeCategory('jovenes');
      setCustomThemeCategory('');
      setSpecificTopicsInput('Liderazgo, Oración, Estudio Bíblico, Misión');
      setImageUrl(SUGGESTED_COVERS[0].url);
      setIsPrivate(false);
      setMeetingDays('Sábados por la tarde');
      setMeetingTime('4:30 PM - 6:30 PM');
      setModality('presencial');
      setMeetingPlace('');
      setVirtualMeetingUrl('');
      setRequiredMaterials(['Biblia física o digital', 'Cuaderno de notas y bolígrafo']);
      setMembershipRequirements('Compromiso con el crecimiento espiritual y los principios adventistas.');
      setRules([
        'Mantener reverencia, respeto mutuo y amor cristiano en todas las publicaciones.',
        'Todo contenido debe estar fundamentado en las Sagradas Escrituras.',
        'Cero spam, mensajes comerciales o debates destructivos.',
        'Proteger la privacidad de los hermanos y menores de edad.'
      ]);
    }
  }, [communityToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleToggleMaterial = (mat: string) => {
    if (requiredMaterials.includes(mat)) {
      setRequiredMaterials(requiredMaterials.filter(m => m !== mat));
    } else {
      setRequiredMaterials([...requiredMaterials, mat]);
    }
  };

  const handleAddCustomMaterial = () => {
    if (!customMaterial.trim()) return;
    if (!requiredMaterials.includes(customMaterial.trim())) {
      setRequiredMaterials([...requiredMaterials, customMaterial.trim()]);
    }
    setCustomMaterial('');
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !church.trim()) return;

    const topics = specificTopicsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      description: description.trim(),
      church: church.trim(),
      district,
      city: city.trim(),
      theme: theme.trim() || (themeCategory === 'otra' && customThemeCategory.trim() ? customThemeCategory.trim() : name.trim()),
      themeCategory,
      customThemeCategory: themeCategory === 'otra' ? customThemeCategory.trim() : undefined,
      specificTopics: topics,
      imageUrl: imageUrl.trim() || SUGGESTED_COVERS[0].url,
      isPrivate,
      creatorId: communityToEdit?.creatorId || currentUser.id,
      creatorName: communityToEdit?.creatorName || `${currentUser.name} ${currentUser.lastName || ''}`.trim() || currentUser.username,
      creatorAvatar: communityToEdit?.creatorAvatar || currentUser.avatar,
      creatorRole: communityToEdit?.creatorRole || 'Responsable de Comunidad',
      meetingDays: meetingDays.trim(),
      meetingTime: meetingTime.trim(),
      modality,
      meetingPlace: modality !== 'virtual' ? meetingPlace.trim() : undefined,
      virtualMeetingUrl: modality !== 'presencial' ? virtualMeetingUrl.trim() : undefined,
      requiredMaterials,
      membershipRequirements: membershipRequirements.trim() || undefined,
      rules
    }, communityToEdit?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {communityToEdit ? 'Editar Información de la Comunidad' : 'Crear Nueva Comunidad Cristiana'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Responsable: {currentUser.name} ({currentUser.church || 'Buenaventura'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Nombre de la comunidad */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              1. Nombre de la comunidad: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Jóvenes Adventistas Central Buenaventura"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          {/* 2. Temática Principal y Categoría */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-slate-300 font-bold text-xs sm:text-sm">
                2. Temática principal de la comunidad: *
              </label>
              <span className="text-[10px] text-blue-400 font-semibold">
                {THEME_CATEGORIES.length} temáticas disponibles
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {THEME_CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setThemeCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    themeCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-1 ring-blue-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {cat.description && (
                    <span className={`text-[10px] mt-1 line-clamp-2 leading-tight ${
                      themeCategory === cat.id ? 'text-blue-100 font-normal' : 'text-slate-400 font-normal'
                    }`}>
                      {cat.description}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Temática personalizada cuando se selecciona 'otra' */}
            {themeCategory === 'otra' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-in fade-in duration-150">
                <label className="block text-amber-300 font-bold text-xs">
                  Escribe tu temática personalizada: *
                </label>
                <input
                  type="text"
                  required={themeCategory === 'otra'}
                  value={customThemeCategory}
                  onChange={(e) => setCustomThemeCategory(e.target.value)}
                  placeholder="Ej: Robótica y fe, Fotografía de naturaleza, Ajedrez cristiano..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-semibold"
                />
                <p className="text-[10px] text-amber-200/80">
                  Esta temática personalizada se guardará y mostrará como la categoría principal de tu comunidad.
                </p>
              </div>
            )}

            <div className="pt-1">
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                Lema o propósito temático:
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ej: Juventud en Misión y Fuego Espiritual"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* 3. Descripción y Propósito */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              3. Descripción y propósito de la comunidad: *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué actividades realizarán, a quiénes va dirigida y cuál es la misión espiritual de este grupo..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* 4. Temas específicos que se tratarán */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              4. Temas específicos que se tratarán (separados por coma):
            </label>
            <input
              type="text"
              value={specificTopicsInput}
              onChange={(e) => setSpecificTopicsInput(e.target.value)}
              placeholder="Ej: Liderazgo juvenil, Profecías bíblicas, Evangelismo portuario, Grupos pequeños"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 5. Iglesia, Distrito y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Iglesia o Sede: *</label>
              <input
                type="text"
                required
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="Iglesia Central..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Distrito Oficial:</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Distrito Central">Distrito Central</option>
                <option value="Distrito Emanuel">Distrito Emanuel</option>
                <option value="Distrito Alfa y Omega">Distrito Alfa y Omega</option>
                <option value="Distrito Manantial">Distrito Manantial</option>
                <option value="Distrito Bajo Calima">Distrito Bajo Calima</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ciudad o Municipio:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Buenaventura"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 6. Tipo de Comunidad: Pública o Privada */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 block">
              6. Tipo de comunidad y privacidad:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  !isPrivate 
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-white mb-1">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span>Comunidad Pública</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Cualquier miembro de A Prueba de Fuego puede unirse libremente y ver las reuniones y avisos.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isPrivate 
                    ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-white mb-1">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>Comunidad Privada (Moderada)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Requiere que el creador o administradores aprueben la solicitud antes de tener acceso a los contenidos privados.
                </p>
              </button>
            </div>
          </div>

          {/* 7 y 8. Días y Horarios habituales de reunión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                7. Días habituales de reunión:
              </label>
              <input
                type="text"
                value={meetingDays}
                onChange={(e) => setMeetingDays(e.target.value)}
                placeholder="Ej: Sábados por la tarde, Miércoles de oración"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                8. Horario habitual:
              </label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="Ej: 4:30 PM - 6:30 PM"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 9, 10, 11. Modalidad, Lugar y Enlace Virtual */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                9. Modalidad habitual:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModality('presencial')}
                  className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                    modality === 'presencial' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Presencial</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModality('virtual')}
                  className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                    modality === 'virtual' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Virtual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModality('mixta')}
                  className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                    modality === 'mixta' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Mixta</span>
                </button>
              </div>
            </div>

            {modality !== 'virtual' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  10. Lugar presencial de reunión:
                </label>
                <input
                  type="text"
                  value={meetingPlace}
                  onChange={(e) => setMeetingPlace(e.target.value)}
                  placeholder="Ej: Salón Juvenil Iglesia Central, Carrera 5 # 3-20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {modality !== 'presencial' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  11. Enlace habitual de reunión virtual:
                </label>
                <input
                  type="url"
                  value={virtualMeetingUrl}
                  onChange={(e) => setVirtualMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* 12. Qué debe llevar o preparar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 block">
              12. ¿Qué debe llevar o preparar una persona que participe?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REQUIREMENTS.map(item => {
                const selected = requiredMaterials.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleToggleMaterial(item)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                      selected 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                placeholder="Agregar otro elemento requerido..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomMaterial}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* 13. Requisitos adicionales */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              13. Requisitos adicionales para los nuevos miembros:
            </label>
            <input
              type="text"
              value={membershipRequirements}
              onChange={(e) => setMembershipRequirements(e.target.value)}
              placeholder="Ej: Asistir puntualmente a los encuentros sabáticos, espíritu colaborador..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 14. Normas de convivencia */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 block">
              14. Normas de convivencia de la comunidad:
            </span>
            <ul className="space-y-1.5">
              {rules.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="text-amber-500 font-bold">{i + 1}.</span>
                    <span className="truncate">{r}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(i)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Escribir nueva norma de convivencia..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* 15. Imagen de portada */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-300 block">
              15. Fotografía o imagen de portada:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SUGGESTED_COVERS.map(cover => (
                <button
                  type="button"
                  key={cover.url}
                  onClick={() => setImageUrl(cover.url)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    imageUrl === cover.url 
                      ? 'border-blue-500 ring-2 ring-blue-500/50 scale-102' 
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={cover.url} alt={cover.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] text-white font-bold truncate rounded px-1">
                    {cover.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-1.5">
              <label className="block text-slate-400 font-semibold mb-1">
                O introduce una URL de imagen personalizada:
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              {communityToEdit ? 'Guardar Cambios de Comunidad' : 'Crear Comunidad Ahora'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
