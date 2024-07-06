<?php

namespace App\Http\Controllers;

use App\Models\GameCloseTheNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClosingGameController extends Controller
{
    public function index()
    {
//        if (Auth::check()) {
//            session()->flash('authenticated', '');
//            return redirect()->route('home');
//        }

        $session_id = session()->getId();

        $game = GameCloseTheNumber::where('session_id', $session_id)
            ->where('finished', 0)
            ->first();

        $finished_game = GameCloseTheNumber::where('session_id', $session_id)
            ->where('finished', 1)
            ->first();

        if ($game || $finished_game) {
            return view('livewire.game-close-the-number-game', ['game' => $game]);
        }
        session()->flash('game_error', 'Something went wrong... please contact the administrator');
        return redirect()->to('/');
    }
}
