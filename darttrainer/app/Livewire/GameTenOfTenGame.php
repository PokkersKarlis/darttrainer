<?php

namespace App\Livewire;

use Livewire\Component;

class GameTenOfTenGame extends Component
{
    public $active_number;

    public function mount($active_number)
    {
        $this->active_number = $active_number;
    }

    public function render()
    {
        return view('livewire.game-ten-of-ten-game');
    }
}
