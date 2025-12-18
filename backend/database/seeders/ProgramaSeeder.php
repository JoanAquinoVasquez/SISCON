<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programa;

class ProgramaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programasBase = [
            ['nombre' => 'Ciencias con mención en Gestión de la Calidad e Inocuidad de Alimentos', 'grado_id' => 2, 'facultad_id' => 1],
            ['nombre' => 'Ciencias con mención en Ingeniería de Procesos Industriales', 'grado_id' => 2, 'facultad_id' => 1],
            ['nombre' => 'Microbiología Clínica', 'grado_id' => 3, 'facultad_id' => 9],
            ['nombre' => 'Gestión Ambiental', 'grado_id' => 3, 'facultad_id' => 1],
            ['nombre' => 'Educación Ambiental Intercultural', 'grado_id' => 3, 'facultad_id' => 1],
            ['nombre' => 'Ciencias con mención en Ingeniería Hidráulica', 'grado_id' => 2, 'facultad_id' => 2],
            ['nombre' => 'Ciencias con mención en Ordenamiento Territorial y Desarrollo Urbano', 'grado_id' => 2, 'facultad_id' => 2],
            ['nombre' => 'Gerencia de Obras y Construcción', 'grado_id' => 2, 'facultad_id' => 2],
            ['nombre' => 'Ingeniería de Sistemas con Mención en Gerencia de Tecnologías de la Información y Gestión del Software', 'grado_id' => 2, 'facultad_id' => 2],
            ['nombre' => 'Territorio y Urbanismo Sostenible', 'grado_id' => 1, 'facultad_id' => 2],
            ['nombre' => 'Ciencias con mención en Proyectos de Inversión', 'grado_id' => 2, 'facultad_id' => 3],
            ['nombre' => 'Ciencias Veterinarias con Mención en Salud Animal', 'grado_id' => 2, 'facultad_id' => 10],
            ['nombre' => 'Administración con mención en Gerencia Empresarial', 'grado_id' => 2, 'facultad_id' => 3],
            ['nombre' => 'Administración', 'grado_id' => 1, 'facultad_id' => 3],
            ['nombre' => 'Ciencias de Enfermería', 'grado_id' => 2, 'facultad_id' => 4],
            ['nombre' => 'Ciencias de Enfermería', 'grado_id' => 1, 'facultad_id' => 4],
            ['nombre' => 'Área Organizacional y de Gestión Enfermera Especialista en Administración y Gerencia en Salud con mención en Gestión de la Calidad', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área de Salud Pública y Comunitaria Enfermera Especialista en Salud Pública con mención en Salud Familiar', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidado Integral Infantil con Mención en Crecimiento y Desarrollo', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidados Críticos con mención en Adulto', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Cuidados Críticos con mención en Neonatología', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Emergencia y Desastres con mención en Cuidados Hospitalarios', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Enfermera Especialista en Gastroenterología y Procedimientos Endoscópicos con mención En Procedimientos Endoscópicos', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Especialista en Enfermería Nefrológica y Urológica con mención en Diálisis', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del cuidado a la Persona Especialista en Enfermería Oncológica con mención en Oncología', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del Cuidado a la Persona Especialista en Enfermería Pediátrica Y Neonatología con mención en Pediatría', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área de Salud Pública y Comunitaria Enfermera Especialista en Salud Ocupacional con mención en Salud Ocupacional', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Área del Cuidado a la Persona Enfermera Especialista en Centro Quirúrgico Especializado con mención en Centro Quirúrgico', 'grado_id' => 3, 'facultad_id' => 4],
            ['nombre' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía', 'grado_id' => 2, 'facultad_id' => 5],
            ['nombre' => 'Ciencias de la Ingeniería Mecánica y Eléctrica con mención en Energía', 'grado_id' => 1, 'facultad_id' => 5],
            ['nombre' => 'Derecho con mención en Civil y Comercial', 'grado_id' => 2, 'facultad_id' => 6],
            ['nombre' => 'Derecho con mención en Derecho Constitucional y Procesal Constitucional', 'grado_id' => 2, 'facultad_id' => 6],
            ['nombre' => 'Derecho con mención en Derecho Penal y Procesal Penal', 'grado_id' => 2, 'facultad_id' => 6],
            ['nombre' => 'Derecho y Ciencia Política', 'grado_id' => 1, 'facultad_id' => 6],
            ['nombre' => 'Gestión Integrada de los Recursos Hídricos', 'grado_id' => 2, 'facultad_id' => 7],
            ['nombre' => 'Ciencias de la Educación con mención en Didáctica del Idioma Inglés', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Ciencias de la Educación con mención en Docencia y Gestión Universitaria', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Ciencias Sociales con mención en Gestión Pública y Gerencia Social', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Ciencias de la Educación con mención en Tecnologías de la Información e Informática Educativa', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Ciencias de la Educación con mención en Gerencia Educativa Estratégica', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Ciencias de la Educación con mención en Investigación y Docencia', 'grado_id' => 2, 'facultad_id' => 8],
            ['nombre' => 'Sociología', 'grado_id' => 1, 'facultad_id' => 8],
            ['nombre' => 'Ciencias de la Educación', 'grado_id' => 1, 'facultad_id' => 8],
            ['nombre' => 'Ciencias Ambientales', 'grado_id' => 1, 'facultad_id' => 9],
        ];

        // Crear cada programa en ambos periodos: 2024-II y 2025-I
        $periodos = ['2024-II', '2025-I'];

        foreach ($programasBase as $programaBase) {
            foreach ($periodos as $periodo) {
                Programa::create(array_merge($programaBase, ['periodo' => $periodo]));
            }
        }
    }
}
