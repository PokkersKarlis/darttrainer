<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Games') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                <div class="p-4">
                    <livewire:random-darts />
                </div>
                <div class="p-4">
                    <livewire:range-selector />
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
