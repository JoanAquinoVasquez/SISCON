import React, { useState, useEffect } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import type { Coordinador } from '../../services/coordinadorService';
import { programaService, type Programa } from '../../services/programaService';

const coordinadorSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido_paterno: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  apellido_materno: z.string().min(2, 'El apellido materno debe tener al menos 2 caracteres'),
  titulo_profesional: z.string().optional(),
  genero: z.enum(['M', 'F']),
  dni: z.string().optional(),
  numero_telefono: z.string().optional(),
  tipo_coordinador: z.enum(['interno', 'externo']),
  programas: z.array(z.number()).optional(),
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
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [selectedProgramas, setSelectedProgramas] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CoordinadorFormData>({
    resolver: zodResolver(coordinadorSchema),
    defaultValues: {
      programas: [],
    }
  });

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const response = await programaService.getAll();
        setProgramas(response.data);
      } catch (error) {
        console.error('Error fetching programas:', error);
      }
    };
    fetchProgramas();
  }, []);

  useEffect(() => {
    if (open) {
      if (coordinador) {
        const programaIds = coordinador.programas?.map((p: any) => p.id) || [];
        setSelectedProgramas(programaIds);
        reset({
          nombres: coordinador.nombres,
          apellido_paterno: coordinador.apellido_paterno,
          apellido_materno: coordinador.apellido_materno,
          titulo_profesional: coordinador.titulo_profesional || '',
          genero: coordinador.genero,
          dni: coordinador.dni || '',
          numero_telefono: coordinador.numero_telefono || '',
          tipo_coordinador: coordinador.tipo_coordinador,
          programas: programaIds,
        });
      } else {
        setSelectedProgramas([]);
        reset({
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          titulo_profesional: '',
          genero: 'M',
          dni: '',
          numero_telefono: '',
          tipo_coordinador: 'interno',
          programas: [],
        });
      }
    }
  }, [coordinador, open, reset]);

  const handleClose = () => {
    reset();
    setSelectedProgramas([]);
    onClose();
  };

  const handleFormSubmit = (data: CoordinadorFormData) => {
    onSubmit({ ...data, programas: selectedProgramas });
    reset();
  };

  const togglePrograma = (programaId: number) => {
    setSelectedProgramas(prev => {
      const newSelection = prev.includes(programaId)
        ? prev.filter(id => id !== programaId)
        : [...prev, programaId];
      setValue('programas', newSelection);
      return newSelection;
    });
  };

  const generoValue = watch('genero');
  const tipoCoordinadorValue = watch('tipo_coordinador');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label>Programas Asignados</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedProgramas.length > 0
                    ? `${selectedProgramas.length} programa(s) seleccionado(s)`
                    : "Seleccionar programas"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-white">
                <DropdownMenuLabel>Programas Disponibles</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {programas.map((programa) => (
                  <div key={programa.id} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-100 cursor-pointer" onClick={(e) => {
                    e.preventDefault();
                    togglePrograma(programa.id);
                  }}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedProgramas.includes(programa.id)}
                      onChange={() => { }} // Handled by parent div click
                    />
                    <span className="text-sm">
                      {programa.grado?.nombre || 'Programa'} en {programa.nombre} ({programa.periodo})
                      {programa.descripcion ? ` (${programa.descripcion})` : ''}
                    </span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected Programs Tags */}
            {selectedProgramas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProgramas.map(id => {
                  const prog = programas.find(p => p.id === id);
                  if (!prog) return null;
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {prog.grado?.nombre || 'Programa'} en {prog.nombre} ({prog.periodo})
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => togglePrograma(id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
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
