// src/pages/Cursos/SemestreForm.tsx
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
import type { Semestre } from '../../services/semestreService';

interface SemestreFormData {
  numero_semestre: number;
  nombre: string;
  descripcion?: string;
}

interface SemestreFormProps {
  semestre?: Semestre | null;
  open: boolean;
  programaNombre: string;
  onClose: () => void;
  onSubmit: (data: SemestreFormData) => void;
  isLoading?: boolean;
}

export function SemestreForm({
  semestre,
  open,
  programaNombre,
  onClose,
  onSubmit,
  isLoading,
}: SemestreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SemestreFormData>({
    defaultValues: {
      numero_semestre: semestre?.numero_semestre ?? 1,
      nombre: semestre?.nombre ?? '',
      descripcion: semestre?.descripcion ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        numero_semestre: semestre?.numero_semestre ?? 1,
        nombre: semestre?.nombre ?? '',
        descripcion: semestre?.descripcion ?? '',
      });
    }
  }, [open, semestre, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (raw: SemestreFormData) => {
    onSubmit({ ...raw, numero_semestre: Number(raw.numero_semestre) });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{semestre ? 'Editar Semestre' : 'Nuevo Semestre'}</DialogTitle>
          <DialogDescription className="text-xs truncate">
            Programa: <span className="font-semibold">{programaNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_semestre">N.º de Semestre *</Label>
              <Input
                id="numero_semestre"
                type="number"
                min={1}
                max={12}
                {...register('numero_semestre', {
                  required: 'Campo requerido',
                  min: { value: 1, message: 'Mínimo semestre 1' },
                  max: { value: 12, message: 'Máximo semestre 12' },
                })}
                placeholder="1"
              />
              {errors.numero_semestre && (
                <p className="text-sm text-destructive">{errors.numero_semestre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sem-nombre">Nombre *</Label>
              <Input
                id="sem-nombre"
                {...register('nombre', { required: 'El nombre es requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                placeholder="Semestre I"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sem-descripcion">Descripción (opcional)</Label>
            <Input
              id="sem-descripcion"
              {...register('descripcion')}
              placeholder="Descripción del semestre"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : semestre ? 'Actualizar' : 'Crear Semestre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
