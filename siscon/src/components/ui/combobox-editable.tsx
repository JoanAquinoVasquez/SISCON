import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import { Input } from './input';
import { Label } from './label';
import { Search, X } from 'lucide-react';

interface ComboboxEditableProps {
    label?: string;
    searchEndpoint: string;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
}

export function ComboboxEditable({
    label,
    searchEndpoint,
    value,
    onChange,
    placeholder = 'Buscar o escribir...',
}: ComboboxEditableProps) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isTypingRef = useRef(false);

    // Sincronizar inputValue con value solo si no está escribiendo
    useEffect(() => {
        if (!isTypingRef.current) {
            if (value) {
                const displayValue = value?.nombre || value?.label || (typeof value === 'string' ? value : '');
                setInputValue(displayValue);
            } else {
                setInputValue('');
            }
        }
    }, [value]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                isTypingRef.current = false;
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Buscar sugerencias
    useEffect(() => {
        if (!inputValue || inputValue.length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${searchEndpoint}?q=${encodeURIComponent(inputValue)}`);
                const data = response.data.data || [];
                setSuggestions(data);
                if (data.length > 0 && isTypingRef.current) {
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Error searching:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue, searchEndpoint]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        isTypingRef.current = true;
        setInputValue(newValue);

        // Solo actualizar el valor si hay texto
        if (newValue.trim()) {
            onChange({
                id: 'custom',
                label: newValue,
                nombre: newValue,
            });
        } else {
            onChange(null);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        isTypingRef.current = false;
        setInputValue(suggestion.nombre || suggestion.label);
        onChange(suggestion);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleClear = () => {
        isTypingRef.current = false;
        setInputValue('');
        onChange(null);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div ref={wrapperRef} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        className="pl-10 pr-10"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Dropdown de sugerencias */}
                {isOpen && (suggestions.length > 0 || isLoading) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-gray-500 text-sm">
                                Buscando...
                            </div>
                        ) : suggestions.length > 0 ? (
                            <ul>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={suggestion.id || index}
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {suggestion.label || suggestion.nombre}
                                        </div>
                                        {suggestion.codigo && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Código: {suggestion.codigo}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                )}

                {/* Mensaje de ayuda */}
                <p className="text-xs text-gray-500 mt-1">
                    Puedes seleccionar de la lista o escribir un nombre personalizado
                </p>
            </div>
        </div>
    );
}
