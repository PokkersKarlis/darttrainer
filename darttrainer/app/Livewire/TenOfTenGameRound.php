<?php

namespace App\Livewire;

use App\Models\GameTenOfTen;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class TenOfTenGameRound extends Component
{
    public $game;

    public $counter_active = false;

    public $results = false;

    public const DART_COUNT_MISS = -1;
    public const GAME_STATUS_FINISHED_OUT_OF_RANGE = -2;

    public function render()
    {
        $session_id = session()->getId();
        $game = GameTenOfTen::where('session_id', $session_id)
            ->where('finished', 0)
            ->first();

        $finished_game = GameTenOfTen::where('session_id', $session_id)
            ->where('finished', 1)
            ->first();

        if ($finished_game) {
            if (!Auth::check()) {
                $this->results = true;
                $this->game = $finished_game;
            }
        }

        if (Auth::check()) {
            $active_game = GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
            if($active_game) {
                $game = $active_game;
            }
            $finished_game = GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 1)
                ->first();
            if ($finished_game) {
                $this->results = true;
                $this->game = $finished_game;
                return view('livewire.ten-of-ten-game-round');
            }
        }

        if($game) {
            $this->game = $game;
            if($this->game->activeElement->darts_count === 0){
                $this->counter_active = true;
            }
        }

        return view('livewire.ten-of-ten-game-round');
    }
}
