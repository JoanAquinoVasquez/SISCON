<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Docente;

class StoreAsignacionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        // Reglas base para todos
        $rules = [
            'docente_id' => 'required|exists:docentes,id',
            'curso_id' => 'required|exists:cursos,id',
            'horas_teoricas' => 'required|numeric|min:0',
            'horas_practicas' => 'required|numeric|min:0',
            'costo_hora' => 'required|numeric|min:0',
            'fechas_clase' => 'required|string', // o array si lo manejas así
        ];

        // Obtenemos el docente para saber su categoría
        // Nota: Esto implica una query extra, pero es necesario para validar
        if ($this->has('docente_id')) {
            $docente = Docente::find($this->input('docente_id'));

            if ($docente && $docente->categoria === 'ENFERMERIA') {
                // REGLAS PARA ENFERMERÍA
                $rules['orden_servicio'] = 'required|string';
                $rules['pedido_servicio'] = 'required|string';
                $rules['recibo_honorarios'] = 'required|string';
                $rules['fecha_emision_rh'] = 'required|date';
                $rules['mes_pago'] = 'required|string';
            } else {
                // REGLAS PARA DOCENTE REGULAR
                // La resolución es única para un docente enseñando un curso específico en fecha específica
                // Aquí simplificamos la validación unique
                $rules['numero_resolucion'] = 'required|string|unique:asignaciones_docencia,numero_resolucion';
                $rules['oficio_direccion'] = 'required|string'; // Puede repetirse
                $rules['nota_de_pago'] = 'required|string';
            }
        }

        return $rules;
    }
}
