<?php

namespace App\Livewire;

use Livewire\Component;

class RangeSelector extends Component
{
    public $from = 50;
    public $to = 70;

    public function startGame()
    {
        var_dump($this->from);
    }

    public function updatedFrom($value)
    {
        $this->to = $value + 1;
    }

    public function updatedTo($value)
    {
        $this->from = $value - 1;
    }

    public function render()
    {
        return view('livewire.range-selector');
    }
}
