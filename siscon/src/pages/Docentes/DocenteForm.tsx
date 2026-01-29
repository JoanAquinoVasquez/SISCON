// src/pages/Docentes/DocenteForm.tsx
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
import type { Docente } from '../../services/docenteService';

const docenteSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido_paterno: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  apellido_materno: z.string().min(2, 'El apellido materno debe tener al menos 2 caracteres'),
  titulo_profesional: z.string().optional(),
  genero: z.enum(['M', 'F']),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos').or(z.literal('')),
  numero_telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional(),
  tipo_docente: z.enum(['interno', 'externo', 'interno_enfermeria', 'externo_enfermeria']),
});

type DocenteFormData = z.infer<typeof docenteSchema>;

interface DocenteFormProps {
  docente?: Docente | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DocenteFormData) => void;
  isLoading?: boolean;
}

export function DocenteForm({ docente, open, onClose, onSubmit, isLoading }: DocenteFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DocenteFormData>({
    resolver: zodResolver(docenteSchema),
  });

  React.useEffect(() => {
    if (open) {
      if (docente) {
        reset({
          nombres: docente.nombres,
          apellido_paterno: docente.apellido_paterno,
          apellido_materno: docente.apellido_materno,
          titulo_profesional: docente.titulo_profesional || '',
          genero: docente.genero,
          dni: docente.dni || '',
          numero_telefono: docente.numero_telefono || '',
          email: docente.email || '',
          fecha_nacimiento: docente.fecha_nacimiento || '',
          tipo_docente: docente.tipo_docente,
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
          email: '',
          fecha_nacimiento: '',
          tipo_docente: 'interno',
        });
      }
    }
  }, [docente, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: DocenteFormData) => {
    onSubmit(data);
    reset();
  };

  const generoValue = watch('genero');
  const tipoDocenteValue = watch('tipo_docente');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{docente ? 'Editar Docente' : 'Nuevo Docente'}</DialogTitle>
          <DialogDescription>
            {docente
              ? 'Modifica los datos del docente'
              : 'Completa el formulario para registrar un nuevo docente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo_profesional">Título Profesional</Label>
              <Input
                id="titulo_profesional"
                {...register('titulo_profesional')}
                placeholder="Mg., Dr., Ing., etc."
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
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register('fecha_nacimiento')}
              />
              {errors.fecha_nacimiento && (
                <p className="text-sm text-destructive">{errors.fecha_nacimiento.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
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
                  <SelectItem value="M"><span>Masculino</span></SelectItem>
                  <SelectItem value="F"><span>Femenino</span></SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && (
                <p className="text-sm text-destructive">{errors.genero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_docente">Tipo de Docente *</Label>
              <Select
                value={tipoDocenteValue}
                onValueChange={(value) => setValue('tipo_docente', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno"><span>Interno</span></SelectItem>
                  <SelectItem value="externo"><span>Externo</span></SelectItem>
                  <SelectItem value="interno_enfermeria"><span>Interno Enfermería</span></SelectItem>
                  <SelectItem value="externo_enfermeria"><span>Externo Enfermería</span></SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_docente && (
                <p className="text-sm text-destructive">{errors.tipo_docente.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : docente ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
