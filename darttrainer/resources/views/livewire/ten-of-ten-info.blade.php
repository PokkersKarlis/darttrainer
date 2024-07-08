<div>
    <div id="screenshot-container" class="relative flex w-full items-stretch">
        @if($game_selector)
            <livewire:ten-of-ten-select-game>
                @else
                    <livewire:ten-of-ten-board>
        @endif
    </div>
    <div class="w-full shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05]">
        @if(!Auth::check())
            <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                <p class="font-bold">Play without registration</p>
                <p>Game is based on user session. There will be statistics only for single game. If You want to collect
                    statistics for every game, please register and use dashboard playground!</p>
            </div>
        @endif
        @if(!$game_selector)
            <button wire:click.prevent="selectGame" class="button singles" type="submit">Play</button>
        @endif
    </div>
</div>

