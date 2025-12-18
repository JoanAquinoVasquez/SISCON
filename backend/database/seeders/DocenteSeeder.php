<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Docente;

class DocenteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $docentes = [
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Cesar Agusto', 'apellido_paterno' => 'Pintado', 'apellido_materno' => 'Castillo', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Hendrikus Sigbertus Maria', 'apellido_paterno' => 'Hendriks', 'apellido_materno' => 'Johannes', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Jorge Luis', 'apellido_paterno' => 'Dávila', 'apellido_materno' => 'Vidarte', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Leopoldo', 'apellido_paterno' => 'Yzquierdo', 'apellido_materno' => 'Hernandez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Ricardo', 'apellido_paterno' => 'Velasquez', 'apellido_materno' => 'Ramirez', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr. Ing.', 'nombres' => 'Carlos Adolfo', 'apellido_paterno' => 'Loayza', 'apellido_materno' => 'Rivas', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr. Ing.', 'nombres' => 'Luis Alberto', 'apellido_paterno' => 'Otake', 'apellido_materno' => 'Oyama', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Walter Antonio', 'apellido_paterno' => 'Campos', 'apellido_materno' => 'Ugaz', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'José Rolando', 'apellido_paterno' => 'Cardenas', 'apellido_materno' => 'Gonzáles', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Carlos Alberto', 'apellido_paterno' => 'Sanchez', 'apellido_materno' => 'Coronado', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Sidney Alex', 'apellido_paterno' => 'Bravo', 'apellido_materno' => 'Melgar', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Edwin Vilmer', 'apellido_paterno' => 'Figueroa', 'apellido_materno' => 'Gutarra', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Elmer', 'apellido_paterno' => 'Llanos', 'apellido_materno' => 'Diaz', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Lolo', 'apellido_paterno' => 'Avellaneda', 'apellido_materno' => 'Callirgos', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Richard Eduardo', 'apellido_paterno' => 'Castillo', 'apellido_materno' => 'Rivera', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Manuel Francisco', 'apellido_paterno' => 'Hurtado', 'apellido_materno' => 'Sanchez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Juan Diego', 'apellido_paterno' => 'Dávila', 'apellido_materno' => 'Cisneros', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Raquel Yovana', 'apellido_paterno' => 'Tello', 'apellido_materno' => 'Flores', 'genero' => 'F', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Francisco Felizardo', 'apellido_paterno' => 'Reluz', 'apellido_materno' => 'Barturén', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Jose Luis', 'apellido_paterno' => 'Venegas', 'apellido_materno' => 'Kemper', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Lino Jorge', 'apellido_paterno' => 'Llatas', 'apellido_materno' => 'Altamirano', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Lourdes Margarita', 'apellido_paterno' => 'Meza', 'apellido_materno' => 'Ruiz', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Jorge Max', 'apellido_paterno' => 'Mundaca', 'apellido_materno' => 'Monja', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Rosa Guadalupe', 'apellido_paterno' => 'Neciosup', 'apellido_materno' => 'Rosas', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Freddy Widmar', 'apellido_paterno' => 'Hernandez', 'apellido_materno' => 'Rengifo', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Eduardo Julio', 'apellido_paterno' => 'Tejada', 'apellido_materno' => 'Sánchez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Evert Jose', 'apellido_paterno' => 'Fernandez', 'apellido_materno' => 'Vasquez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Tomás', 'apellido_paterno' => 'Serquen', 'apellido_materno' => 'Montehermozo', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Franklin Edinson', 'apellido_paterno' => 'Teran', 'apellido_materno' => 'Santa Cruz', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Segundo Gabriel', 'apellido_paterno' => 'Zeña', 'apellido_materno' => 'Coronado', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Mariela', 'apellido_paterno' => 'Espinoza', 'apellido_materno' => 'Vizquerra', 'genero' => 'F', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Segundo Martel', 'apellido_paterno' => 'Vergara', 'apellido_materno' => 'Castillo', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Cesar Agustin', 'apellido_paterno' => 'Mino', 'apellido_materno' => 'Jara', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Fiorela Anai', 'apellido_paterno' => 'Fernandez', 'apellido_materno' => 'Otoya', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Martha', 'apellido_paterno' => 'Rios', 'apellido_materno' => 'Rodriguez', 'genero' => 'F', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Angel Johel', 'apellido_paterno' => 'Centurion', 'apellido_materno' => 'Larrea', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Ysabel', 'apellido_paterno' => 'Nevado', 'apellido_materno' => 'Rojas', 'genero' => 'F', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Dáel Carlos', 'apellido_paterno' => 'Dávila', 'apellido_materno' => 'Elguera', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Jorge Enrique', 'apellido_paterno' => 'Carvajal', 'apellido_materno' => 'Bermúdez', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Pedro Luis', 'apellido_paterno' => 'Custodio', 'apellido_materno' => 'Montalvo', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Cesar', 'apellido_paterno' => 'Vargas', 'apellido_materno' => 'Rodriguez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Alberto Enrique', 'apellido_paterno' => 'Samillán', 'apellido_materno' => 'Ayala', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Roger Antonio', 'apellido_paterno' => 'Anaya', 'apellido_materno' => 'Morales', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Rocío Del Pilar', 'apellido_paterno' => 'Blas', 'apellido_materno' => 'Rebaza', 'genero' => 'F', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'César Augusto', 'apellido_paterno' => 'Monteza', 'apellido_materno' => 'Arbulú', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'José Luis', 'apellido_paterno' => 'Ordinola', 'apellido_materno' => 'Boyer', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Julia Otilia', 'apellido_paterno' => 'Sagastegui', 'apellido_materno' => 'Cruz', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Joward Martín', 'apellido_paterno' => 'Ipanaqué', 'apellido_materno' => 'Costilla', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Félix', 'apellido_paterno' => 'Vallejos', 'apellido_materno' => 'Ramos', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Bruno Fernando', 'apellido_paterno' => 'Avalos', 'apellido_materno' => 'Pretell', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Deciderio Enrique', 'apellido_paterno' => 'Díaz', 'apellido_materno' => 'Rubio', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Marcos', 'apellido_paterno' => 'Callirgos', 'apellido_materno' => 'Coico', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Jorge Luis', 'apellido_paterno' => 'Arrasco', 'apellido_materno' => 'Alegre', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Edgar Cesar', 'apellido_paterno' => 'Casas', 'apellido_materno' => 'Casas', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Marco Oswaldo', 'apellido_paterno' => 'Arnao', 'apellido_materno' => 'Vásquez', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Ana Luisa', 'apellido_paterno' => 'Mendoza', 'apellido_materno' => 'Vela', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Edgardo Gonzalo', 'apellido_paterno' => 'Rodríguez', 'apellido_materno' => 'Gómez', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Johan Mitchel', 'apellido_paterno' => 'Quesnay', 'apellido_materno' => 'Casusol', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Jorge Manuel', 'apellido_paterno' => 'Cardeña', 'apellido_materno' => 'Peña', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Alex Abanto', 'apellido_paterno' => 'León', 'apellido_materno' => 'Zuloeta', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Ana María', 'apellido_paterno' => 'Juarez', 'apellido_materno' => 'Chunga', 'genero' => 'F', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Eduardo Santiago', 'apellido_paterno' => 'Willis', 'apellido_materno' => 'Araujo', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Segundo Eloy', 'apellido_paterno' => 'Tuesta', 'apellido_materno' => 'Bardalez', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Cesar Edwin', 'apellido_paterno' => 'Moreno', 'apellido_materno' => 'More', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Nelson Alejandro', 'apellido_paterno' => 'Puyen', 'apellido_materno' => 'Farías', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Eliu', 'apellido_paterno' => 'Arismendiz', 'apellido_materno' => 'Amaya', 'genero' => 'M', 'tipo_docente' => 'externo'],
            ['titulo_profesional' => 'Mg.', 'nombres' => 'Jorge Antonio', 'apellido_paterno' => 'Fupuy', 'apellido_materno' => 'Chung', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Ernesto Edmundo', 'apellido_paterno' => 'Hashimoto', 'apellido_materno' => 'Moncayo', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Ing.', 'nombres' => 'Domingo Jorge Luis', 'apellido_paterno' => 'Dávila', 'apellido_materno' => 'Vidarte', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dr.', 'nombres' => 'Lindon', 'apellido_paterno' => 'Vela', 'apellido_materno' => 'Melendez', 'genero' => 'M', 'tipo_docente' => 'interno'],
            ['titulo_profesional' => 'Dra.', 'nombres' => 'Ángela', 'apellido_paterno' => 'Castro', 'apellido_materno' => 'Espinoza', 'genero' => 'F', 'tipo_docente' => 'interno'],
        ];

        foreach ($docentes as $docente) {
            Docente::create($docente);
        }
    }
}
