<?php

namespace App\Http\Controllers;

use App\Livewire\TenOfTenSelectGame;
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
        }

        $area = '';
        if ($game) {
            if ($game->activeElement !== null) {
                switch ($game->activeElement->given_number_type) {
                    case TenOfTenSelectGame::GAME_TYPE_SINGLES:
                        $area = 's' . $game->activeElement->given_number;
                        if ($game->activeElement->given_number === TenOfTenSelectGame::GREEN) {
                            $area = 'Outer';
                        }
                        break;
                    case TenOfTenSelectGame::GAME_TYPE_DOUBLES:
                        $area = 'd' . $game->activeElement->given_number;
                        if ($game->activeElement->given_number === TenOfTenSelectGame::BULL) {
                            $area = 'Bull';
                        }
                        break;
                    case TenOfTenSelectGame::GAME_TYPE_TRIPLES:
                        $area = 't' . $game->activeElement->given_number;
                        break;
                }
            }
        }

        if ($game || $finished_game) {
            return view('livewire.game-ten-of-ten-game', ['game' => $game, 'active_number' => $area]);
        }


        session()->flash('game_error', 'Something went wrong... please contact the administrator');
        return redirect()->to('/');
    }
}
