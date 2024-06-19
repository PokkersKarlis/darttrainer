<?php

namespace App\Livewire;

use Livewire\Component;

class RangeSelectorInfo extends Component
{
    public $from = 2;
    public $to = 22;

    protected $listeners = ['updatedFromTo' => '$refresh'];

    public function updatedFrom($value)
    {
        // Adjust 'to' value based on 'from' value
        $this->to = $value + 20;

        // Emit event to update the UI
        $this->emit('updatedFromTo');
    }

    public function updatedTo($value)
    {
        // Adjust 'from' value based on 'to' value
        $this->from = $value - 20;

        // Emit event to update the UI
        $this->emit('updatedFromTo');
    }

    public function render()
    {
        return view('livewire.range-selector-info');
    }
}
