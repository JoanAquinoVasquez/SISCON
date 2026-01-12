import { useState, useRef } from 'react';
import { Label } from './label';
import { Button } from './button';
import axios from '../../lib/axios';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function FileUpload({ label, value, onChange, disabled = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar 10MB');
      return;
    }

    setError(null);
    setFileName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/upload-documento', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onChange(response.data.url);
      } else {
        setError('Error al subir el archivo');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir el archivo');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-0">
      <Label>{label}</Label>
      
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          id={`file-${label}`}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Subiendo...
            </>
          ) : value ? (
            <>
              <span className="mr-2">✓</span>
              Archivo subido
            </>
          ) : (
            <>
              <span className="mr-2">📄</span>
              Seleccionar PDF
            </>
          )}
        </Button>

        {value && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </Button>
        )}
      </div>

      {fileName && !error && (
        <p className="text-sm text-gray-600">
          {fileName}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {value && !uploading && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline block"
        >
          Ver documento
        </a>
      )}
    </div>
  );
}
