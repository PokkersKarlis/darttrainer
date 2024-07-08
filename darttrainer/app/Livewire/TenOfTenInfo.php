<?php

namespace App\Livewire;

use Livewire\Component;

class TenOfTenInfo extends Component
{
    public $game_selector = false;
    public function selectGame()
    {
        $this->game_selector = true;
    }

    public function startGame($type)
    {
        dump('$type');
    }

    public function render()
    {
        return view('livewire.ten-of-ten-info');
    }
}
