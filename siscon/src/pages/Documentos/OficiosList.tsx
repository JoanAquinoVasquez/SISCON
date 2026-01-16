import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Loader2, FileText, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Oficio {
    pago_id: number;
    numero: string;
    url: string | null;
    tipo_codigo: string;
    tipo_label: string;
    fecha_registro: string;
    docente_nombre: string;
    grado_nombre: string;
    programa_nombre: string;
    periodo: string;
}

export default function OficiosList() {
    const navigate = useNavigate();
    const [oficios, setOficios] = useState<Oficio[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [exportingId, setExportingId] = useState<number | null>(null);

    useEffect(() => {
        fetchOficios();
    }, [search, currentPage]);

    const fetchOficios = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage };
            if (search) params.search = search;

            const response = await axios.get('/documentos/oficios', { params });
            setOficios(response.data.data);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Error al cargar oficios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (oficio: Oficio) => {
        try {
            setExportingId(oficio.pago_id);
            const endpoint = `/pagos-docentes/${oficio.pago_id}/generar-oficio`;

            const response = await axios.post(endpoint, {}, {
                responseType: 'blob'
            });

            // Crear URL del blob y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Obtener nombre del archivo del header o generar uno
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `Oficio_${oficio.numero}.docx`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = decodeURIComponent(fileNameMatch[1]);
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Documento descargado correctamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Error al generar el documento');
        } finally {
            setExportingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Oficios</h1>
                    <p className="text-slate-600 mt-1">Registro de oficios generados y recibidos</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                            <CardTitle>Listado de Oficios</CardTitle>
                            <CardDescription>
                                Total de documentos encontrados: {totalItems}
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por número..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Docente Relacionado</TableHead>
                                    <TableHead>Programa</TableHead>
                                    <TableHead>Fecha Registro</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <span>Cargando oficios...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : oficios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No se encontraron oficios
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    oficios.map((oficio, index) => (
                                        <TableRow key={`${oficio.pago_id}-${oficio.tipo_codigo}-${index}`}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-slate-500" />
                                                    {oficio.numero}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50">
                                                    {oficio.tipo_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{oficio.docente_nombre}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{oficio.grado_nombre} en {oficio.programa_nombre}</div>
                                                <div className="text-xs text-muted-foreground">{oficio.periodo}</div>
                                            </TableCell>
                                            <TableCell>{formatDate(oficio.fecha_registro)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {oficio.url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(oficio.url!, '_blank')}
                                                            title="Ver documento"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleExport(oficio)}
                                                        disabled={exportingId === oficio.pago_id}
                                                        title="Exportar Word"
                                                    >
                                                        {exportingId === oficio.pago_id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/pagos-docentes/${oficio.pago_id}/editar`)}
                                                        title="Ver trámite"
                                                    >
                                                        Ver Trámite
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
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <span className="flex items-center px-4 text-sm">
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
                </CardContent>
            </Card>
        </div>
    );
}
