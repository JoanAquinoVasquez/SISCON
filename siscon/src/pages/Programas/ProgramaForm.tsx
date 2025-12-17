// src/pages/Programas/ProgramaForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import type { Programa } from '../../services/programaService';

const programaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
});

type ProgramaFormData = z.infer<typeof programaSchema>;

interface ProgramaFormProps {
  programa?: Programa | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProgramaFormData) => void;
  isLoading?: boolean;
}

export function ProgramaForm({ programa, open, onClose, onSubmit, isLoading }: ProgramaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgramaFormData>({
    resolver: zodResolver(programaSchema),
    defaultValues: programa
      ? {
          nombre: programa.nombre,
          descripcion: programa.descripcion || '',
        }
      : {
          nombre: '',
          descripcion: '',
        },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: ProgramaFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{programa ? 'Editar Programa' : 'Nuevo Programa'}</DialogTitle>
          <DialogDescription>
            {programa
              ? 'Modifica los datos del programa'
              : 'Completa el formulario para crear un nuevo programa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ingeniería de Sistemas"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Input
              id="descripcion"
              {...register('descripcion')}
              placeholder="Descripción del programa"
            />
            {errors.descripcion && (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : programa ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
