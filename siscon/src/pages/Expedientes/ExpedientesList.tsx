import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
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
  Pencil,
  Download
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
  motivo_sin_efecto?: string | null;
  documento_respuesta_url?: string | null;
  documento_respuesta_nombre?: string | null;
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
  const [perPage, setPerPage] = useState(15);
  const [pagination, setPagination] = useState<{ total?: number; from?: number; to?: number; } | null>(null);
  const [fetchId, setFetchId] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
    file: null as File | null,
    motivo_sin_efecto: ''
  });

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    let active = true;

    const fetchExpedientes = async () => {
      try {
        setLoading(true);
        const params: any = { page: currentPage, per_page: perPage };
        if (debouncedSearch) params.search = debouncedSearch;
        if (tipoAsunto) params.tipo_asunto = tipoAsunto;
        if (estado) params.estado = estado;

        const response = await axios.get('/expedientes', { params });

        if (active) {
          setExpedientes(response.data.data);
          setTotalPages(response.data.last_page);
          setPagination({
            total: response.data.total,
            from: response.data.from,
            to: response.data.to
          });
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
  }, [debouncedSearch, tipoAsunto, estado, currentPage, perPage, fetchId]);

  const refreshExpedientes = () => {
    setFetchId(prev => prev + 1);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (tipoAsunto) params.tipo_asunto = tipoAsunto;
      if (estado) params.estado = estado;

      const response = await axios.get('/expedientes/exportar-excel', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Expedientes_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
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
      file: null,
      motivo_sin_efecto: exp.motivo_sin_efecto || ''
    });
    setIsEstadoOpen(true);
  };

  const handleSaveEstado = async () => {
    try {
      setLoadingEstado(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('estado', estadoForm.estado);
      if (estadoForm.file) {
        formData.append('file', estadoForm.file);
      }
      if (estadoForm.estado === 'sin_efecto') {
        formData.append('motivo_sin_efecto', estadoForm.motivo_sin_efecto);
      }

      const response = await axios.post(`/expedientes/${estadoForm.id}/estado`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      // Close modal immediately
      setIsEstadoOpen(false);
      setEstadoForm({ ...estadoForm, file: null });
      refreshExpedientes();

      // If a background upload was started, poll for its status
      const uploadUuid = response.data?.upload_uuid;
      if (uploadUuid) {
        toast.success('Estado actualizado. Subiendo archivo a Google Drive...', { duration: 3000 });
        pollUploadStatus(uploadUuid);
      } else {
        toast.success('Estado actualizado exitosamente');
      }

    } catch (error: any) {
      console.error(error);
      const serverMsg = error?.response?.data?.message;
      if (serverMsg) {
        toast.error(`⚠️ ${serverMsg}`, { duration: 8000 });
      } else {
        toast.error('Error al actualizar el estado.');
      }
    } finally {
      setLoadingEstado(false);
      setUploadProgress(null);
    }
  };

  /**
   * Poll the backend for upload status until completed or failed.
   */
  const pollUploadStatus = (uuid: string) => {
    const toastId = toast.loading('Subiendo archivo a Google Drive en segundo plano...', { duration: Infinity });

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/file-uploads/${uuid}/status`);
        const { status, error_message } = res.data;

        if (status === 'completed') {
          clearInterval(interval);
          toast.success('Archivo subido a Google Drive exitosamente', { id: toastId, duration: 5000 });
          refreshExpedientes();
        } else if (status === 'failed') {
          clearInterval(interval);
          toast.error(`Error al subir archivo: ${error_message || 'Error desconocido'}`, { id: toastId, duration: 8000 });
        }
        // If still pending/processing, keep polling
      } catch {
        // If polling fails, don't kill the interval - might be a transient network error
      }
    }, 3000);

    // Safety: stop polling after 10 minutes max
    setTimeout(() => {
      clearInterval(interval);
    }, 600000);
  };

  const getEstadoBadge = (estado: string | null) => {
    const currentState = estado || 'pendiente';

    const variants: Record<string, any> = {
      pendiente: { variant: 'warning', label: 'Pendiente' },
      en_proceso: { variant: 'secondary', label: 'En Proceso' },
      completado: { variant: 'success', label: 'Completado' },
      rechazado: { variant: 'destructive', label: 'Rechazado' },
      sin_efecto: { variant: 'outline', label: 'Sin Efecto' },
      para_conocimiento: { variant: 'default', label: 'Para Conocimiento' },
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
          <Button variant="outline" onClick={handleExportExcel} disabled={isExporting} size="lg">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Exportar Excel
          </Button>
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
            <option value="sin_efecto">Sin Efecto</option>
            <option value="para_conocimiento">Para Conocimiento</option>
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
                      {exp.estado === 'sin_efecto' && exp.motivo_sin_efecto && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] truncate" title={exp.motivo_sin_efecto}>
                          {exp.motivo_sin_efecto}
                        </div>
                      )}
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
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              lastPage={totalPages}
              total={pagination?.total}
              from={pagination?.from}
              to={pagination?.to}
              onPageChange={setCurrentPage}
              perPage={perPage}
              onPerPageChange={(newPerPage) => {
                setPerPage(newPerPage);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </Card>

      {/* Modal de Detalle */}
      {/* Modal de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Expediente {selectedExpediente?.numero_expediente_mesa_partes ? `N° ${selectedExpediente.numero_expediente_mesa_partes}` : `#${selectedExpediente?.id || ''}`}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Información
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedExpediente?.tipo_asunto && getTipoAsuntoBadge(selectedExpediente.tipo_asunto)}
                {selectedExpediente?.estado && getEstadoBadge(selectedExpediente.estado)}
              </div>
            </div>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
                <span className="text-muted-foreground font-medium animate-pulse">Cargando detalles completos...</span>
              </div>
            </div>
          ) : selectedExpediente ? (
            <div className="space-y-6 pt-2">
              {/* Sección 1: Información del Documento Recibido */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FileIcon className="w-4 h-4 text-blue-600" />
                  Información del Documento y Recepción
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Doc. Recibido</span>
                    <span className="text-sm font-semibold text-gray-900 break-words">{selectedExpediente.numero_documento || '-'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Remitente</span>
                    <span className="text-sm font-semibold text-gray-900 break-words">{selectedExpediente.remitente || '-'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Fecha Mesa de Partes</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedExpediente.fecha_mesa_partes) || '-'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Recepción Contabilidad</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedExpediente.fecha_recepcion_contabilidad) || '-'}</span>
                  </div>
                </div>

                {selectedExpediente.estado === 'sin_efecto' && selectedExpediente.motivo_sin_efecto && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Motivo de Anulación (Sin Efecto):
                    </p>
                    <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed pl-3.5">{selectedExpediente.motivo_sin_efecto}</p>
                  </div>
                )}

                {selectedExpediente.documento_respuesta_url && (
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Documento de Respuesta Adjunto</p>
                        <p className="text-sm font-medium text-blue-950 break-all">{selectedExpediente.documento_respuesta_nombre || 'Documento de Respuesta'}</p>
                      </div>
                    </div>
                    <a
                      href={selectedExpediente.documento_respuesta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Documento Final
                    </a>
                  </div>
                )}
              </div>

              {/* Sección 2: Detalle del Asunto según Tipo */}
              {selectedExpediente.tipo_asunto === 'devolucion' ? (
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    Detalles Específicos de la Devolución
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Solicitante (Persona)</span>
                      <span className="text-sm font-semibold text-gray-900 break-words">
                        {selectedExpediente.devolucion?.persona || selectedExpediente.persona_devolucion || '-'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Tipo de Devolución</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTipoDevolucion(selectedExpediente.devolucion?.tipo_devolucion || selectedExpediente.tipo_devolucion)}
                      </span>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
                      <span className="text-xs text-emerald-700 font-bold block mb-1 uppercase tracking-wide">Importe a Devolver</span>
                      <span className="text-lg font-bold text-emerald-900">
                        S/ {Number(selectedExpediente.devolucion?.importe || selectedExpediente.importe_devolucion || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Programa / Grado</span>
                      <span className="text-sm font-medium text-gray-900 break-words">
                        {selectedExpediente.devolucion?.programa ?
                          `${selectedExpediente.devolucion.programa.grado?.nombre || ''} en ${selectedExpediente.devolucion.programa.nombre}`
                          : '-'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Comprobantes & Oficio</span>
                      <div className="text-sm font-medium text-gray-900 space-y-0.5">
                        <p>Voucher: {selectedExpediente.devolucion?.numero_voucher || selectedExpediente.numero_voucher || '-'}</p>
                        {selectedExpediente.devolucion?.numero_oficio_direccion && (
                          <p className="text-xs text-blue-700 font-semibold">Oficio Dirección: {selectedExpediente.devolucion.numero_oficio_direccion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedExpediente.tipo_asunto === 'descripcion' ? (
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Descripción Completa del Asunto
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words min-h-[100px]">
                    {selectedExpediente.descripcion_asunto || <span className="text-slate-400 italic">Sin descripción registrada</span>}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Información Académica y Docente Vinculada
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Docente</span>
                      <span className="text-sm font-semibold text-gray-900 break-words">
                        {selectedExpediente.docente?.titulo_profesional ? `${selectedExpediente.docente.titulo_profesional} ` : ''}
                        {selectedExpediente.docente ? `${selectedExpediente.docente.nombres} ${selectedExpediente.docente.apellido_paterno} ${selectedExpediente.docente.apellido_materno}` : '-'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 sm:col-span-2">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Programa y Grado</span>
                      <span className="text-sm font-medium text-gray-900 break-words">
                        {selectedExpediente.semestre?.programa ?
                          `${selectedExpediente.semestre.programa.grado?.nombre || ''} en ${selectedExpediente.semestre.programa.nombre} (${selectedExpediente.semestre.programa.periodo})`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold block mb-1">Curso</span>
                      <span className="text-sm font-semibold text-gray-900 break-words">{selectedExpediente.curso?.nombre || '-'}</span>
                      {selectedExpediente.curso?.codigo && (
                        <span className="text-xs text-slate-500 block mt-0.5 font-mono">Código: {selectedExpediente.curso.codigo}</span>
                      )}
                    </div>

                    {selectedExpediente.pagoDocente && (
                      <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-blue-700 font-bold block mb-0.5 uppercase tracking-wide">Total Pago Vinculado</span>
                          <span className="text-lg font-bold text-blue-950">
                            S/ {Number(selectedExpediente.pagoDocente.importe_total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {selectedExpediente.pagoDocente.estado || 'Procesando'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No se pudo cargar la información del expediente.
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
                <option value="sin_efecto">Sin Efecto</option>
                <option value="para_conocimiento">Para Conocimiento</option>
              </select>
            </div>

            {estadoForm.estado === 'sin_efecto' && (
              <div className="space-y-2">
                <label htmlFor="motivo_sin_efecto" className="text-sm font-semibold text-gray-700">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="motivo_sin_efecto"
                  value={estadoForm.motivo_sin_efecto}
                  onChange={(e) => setEstadoForm({ ...estadoForm, motivo_sin_efecto: e.target.value })}
                  placeholder="Describa el motivo por el cual el expediente queda sin efecto..."
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] resize-y"
                  maxLength={1000}
                />
                <p className="text-[11px] text-gray-500 text-right">
                  {estadoForm.motivo_sin_efecto.length}/1000 caracteres
                </p>
              </div>
            )}

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
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl w-full min-w-0 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-blue-900 truncate max-w-[200px] sm:max-w-[400px]" title={estadoForm.file.name}>{estadoForm.file.name}</p>
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
            {loadingEstado && estadoForm.estado === 'completado' && uploadProgress !== null && (
              <div className="space-y-1.5 px-1 mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-blue-800">
                  <span>{uploadProgress < 100 ? `Enviando al servidor (${uploadProgress}%)...` : 'Subiendo a Google Drive, por favor espere...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200/70 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadProgress === 100 && (
                  <p className="text-[11px] text-blue-700 font-medium animate-pulse mt-1">
                    ⏳ Guardando en Google Drive... Los archivos grandes (mayores a 50MB) tardan varios segundos en procesarse. No cierre el modal.
                  </p>
                )}
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
              disabled={loadingEstado || (estadoForm.estado === 'completado' && !estadoForm.file) || (estadoForm.estado === 'sin_efecto' && !estadoForm.motivo_sin_efecto.trim())}
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
