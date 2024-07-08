<div
    class="items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20]    dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"
    style="padding: 20px">
    @if($game_started)
        <div class="w-full flex">
            <div class="w-1/2 flex justify-center items-center">
                <h1 class="text-center text-2xl font-bold">Starting number: <span style="color: #1a202c">{{ $starting_number }}</span></h1>
            </div>
            <div class="w-1/2 flex justify-center items-center">
                <h1 class="text-center text-2xl font-bold">Ending number: <span style="color: #1a202c">{{ $ending_number }}</span></h1>
            </div>
        </div>
        <div class="w-full flex justify-center items-center">
            <h1 class="text-center text-2xl text-green-700 font-bold">Upcoming number: {{ $upcoming_number }}</h1>
        </div>
    @else
    <div class="bg-white p-8 rounded w-full max-w-md">
        <div class="mb-4">
            <label for="from" class="block text-sm font-medium text-gray-700">From</label>
            @error('starting_number')
            <span class="text-red-500 text-xs"> {{ $message }}</span>
            @enderror
            <input type="number" id="from" wire:model="starting_number" name="starting_number" min="2" value="{{ $starting_number }}"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            <input type="range" id="rangeFrom" min="2" max="330" value="{{ $starting_number }}" step="1" wire:model.live="starting_number"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
        <div class="mb-4">
            <label for="to" class="block text-sm font-medium text-gray-700">To</label>
            @error('ending_number')
            <span class="text-red-500 text-xs"> {{ $message }}</span>
            @enderror
            <input type="number" id="to" wire:model="ending_number" name="ending_number" min="3" value="{{ $ending_number }}"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            <input type="range" id="rangeTo" min="3" max="350" value="{{ $ending_number }}" step="1" wire:model.live="ending_number"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>
    </div>
    @endif
    @if(!Auth::check())
        <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
            <p class="font-bold">Play without registration</p>
            <p>Game is based on user session. There will be statistics only for single game. If You want to collect statistics for every game, please register and use dashboard playground!</p>
        </div>
    @endif
    <button wire:click.prevent="startGame" class="button singles" type="submit">{{ $game_button }}</button>
</div>



