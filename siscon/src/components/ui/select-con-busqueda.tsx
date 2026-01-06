import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from './input';
import { Label } from './label';
import { cn } from '../../lib/utils';
import axios from '../../lib/axios';

interface Option {
  id: number | string;
  label: string;
  [key: string]: any;
}

interface SelectConBusquedaProps {
  label: string;
  searchEndpoint: string;
  value: Option | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  additionalParams?: Record<string, string>;
}

export function SelectConBusqueda({
  label,
  searchEndpoint,
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  disabled = false,
  additionalParams = {},
}: SelectConBusquedaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          q: debouncedSearchTerm,
          ...additionalParams,
        });

      

        const response = await axios.get(`${searchEndpoint}?${params}`);
       
        setOptions(response.data.data || []);
      } catch (err: any) {
        const errorMessage = err.response?.status === 401
          ? 'No autenticado. Por favor inicia sesión.'
          : err.response?.status === 404
            ? 'Endpoint no encontrado'
            : 'Error al buscar';
        setError(errorMessage);
        console.error('Error fetching options:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: err.config
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, searchEndpoint, JSON.stringify(additionalParams)]);

  const handleSelect = (option: Option) => {
    onChange(option);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && options.length > 0) {
      e.preventDefault();
      handleSelect(options[0]);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={value ? value.label : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              handleClear();
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Buscando...
            </div>
          )}
          {error && (
            <div className="px-4 py-2 text-sm text-red-500">
              {error}
            </div>
          )}
          {!isLoading && !error && options.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              No se encontraron resultados
            </div>
          )}
          {!isLoading && options.length > 0 && (
            <ul>
              {options.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
