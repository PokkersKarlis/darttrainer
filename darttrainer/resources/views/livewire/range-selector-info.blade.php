
    <div class=" items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20]    dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]" style="padding: 20px">
        <div class="bg-white p-8 rounded w-full max-w-md">
            <div class="mb-4">
                <label for="from" class="block text-sm font-medium text-gray-700">From</label>
                <input type="number" id="from" wire:model="from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <input type="range" id="rangeFrom" min="2" max="330" step="1" wire:model="from" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div class="mb-4">
                <label for="to" class="block text-sm font-medium text-gray-700">To</label>
                <input type="number" id="to" wire:model="to" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <input type="range" id="rangeTo" min="3" max="350" step="1" wire:model="to" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            document.addEventListener('livewire:load', function () {
                Livewire.hook('message.sent', (message, component) => {
                    updateRangeInputs();
                });

                function updateRangeInputs() {
                    var rangeInputFrom = document.getElementById('rangeFrom');
                    var rangeInputTo = document.getElementById('rangeTo');
                    var fromInput = document.getElementById('from');
                    var toInput = document.getElementById('to');

                    rangeInputFrom.value = fromInput.value;
                    rangeInputTo.value = toInput.value;
                }

                Livewire.on('updatedFromTo', () => {
                    updateRangeInputs();
                });
            });
        </script>
    @endpush


