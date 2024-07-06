<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameCloseTheNumberElement;
use Livewire\Component;

class CloseTheNumberGameRound extends Component
{
    public $game;

    public $counter_active = false;

    public $results = false;

    public const DART_COUNT_MISS = -1;
    public const GAME_STATUS_FINISHED_OUT_OF_RANGE = -2;

    public $try_count = 2;

    public function setValue($number)
    {
        switch ($number) {
            case self::DART_COUNT_MISS:
                $this->counter_active = false;
                session()->flash('round_selected_miss', 'Try count: ' . $this->try_count  . '. Number: ' . $this->game->activeElement->given_number . ' . Darts count: miss. Close the number without register dart count.
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
            $this->game->finished = 1;
            $this->game->save();
            $this->results = true;
            session()->flash('game_end', 'Game finished');
            //return redirect()->to('/');
        }
        $this->try_count = $this->try_count + 1;
        return view('livewire.close-the-number-game-round');
    }

    public function endGame($id)
    {
        GameCloseTheNumberElement::where('game_id', $id)->delete();
        GameCloseTheNumber::where('id', $id)->delete();
        session()->flash('game_end', 'Game finished!');
        return redirect()->to('/');
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
            $this->results = true;
            $this->game = $finished_game;
        }
        if($game) {
            $this->game = $game;
            if($this->game->activeElement->darts_count === 0){
                $this->counter_active = true;
            }
        }

        return view('livewire.close-the-number-game-round');
    }
}
