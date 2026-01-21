<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Docente;
use Illuminate\Support\Facades\File;

class DocentesEnfermeriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $docentes = [
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Lidia Mariela', 'apellido_paterno' => 'Castro', 'apellido_materno' => 'Limo', 'genero' => 'F', 'dni' => '17530756', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Wendy Lisette', 'apellido_paterno' => 'Montaño', 'apellido_materno' => 'Guerrero', 'genero' => 'F', 'dni' => '48277881', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Mariana', 'apellido_paterno' => 'Yampufe', 'apellido_materno' => 'Salazar', 'genero' => 'F', 'dni' => '44108776', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Veronica Elizabeth', 'apellido_paterno' => 'Bustamante', 'apellido_materno' => 'Sipion', 'genero' => 'F', 'dni' => '41232582', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Jakeline Jissel', 'apellido_paterno' => 'Delgado', 'apellido_materno' => 'Alcantara', 'genero' => 'F', 'dni' => '41306008', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Fiorella Del Milagro', 'apellido_paterno' => 'Tarrillo', 'apellido_materno' => 'Ruiz', 'genero' => 'F', 'dni' => '42795839', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Angela Maria', 'apellido_paterno' => 'Vidaurre', 'apellido_materno' => 'Castillo', 'genero' => 'F', 'dni' => '73961078', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Lexci Eliana', 'apellido_paterno' => 'Solis', 'apellido_materno' => 'Sanchez', 'genero' => 'F', 'dni' => '45515918', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Susetty Yessenia', 'apellido_paterno' => 'Chavesta', 'apellido_materno' => 'Paico', 'genero' => 'F', 'dni' => '45148696', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'David Isac', 'apellido_paterno' => 'Retuerto', 'apellido_materno' => 'Alvarado', 'genero' => 'M', 'dni' => '45106321', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Lic.', 'nombres' => 'Irma Patricia', 'apellido_paterno' => 'Domenack', 'apellido_materno' => 'Juarez De Sanchez', 'genero' => 'F', 'dni' => '17620694', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Lucy Milagros', 'apellido_paterno' => 'Castillo', 'apellido_materno' => 'Fiestas', 'genero' => 'F', 'dni' => '42489454', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Leila Marissa', 'apellido_paterno' => 'Sabogal', 'apellido_materno' => 'Cumpa', 'genero' => 'F', 'dni' => '40272521', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Juana Iris', 'apellido_paterno' => 'Gutierrez', 'apellido_materno' => 'Huaman', 'genero' => 'F', 'dni' => '40907528', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Gladys Marlene', 'apellido_paterno' => 'Gonzaga', 'apellido_materno' => 'Ramirez', 'genero' => 'F', 'dni' => '19210301', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Rosa Elena', 'apellido_paterno' => 'Rios', 'apellido_materno' => 'Ordoñez', 'genero' => 'F', 'dni' => '16712341', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Lic.', 'nombres' => 'Lucy Aracely', 'apellido_paterno' => 'Reaño', 'apellido_materno' => 'Rivasplata', 'genero' => 'F', 'dni' => '41511423', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Patricia Aurora', 'apellido_paterno' => 'Negreiros', 'apellido_materno' => 'Morales', 'genero' => 'F', 'dni' => '16703063', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Lic.', 'nombres' => 'Veronica Fiorella', 'apellido_paterno' => 'Santa Cruz', 'apellido_materno' => 'Celis', 'genero' => 'F', 'dni' => '42755703', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Ana Maria', 'apellido_paterno' => 'Soza', 'apellido_materno' => 'Carrillo', 'genero' => 'F', 'dni' => '44446121', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Olga Marina', 'apellido_paterno' => 'Elorreaga', 'apellido_materno' => 'Pacheco', 'genero' => 'F', 'dni' => '40915744', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Lourdes Marisol', 'apellido_paterno' => 'Vega', 'apellido_materno' => 'Saavedra', 'genero' => 'F', 'dni' => '41705833', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Iris Lorena', 'apellido_paterno' => 'Carrillo', 'apellido_materno' => 'Hernandez', 'genero' => 'F', 'dni' => '16490283', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Paola Ivette', 'apellido_paterno' => 'Zuloeta', 'apellido_materno' => 'Atoche', 'genero' => 'F', 'dni' => '40872194', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Roxana', 'apellido_paterno' => 'Bustamante', 'apellido_materno' => 'Vasquez', 'genero' => 'F', 'dni' => '27416332', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Ruth Esperanza', 'apellido_paterno' => 'Villasis', 'apellido_materno' => 'Chavez', 'genero' => 'F', 'dni' => '16487989', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Sonia Elizabeth', 'apellido_paterno' => 'Tuñoque', 'apellido_materno' => 'Coronado', 'genero' => 'F', 'dni' => '16740053', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Ismeria', 'apellido_paterno' => 'Huaman', 'apellido_materno' => 'Fernandez', 'genero' => 'F', 'dni' => '16752289', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Sara Maribel', 'apellido_paterno' => 'Arrascue', 'apellido_materno' => 'Lara', 'genero' => 'F', 'dni' => '16698230', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Angelica Brigida', 'apellido_paterno' => 'Vera', 'apellido_materno' => 'Mechan', 'genero' => 'F', 'dni' => '16680616', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Myrian Elizabeth', 'apellido_paterno' => 'Calderon', 'apellido_materno' => 'Ruiz', 'genero' => 'F', 'dni' => '16450278', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Viviana Elida', 'apellido_paterno' => 'Moreno', 'apellido_materno' => 'Cabello', 'genero' => 'F', 'dni' => '40501442', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Esp.', 'nombres' => 'Flor Esperanza', 'apellido_paterno' => 'Otiniano', 'apellido_materno' => 'Ñañez', 'genero' => 'F', 'dni' => '16637161', 'tipo_docente' => 'externo_enfermeria'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Deyanira Carmen', 'apellido_paterno' => 'Montoro', 'apellido_materno' => 'Avelino', 'genero' => 'F', 'dni' => '00253448', 'tipo_docente' => 'externo_enfermeria'],
        ];

        foreach ($docentes as $docente) {
            Docente::updateOrCreate(
                ['dni' => $docente['dni']],
                $docente
            );
        }
    }
}
