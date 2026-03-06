// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
   GraduationCap,
  FileText, Clock, CheckCircle2, XCircle,
  AlertCircle, DollarSign, RotateCcw,
  Activity, UserCheck, BarChart3, 
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface DashboardStats {
  expedientes: {
    total: number;
    por_estado: Record<string, number>;
    por_tipo_asunto: Record<string, number>;
    por_usuario: { name: string; total: number }[];
    ultimos_30_dias: number;
    este_mes: number;
    activos: number;
    tasa_completado: number;
  };
  pagos_docentes: {
    total: number;
    por_estado: Record<string, number>;
    por_tipo_docente: Record<string, number>;
    sin_expediente: number;
    importe_total: number;
    importe_pagado: number;
    promedio_importe: number;
    tasa_completados: number;
  };
  devoluciones: {
    total: number;
    por_estado: Record<string, number>;
    por_tipo: Record<string, number>;
    importe_total: number;
  };
  catalogo: {
    docentes_total: number;
    docentes_por_tipo: Record<string, number>;
    programas_total: number;
    cursos_total: number;
  };
  reciente: {
    expedientes: { id: number; numero_expediente_mesa_partes?: string; tipo_asunto: string; estado: string; user?: { name: string }; created_at: string }[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
  en_proceso: { label: 'En Proceso', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
  completado: { label: 'Completado', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  rechazado: { label: 'Rechazado', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const TIPO_ASUNTO_LABEL: Record<string, string> = {
  presentacion: 'Presentación',
  conformidad: 'Conformidad',
  devolucion: 'Devolución',
};

const TIPO_DEVOLUCION_LABEL: Record<string, string> = {
  inscripcion: 'Inscripción',
  idiomas: 'Idiomas',
  grados_titulos: 'Grados y Títulos',
};

function fmt(n: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);
}

// function pct(value: number) {
//   return `${value}%`;
// }

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, gradient, bg }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; gradient: string; bg: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${bg} border border-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: 'text-slate-600', bg: 'bg-slate-50', icon: Activity };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

function SectionEstados({ title, total, porEstado, icon: Icon, gradient }: {
  title: string; total: number; porEstado: Record<string, number>;
  icon: React.ElementType; gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400">{total} registros totales</p>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => {
          const count = porEstado[key] ?? 0;
          const pctVal = total > 0 ? Math.round(count / total * 100) : 0;
          const IconE = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-2">
              <IconE className={`h-4 w-4 ${cfg.color} shrink-0`} />
              <span className="text-sm text-slate-600 w-24 shrink-0">{cfg.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                  style={{ width: `${pctVal}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count}</span>
              <span className="text-xs text-slate-400 w-10 text-right">{pctVal}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reloj en tiempo real ─────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dia = now.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="text-right">
      <p className="text-3xl font-mono font-bold text-white tracking-wider">{hora}</p>
      <p className="text-blue-100 text-sm capitalize mt-1">{dia}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export function Dashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats') as Promise<DashboardStats>,
    refetchInterval: 60_000, // refresca cada minuto
  });

  return (
    <div className="space-y-6 pb-8">

      {/* ── Banner con reloj ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-7 text-white shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1">Panel de Control</h1>
          <p className="text-blue-100 text-sm">Sistema de Contabilidad SISCON — EPG</p>
        </div>
        <LiveClock />
      </div>

      {/* ── Tarjetas de catálogo ───────────────────────────────────
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Docentes" value={data?.catalogo.docentes_total ?? 0}
              subtitle={`${data?.catalogo.docentes_por_tipo?.interno ?? 0} internos · ${data?.catalogo.docentes_por_tipo?.externo ?? 0} externos`}
              icon={GraduationCap} gradient="from-orange-400 to-red-500" bg="bg-orange-50" />
            <StatCard title="Programas" value={data?.catalogo.programas_total ?? 0}
              subtitle="Maestrías activas"
              icon={Building2} gradient="from-purple-400 to-pink-500" bg="bg-purple-50" />
            <StatCard title="Cursos" value={data?.catalogo.cursos_total ?? 0}
              subtitle="Total en catálogo"
              icon={BookOpen} gradient="from-green-400 to-emerald-500" bg="bg-green-50" />
            <StatCard title="Usuarios" value={0}
              subtitle="Acceso al sistema"
              icon={Users} gradient="from-blue-400 to-cyan-500" bg="bg-blue-50" />
          </>
        )}
      </div>

      {/* ── KPIs principales ─────────────────────────────────────── */}
      {/* <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Expedientes Totales" value={data?.expedientes.total ?? 0}
              subtitle={`${data?.expedientes.este_mes ?? 0} este mes`}
              icon={FileText} gradient="from-indigo-400 to-blue-500" bg="bg-indigo-50" />
            <StatCard title="Expedientes Activos" value={data?.expedientes.activos ?? 0}
              subtitle="Pendiente + En proceso"
              icon={Activity} gradient="from-amber-400 to-orange-500" bg="bg-amber-50" />
            <StatCard title="Tasa de Completado" value={pct(data?.expedientes.tasa_completado ?? 0)}
              subtitle="Expedientes completados"
              icon={TrendingUp} gradient="from-green-500 to-teal-500" bg="bg-green-50" />
            <StatCard title="Pagos Docentes" value={data?.pagos_docentes.total ?? 0}
              subtitle={`${data?.pagos_docentes.sin_expediente ?? 0} sin expediente`}
              icon={Layers} gradient="from-violet-400 to-purple-600" bg="bg-violet-50" />
          </>
        )}
      </div> 
       */}

      {/* ── Importes ─────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Importe Total Docentes" value={fmt(data?.pagos_docentes.importe_total ?? 0)}
              subtitle="Suma de todos los pagos"
              icon={DollarSign} gradient="from-green-500 to-emerald-600" bg="bg-green-50" />
            <StatCard title="Importe Pagado" value={fmt(data?.pagos_docentes.importe_pagado ?? 0)}
              subtitle="Solo pagos completados"
              icon={CheckCircle2} gradient="from-teal-400 to-cyan-500" bg="bg-teal-50" />
            <StatCard title="Importe Devoluciones" value={fmt(data?.devoluciones.importe_total ?? 0)}
              subtitle="Total devoluciones registradas"
              icon={RotateCcw} gradient="from-rose-400 to-red-500" bg="bg-rose-50" />
          </>
        )}
      </div>

      {/* ── Estados por sección ───────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)
        ) : (
          <>
            <SectionEstados title="Expedientes" total={data?.expedientes.total ?? 0}
              porEstado={data?.expedientes.por_estado ?? {}}
              icon={FileText} gradient="from-indigo-400 to-blue-500" />
            <SectionEstados title="Pagos Docentes" total={data?.pagos_docentes.total ?? 0}
              porEstado={data?.pagos_docentes.por_estado ?? {}}
              icon={GraduationCap} gradient="from-violet-400 to-purple-600" />
            <SectionEstados title="Devoluciones" total={data?.devoluciones.total ?? 0}
              porEstado={data?.devoluciones.por_estado ?? {}}
              icon={RotateCcw} gradient="from-rose-400 to-red-500" />
          </>
        )}
      </div>

      {/* ── Desglose adicional ────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">

        {/* Expedientes por tipo de asunto */}
        {isLoading ? <Skeleton className="h-52" /> : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Expedientes por Tipo de Asunto</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(data?.expedientes.por_tipo_asunto ?? {}).map(([tipo, count]) => {
                const total = data?.expedientes.total ?? 1;
                const pctVal = Math.round((count as number) / total * 100);
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-28 shrink-0">
                      {TIPO_ASUNTO_LABEL[tipo] ?? tipo}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500"
                        style={{ width: `${pctVal}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count as number}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Devoluciones por tipo */}
        {isLoading ? <Skeleton className="h-52" /> : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="h-5 w-5 text-rose-500" />
              <h3 className="font-semibold text-slate-800">Devoluciones por Tipo</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(data?.devoluciones.por_tipo ?? {}).map(([tipo, count]) => {
                const total = data?.devoluciones.total ?? 1;
                const pctVal = Math.round((count as number) / total * 100);
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-40 shrink-0">
                      {TIPO_DEVOLUCION_LABEL[tipo] ?? tipo}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500"
                        style={{ width: `${pctVal}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count as number}</span>
                  </div>
                );
              })}
              {Object.keys(data?.devoluciones.por_tipo ?? {}).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Sin devoluciones registradas</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Expedientes por usuario ───────────────────────────────── */}
      {isLoading ? <Skeleton className="h-64" /> : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">Expedientes Registrados por Usuario</h3>
          </div>
          <div className="space-y-3">
            {(data?.expedientes.por_usuario ?? []).map((u, idx) => {
              const max = data?.expedientes.por_usuario[0]?.total ?? 1;
              const pctVal = Math.round(u.total / max * 100);
              return (
                <div key={u.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{idx + 1}</span>
                  <span className="text-sm text-slate-700 w-40 truncate shrink-0">{u.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                      style={{ width: `${pctVal}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-8 text-right">{u.total}</span>
                </div>
              );
            })}
            {(data?.expedientes.por_usuario ?? []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Sin datos de usuarios</p>
            )}
          </div>
        </div>
      )}

      {/* ── Actividad reciente ───────────────────────────────────── */}
      {isLoading ? <Skeleton className="h-52" /> : (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-800">Actividad Reciente</h3>
            <span className="ml-auto text-xs text-slate-400">Últimos 7 días</span>
          </div>
          <div className="divide-y divide-slate-50">
            {(data?.reciente.expedientes ?? []).map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {exp.numero_expediente_mesa_partes ?? `EXP-${exp.id}`}
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      {TIPO_ASUNTO_LABEL[exp.tipo_asunto] ?? exp.tipo_asunto}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">{exp.user?.name ?? '—'}</p>
                </div>
                <EstadoBadge estado={exp.estado} />
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(exp.created_at).toLocaleDateString('es-PE')}
                </span>
              </div>
            ))}
            {(data?.reciente.expedientes ?? []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Sin actividad reciente</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}