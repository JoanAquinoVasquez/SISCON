import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, FileText, Loader2 } from 'lucide-react';

interface Expediente {
  id: number;
  numero_expediente_mesa_partes: string | null;
  numero_documento: string;
  fecha_recepcion_contabilidad: string;
  remitente: string;
  tipo_asunto: 'descripcion' | 'presentacion' | 'conformidad' | 'resolucion';
  docente_nombre: string | null;
  docente_titulo_profesional: string | null;
  curso_nombre: string | null;
  periodo: string | null;
  estado_pago: string | null;
  pago_docente_id: number | null;
  fecha_mesa_partes: string;
  programa_nombre: string | null;
  grado_nombre: string | null;
}

export default function ExpedientesList() {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoAsunto, setTipoAsunto] = useState('');
  const [estadoPago, setEstadoPago] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExpedientes();
  }, [search, tipoAsunto, estadoPago, currentPage]);

  const fetchExpedientes = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage };
      if (search) params.search = search;
      if (tipoAsunto) params.tipo_asunto = tipoAsunto;
      if (estadoPago) params.estado_pago = estadoPago;

      const response = await axios.get('/expedientes', { params });

      setExpedientes(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error al cargar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este expediente?')) return;

    try {
      await axios.delete(`/expedientes/${id}`);
      fetchExpedientes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el expediente');
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
     if (!dateString) return '';
        return dateString.split('T')[0].split(' ')[0];
  };

  const getTipoAsuntoBadge = (tipo: string) => {
    const variants: Record<string, any> = {
      descripcion: { variant: 'secondary', label: 'Descripción' },
      presentacion: { variant: 'default', label: 'Presentación' },
      conformidad: { variant: 'warning', label: 'Conformidad' },
      resolucion: { variant: 'success', label: 'Resolución' },
    };
    const config = variants[tipo] || variants.descripcion;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEstadoPagoBadge = (estado: string | null) => {
    if (!estado) return <span className="text-gray-400">-</span>;

    const variants: Record<string, any> = {
      pendiente: { variant: 'secondary', label: 'Pendiente' },
      en_proceso: { variant: 'warning', label: 'En Proceso' },
      completado: { variant: 'success', label: 'Completado' },
    };
    const config = variants[estado] || variants.pendiente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-1">Gestión de documentos recibidos en contabilidad</p>
        </div>
        <Button onClick={() => navigate('/expedientes/nuevo')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Expediente
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por N° documento, N° expediente, remitente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={tipoAsunto}
            onChange={(e) => setTipoAsunto(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="descripcion">Descripción</option>
            <option value="presentacion">Presentación</option>
            <option value="conformidad">Conformidad</option>
            <option value="resolucion">Resolución</option>
          </select>
          <select
            value={estadoPago}
            onChange={(e) => setEstadoPago(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Expediente MP</TableHead>
                <TableHead>Documento Recibido</TableHead>
                <TableHead>Tipo Asunto</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Estado Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Cargando datos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : expedientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No se encontraron expedientes
                  </TableCell>
                </TableRow>
              ) : (
                expedientes.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">N° {exp.numero_expediente_mesa_partes}</div>
                      <div className="text-xs text-muted-foreground">Recib. el {formatDate(exp.fecha_mesa_partes)}</div></TableCell>
                    <TableCell className="font-medium">
                      {exp.numero_documento}
                      <div className="text-xs text-muted-foreground">{exp.remitente}</div>
                    </TableCell>
                    <TableCell>{getTipoAsuntoBadge(exp.tipo_asunto)}</TableCell>
                    <TableCell>
                      {exp.docente_nombre ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {exp.docente_titulo_profesional ? `${exp.docente_titulo_profesional} ` : ''}{exp.docente_nombre}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {exp.curso_nombre}
                      <div className="text-xs text-muted-foreground">{exp.grado_nombre} en {exp.programa_nombre} {exp.periodo}</div>
                    </TableCell>
                    <TableCell>{getEstadoPagoBadge(exp.estado_pago)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {exp.pago_docente_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/pagos-docentes/${exp.pago_docente_id}/editar`)}
                            title="Ver pago vinculado"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/expedientes/${exp.id}/editar`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exp.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
