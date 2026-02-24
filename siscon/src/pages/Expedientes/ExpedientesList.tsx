import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Plus, Search,
  Loader2,
  MoreVertical,
  Upload,
  FileIcon,
  X,
  CheckCircle,
  Eye,
  Trash2,
  Pencil
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';

interface Expediente {
  id: number;
  numero_expediente_mesa_partes: string | null;
  numero_documento: string;
  fecha_recepcion_contabilidad: string;
  remitente: string;
  tipo_asunto: 'descripcion' | 'presentacion' | 'conformidad' | 'devolucion';
  docente_nombre: string | null;
  docente_titulo_profesional: string | null;
  curso_nombre: string | null;
  periodo: string | null;
  estado: string;
  documento_respuesta_url?: string | null;
  estado_pago: string | null;
  pago_docente_id: number | null;
  devolucion_id?: number | null;
  fecha_mesa_partes: string;
  programa_nombre: string | null;
  grado_nombre: string | null;
  descripcion_asunto: string | null;
  persona_devolucion: string | null;
  tipo_devolucion: string | null;
  importe_devolucion: number | string | null;
  numero_voucher: string | null;
  numero_oficio_direccion?: string | null;
}

export default function ExpedientesList() {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoAsunto, setTipoAsunto] = useState('');
  const [estado, setEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchId, setFetchId] = useState(0);

  // Detail Modal
  const [selectedExpediente, setSelectedExpediente] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Cambio Estado Modal
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [estadoForm, setEstadoForm] = useState({
    id: 0,
    estado: 'pendiente',
    file: null as File | null
  });

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    let active = true;

    const fetchExpedientes = async () => {
      try {
        setLoading(true);
        const params: any = { page: currentPage };
        if (debouncedSearch) params.search = debouncedSearch;
        if (tipoAsunto) params.tipo_asunto = tipoAsunto;
        if (estado) params.estado = estado;

        const response = await axios.get('/expedientes', { params });

        if (active) {
          setExpedientes(response.data.data);
          setTotalPages(response.data.last_page);
        }
      } catch (error) {
        console.error('Error al cargar expedientes:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchExpedientes();

    return () => {
      active = false;
    };
  }, [debouncedSearch, tipoAsunto, estado, currentPage, fetchId]);

  const refreshExpedientes = () => {
    setFetchId(prev => prev + 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este expediente?')) return;

    try {
      await axios.delete(`/expedientes/${id}`);
      refreshExpedientes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el expediente');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      setIsDetailOpen(true);
      const response = await axios.get(`/expedientes/${id}`);
      setSelectedExpediente(response.data.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      toast.error('Error al cargar los detalles del expediente');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0].split(' ')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
  };

  const getTipoAsuntoBadge = (tipo: string) => {
    const variants: Record<string, any> = {
      descripcion: { variant: 'secondary', label: 'Descripción' },
      presentacion: { variant: 'default', label: 'Presentación' },
      conformidad: { variant: 'tertiary', label: 'Conformidad' },
      devolucion: { variant: 'destructive', label: 'Devolución' },
    };
    const config = variants[tipo] || variants.descripcion;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTipoDevolucion = (tipo: string | null) => {
    switch (tipo) {
      case 'inscripcion': return 'Derecho de Inscripción';
      case 'idiomas': return 'Idiomas';
      case 'grados_titulos': return 'Grados y Títulos';
      case 'certificado_estudios': return 'Certificado de Estudios';
      case 'otros': return 'Otros';
      default: return tipo;
    }
  };

  const handleOpenEstado = (exp: Expediente) => {
    setEstadoForm({
      id: exp.id,
      estado: exp.estado || 'pendiente',
      file: null
    });
    setIsEstadoOpen(true);
  };

  const handleSaveEstado = async () => {
    try {
      setLoadingEstado(true);

      const formData = new FormData();
      formData.append('estado', estadoForm.estado);
      if (estadoForm.file) {
        formData.append('file', estadoForm.file);
      }

      await axios.post(`/expedientes/${estadoForm.id}/estado`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Estado actualizado exitosamente');
      setIsEstadoOpen(false);
      refreshExpedientes();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el estado');
    } finally {
      setLoadingEstado(false);
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    const currentState = estado || 'pendiente';

    const variants: Record<string, any> = {
      pendiente: { variant: 'warning', label: 'Pendiente' },
      en_proceso: { variant: 'secondary', label: 'En Proceso' },
      completado: { variant: 'success', label: 'Completado' },
      rechazado: { variant: 'destructive', label: 'Rechazado' },
    };
    const config = variants[currentState] || variants.pendiente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-1">Gestión de documentos recibidos en contabilidad</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => navigate('/expedientes/nuevo')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Expediente
          </Button>
        </div>
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={tipoAsunto}
            onChange={(e) => { setTipoAsunto(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="descripcion">Descripción</option>
            <option value="presentacion">Presentación</option>
            <option value="conformidad">Conformidad</option>
            <option value="devolucion">Devolución</option>
          </select>
          <select
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="rechazado">Rechazado</option>
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
                <TableHead>Docente / Solicitante</TableHead>
                <TableHead>Curso / Detalle</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Cargando expedientes...</span>
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
                  <TableRow
                    key={exp.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.action-buttons')) return;

                      if (exp.tipo_asunto === 'descripcion') {
                        handleViewDetail(exp.id);
                      } else if (exp.tipo_asunto === 'presentacion' || exp.tipo_asunto === 'conformidad') {
                        const searchQuery = exp.pago_docente_id ? '' : (exp.numero_documento || exp.docente_nombre || '');
                        const highlightParam = exp.pago_docente_id ? `&highlight_id=${exp.pago_docente_id}` : '';
                        navigate(`/pagos-docentes?search=${encodeURIComponent(searchQuery)}${highlightParam}`);
                      } else if (exp.tipo_asunto === 'devolucion') {
                        const searchQuery = exp.devolucion_id ? '' : (exp.numero_voucher || exp.numero_documento || exp.persona_devolucion || '');
                        const highlightParam = exp.devolucion_id ? `&highlight_id=${exp.devolucion_id}` : '';
                        navigate(`/devoluciones?search=${encodeURIComponent(searchQuery)}${highlightParam}`);
                      }
                    }}
                  >
                    <TableCell>{exp.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">N° {exp.numero_expediente_mesa_partes}</div>
                      <div className="text-xs text-muted-foreground">Recib. el {formatDate(exp.fecha_mesa_partes)}</div></TableCell>
                    <TableCell className="font-medium">
                      {exp.numero_documento}
                      <div className="text-xs text-muted-foreground">{exp.remitente}</div>
                    </TableCell>
                    <TableCell>{getTipoAsuntoBadge(exp.tipo_asunto)}</TableCell>
                    {exp.tipo_asunto === 'descripcion' ? (
                      <TableCell colSpan={2}>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.descripcion_asunto || <span className="text-gray-400 italic">Sin descripción</span>}
                        </div>
                      </TableCell>
                    ) : exp.tipo_asunto === 'devolucion' ? (
                      <>
                        <TableCell>
                          {exp.persona_devolucion ? (
                            <div className="text-sm">
                              <div className="font-medium">{exp.persona_devolucion}</div>
                              {exp.tipo_devolucion && (
                                <div className="text-xs text-muted-foreground mt-0.5">{formatTipoDevolucion(exp.tipo_devolucion)}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {exp.importe_devolucion ? (
                            <div className="text-sm">
                              <div className="font-medium">S/ {Number(exp.importe_devolucion).toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                                {exp.numero_voucher ? `V: ${exp.numero_voucher}` : ''}
                                {exp.numero_oficio_direccion ? ` | O: ${exp.numero_oficio_direccion}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <>
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
                          {exp.curso_nombre ? (
                            <>
                              <div>{exp.curso_nombre}</div>
                              <div className="text-xs text-muted-foreground">{exp.grado_nombre ? exp.grado_nombre : ''} {exp.grado_nombre ? 'en' : '-'} {exp.programa_nombre ? exp.programa_nombre : ''} {exp.periodo ? exp.periodo : ''}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      {getEstadoBadge(exp.estado)}
                    </TableCell>
                    <TableCell className="text-right action-buttons">
                      {/* Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEstado(exp); }}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Cambiar estado</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetail(exp.id); }}>
                            <Eye className="mr-2 h-4 w-4" /> Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/expedientes/${exp.id}/editar`); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Modal de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Expediente</DialogTitle>
            <DialogDescription>
              Información completa del expediente {selectedExpediente?.numero_expediente_mesa_partes ? `N° ${selectedExpediente.numero_expediente_mesa_partes}` : ''}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground animate-pulse">Cargando detalles...</span>
              </div>
            </div>
          ) : selectedExpediente ? (
            <div className="space-y-6">
              {/* Data General */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Doc. Recibido</h3>
                  <p>{selectedExpediente.numero_documento}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Tipo Asunto</h3>
                  {getTipoAsuntoBadge(selectedExpediente.tipo_asunto)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Remitente</h3>
                  <p>{selectedExpediente.remitente}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Recep. Contabilidad</h3>
                  <p>{formatDate(selectedExpediente.fecha_recepcion_contabilidad) || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Estado</h3>
                  <div className="mb-1">{getEstadoBadge(selectedExpediente.estado)}</div>
                  {selectedExpediente.documento_respuesta_url && (
                    <a
                      href={selectedExpediente.documento_respuesta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver doc. respuesta
                    </a>
                  )}
                </div>
              </div>

              {selectedExpediente.tipo_asunto === 'devolucion' ? (
                <>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Persona</h3>
                      <p>{selectedExpediente.devolucion?.persona || selectedExpediente.persona_devolucion}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Programa</h3>
                      <p>
                        {selectedExpediente.devolucion?.programa ?
                          `${selectedExpediente.devolucion.programa.grado?.nombre || ''} en ${selectedExpediente.devolucion.programa.nombre}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Tipo de Devolución</h3>
                      <p>{formatTipoDevolucion(selectedExpediente.devolucion?.tipo_devolucion || selectedExpediente.tipo_devolucion)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Importe</h3>
                      <p className="font-bold">S/ {Number(selectedExpediente.devolucion?.importe || selectedExpediente.importe_devolucion).toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Voucher / Oficio</h3>
                      <p>{selectedExpediente.devolucion?.numero_voucher || selectedExpediente.numero_voucher || '-'}</p>
                      {selectedExpediente.devolucion?.numero_oficio_direccion && (
                        <p className="text-xs text-muted-foreground mt-1">Oficio: {selectedExpediente.devolucion.numero_oficio_direccion}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : selectedExpediente.tipo_asunto === 'descripcion' ? (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Descripción del Asunto</h3>
                  <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap">
                    {selectedExpediente.descripcion_asunto || <span className="text-muted-foreground italic">Sin descripción</span>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Docente</h3>
                      <p>
                        {selectedExpediente.docente?.titulo_profesional ? `${selectedExpediente.docente.titulo_profesional} ` : ''}
                        {selectedExpediente.docente?.nombres} {selectedExpediente.docente?.apellido_paterno} {selectedExpediente.docente?.apellido_materno}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Programa</h3>
                      <p>
                        {selectedExpediente.semestre?.programa ?
                          `${selectedExpediente.semestre.programa.grado?.nombre || ''} en ${selectedExpediente.semestre.programa.nombre} (${selectedExpediente.semestre.programa.periodo})`
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Curso</h3>
                      <p>{selectedExpediente.curso?.nombre}</p>
                      <p className="text-xs text-muted-foreground">Código: {selectedExpediente.curso?.codigo}</p>
                    </div>
                    {selectedExpediente.pagoDocente && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">Total de Pago</h3>
                        <p className="font-bold text-lg">S/ {selectedExpediente.pagoDocente.importe_total}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se pudo cargar la información
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cambio de Estado */}
      <Dialog open={isEstadoOpen} onOpenChange={setIsEstadoOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Expediente</DialogTitle>
            <DialogDescription className="text-sm">
              Seleccione el nuevo estado para este expediente. Al marcarlo como <strong>Completado</strong>, deberá adjuntar el documento de respuesta final.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                Nuevo Estado
              </label>
              <select
                id="estado"
                value={estadoForm.estado}
                onChange={(e) => setEstadoForm({ ...estadoForm, estado: e.target.value })}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            {estadoForm.estado === 'completado' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Documento de Respuesta
                </label>

                {!estadoForm.file ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files?.[0];
                      if (file) setEstadoForm({ ...estadoForm, file });
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Haz clic o arrastra un archivo</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX o Imágenes (máx. 10MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setEstadoForm({ ...estadoForm, file: e.target.files?.[0] || null })}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">{estadoForm.file.name}</p>
                      <p className="text-xs text-blue-600">{(estadoForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEstadoForm({ ...estadoForm, file: null })}
                      className="text-blue-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p className="text-[11px] text-gray-500 flex items-start gap-1.5 px-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                  El archivo se subirá automáticamente a Google Drive y se vinculará al expediente.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsEstadoOpen(false); setEstadoForm({ ...estadoForm, file: null }); }}
              disabled={loadingEstado}
              className="px-6 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEstado}
              disabled={loadingEstado || (estadoForm.estado === 'completado' && !estadoForm.file)}
              className="px-6 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
            >
              {loadingEstado ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Actualizar Estado
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
