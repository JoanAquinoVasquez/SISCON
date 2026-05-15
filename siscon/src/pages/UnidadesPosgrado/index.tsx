import { useState, useEffect } from 'react';
import { Plus, Search, Building2, User, Loader2, Edit2, Trash2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { FacultadForm } from './FacultadForm';
import { getFacultades, createFacultad, updateFacultad, deleteFacultad } from '../../services/facultadService';
import type { Facultad } from '../../services/facultadService';

export default function UnidadesPosgradoPage() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFacultad, setSelectedFacultad] = useState<Facultad | null>(null);

  const fetchFacultades = async (searchQuery?: string) => {
    try {
      setIsLoading(true);
      const data = await getFacultades(searchQuery);
      setFacultades(data.data);
    } catch (error: any) {
      toast.error('Error al cargar las unidades de posgrado');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFacultades(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleCreate = () => {
    setSelectedFacultad(null);
    setIsFormOpen(true);
  };

  const handleEdit = (facultad: Facultad) => {
    setSelectedFacultad(facultad);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta Unidad de Posgrado?')) {
      try {
        await deleteFacultad(id);
        toast.success('Unidad de Posgrado eliminada');
        fetchFacultades(search);
      } catch (error: any) {
        toast.error('Error al eliminar la unidad');
      }
    }
  };

  const handleSubmit = async (data: Partial<Facultad>) => {
    try {
      setIsSubmitting(true);
      if (selectedFacultad) {
        await updateFacultad(selectedFacultad.id, data);
        toast.success('Unidad de Posgrado actualizada');
      } else {
        await createFacultad(data);
        toast.success('Unidad de Posgrado creada');
      }
      setIsFormOpen(false);
      fetchFacultades(search);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(errors[key][0]);
        });
      } else {
        toast.error(selectedFacultad ? 'Error al actualizar' : 'Error al crear');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Unidades de Posgrado</h1>
          <p className="text-slate-500">Gestiona las facultades y sus directores</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Unidad
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Buscar por código, nombre o director..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
            <p>Cargando unidades de posgrado...</p>
          </div>
        ) : facultades.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Building2 className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No se encontraron unidades</p>
            <p className="text-sm">Intenta con otros términos de búsqueda o crea una nueva.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Código</th>
                  <th className="px-6 py-4 font-semibold">Unidad / Facultad</th>
                  <th className="px-6 py-4 font-semibold">Director</th>
                  <th className="px-6 py-4 font-semibold">Teléfono</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facultades.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-800">
                        {fac.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">{fac.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {fac.director_nombre ? (
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${fac.director_genero === 'F' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{fac.director_nombre}</p>
                            <p className="text-xs text-slate-500">
                              {fac.director_genero === 'F' ? 'Directora' : 'Director'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {fac.director_telefono ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{fac.director_telefono}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fac)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                          title="Editar Unidad"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(fac.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          title="Eliminar Unidad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <FacultadForm
          facultad={selectedFacultad}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
