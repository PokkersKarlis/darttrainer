<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameCloseTheNumberElement;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class CloseTheNumberGameRound extends Component
{
    public $game;

    public $counter_active = false;

    public $results = false;

    public $finished_rounds = false;

    public $round = 1;

    public $round_count = 0;

    public const DART_COUNT_MISS = -1;
    public const GAME_STATUS_FINISHED_OUT_OF_RANGE = -2;

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
        if ($this->game->activeElement->given_number === $this->game->ending_number && ($number > 0 || $number ===  self::GAME_STATUS_FINISHED_OUT_OF_RANGE)) {
            if (Auth::check()) {
                $this->game->finished = 2;
            } else {
                $this->game->finished = 1;
            }
            $this->game->save();
            $this->results = true;
            session()->flash('game_end', 'Game finished');
            return redirect()->to('/');
        }
        $this->finished_rounds = true;
        sleep(0.5);
        return view('livewire.close-the-number-game-round');
    }

    public function endGame($id)
    {
        if (!Auth::check()) {
            GameCloseTheNumberElement::where('game_id', $id)->delete();
            GameCloseTheNumber::where('id', $id)->delete();
        } else {
            session()->flash('game_end', 'Game ended!');
        }

        return redirect()->to('/');
    }

    public function pauseGame($id)
    {
        if (!Auth::check()) {
            GameCloseTheNumberElement::where('game_id', $id)->delete();
            GameCloseTheNumber::where('id', $id)->delete();
        } else {
            session()->flash('game_end', 'Game paused!');
        }

        return redirect()->to('/');
    }

    public function undo()
    {
        $round = $this->game->lastUpdatedElement;
        if ($round !== null) {
            $round->darts_count = 0;
            $round->save();
            $this->game->refresh();
            $round = $this->game->lastUpdatedElement;
            if ($round === null) {
                $this->finished_rounds = false;
            }
        } else {
            $this->finished_rounds = true;
        }

        return view('livewire.ten-of-ten-game-round');
    }

    public function render()
    {
        $session_id = session()->getId();
        $game = GameCloseTheNumber::where('session_id', $session_id)
            ->where('finished', 0)
            ->first();

        $finished_game = GameCloseTheNumber::where('session_id', $session_id)
            ->where('finished', 1)
            ->first();

        if ($finished_game) {
            if (!Auth::check()) {
                $this->results = true;
                $this->game = $finished_game;
            }
        }

        if (Auth::check()) {
            $active_game = GameCloseTheNumber::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
            if($active_game) {
                $game = $active_game;
            }
            $finished_game = GameCloseTheNumber::where('player_id', Auth::id())
                ->where('finished', 1)
                ->first();
            if ($finished_game) {
                $this->results = true;
                $this->game = $finished_game;
                return view('livewire.close-the-number-game-round');
            }
        }

        if($game) {
            $this->game = $game;
            if($this->game->activeElement->darts_count === 0){
                $this->counter_active = true;
            }
            $round = $this->game->lastUpdatedElement;
            if ($round === null) {
                $this->finished_rounds = true;
            } else {
                $this->finished_rounds = false;
            }
            $this->round = 1 + count($this->game->finishedElements);
            $this->round_count = count($this->game->allElements);
        }

        return view('livewire.close-the-number-game-round');
    }
}
