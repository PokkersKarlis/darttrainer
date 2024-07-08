<?php

namespace App\Http\Controllers;

use App\Models\GameTenOfTen;
use Illuminate\Support\Facades\Auth;

class TenOfTenGameController extends Controller
{
    public function index()
    {
        $session_id = session()->getId();

        $game = GameTenOfTen::where('session_id', $session_id)
            ->where('finished', 0)
            ->first();

        $finished_game = GameTenOfTen::where('session_id', $session_id)
            ->where('finished', 1)
            ->first();

        if (Auth::check()) {
            $game = GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
            return view('livewire.game-ten-of-ten-game', ['game' => $game]);
        }

        if ($game || $finished_game) {
            return view('livewire.game-ten-of-ten-game', ['game' => $game]);
        }
        session()->flash('game_error', 'Something went wrong... please contact the administrator');
        return redirect()->to('/');
    }
}
