import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  Search,
  FileDown,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

interface Template {
  name: string;
  size: number;
  last_modified: string;
}

const getTemplateDescription = (name: string): string => {
  switch (name) {
    case 'Resoluciones Plantilla DI 2025.docx':
      return 'Resolución para Docente Interno (Periodo 2025-I)';
    case 'Resoluciones Plantilla DE 2025.docx':
      return 'Resolución para Docente Externo (Periodo 2025-I)';
    case 'Resolucion Plantilla DI 2024.docx':
      return 'Resolución para Docente Interno (Periodo 2024-II)';
    case 'Resolucion Plantilla DE 2024.docx':
      return 'Resolución para Docente Externo (Periodo 2024-II)';
    case 'Ofic. Conta Plantilla DI 2025.docx':
      return 'Oficio de Contabilidad para Docente Interno (Periodo 2025-I)';
    case 'Ofic. Conta Plantilla DE 2025.docx':
      return 'Oficio de Contabilidad para Docente Externo (Periodo 2025-I)';
    case 'Ofic. Conta Plantilla DI 2024.docx':
      return 'Oficio de Contabilidad para Docente Interno (Periodo 2024-II)';
    case 'Ofic. Conta Plantilla DE 2024.docx':
      return 'Oficio de Contabilidad para Docente Externo (Periodo 2024-II)';
    case 'Resolución Aceptacion DocExt 2025.docx':
      return 'Resolución de Aceptación para Docente Externo (Periodo 2025-I)';
    case 'Resolución Aceptacion DocExt 2024.docx':
      return 'Resolución de Aceptación para Docente Externo (Periodo 2024-II)';
    case 'Resolución Aceptacion DocExt FE 2025.docx':
      return 'Resolución de Aceptación para Docente Externo Enfermería (Periodo 2025-I)';
    default:
      return 'Plantilla del sistema';
  }
};

export default function GestionPlantillas() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Error al cargar las plantillas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      const response = await axios.get(`/templates/download/${filename}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('Error al descargar la plantilla', 'error');
    }
  };

  const handleUpload = async (filename: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_filename', filename);

    try {
      setUploading(filename);
      await axios.post('/templates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Plantilla actualizada exitosamente', 'success');
      fetchTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      showToast('Error al actualizar la plantilla', 'error');
    } finally {
      setUploading(null);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Plantillas</h1>
          <p className="text-slate-500 mt-1">Descarga y actualiza los formatos de Word (.docx) utilizados para la generación de documentos.</p>
        </div>
        <Button onClick={fetchTemplates} variant="outline" className="gap-2">
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refrescar
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Plantillas Disponibles
            </CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar plantilla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-slate-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Nombre del Archivo</TableHead>
                <TableHead className="font-semibold text-slate-700">Tamaño</TableHead>
                <TableHead className="font-semibold text-slate-700">Última Modificación</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={4}>
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                      <p>No se encontraron plantillas.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.name} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileDown className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{getTemplateDescription(template.name)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <Badge variant="outline" className="font-normal bg-slate-50 text-slate-600 border-slate-200">
                        {formatFileSize(template.size)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {template.last_modified}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleDownload(template.name)}
                          title="Descargar plantilla"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                        
                        <div className="relative">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(template.name, file);
                              }}
                              disabled={uploading === template.name}
                            />
                            <div className={cn(
                              "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                              "border border-slate-200 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 h-8 px-3 py-2",
                              uploading === template.name && "opacity-50 cursor-not-allowed"
                            )}>
                              {uploading === template.name ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2 text-blue-600" />
                              )}
                              Actualizar
                            </div>
                          </label>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-4">
        <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-900 uppercase tracking-tight">¡Atención Administrador!</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Al actualizar una plantilla, asegúrese de mantener el nombre original del archivo. El sistema sobrescribirá el archivo en el servidor 
            utilizando el nombre destino mostrado en la tabla, independientemente del nombre del archivo que usted suba.
            Verifique que los <strong>placeholders</strong> (ej: {'{DOCENTE}'}, {'{CURSO}'}) se mantengan iguales para evitar errores en la generación de documentos.
          </p>
        </div>
      </div>
    </div>
  );
}
