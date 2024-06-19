<div class="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"  style="padding: 20px">
    <div class="bg-white p-8 rounded w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Close the numbers</h2>
        <div class="mb-4">
            <label for="from" class="block text-sm font-medium text-gray-700">From</label>
            <input type="number" id="from" name="from" wire:model.debounce.500ms="from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div class="mb-4">
            <label for="to" class="block text-sm font-medium text-gray-700">To</label>
            <input type="number" id="to" name="to" wire:model.debounce.500ms="to" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div class="mb-4">
            <label for="range" class="block text-sm font-medium text-gray-700">Select Range</label>
            <input type="range" id="range" min="0" max="350" step="20" wire:model="from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <button class="button singles" disabled>Play</button>

    @push('scripts')
        <script>
            document.addEventListener('livewire:load', function () {
                var rangeInput = document.getElementById('range');
                var fromInput = document.getElementById('from');
                var toInput = document.getElementById('to');

                rangeInput.addEventListener('input', function () {
                    var value = parseInt(this.value);
                    fromInput.value = value;
                    toInput.value = value + 20;
                });

                fromInput.addEventListener('input', function () {
                    var value = parseInt(this.value);
                    rangeInput.value = value;
                    toInput.value = value + 20;
                });

                toInput.addEventListener('input', function () {
                    var value = parseInt(this.value);
                    rangeInput.value = value - 20;
                    fromInput.value = value - 20;
                });
            });
        </script>
    @endpush

</div>
