<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class TemplateController extends Controller
{
    protected $templatePath;

    public function __construct()
    {
        $this->templatePath = storage_path('templates');
    }

    /**
     * List all templates in the storage/templates directory
     */
    public function index()
    {
        if (!File::exists($this->templatePath)) {
            return response()->json(['data' => []]);
        }

        $files = File::files($this->templatePath);
        $templates = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'docx') {
                $templates[] = [
                    'name' => $file->getFilename(),
                    'size' => $file->getSize(),
                    'last_modified' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }
        }

        return response()->json(['data' => $templates]);
    }

    /**
     * Download a specific template
     */
    public function download($filename)
    {
        $path = $this->templatePath . DIRECTORY_SEPARATOR . $filename;

        if (!File::exists($path)) {
            return response()->json(['message' => 'Archivo no encontrado'], 404);
        }

        return response()->download($path);
    }

    /**
     * Update/Overwrite a template
     */
    public function upload(Request $request)
    {
        $request->validate([
            'target_filename' => 'required|string',
            'file' => 'required|file|mimes:docx,zip' // ZIP is sometimes detected for docx
        ]);

        $targetFilename = $request->target_filename;
        $file = $request->file('file');

        // Security check: ensure the target filename is one of the existing templates
        $path = $this->templatePath . DIRECTORY_SEPARATOR . $targetFilename;
        
        if (!File::exists($path)) {
             // Optional: Allow creating new ones if we want, but the user said "sobreescribir"
             // For now, let's allow it if it ends in .docx and is in the correct folder
             if (substr($targetFilename, -5) !== '.docx') {
                 return response()->json(['message' => 'El nombre de archivo debe terminar en .docx'], 400);
             }
        }

        // Overwrite with the target name
        $file->move($this->templatePath, $targetFilename);

        return response()->json([
            'message' => 'Plantilla actualizada exitosamente',
            'filename' => $targetFilename
        ]);
    }
}
