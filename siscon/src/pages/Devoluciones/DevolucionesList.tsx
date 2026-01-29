import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreVertical
} from 'lucide-react';
import {
    getDevoluciones,
    deleteDevolucion,
    type Devolucion,
    updateEstadoDevolucion,
    updateDevolucion
} from '../../services/devolucionService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function DevolucionesList() {
    const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        tipo_devolucion: '',
        estado: ''
    });
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [page, setPage] = useState(1);

    // Estado para modal de cambio de estado
    const [selectedDevolucion, setSelectedDevolucion] = useState<Devolucion | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Estado para modal de edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Devolucion>>({});
    const [saving, setSaving] = useState(false);

    const fetchDevoluciones = async () => {
        try {
            setLoading(true);
            const data = await getDevoluciones({
                page,
                search,
                ...filters
            });
            setDevoluciones(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                per_page: data.per_page,
                total: data.total,
                from: data.from,
                to: data.to
            });
        } catch (error) {
            console.error('Error al cargar devoluciones:', error);
            toast.error('Error al cargar la lista de devoluciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevoluciones();
    }, [page, search, filters]);

    const handleDelete = async (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            try {
                await deleteDevolucion(id);
                toast.success('Devolución eliminada correctamente');
                fetchDevoluciones();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar el registro');
            }
        }
    };

    const handleStatusChange = (devolucion: Devolucion) => {
        setSelectedDevolucion(devolucion);
        setNewStatus(devolucion.estado);
        setObservaciones(devolucion.observaciones || '');
        setIsStatusModalOpen(true);
    };

    const handleEdit = (devolucion: Devolucion) => {
        setSelectedDevolucion(devolucion);
        setEditFormData({
            persona: devolucion.persona,
            dni: devolucion.dni,
            importe: devolucion.importe,
            numero_voucher: devolucion.numero_voucher,
            tipo_devolucion: devolucion.tipo_devolucion,
            observaciones: devolucion.observaciones
        });
        setIsEditModalOpen(true);
    };

    const submitStatusChange = async () => {
        if (!selectedDevolucion) return;

        try {
            setUpdatingStatus(true);
            await updateEstadoDevolucion(selectedDevolucion.id, newStatus, observaciones);
            toast.success('Estado actualizado correctamente');
            setIsStatusModalOpen(false);
            fetchDevoluciones();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al actualizar el estado');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const submitEdit = async () => {
        if (!selectedDevolucion) return;

        try {
            setSaving(true);
            await updateDevolucion(selectedDevolucion.id, editFormData);
            toast.success('Devolución actualizada correctamente');
            setIsEditModalOpen(false);
            fetchDevoluciones();
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error('Error al actualizar la devolución');
        } finally {
            setSaving(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
            case 'procesado':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Procesado</Badge>;
            case 'rechazado':
                return <Badge variant="destructive">Rechazado</Badge>;
            case 'aprobado':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Aprobado</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'inscripcion': return <Badge variant="outline" className="border-blue-200 text-blue-700">Inscripción</Badge>;
            case 'idiomas': return <Badge variant="outline" className="border-purple-200 text-purple-700">Idiomas</Badge>;
            case 'grados_titulos': return <Badge variant="outline" className="border-orange-200 text-orange-700">Grados y Títulos</Badge>;
            default: return <Badge variant="outline">{tipo}</Badge>;
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Devoluciones</h1>
                    <p className="text-muted-foreground">
                        Gestión de solicitudes de devolución
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por persona, DNI o voucher..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={filters.tipo_devolucion}
                    onValueChange={(value) => setFilters({ ...filters, tipo_devolucion: value === 'todos' ? '' : value })}
                >
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Tipo Devolución" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos"><span>Todos</span></SelectItem>
                        <SelectItem value="inscripcion"><span>Inscripción</span></SelectItem>
                        <SelectItem value="idiomas"><span>Idiomas</span></SelectItem>
                        <SelectItem value="grados_titulos"><span>Grados y Títulos</span></SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.estado}
                    onValueChange={(value) => setFilters({ ...filters, estado: value === 'todos' ? '' : value })}
                >
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos"><span>Todos</span></SelectItem>
                        <SelectItem value="pendiente"><span>Pendiente</span></SelectItem>
                        <SelectItem value="aprobado"><span>Aprobado</span></SelectItem>
                        <SelectItem value="rechazado"><span>Rechazado</span></SelectItem>
                        <SelectItem value="procesado"><span>Procesado</span></SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabla */}
            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Cód.</TableHead>
                            <TableHead>Persona</TableHead>
                            <TableHead>Programa</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Voucher</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Cargando datos...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : devoluciones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No se encontraron registros
                                </TableCell>
                            </TableRow>
                        ) : (
                            devoluciones.map((devolucion) => (
                                <TableRow key={devolucion.id}>
                                    <TableCell>{devolucion.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{devolucion.persona}</div>
                                        <div className="text-xs text-muted-foreground">DNI: {devolucion.dni}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{devolucion.programa_nombre}</div>
                                        <div className="text-xs text-muted-foreground">Admisión: {devolucion.proceso_admision}</div>
                                    </TableCell>
                                    <TableCell>{getTipoBadge(devolucion.tipo_devolucion)}</TableCell>
                                    <TableCell>{devolucion.numero_voucher}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        S/ {Number(devolucion.importe).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getEstadoBadge(devolucion.estado)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEdit(devolucion)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(devolucion)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Cambiar Estado
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(devolucion.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {pagination.from} a {pagination.to} de {pagination.total} registros
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                            disabled={page === pagination.last_page}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal de Cambio de Estado */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Actualizar Estado</DialogTitle>
                        <DialogDescription>
                            Cambiar el estado de la devolución de {selectedDevolucion?.persona}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente"><span>Pendiente</span></SelectItem>
                                    <SelectItem value="aprobado"><span>Aprobado</span></SelectItem>
                                    <SelectItem value="rechazado"><span>Rechazado</span></SelectItem>
                                    <SelectItem value="procesado"><span>Procesado</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                                value={observaciones}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)}
                                placeholder="Ingrese observaciones si es necesario..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitStatusChange} disabled={updatingStatus}>
                            {updatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Edición */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Devolución</DialogTitle>
                        <DialogDescription>
                            Modificar los datos de la devolución
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>DNI</Label>
                                <Input
                                    value={editFormData.dni || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, dni: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Importe</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editFormData.importe || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, importe: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Persona</Label>
                            <Input
                                value={editFormData.persona || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, persona: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>N° Voucher</Label>
                            <Input
                                value={editFormData.numero_voucher || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, numero_voucher: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo Devolución</Label>
                            <Select
                                value={editFormData.tipo_devolucion}
                                onValueChange={(value: any) => setEditFormData({ ...editFormData, tipo_devolucion: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inscripcion"><span>Inscripción</span></SelectItem>
                                    <SelectItem value="idiomas"><span>Idiomas</span></SelectItem>
                                    <SelectItem value="grados_titulos"><span>Grados y Títulos</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                                value={editFormData.observaciones || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, observaciones: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitEdit} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
