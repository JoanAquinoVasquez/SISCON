// src/pages/Coordinadores/CoordinadorForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import type { Coordinador } from '../../services/coordinadorService';

const coordinadorSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido_paterno: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  apellido_materno: z.string().min(2, 'El apellido materno debe tener al menos 2 caracteres'),
  titulo_profesional: z.string().optional(),
  genero: z.enum(['M', 'F']),
  dni: z.string().optional(),
  numero_telefono: z.string().optional(),
  tipo_coordinador: z.enum(['interno', 'externo']),
});

type CoordinadorFormData = z.infer<typeof coordinadorSchema>;

interface CoordinadorFormProps {
  coordinador?: Coordinador | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CoordinadorFormData) => void;
  isLoading?: boolean;
}

export function CoordinadorForm({ coordinador, open, onClose, onSubmit, isLoading }: CoordinadorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CoordinadorFormData>({
    resolver: zodResolver(coordinadorSchema),
  });

  React.useEffect(() => {
    if (open) {
      if (coordinador) {
        reset({
          nombres: coordinador.nombres,
          apellido_paterno: coordinador.apellido_paterno,
          apellido_materno: coordinador.apellido_materno,
          titulo_profesional: coordinador.titulo_profesional || '',
          genero: coordinador.genero,
          dni: coordinador.dni || '',
          numero_telefono: coordinador.numero_telefono || '',
          tipo_coordinador: coordinador.tipo_coordinador,
        });
      } else {
        reset({
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          titulo_profesional: '',
          genero: 'M',
          dni: '',
          numero_telefono: '',
          tipo_coordinador: 'interno',
        });
      }
    }
  }, [coordinador, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: CoordinadorFormData) => {
    onSubmit(data);
    reset();
  };

  const generoValue = watch('genero');
  const tipoCoordinadorValue = watch('tipo_coordinador');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{coordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}</DialogTitle>
          <DialogDescription>
            {coordinador
              ? 'Modifica los datos del coordinador'
              : 'Completa el formulario para registrar un nuevo coordinador'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo_profesional">Título Profesional</Label>
              <Input
                id="titulo_profesional"
                {...register('titulo_profesional')}
                placeholder="Dr., Mg., Dra., etc."
              />
              {errors.titulo_profesional && (
                <p className="text-sm text-destructive">{errors.titulo_profesional.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                {...register('nombres')}
                placeholder="Juan Carlos"
              />
              {errors.nombres && (
                <p className="text-sm text-destructive">{errors.nombres.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
              <Input
                id="apellido_paterno"
                {...register('apellido_paterno')}
                placeholder="Pérez"
              />
              {errors.apellido_paterno && (
                <p className="text-sm text-destructive">{errors.apellido_paterno.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido_materno">Apellido Materno *</Label>
              <Input
                id="apellido_materno"
                {...register('apellido_materno')}
                placeholder="García"
              />
              {errors.apellido_materno && (
                <p className="text-sm text-destructive">{errors.apellido_materno.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                {...register('dni')}
                placeholder="12345678"
                maxLength={8}
              />
              {errors.dni && (
                <p className="text-sm text-destructive">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_telefono">Teléfono</Label>
              <Input
                id="numero_telefono"
                {...register('numero_telefono')}
                placeholder="987654321"
              />
              {errors.numero_telefono && (
                <p className="text-sm text-destructive">{errors.numero_telefono.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genero">Género *</Label>
              <Select
                value={generoValue}
                onValueChange={(value) => setValue('genero', value as 'M' | 'F')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && (
                <p className="text-sm text-destructive">{errors.genero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_coordinador">Tipo de Coordinador *</Label>
              <Select
                value={tipoCoordinadorValue}
                onValueChange={(value) => setValue('tipo_coordinador', value as 'interno' | 'externo')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Interno</SelectItem>
                  <SelectItem value="externo">Externo</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_coordinador && (
                <p className="text-sm text-destructive">{errors.tipo_coordinador.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : coordinador ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
