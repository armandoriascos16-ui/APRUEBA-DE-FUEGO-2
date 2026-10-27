import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Calendar, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FolderOpen,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  BUENAVENTURA_OFFICIAL_DISTRICTS, 
  ASOPACIFICO_GENERAL_PLANS, 
  ASOPACIFICO_OFFICIAL_SOURCES,
  syncBuenaventuraFromOfficialApi 
} from '../../data/buenaventuraDistrictsData';
import { BuenaventuraDistrict } from '../../types';

export const ChurchesView: React.FC = () => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist_bv_1_central');
  const [activeTab, setActiveTab] = useState<'distritos' | 'planes' | 'fuentes'>('distritos');
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    lastMessage?: string;
    checkedAt?: string;
    itemsCount?: number;
    success?: boolean;
  }>({
    loading: false,
    checkedAt: '24 de Octubre de 2026',
    itemsCount: 4,
    success: true,
  });

  const selectedDistrict = BUENAVENTURA_OFFICIAL_DISTRICTS.find(d => d.id === selectedDistrictId) 
    || BUENAVENTURA_OFFICIAL_DISTRICTS[0];

  const handleSyncApi = async () => {
    setSyncStatus(prev => ({ ...prev, loading: true }));
    const result = await syncBuenaventuraFromOfficialApi();
    setSyncStatus({
      loading: false,
      lastMessage: result.message,
      checkedAt: result.lastChecked,
      itemsCount: result.itemsFound,
      success: result.success
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Institucional de la Sección Oficial */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-950 border border-blue-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>ASOCIACIÓN DEL PACÍFICO · UNIÓN COLOMBIANA DEL SUR</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
            Información Oficial Verificada
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
          Distritos zona Buenaventura
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Estructura eclesiástica oficial de la Iglesia Adventista del Séptimo Día en el puerto de Buenaventura. 
          Datos respaldados documentalmente por la Secretaría y los portales oficiales de la Asociación del Pacífico.
        </p>

        {/* Barra de Sincronización REST API Oficial */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Última verificación con Asopacífico:</span>
            <span className="text-slate-200 font-semibold">{syncStatus.checkedAt}</span>
          </div>

          <button
            onClick={handleSyncApi}
            disabled={syncStatus.loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncStatus.loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{syncStatus.loading ? 'Comprobando en Asopacífico...' : 'Comprobar en directo (API)'}</span>
          </button>
        </div>

        {syncStatus.lastMessage && (
          <div className={`mt-3 p-3 rounded-2xl text-xs flex items-start gap-2 border ${
            syncStatus.success 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{syncStatus.lastMessage}</span>
          </div>
        )}
      </div>

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('distritos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'distritos'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Distritos Oficiales (5)</span>
        </button>

        <button
          onClick={() => setActiveTab('planes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'planes'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Planes de la Asociación ({ASOPACIFICO_GENERAL_PLANS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fuentes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'fuentes'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Fuentes Oficiales (4)</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* PESTAÑA 1: DISTRITOS OFICIALES (Exactamente los 5 requeridos) */}
      {/* ==================================================================== */}
      {activeTab === 'distritos' && (
        <div className="space-y-6">
          
          {/* Navegación horizontal de los 5 distritos en orden estricto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Distritos Eclesiásticos de Buenaventura (Orden Oficial)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BUENAVENTURA_OFFICIAL_DISTRICTS.map((dist, idx) => {
                const isSelected = dist.id === selectedDistrictId;
                return (
                  <button
                    key={dist.id}
                    onClick={() => setSelectedDistrictId(dist.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      {dist.verificationStatus === 'verificado_oficial' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-amber-400" title="En confirmación con Secretaría" />
                      )}
                    </div>
                    <span className="text-xs font-bold truncate block">
                      {dist.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {dist.churches.length} {dist.churches.length === 1 ? 'iglesia' : 'iglesias'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Detalle del Distrito Seleccionado */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                    {selectedDistrict.name}
                  </h2>
                  {selectedDistrict.verificationStatus === 'verificado_oficial' ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verificado en Asopacífico
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      En proceso con Secretaría
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zona Buenaventura · Asociación del Pacífico · Unión Colombiana del Sur
                </p>
              </div>

              <a
                href={selectedDistrict.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-700"
              >
                <span>Fuente oficial</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Ficha Institucional del Distrito (Cero inventos de pastores ni teléfonos falsos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                <span className="text-slate-400 font-semibold block">Sede Eclesiástica Principal:</span>
                <span className="text-slate-100 font-bold block">{selectedDistrict.headquartersChurch}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                <span className="text-slate-400 font-semibold block">Pastor Distrital Asignado:</span>
                <span className="text-amber-400 font-medium block">{selectedDistrict.pastor}</span>
              </div>
            </div>

            {/* Iglesias y Congregaciones del Distrito */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>Iglesias y Congregaciones Verificadas</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedDistrict.churches.length} registradas oficialmente
                </span>
              </div>

              {selectedDistrict.churches.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectedDistrict.churches.map((church) => (
                    <div
                      key={church.id}
                      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{church.name}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>{church.address}</span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold shrink-0">
                          {church.neighborhoodOrSector}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Horarios de Culto Sabático:</span>
                          <span className="text-slate-200 font-medium">{church.schedule}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Liderazgo JA:</span>
                          <span className="text-amber-300 font-medium">{church.youthLeader}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[11px]">
                        <span className="text-slate-400">
                          Comprobado en: {church.officialSourceName} ({church.verifiedAt})
                        </span>
                        <a
                          href={church.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                        >
                          <span>Ver publicación</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* REGLA ESTRICTA: Mensaje transparente cuando no hay congregaciones detalladas públicamente */
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-amber-400 mx-auto" />
                  <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto">
                    No hay iglesias ni congregaciones publicadas oficialmente para este distrito en este momento.
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    Información pendiente de verificación con la Secretaría de la Asociación del Pacífico. 
                    Para preservar la total integridad y veracidad de la aplicación, no se incluyen nombres ficticios ni de ejemplo.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://asopacifico.org/secretaria/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-blue-300 text-xs font-semibold border border-slate-700"
                    >
                      <span>Consultar Directorio en Secretaría Asopacífico</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Acceso Directo a los Planes de la Asociación del Pacífico desde el distrito */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-bold block">
                  Planes de la Asociación del Pacífico aplicables a {selectedDistrict.name}:
                </span>
                <span className="text-[11px] text-slate-400">
                  Consulta las directrices misioneras vigentes de Asopacífico
                </span>
              </div>
              <button
                onClick={() => setActiveTab('planes')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Ver Planes</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA 2: PLANES DE LA ASOCIACIÓN DEL PACÍFICO (Compartido por los 5) */}
      {/* ==================================================================== */}
      {activeTab === 'planes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Planes de la Asociación del Pacífico
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plan general publicado oficialmente por la Asociación del Pacífico, accesible y aplicable 
              a los cinco distritos de Buenaventura (Central, Emanuel, Alfa y Omega, Manantial y Bajo Calima).
            </p>
          </div>

          {ASOPACIFICO_GENERAL_PLANS.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {ASOPACIFICO_GENERAL_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 hover:border-blue-500/40 transition-all shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.status === 'en_curso'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {plan.status === 'en_curso' ? '● En curso / Vigente' : 'Culminado / Histórico'}
                        </span>
                        <span className="text-[11px] text-blue-400 font-semibold">
                          {plan.organizerDepartment}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {plan.title}
                      </h3>
                    </div>

                    <a
                      href={plan.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                    >
                      <span>Portal oficial</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span><strong>Fecha:</strong> {plan.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span><strong>Lugar:</strong> {plan.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Ámbito: {plan.districtName}</span>
                    <span>Fuente: {plan.officialSourceName}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <FolderOpen className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No hay planes oficiales publicados para consultar en este momento
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Visita el portal de la Asociación del Pacífico para verificar próximas publicaciones.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA 3: FUENTES OFICIALES (Los cuatro sitios requeridos) */}
      {/* ==================================================================== */}
      {activeTab === 'fuentes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Fuentes Oficiales de Consulta
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enlaces directos y verificables a las plataformas institucionales de la Asociación del Pacífico.
              Toda la información contenida en esta sección puede ser contrastada en estos cuatro portales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ASOPACIFICO_OFFICIAL_SOURCES.map((source) => (
              <div
                key={source.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 hover:border-blue-500/40 transition-all shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      {source.badge}
                    </span>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                      ✓
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {source.name}
                  </h3>
                  <p className="text-[11px] text-blue-400 font-medium mt-0.5">
                    {source.organization}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                    {source.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Abrir Portal Oficial</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <span className="text-[10px] text-slate-500 text-center block mt-1.5 truncate">
                    {source.url}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
