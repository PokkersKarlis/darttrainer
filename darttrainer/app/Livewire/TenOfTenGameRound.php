<?php

namespace App\Livewire;

use App\Models\GameTenOfTen;
use App\Models\GameTenOfTenElement;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class TenOfTenGameRound extends Component
{
    public $game;

    public $counter_active = false;

    public $results = false;

    public $area = null;

    public const DART_COUNT_MISS = -1;
    public const GAME_STATUS_FINISHED_OUT_OF_RANGE = -2;
    #[Reactive]
    public $active_number;

    public function mount($active_number)
    {
        $this->active_number = $active_number;
    }

    public function setValue($number)
    {
        switch ($number) {
            case self::DART_COUNT_MISS:
                $this->counter_active = false;
                session()->flash('round_selected_miss', 'Number: ' . $this->game->activeElement->given_number . ' . Darts count: miss. Close the number without register dart count.
                Result saved successfully!');
                break;
            case self::GAME_STATUS_FINISHED_OUT_OF_RANGE:
                session()->flash('round_selected', 'Number: ' . $this->game->activeElement->given_number . ' . Number closed! Result saved successfully!');
                break;
            case ($number > 0):
                session()->flash('round_selected', 'Number: ' . $this->game->activeElement->given_number . ' . Darts count: ' . $number . '. Result saved successfully!');
                break;
        }

        $this->game->activeElement->darts_count = $number;
        $this->game->activeElement->save();
        $this->game->refresh();
        if ($this->game->activeElement === null && ($number > 0 || $number === self::GAME_STATUS_FINISHED_OUT_OF_RANGE)) {
            if (Auth::check()) {
                $this->game->finished = 2;
            } else {
                $this->game->finished = 1;
            }
            $this->game->save();
            $this->results = true;
            session()->flash('game_end', 'Game finished');
        } else {
            switch ($this->game->activeElement->given_number_type) {
                case TenOfTenSelectGame::GAME_TYPE_SINGLES:
                    $this->area = 's' . $this->game->activeElement->given_number;
                    if ($this->game->activeElement->given_number === TenOfTenSelectGame::GREEN) {
                        $this->area = 'Outer';
                    }
                    break;
                case TenOfTenSelectGame::GAME_TYPE_DOUBLES:
                    $this->area = 'd' . $this->game->activeElement->given_number;
                    if ($this->game->activeElement->given_number === TenOfTenSelectGame::BULL) {
                        $this->area = 'Bull';
                    }
                    break;
                case TenOfTenSelectGame::GAME_TYPE_TRIPLES:
                    $this->area = 't' . $this->game->activeElement->given_number;
                    break;
            }
            $this->active_number = $this->area;
        }
        return view('livewire.ten-of-ten-game-round', ['active_number' => $this->area]);
    }

    public function endGame()
    {
        if (!Auth::check()) {
            GameTenOfTenElement::where('game_id', $this->game->id)->delete();
            GameTenOfTen::where('id', $this->game->id)->delete();
            session()->flash('game_end', 'Game ended!');
        } else {
            session()->flash('game_end', 'Game ended!');
        }

        return redirect()->to('/');
    }

    public function pauseGame()
    {
        if (!Auth::check()) {
            GameTenOfTenElement::where('game_id', $this->game->id)->delete();
            GameTenOfTen::where('id', $this->game->id)->delete();
            session()->flash('game_end', 'Game ended!');
        } else {
            session()->flash('game_end', 'Game paused!');
        }

        return redirect()->to('/');
    }

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
            if ($active_game) {
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

        if ($game) {
            $this->game = $game;
            if ($this->game->activeElement !== null) {
                if ($this->game->activeElement->darts_count === 0) {
                    $this->counter_active = true;
                }
                switch ($this->game->activeElement->given_number_type) {
                    case TenOfTenSelectGame::GAME_TYPE_SINGLES:
                        $this->area = 's' . $this->game->activeElement->given_number;
                        if ($this->game->activeElement->given_number === TenOfTenSelectGame::GREEN) {
                            $this->area = 'Outer';
                        }
                        break;
                    case TenOfTenSelectGame::GAME_TYPE_DOUBLES:
                        $this->area = 'd' . $this->game->activeElement->given_number;
                        if ($this->game->activeElement->given_number === TenOfTenSelectGame::BULL) {
                            $this->area = 'Bull';
                        }
                        break;
                    case TenOfTenSelectGame::GAME_TYPE_TRIPLES:
                        $this->area = 't' . $this->game->activeElement->given_number;
                        break;
                }
            }
        }
        return view('livewire.ten-of-ten-game-round', [
            'active_number' => $this->area,
        ]);
    }
}
