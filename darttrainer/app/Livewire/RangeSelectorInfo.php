<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameCloseTheNumberElement;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Rule;
use Livewire\Component;

class RangeSelectorInfo extends Component
{
    #[Rule('required|integer|min:2|max:330')]
    public int $starting_number = 2;
    #[Rule('required|integer|min:3|max:350')]
    public int $ending_number = 3;
    public int $player_id;
    #[Rule('string|max:255')]
    public string $session_id;
    public string $game_button = 'Play';
    public int $upcoming_number;
    public bool $game_started = false;
    public $player_game = null;

    public function startGame()
    {

        $this->session_id = session()->getId();
        $game = GameCloseTheNumber::where('session_id', $this->session_id)
            ->where('finished', 0)
            ->first();
        $finished_game = GameCloseTheNumber::where('session_id', $this->session_id)
            ->where('finished', 1)
            ->first();

        if (Auth::check()) {
            $this->player_game = GameCloseTheNumber::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
        }

        if ($game === null && $finished_game === null && $this->player_game === null) {
            $validated = $this->validate();
            $game = GameCloseTheNumber::create($validated);
            if (Auth::check()) {
                // Get the logged-in user's ID and assign it to player_id
                $game->player_id = Auth::id();
                $game->save();
            }
            for ($i = $validated['starting_number']; $i <= $validated['ending_number']; $i++) {
                $game_element = new GameCloseTheNumberElement();
                $game_element->game_id = $game->id;
                $game_element->given_number = $i;
                $game_element->save();
            }
        }

        session()->flash('game_started', 'Game started!');

        return redirect()->to('/close-the-number');
    }

    public function controlInputs(): void
    {
        if ($this->starting_number < 2) {
            $this->starting_number = 2;
        }

        if ($this->ending_number < 3) {
            $this->ending_number = 3;
        }

        if ($this->ending_number < $this->starting_number) {
            $this->ending_number = $this->starting_number + 20;
        }

    }

    public function render(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        $this->session_id = session()->getId();

        $game = GameCloseTheNumber::where('session_id', $this->session_id)
            ->where('finished', 0)
            ->first();

        $finished_game = GameCloseTheNumber::where('session_id', $this->session_id)
            ->where('finished', 1)
            ->first();

        if (Auth::check()) {
            if ($game) {
                if ($game->player_id === Auth::id()) {
                    $game->player_id = Auth::id();
                    $game->save();
                }
            } else {
                $game = GameCloseTheNumber::where('player_id', Auth::id())
                    ->where('finished', 0)
                    ->first();
            }
        } else {
            if ($finished_game) {
                $this->game_button = 'View results';
            }
        }



        if ($game) {
            $this->game_started = true;
            $this->game_button = 'Continue';
            $this->starting_number = $game->starting_number;
            $this->ending_number = $game->ending_number;
            $this->upcoming_number =$game->activeElement->given_number;
        }
        $this->controlInputs();
        return view('livewire.range-selector-info');
    }
}
