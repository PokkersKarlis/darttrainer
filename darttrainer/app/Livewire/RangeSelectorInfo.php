<?php

namespace App\Livewire;

use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Livewire\Component;

class RangeSelectorInfo extends Component
{
    public int $from = 2;
    public int $to = 22;

    public function controlInputs(): void
    {
        if ($this->from - 20 < 2) {
            $this->from = 2;
        }

        if ($this->from >= $this->to || $this->to - 20 < 3) {
            if ($this->from - 20 < 2) {
                $this->to = 3;
            } else {
                $this->to = $this->from + 20;
            }
        }
    }

    public function xx ()
    {
        $this->validate([
           'from' => 'required|integer|min:2',
           'to' => 'required|integer|min:3',
        ]);
    }



    public function render(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        $this->controlInputs();
        return view('livewire.range-selector-info');
    }
}
