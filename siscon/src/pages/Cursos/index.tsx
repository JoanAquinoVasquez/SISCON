// src/pages/Cursos/index.tsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  Layers,
  GraduationCap,
  Calendar,
  Pencil,
  Trash2,
  BookMarked,
  FolderPlus,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { programaService, type Programa } from '../../services/programaService';
import { semestreService, type Semestre } from '../../services/semestreService';
import { cursoService, type Curso } from '../../services/cursoService';
import { CursoForm } from './CursoForm';
import { SemestreForm } from './SemestreForm';
import { ProgramaCreateForm } from './ProgramaCreateForm';
import { cn } from '../../lib/utils';

// ---------- helpers ----------
const GRADO_COLORS: Record<string, string> = {
  Maestría: 'bg-blue-100 text-blue-700 border-blue-200',
  Doctorado: 'bg-purple-100 text-purple-700 border-purple-200',
  'Segunda Especialidad': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function gradoBadgeClass(nombre?: string) {
  if (!nombre) return 'bg-slate-100 text-slate-600 border-slate-200';
  const key = Object.keys(GRADO_COLORS).find((k) =>
    nombre.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? GRADO_COLORS[key] : 'bg-slate-100 text-slate-600 border-slate-200';
}

// ============================================================
export default function CursosPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // ── Filtros programas
  const [search, setSearch] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('');

  // ── Selección en cascada
  const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(null);

  // ── Dialogs
  const [isProgramaFormOpen, setIsProgramaFormOpen] = useState(false);
  const [isSemestreFormOpen, setIsSemestreFormOpen] = useState(false);
  const [editingSemestre, setEditingSemestre] = useState<Semestre | null>(null);
  const [isCursoFormOpen, setIsCursoFormOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  // ══════════════════════════════════════════
  // QUERIES
  // ══════════════════════════════════════════
  const { data: programasData, isLoading: loadingProgramas } = useQuery({
    queryKey: ['programas'],
    queryFn: () => programaService.getAll(),
  });

  const { data: semestresData, isLoading: loadingSemestres } = useQuery({
    queryKey: ['semestres', selectedPrograma?.id],
    queryFn: () => semestreService.getByPrograma(selectedPrograma!.id),
    enabled: !!selectedPrograma,
  });

  const { data: cursosData, isLoading: loadingCursos } = useQuery({
    queryKey: ['cursos-semestre', selectedSemestre?.id],
    queryFn: () => cursoService.getBySemestre(selectedSemestre!.id),
    enabled: !!selectedSemestre,
  });

  // ══════════════════════════════════════════
  // MUTATIONS — Programas
  // ══════════════════════════════════════════
  const createProgramaMutation = useMutation({
    mutationFn: programaService.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      showToast('Programa creado exitosamente', 'success');
      setIsProgramaFormOpen(false);
      setSelectedPrograma(res.data);
      setSelectedSemestre(null);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  // ══════════════════════════════════════════
  // MUTATIONS — Semestres
  // ══════════════════════════════════════════
  const createSemestreMutation = useMutation({
    mutationFn: (data: { programa_id: number; numero_semestre: number; nombre: string; descripcion?: string }) =>
      semestreService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['semestres', selectedPrograma?.id] });
      showToast('Semestre creado exitosamente', 'success');
      setIsSemestreFormOpen(false);
      setEditingSemestre(null);
      setSelectedSemestre(res.data);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  const updateSemestreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      semestreService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semestres', selectedPrograma?.id] });
      showToast('Semestre actualizado', 'success');
      setIsSemestreFormOpen(false);
      setEditingSemestre(null);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  const deleteSemestreMutation = useMutation({
    mutationFn: semestreService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semestres', selectedPrograma?.id] });
      showToast('Semestre eliminado', 'success');
      if (selectedSemestre?.id === editingSemestre?.id) setSelectedSemestre(null);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  // ══════════════════════════════════════════
  // MUTATIONS — Cursos
  // ══════════════════════════════════════════
  const createCursoMutation = useMutation({
    mutationFn: cursoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-semestre', selectedSemestre?.id] });
      showToast('Curso registrado exitosamente', 'success');
      setIsCursoFormOpen(false);
      setEditingCurso(null);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  const updateCursoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      cursoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-semestre', selectedSemestre?.id] });
      showToast('Curso actualizado', 'success');
      setIsCursoFormOpen(false);
      setEditingCurso(null);
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  const deleteCursoMutation = useMutation({
    mutationFn: cursoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos-semestre', selectedSemestre?.id] });
      showToast('Curso eliminado', 'success');
    },
    onError: (e: Error) => showToast(`Error: ${e.message}`, 'error'),
  });

  // ══════════════════════════════════════════
  // DERIVED DATA
  // ══════════════════════════════════════════
  const programas = programasData?.data ?? [];
  const semestres = semestresData?.data ?? [];
  const cursos = cursosData?.data ?? [];

  const periodos = useMemo(
    () => [...new Set(programas.map((p) => p.periodo).filter(Boolean))].sort().reverse(),
    [programas],
  );

  const filteredProgramas = useMemo(() => {
    return programas.filter((p) => {
      const matchSearch =
        !search || p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchPeriodo = !periodoFilter || p.periodo === periodoFilter;
      return matchSearch && matchPeriodo;
    });
  }, [programas, search, periodoFilter]);

  // ══════════════════════════════════════════
  // HANDLERS
  // ══════════════════════════════════════════
  const handleSelectPrograma = (p: Programa) => {
    setSelectedPrograma(p);
    setSelectedSemestre(null);
  };

  const handleSemestreSubmit = (data: any) => {
    if (!selectedPrograma) return;
    if (editingSemestre) {
      updateSemestreMutation.mutate({ id: editingSemestre.id, data });
    } else {
      createSemestreMutation.mutate({ programa_id: selectedPrograma.id, ...data });
    }
  };

  const handleCursoSubmit = (data: any) => {
    if (!selectedSemestre) return;
    if (editingCurso) {
      updateCursoMutation.mutate({ id: editingCurso.id, data: { ...data, semestre_ids: [selectedSemestre.id] } });
    } else {
      createCursoMutation.mutate({ ...data, semestre_ids: [selectedSemestre.id] });
    }
  };

  const handleDeleteSemestre = (s: Semestre) => {
    if (confirm(`¿Eliminar el "${s.nombre}"? Se desvinculará de todos sus cursos.`)) {
      deleteSemestreMutation.mutate(s.id);
    }
  };

  const handleDeleteCurso = (c: Curso) => {
    if (confirm(`¿Eliminar el curso "${c.nombre}"?`)) {
      deleteCursoMutation.mutate(c.id);
    }
  };

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Gestión de Cursos
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecciona un programa y semestre para registrar o editar cursos
          </p>
        </div>
        <Button
          id="btn-nuevo-programa"
          className="gap-2"
          variant="outline"
          onClick={() => setIsProgramaFormOpen(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Agregar Periodo / Programa
        </Button>
      </div>

      {/* ══════════════════════════════════════════
          LAYOUT 3 COLUMNAS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">

        {/* ── COL 1: Programas */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3 shrink-0 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              Programas
            </CardTitle>
            {/* Filtros */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="buscar-programa"
                  className="pl-8 h-8 text-sm"
                  placeholder="Buscar programa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setPeriodoFilter('')}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border transition-colors',
                    !periodoFilter
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 hover:bg-slate-50',
                  )}
                >
                  Todos
                </button>
                {periodos.slice(0, 8).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodoFilter(p === periodoFilter ? '' : p)}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border transition-colors',
                      periodoFilter === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-2">
            {loadingProgramas ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full mr-2" />
                Cargando...
              </div>
            ) : filteredProgramas.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No se encontraron programas
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredProgramas.map((p) => (
                  <li key={p.id}>
                    <button
                      id={`prog-${p.id}`}
                      onClick={() => handleSelectPrograma(p)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm group',
                        selectedPrograma?.id === p.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'hover:bg-slate-100',
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium leading-tight line-clamp-2">{p.nombre}</span>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 shrink-0 mt-0.5 transition-transform',
                            selectedPrograma?.id === p.id
                              ? 'text-white rotate-90'
                              : 'text-muted-foreground group-hover:translate-x-0.5',
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {p.periodo && (
                          <span
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded border font-medium',
                              selectedPrograma?.id === p.id
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-amber-50 text-amber-700 border-amber-200',
                            )}
                          >
                            <Calendar className="inline h-3 w-3 mr-0.5" />
                            {p.periodo}
                          </span>
                        )}
                        {p.grado && (
                          <span
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded border font-medium',
                              selectedPrograma?.id === p.id
                                ? 'bg-white/20 text-white border-white/30'
                                : gradoBadgeClass(p.grado.nombre),
                            )}
                          >
                            {p.grado.nombre}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── COL 2: Semestres */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3 shrink-0 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                Semestres
              </CardTitle>
              {selectedPrograma && (
                <Button
                  id="btn-nuevo-semestre"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    setEditingSemestre(null);
                    setIsSemestreFormOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Semestre
                </Button>
              )}
            </div>
            {selectedPrograma ? (
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {selectedPrograma.nombre}
              </CardDescription>
            ) : (
              <CardDescription className="text-xs mt-1 italic">
                Selecciona un programa
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-2">
            {!selectedPrograma ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <Layers className="h-8 w-8 opacity-30" />
                <p className="text-sm">Selecciona un programa primero</p>
              </div>
            ) : loadingSemestres ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="animate-spin h-4 w-4 border-b-2 border-purple-600 rounded-full mr-2" />
                Cargando...
              </div>
            ) : semestres.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <Layers className="h-8 w-8 opacity-30" />
                <p className="text-sm">No hay semestres</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => {
                    setEditingSemestre(null);
                    setIsSemestreFormOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Agregar semestre
                </Button>
              </div>
            ) : (
              <ul className="space-y-1">
                {semestres.map((s) => (
                  <li key={s.id}>
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group',
                        selectedSemestre?.id === s.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'hover:bg-slate-100',
                      )}
                      onClick={() => setSelectedSemestre(s)}
                      id={`sem-${s.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.nombre}</p>
                        <p
                          className={cn(
                            'text-xs mt-0.5',
                            selectedSemestre?.id === s.id ? 'text-purple-200' : 'text-muted-foreground',
                          )}
                        >
                          Semestre {s.numero_semestre}
                          {s.cursos && s.cursos.length > 0 && (
                            <> · {s.cursos.length} curso{s.cursos.length !== 1 ? 's' : ''}</>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSemestre(s);
                            setIsSemestreFormOpen(true);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-white/20',
                            selectedSemestre?.id === s.id ? 'text-white' : 'text-slate-500',
                          )}
                          title="Editar semestre"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSemestre(s);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-white/20',
                            selectedSemestre?.id === s.id ? 'text-white' : 'text-red-400',
                          )}
                          title="Eliminar semestre"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── COL 3: Cursos */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3 shrink-0 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-emerald-600" />
                Cursos
              </CardTitle>
              {selectedSemestre && (
                <Button
                  id="btn-nuevo-curso"
                  size="sm"
                  className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setEditingCurso(null);
                    setIsCursoFormOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Curso
                </Button>
              )}
            </div>
            {selectedSemestre ? (
              <CardDescription className="text-xs mt-1">
                {selectedPrograma?.nombre} — {selectedSemestre.nombre}
              </CardDescription>
            ) : (
              <CardDescription className="text-xs mt-1 italic">
                Selecciona un semestre
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-2">
            {!selectedSemestre ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <BookMarked className="h-8 w-8 opacity-30" />
                <p className="text-sm">Selecciona un semestre primero</p>
              </div>
            ) : loadingCursos ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="animate-spin h-4 w-4 border-b-2 border-emerald-600 rounded-full mr-2" />
                Cargando...
              </div>
            ) : cursos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <BookMarked className="h-8 w-8 opacity-30" />
                <p className="text-sm">No hay cursos en este semestre</p>
                <Button
                  size="sm"
                  className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setEditingCurso(null);
                    setIsCursoFormOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Agregar curso
                </Button>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {cursos.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start justify-between px-3 py-2.5 rounded-lg border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                    id={`curso-${c.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs py-0 h-5 font-mono">
                          {c.codigo}
                        </Badge>
                        {c.creditos != null && c.creditos > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {c.creditos} crédito{c.creditos !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => {
                          setEditingCurso(c);
                          setIsCursoFormOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar curso"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCurso(c)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ════ DIALOGS ════ */}
      <ProgramaCreateForm
        open={isProgramaFormOpen}
        onClose={() => setIsProgramaFormOpen(false)}
        onSubmit={(data) => createProgramaMutation.mutate(data as any)}
        isLoading={createProgramaMutation.isPending}
      />

      <SemestreForm
        open={isSemestreFormOpen}
        semestre={editingSemestre}
        programaNombre={selectedPrograma?.nombre ?? ''}
        onClose={() => {
          setIsSemestreFormOpen(false);
          setEditingSemestre(null);
        }}
        onSubmit={handleSemestreSubmit}
        isLoading={createSemestreMutation.isPending || updateSemestreMutation.isPending}
      />

      <CursoForm
        open={isCursoFormOpen}
        curso={editingCurso}
        semestreNombre={
          selectedSemestre
            ? `${selectedPrograma?.nombre} — ${selectedSemestre.nombre}`
            : ''
        }
        onClose={() => {
          setIsCursoFormOpen(false);
          setEditingCurso(null);
        }}
        onSubmit={handleCursoSubmit}
        isLoading={createCursoMutation.isPending || updateCursoMutation.isPending}
      />
    </div>
  );
}
