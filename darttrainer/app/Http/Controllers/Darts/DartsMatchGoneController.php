<?php

namespace App\Http\Controllers\Darts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DartsMatchGoneController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('darts/MatchGone', [
            'reason' => $request->query('reason', 'gone'),
        ]);
    }
}
