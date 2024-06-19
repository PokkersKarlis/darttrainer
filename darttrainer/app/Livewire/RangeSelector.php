<?php

namespace App\Livewire;

use Livewire\Component;

class RangeSelector extends Component
{
    public $from = 50;
    public $to = 70;

    public function updatedFrom($value)
    {
        $this->to = $value + 20;
    }

    public function updatedTo($value)
    {
        $this->from = $value - 20;
    }

    public function render()
    {
        return view('livewire.range-selector');
    }
}
