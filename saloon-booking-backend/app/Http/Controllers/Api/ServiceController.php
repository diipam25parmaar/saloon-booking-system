<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::with('category')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'numeric|min:0',
            'is_active' => 'boolean'
        ]);

        $service = Service::create($data);
        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'duration_minutes' => 'sometimes|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'numeric|min:0',
            'is_active' => 'boolean'
        ]);

        $service->update($data);
        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}
