<?php

namespace App\Http\Controllers;

use App\Models\PagoDocente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DocumentoController extends Controller
{
    public function indexOficios(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        // Define the types of oficios and their corresponding columns
        $types = [
            'presentacion_facultad' => ['col' => 'numero_oficio_presentacion_facultad', 'url' => 'numero_oficio_presentacion_facultad_url', 'label' => 'Presentación Facultad'],
            'conformidad_facultad' => ['col' => 'numero_oficio_conformidad_facultad', 'url' => 'numero_oficio_conformidad_facultad_url', 'label' => 'Conformidad Facultad'],
            'conformidad_direccion' => ['col' => 'numero_oficio_conformidad_direccion', 'url' => 'numero_oficio_conformidad_direccion_url', 'label' => 'Conformidad Dirección'],
            'pago_direccion' => ['col' => 'numero_oficio_pago_direccion', 'url' => 'numero_oficio_pago_direccion_url', 'label' => 'Pago Dirección'],
            'contabilidad' => ['col' => 'numero_oficio_contabilidad', 'url' => 'numero_oficio_contabilidad_url', 'label' => 'Contabilidad'],
        ];

        $queries = [];

        foreach ($types as $typeKey => $config) {
            $query = DB::table('pagos_docentes')
                ->join('docentes', 'pagos_docentes.docente_id', '=', 'docentes.id')
                ->select(
                    'pagos_docentes.id as pago_id',
                    "pagos_docentes.{$config['col']} as numero",
                    "pagos_docentes.{$config['url']} as url",
                    DB::raw("'$typeKey' as tipo_codigo"),
                    DB::raw("'{$config['label']}' as tipo_label"),
                    'pagos_docentes.created_at as fecha_registro',
                    DB::raw("CONCAT(docentes.titulo_profesional, ' ', docentes.nombres, ' ', docentes.apellido_paterno, ' ', docentes.apellido_materno) as docente_nombre")
                )
                ->whereNotNull("pagos_docentes.{$config['col']}")
                ->where("pagos_docentes.{$config['col']}", '!=', '')
                ->orderBy("pagos_docentes.created_at", 'desc');

            if ($search) {
                $query->where("pagos_docentes.{$config['col']}", 'like', "%{$search}%");
            }

            $queries[] = $query;
        }

        // Union all queries
        $finalQuery = array_shift($queries);
        foreach ($queries as $q) {
            $finalQuery->union($q);
        }

        // Pagination is tricky with union, so we'll get all and paginate manually or use a subquery
        // For simplicity and since we expect reasonable volume, we'll use a subquery approach for pagination

        $countQuery = DB::query()->fromSub($finalQuery, 'sub')->count();

        $items = DB::query()->fromSub($finalQuery, 'sub')
            ->orderBy('fecha_registro', 'desc')
            ->limit($perPage)
            ->offset(($request->query('page', 1) - 1) * $perPage)
            ->get();

        return response()->json([
            'data' => $items,
            'total' => $countQuery,
            'per_page' => $perPage,
            'current_page' => (int) $request->query('page', 1),
            'last_page' => ceil($countQuery / $perPage),
        ]);
    }

    public function indexResoluciones(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $types = [
            'aprobacion' => ['col' => 'numero_resolucion_aprobacion', 'url' => 'numero_resolucion_url', 'date' => 'fecha_resolucion_aprobacion', 'label' => 'Resolución Aprobación'],
            'pago' => ['col' => 'numero_resolucion_pago', 'url' => 'numero_resolucion_url', 'date' => 'fecha_resolucion', 'label' => 'Resolución Pago'],
        ];

        $queries = [];

        foreach ($types as $typeKey => $config) {
            $query = DB::table('pagos_docentes')
                ->join('docentes', 'pagos_docentes.docente_id', '=', 'docentes.id')
                ->select(
                    'pagos_docentes.id as pago_id',
                    "pagos_docentes.{$config['col']} as numero",
                    "pagos_docentes.{$config['url']} as url",
                    "pagos_docentes.{$config['date']} as fecha_documento",
                    DB::raw("'$typeKey' as tipo_codigo"),
                    DB::raw("'{$config['label']}' as tipo_label"),
                    'pagos_docentes.created_at as fecha_registro',
                    DB::raw("CONCAT(docentes.nombres, ' ', docentes.apellido_paterno, ' ', docentes.apellido_materno) as docente_nombre")
                )
                ->whereNotNull("pagos_docentes.{$config['col']}")
                ->where("pagos_docentes.{$config['col']}", '!=', '')
                ->orderBy("pagos_docentes.{$config['date']}", 'desc');

            if ($search) {
                $query->where("pagos_docentes.{$config['col']}", 'like', "%{$search}%");
            }

            $queries[] = $query;
        }

        $finalQuery = array_shift($queries);
        foreach ($queries as $q) {
            $finalQuery->union($q);
        }

        $countQuery = DB::query()->fromSub($finalQuery, 'sub')->count();

        $items = DB::query()->fromSub($finalQuery, 'sub')
            ->orderBy('fecha_documento', 'desc')
            ->limit($perPage)
            ->offset(($request->query('page', 1) - 1) * $perPage)
            ->get();

        return response()->json([
            'data' => $items,
            'total' => $countQuery,
            'per_page' => $perPage,
            'current_page' => (int) $request->query('page', 1),
            'last_page' => ceil($countQuery / $perPage),
        ]);
    }
}
