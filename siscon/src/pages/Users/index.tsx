// src/pages/Users/index.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { userService, type User } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserForm } from './UserForm';

export default function UsersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('todos');
  const [isActive, setIsActive] = useState<string>('todos');
  const [page, setPage] = useState(1);

  // Fetch users with params
  const { data: response, isLoading, isFetching, error } = useQuery({
    queryKey: ['users', page, search, role, isActive],
    queryFn: async () => {
      const params: any = { page, per_page: 10 };
      if (search) params.search = search;
      if (role && role !== 'todos') params.role = role;
      if (isActive && isActive !== 'todos') params.is_active = isActive === 'activos' ? 1 : 0;

      const res = await userService.getAll(params);
      // Handle both paginated and non-paginated responses for backward compatibility if needed
      return res.current_page ? res : { data: res.data, current_page: 1, last_page: 1, total: res.data.length, from: 1, to: res.data.length };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const users = response?.data || [];
  const pagination = response ? {
    current_page: response.current_page,
    last_page: response.last_page,
    total: response.total,
    from: response.from,
    to: response.to
  } : null;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario eliminado exitosamente', 'success');
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario creado exitosamente', 'success');
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario actualizado exitosamente', 'success');
      setIsFormOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  const handleDelete = (user: User) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error al cargar usuarios: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => { setRole(value); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={isActive}
          onValueChange={(value) => { setIsActive(value); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Total: {pagination?.total || 0} usuarios registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          Inactivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDelete(user)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay usuarios registrados</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 border-t pt-4">
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
        </CardContent>
      </Card>

      <UserForm
        user={selectedUser}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
