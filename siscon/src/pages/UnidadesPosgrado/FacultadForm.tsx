import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, X, Hash, User, UserCheck, Phone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { Facultad } from '../../services/facultadService';

const schema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  director_nombre: z.string().nullable().optional(),
  director_genero: z.enum(['M', 'F']).nullable().optional(),
  director_telefono: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface FacultadFormProps {
  facultad?: Facultad | null;
  onSubmit: (data: Partial<Facultad>) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function FacultadForm({ facultad, onSubmit, onClose, isLoading }: FacultadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: facultad?.codigo || '',
      nombre: facultad?.nombre || '',
      director_nombre: facultad?.director_nombre || '',
      director_genero: facultad?.director_genero || null,
      director_telefono: facultad?.director_telefono || '',
    },
  });

  const onSubmitForm = (data: FormData) => {
    // Convert empty strings to null for optional fields
    const formattedData = {
      ...data,
      director_nombre: data.director_nombre || null,
      director_genero: data.director_genero || null,
      director_telefono: data.director_telefono || null,
    };
    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {facultad ? 'Editar Unidad de Posgrado' : 'Nueva Unidad de Posgrado'}
              </h2>
              <p className="text-sm text-slate-500">
                {facultad ? 'Modifica los datos y el director' : 'Agrega una nueva unidad y su director'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="facultad-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-slate-700">Código</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="codigo"
                    {...register('codigo')}
                    className="pl-10"
                    placeholder="Ej. FCCFF"
                  />
                </div>
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-slate-700">Nombre de la Unidad de Posgrado / Facultad</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="nombre"
                    {...register('nombre')}
                    className="pl-10"
                    placeholder="Ej. Facultad de Ciencias Físicas"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                Información del Director
              </h3>

              <div className="space-y-2">
                <Label htmlFor="director_nombre" className="text-slate-700">Nombre del Director (Opcional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="director_nombre"
                    {...register('director_nombre')}
                    className="pl-10"
                    placeholder="Ej. Dr. Juan Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="director_telefono" className="text-slate-700">Teléfono del Director (Opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="director_telefono"
                    {...register('director_telefono')}
                    className="pl-10"
                    placeholder="Ej. 987654321"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="director_genero" className="text-slate-700">Género (Opcional)</Label>
                <div className="flex gap-4 p-1">
                  <label className="flex flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="M"
                      {...register('director_genero')}
                      className="peer sr-only"
                    />
                    <div className="w-full text-center px-4 py-2 border border-slate-200 rounded-lg peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 hover:bg-slate-50 transition-colors">
                      Masculino
                    </div>
                  </label>
                  <label className="flex flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="F"
                      {...register('director_genero')}
                      className="peer sr-only"
                    />
                    <div className="w-full text-center px-4 py-2 border border-slate-200 rounded-lg peer-checked:bg-purple-50 peer-checked:border-purple-500 peer-checked:text-purple-700 hover:bg-slate-50 transition-colors">
                      Femenino
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="facultad-form"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : facultad ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </div>
    </div>
  );
}
