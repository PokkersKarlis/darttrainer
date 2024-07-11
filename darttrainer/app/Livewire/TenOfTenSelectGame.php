<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameTenOfTen;
use App\Models\GameTenOfTenElement;
use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Rule;
use Livewire\Component;

class TenOfTenSelectGame extends Component
{
    #[Rule('string|max:255')]
    public $session_id;
    #[Rule('required|integer|min:1|max:4')]
    public $game_type;

    public $player_game;
    public const GAME_TYPE_SINGLES = 1;
    public const GAME_TYPE_DOUBLES = 2;
    public const GAME_TYPE_TRIPLES = 3;
    public const GAME_TYPE_MIXED = 4;

    public const OUTER_FIELDS = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ];
    public const GREEN = -1;
    public const BULL = -2;

    public function startGame($type)
    {
        $this->game_type = $type;

        $this->session_id = session()->getId();
        $game = GameTenOfTen::where('session_id', $this->session_id)
            ->where('finished', 0)
            ->first();
        $finished_game = GameTenOfTen::where('session_id', $this->session_id)
            ->where('finished', 1)
            ->first();

        if (Auth::check()) {
            $this->player_game = GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
        }

        if ($game === null && $finished_game === null && $this->player_game === null) {
            $validated = $this->validate();
            $game = GameTenOfTen::create($validated);
            if (Auth::check()) {
                // Get the logged-in user's ID and assign it to player_id
                $game->player_id = Auth::id();
                $game->save();
            }
            $game_elements = self::OUTER_FIELDS;
            switch ($this->game_type) {
                case self::GAME_TYPE_SINGLES:
                    $game_elements[] = self::GREEN;
                    break;
                    case self::GAME_TYPE_DOUBLES:
                        $game_elements[] = self::BULL;
                        break;
                case self::GAME_TYPE_MIXED:
                    $game_elements[] = self::GREEN;
                    $game_elements[] = self::BULL;
                    break;
            }


            $shuffled_game_elements = array_rand($game_elements, 10);

            shuffle($shuffled_game_elements);
            $random_values = [];

            foreach ($shuffled_game_elements as $shuffled_game_element) {
                $random_values[] = $game_elements[$shuffled_game_element];
            }

            foreach ($random_values as $shuffled_game_element) {
                $game_element_model = new GameTenOfTenElement();
                $game_element_model->game_id = $game->id;
                $game_element_model->given_number = $shuffled_game_element;
                if ($shuffled_game_element === self::GREEN) {
                    $game_element_model->given_number_type = self::GAME_TYPE_SINGLES;
                } elseif ($shuffled_game_element === self::BULL) {
                    $game_element_model->given_number_type = self::GAME_TYPE_DOUBLES;
                } else {
                    $game_element_model->given_number_type = $this->game_type === self::GAME_TYPE_MIXED ? rand(1, 3): $this->game_type;
                }
                $game_element_model->save();
            }
        }

        session()->flash('game_started', 'Game started!');

        return redirect()->to('/ten-of-ten');
    }

    public function render()
    {
        return view('livewire.ten-of-ten-select-game');
    }
}
