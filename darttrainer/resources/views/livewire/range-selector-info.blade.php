
    <div class=" items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20]    dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]" style="padding: 20px">
        <div class="bg-white p-8 rounded w-full max-w-md">
            <div class="mb-4">
                <label for="from" class="block text-sm font-medium text-gray-700">From</label>
                @error('from')
                <span class="text-red-500 text-xs"> {{ $message }}</span>
                @enderror
                <input type="number" id="from" wire:model="from" min="2" value="{{ $from }}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <input type="range" id="rangeFrom" min="2" max="330" value="{{ $from }}" step="1" wire:model.live="from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div class="mb-4">
                <label for="to" class="block text-sm font-medium text-gray-700">To</label>
                @error('to')
                    <span class="text-red-500 text-xs"> {{ $message }}</span>
                @enderror
                <input type="number" id="to" wire:model="to" min="3" value="{{ $to }}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <input type="range" id="rangeTo" min="3" max="350" value="{{ $to }}" step="1" wire:model.live="to" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
    </div>



