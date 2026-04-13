// src/pages/Cursos/ProgramaCreateForm.tsx
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { programaService } from '../../services/programaService';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface FormData {
  nombre: string;
  grado_id: number;
  facultad_id?: number;
  periodo: string;
  descripcion?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function ProgramaCreateForm({ open, onClose, onSubmit, isLoading }: Props) {
  const { showToast } = useToast();

  // ── Datos de BD
  const { data: programasData } = useQuery({
    queryKey: ['programas'],
    queryFn: () => programaService.getAll(),
    enabled: open,
  });
  const { data: gradosData, isLoading: isLoadingGrados } = useQuery({
    queryKey: ['grados-list'],
    queryFn: () => programaService.getGrados(),
    enabled: open,
  });
  const { data: facultadesData } = useQuery({
    queryKey: ['facultades-list'],
    queryFn: () => programaService.getFacultades(),
    enabled: open,
  });

  // ── Estado del formulario
  const [gradoId, setGradoId] = useState<number>(0);
  const [facultadId, setFacultadId] = useState<number>(0);
  const [nombreSearch, setNombreSearch] = useState('');
  const [nombreSeleccionado, setNombreSeleccionado] = useState('');
  const [periodoInput, setPeriodoInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [facultadAutoNombre, setFacultadAutoNombre] = useState('');
  const comboRef = useRef<HTMLDivElement>(null);

  // ── Helpers
  const gradoNombre = gradosData?.data?.find((g) => g.id === gradoId)?.nombre ?? '';
  const esNombreNuevo = !!nombreSearch && nombreSearch.length >= 3 && !nombreSeleccionado;

  // Programas únicos del grado seleccionado
  const programasFiltrados = (() => {
    if (!programasData?.data || !gradoId) return [];
    const seen = new Map<string, (typeof programasData.data)[0]>();
    for (const p of programasData.data) {
      if (p.grado_id === gradoId && !seen.has(p.nombre)) seen.set(p.nombre, p);
    }
    return [...seen.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  })();

  const sugerencias = programasFiltrados.filter(
    (p) => !nombreSearch || p.nombre.toLowerCase().includes(nombreSearch.toLowerCase()),
  );

  // ── Detectar periodo duplicado
  const periodoYaExiste = !!(
    gradoId &&
    nombreSearch.length >= 3 &&
    periodoInput.length >= 6 &&
    programasData?.data?.some(
      (p) =>
        p.nombre.toLowerCase() === nombreSearch.toLowerCase() &&
        p.grado_id === gradoId &&
        p.periodo === periodoInput,
    )
  );

  // ── RHF
  const { register, handleSubmit, setValue, formState: { errors }, reset } =
    useForm<FormData>({ 
      mode: 'onChange',
      defaultValues: { nombre: '', grado_id: 0, facultad_id: undefined, periodo: '', descripcion: '' } 
    });

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      reset();
      setGradoId(0);
      setFacultadId(0);
      setNombreSearch('');
      setNombreSeleccionado('');
      setPeriodoInput('');
      setFacultadAutoNombre('');
    }
  }, [open, reset]);

  // Cerrar dropdown click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers
  const handleGradoChange = (v: string) => {
    const id = Number(v);
    setGradoId(id);
    setValue('grado_id', id, { shouldValidate: true });
    setNombreSearch('');
    setNombreSeleccionado('');
    setValue('nombre', '', { shouldValidate: true });
    setFacultadId(0);
    setFacultadAutoNombre('');
    setValue('facultad_id', undefined, { shouldValidate: true });
    setPeriodoInput('');
    setValue('periodo', '', { shouldValidate: true });
  };

  const handleSelectSugerencia = (nombre: string, programa: any) => {
    setNombreSeleccionado(nombre);
    setNombreSearch(nombre);
    setValue('nombre', nombre, { shouldValidate: true });
    if (programa.facultad_id) {
      setFacultadId(programa.facultad_id);
      setValue('facultad_id', programa.facultad_id, { shouldValidate: true });
      const fac = facultadesData?.data?.find((f) => f.id === programa.facultad_id);
      setFacultadAutoNombre(fac?.nombre ?? '');
    } else {
      setFacultadId(0);
      setFacultadAutoNombre('');
      setValue('facultad_id', undefined, { shouldValidate: true });
    }
    setShowSuggestions(false);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombreSearch(val);
    setValue('nombre', val, { shouldValidate: true });

    // Buscar si hay una coincidencia exacta con un programa existente (ignorando mayúsculas/minúsculas)
    const programaExistente = programasData?.data?.find(
      (p) => p.grado_id === gradoId && p.nombre.trim().toLowerCase() === val.trim().toLowerCase()
    );

    if (programaExistente) {
      // Si coincide exactamente, actuar como si lo hubiera seleccionado de la lista
      setNombreSeleccionado(programaExistente.nombre);
      if (programaExistente.facultad_id) {
        setFacultadId(programaExistente.facultad_id);
        setValue('facultad_id', programaExistente.facultad_id, { shouldValidate: true });
        const fac = facultadesData?.data?.find((f) => f.id === programaExistente.facultad_id);
        setFacultadAutoNombre(fac?.nombre ?? '');
      }
    } else {
      // Si no coincide, limpiar selección previa
      setNombreSeleccionado('');
      setFacultadId(0);
      setFacultadAutoNombre('');
      setValue('facultad_id', undefined, { shouldValidate: true });
    }
    setShowSuggestions(true);
  };

  const handleClearNombre = () => {
    setNombreSearch('');
    setNombreSeleccionado('');
    setValue('nombre', '', { shouldValidate: true });
    setFacultadId(0);
    setFacultadAutoNombre('');
    setValue('facultad_id', undefined, { shouldValidate: true });
    setPeriodoInput('');
    setValue('periodo', '', { shouldValidate: true });
  };

  const handleFacultadChange = (v: string) => {
    const id = Number(v);
    setFacultadId(id);
    setValue('facultad_id', id, { shouldValidate: true });
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodoInput(e.target.value);
    setValue('periodo', e.target.value, { shouldValidate: true });
  };

  const handleFormSubmit = (raw: FormData) => {
    if (periodoYaExiste) return;
    onSubmit({
      ...raw,
      grado_id: gradoId,
      facultad_id: facultadId || undefined,
    });
  };

  const onInvalid = () => {
    showToast("Por favor, revisa que todos los campos tengan el formato correcto (Ej: 2025-I)", "error");
  };

  const nombreHabilitado = gradoId > 0;
  const mostrarSeleccionFacultad = esNombreNuevo || (!!nombreSeleccionado && !facultadAutoNombre);
  const periodoHabilitado = nombreSearch.length >= 3;


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Periodo / Programa</DialogTitle>
          <DialogDescription>
            Selecciona el grado y luego el programa para registrar un nuevo periodo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className="space-y-4 pt-2">

          {/* PASO 1: Grado */}
          <div className="space-y-2">
            <Label htmlFor="prog-grado">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                Grado académico *
              </span>
            </Label>
            <Select onValueChange={handleGradoChange} value={gradoId ? String(gradoId) : ''} disabled={isLoadingGrados}>
              <SelectTrigger id="prog-grado">
                <SelectValue placeholder={isLoadingGrados ? "Cargando grados..." : "Selecciona el grado"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingGrados ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-muted-foreground font-medium">Cargando grados...</span>
                  </div>
                ) : (
                  gradosData?.data?.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      <span>{g.nombre}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.grado_id && <p className="text-sm text-destructive">{errors.grado_id.message}</p>}
          </div>

          {/* PASO 2: Nombre del programa */}
          <div className="space-y-2">
            <Label htmlFor="prog-nombre">
              <span className="inline-flex items-center gap-1.5">
                <span className={cn(
                  'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                  nombreHabilitado ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400',
                )}>2</span>
                Nombre del programa *
              </span>
            </Label>
            <div ref={comboRef} className="relative">
              <div className="relative flex items-center">
                <Input
                  id="prog-nombre"
                  value={nombreSearch}
                  onChange={handleNombreChange}
                  onFocus={() => nombreHabilitado && setShowSuggestions(true)}
                  disabled={!nombreHabilitado}
                  autoComplete="off"
                  placeholder={
                    !nombreHabilitado
                      ? 'Primero selecciona un grado…'
                      : `Busca o escribe el nombre del programa de ${gradoNombre}`
                  }
                  className={cn(
                    'pr-10',
                    nombreSeleccionado && 'border-blue-400 bg-blue-50/60',
                    !nombreHabilitado && 'opacity-50 cursor-not-allowed',
                    errors.nombre && 'border-destructive'
                  )}
                />
                <input type="hidden" {...register('nombre', { 
                  required: 'El nombre es requerido', 
                  minLength: { value: 3, message: 'Al menos 3 caracteres' } 
                })} />
                {nombreSearch && (
                  <button type="button" onClick={handleClearNombre} className="absolute right-8 text-slate-400 hover:text-red-500 transition-colors p-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <ChevronsUpDown className="absolute right-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {showSuggestions && nombreHabilitado && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {sugerencias.length === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-amber-700 bg-amber-50 rounded-lg">
                      No encontrado — se creará como <strong>nuevo programa</strong>
                    </div>
                  ) : (
                    sugerencias.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectSugerencia(p.nombre, p)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 flex items-start gap-2 transition-colors border-b border-slate-50 last:border-0',
                          nombreSeleccionado === p.nombre && 'bg-blue-50',
                        )}
                      >
                        <Check className={cn('h-4 w-4 mt-0.5 shrink-0 text-blue-600', nombreSeleccionado === p.nombre ? 'opacity-100' : 'opacity-0')} />
                        <div>
                          <p className="leading-tight">{p.nombre}</p>
                          {p.facultad && <p className="text-xs text-muted-foreground mt-0.5">{p.facultad.nombre}</p>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          {/* PASO 3: Facultad */}
          {mostrarSeleccionFacultad && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label htmlFor="prog-facultad">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  Facultad *
                </span>
              </Label>
              <Select
                onValueChange={handleFacultadChange}
                value={facultadId ? String(facultadId) : ''}
              >
                <SelectTrigger id="prog-facultad" className={cn(errors.facultad_id && 'border-destructive')}>
                  <SelectValue placeholder="Selecciona la facultad" />
                </SelectTrigger>
                <SelectContent>
                  {facultadesData?.data?.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      <span>{f.nombre}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('facultad_id', { required: mostrarSeleccionFacultad ? 'La facultad es requerida' : false })} />
              {errors.facultad_id && <p className="text-sm text-destructive">{errors.facultad_id.message}</p>}
            </div>
          )}

          {/* PASO FINAL: Periodo */}
          <div className="space-y-2">
            <Label htmlFor="prog-periodo">
              <span className="inline-flex items-center gap-1.5">
                <span className={cn(
                  'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                  periodoHabilitado ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400',
                )}>{mostrarSeleccionFacultad ? '4' : '3'}</span>
                Periodo *
                <span className="text-xs font-normal text-muted-foreground ml-1">(AAAA-I o AAAA-II)</span>
              </span>
            </Label>
            {nombreSeleccionado && facultadAutoNombre && (
              <p className="text-[11px] text-blue-600 font-medium mb-1">
                La facultad se asignará automáticamente: <strong>{facultadAutoNombre}</strong>
              </p>
            )}
            <Input
              id="prog-periodo"
              value={periodoInput}
              onChange={handlePeriodoChange}
              disabled={!periodoHabilitado}
              placeholder="Ej: 2025-I"
              className={cn(
                periodoYaExiste && 'border-red-400 bg-red-50',
                !periodoHabilitado && 'opacity-50',
                errors.periodo && 'border-destructive'
              )}
            />
            <input type="hidden" {...register('periodo', {
              required: 'El periodo es requerido',
              pattern: { value: /^\d{4}-(I|II)$/, message: 'Formato: AAAA-I o AAAA-II (Ej: 2015-II)' },
            })} />

            {periodoYaExiste && (
              <div className="flex items-start gap-1.5 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Este programa ya tiene registro para el periodo <strong>{periodoInput}</strong>.
                </span>
              </div>
            )}
            {errors.periodo && !periodoYaExiste && (
              <p className="text-sm text-destructive">{errors.periodo.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              type="submit"
              disabled={isLoading || periodoYaExiste || !periodoInput || !nombreSearch || (mostrarSeleccionFacultad && !facultadId)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Guardando...' : 'Crear Periodo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
