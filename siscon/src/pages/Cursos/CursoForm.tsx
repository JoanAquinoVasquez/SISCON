// src/pages/Cursos/CursoForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import type { Curso } from '../../services/cursoService';

interface CursoFormData {
  nombre: string;
  codigo: string;
  creditos?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  descripcion?: string;
}

interface CursoFormProps {
  curso?: Curso | null;
  open: boolean;
  semestreNombre: string;
  onClose: () => void;
  onSubmit: (data: CursoFormData) => void;
  isLoading?: boolean;
}

export function CursoForm({
  curso,
  open,
  semestreNombre,
  onClose,
  onSubmit,
  isLoading,
}: CursoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CursoFormData>({
    defaultValues: {
      nombre: curso?.nombre ?? '',
      codigo: curso?.codigo ?? '',
      creditos: curso?.creditos ?? undefined,
      horas_teoricas: curso?.horas_teoricas ?? undefined,
      horas_practicas: curso?.horas_practicas ?? undefined,
      descripcion: curso?.descripcion ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nombre: curso?.nombre ?? '',
        codigo: curso?.codigo ?? '',
        creditos: curso?.creditos ?? undefined,
        horas_teoricas: curso?.horas_teoricas ?? undefined,
        horas_practicas: curso?.horas_practicas ?? undefined,
        descripcion: curso?.descripcion ?? '',
      });
    }
  }, [open, curso, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (raw: CursoFormData) => {
    onSubmit({
      ...raw,
      creditos: raw.creditos ? Number(raw.creditos) : undefined,
      horas_teoricas: raw.horas_teoricas ? Number(raw.horas_teoricas) : undefined,
      horas_practicas: raw.horas_practicas ? Number(raw.horas_practicas) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{curso ? 'Editar Curso' : 'Registrar Curso'}</DialogTitle>
          <DialogDescription className="text-xs">
            Semestre: <span className="font-semibold">{semestreNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="curso-nombre">Nombre del curso *</Label>
            <Input
              id="curso-nombre"
              {...register('nombre', {
                required: 'El nombre es requerido',
                minLength: { value: 3, message: 'Al menos 3 caracteres' },
              })}
              placeholder="Ej: Tesis II"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="curso-codigo">Código *</Label>
            <Input
              id="curso-codigo"
              {...register('codigo', {
                required: 'El código es requerido',
                minLength: { value: 2, message: 'Al menos 2 caracteres' },
                pattern: { value: /^[A-Z0-9\-]+$/i, message: 'Solo letras, números y guiones' },
              })}
              placeholder="Ej: PI307"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.codigo && (
              <p className="text-sm text-destructive">{errors.codigo.message}</p>
            )}
          </div>

          {/* Créditos + Horas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="curso-creditos">Créditos</Label>
              <Input
                id="curso-creditos"
                type="number"
                min={0}
                {...register('creditos')}
                placeholder="4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curso-ht">Hrs. Teóricas</Label>
              <Input
                id="curso-ht"
                type="number"
                min={0}
                {...register('horas_teoricas')}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curso-hp">Hrs. Prácticas</Label>
              <Input
                id="curso-hp"
                type="number"
                min={0}
                {...register('horas_practicas')}
                placeholder="2"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="curso-descripcion">Descripción (opcional)</Label>
            <Input
              id="curso-descripcion"
              {...register('descripcion')}
              placeholder="Descripción del curso"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} id="btn-guardar-curso">
              {isLoading ? 'Guardando...' : curso ? 'Actualizar' : 'Registrar Curso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
