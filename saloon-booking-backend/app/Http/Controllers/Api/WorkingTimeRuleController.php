<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorkingTimeRuleRequest;
use App\Models\WorkingTimeRule;

class WorkingTimeRuleController extends Controller
{
    public function index()
    {
        return WorkingTimeRule::orderBy('date')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    public function store(StoreWorkingTimeRuleRequest $request)
    {
        if (!$request->filled('day_of_week') && !$request->filled('date')) {
            return response()->json([
                'message' => 'Either day_of_week or date must be provided.',
            ], 422);
        }

        $data = $request->validated();

        $query = WorkingTimeRule::query();
        if (isset($data['date'])) {
            $query->where('date', $data['date']);
        } else {
            $query->where('day_of_week', $data['day_of_week'])->whereNull('date');
        }

        $isOverlapping = $query->where(function ($q) use ($data) {
            $q->where('start_time', '<', $data['end_time'])
              ->where('end_time', '>', $data['start_time']);
        })->exists();

        if ($isOverlapping) {
            return response()->json([
                'message' => 'This rule overlaps with an existing working time rule.',
            ], 422);
        }

        $rule = WorkingTimeRule::create($data);

        return response()->json([
            'message' => 'Working time rule created.',
            'data' => $rule,
        ], 201);
    }

    public function destroy($id)
    {
        $rule = WorkingTimeRule::find($id);
        if (!$rule) {
            return response()->json(['message' => 'Rule not found.'], 404);
        }
        
        $rule->delete();
        
        return response()->json(['message' => 'Rule deleted successfully.']);
    }
}
