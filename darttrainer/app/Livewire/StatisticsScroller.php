<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameTenOfTen;
use App\Models\User;
use Livewire\Component;

class StatisticsScroller extends Component
{
    public $closing_game = [];

    public $ten_of_ten_game = [];


    public function render()
    {
        $top_three_closing_game_ids = GameCloseTheNumber::select('player_id')
            ->selectRaw('COUNT(*) as count')
            ->where('finished', 2)
            ->groupBy('player_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get();

        if (!empty($top_three_closing_game_ids)) {
            foreach ($top_three_closing_game_ids as $i => $game) {
                $this->closing_game[$i]['name'] = User::where('id', $game->player_id)->first()->name;
                $this->closing_game[$i]['count'] = $game->count;
            }
        }

        $top_three_ten_of_ten_game_ids = GameTenOfTen::select('player_id')
            ->selectRaw('COUNT(*) as count')
            ->where('finished', 2)
            ->groupBy('player_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get();

        if (!empty($top_three_ten_of_ten_game_ids)) {
            foreach ($top_three_ten_of_ten_game_ids as $i => $game) {
                $this->ten_of_ten_game[$i]['name'] = User::where('id', $game->player_id)->first()->name;
                $this->ten_of_ten_game[$i]['count'] = $game->count;
            }
        }

        return view('livewire.statistics-scroller');
    }
}
