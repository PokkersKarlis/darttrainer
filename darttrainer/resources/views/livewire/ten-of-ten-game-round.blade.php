@php use Illuminate\Support\Facades\Auth; @endphp
<div>
    <div class="min-h-full">
        @if ($results)
            <div id="modal" class="fixed z-50 inset-0 flex items-center justify-center modal">
                <div class="fixed inset-0 transition-opacity">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div
                    class="bg-white rounded-lg text-left shadow-xl transform transition-all w-4/5 h-4/5 sm:w-3/4 sm:h-3/4 max-h-screen overflow-auto">
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button wire:click="endGame({{ $game->id }})"
                                type="button"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Finish game
                        </button>
                    </div>
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 overflow-auto">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Results:
                        </h3>
                        <div class="mt-2">
                            <ul class="list-disc list-inside flex flex-wrap justify-center"
                                style="color: #1a202c; list-style: none; padding: 0;">
                                @foreach($game->finishedElements as $game_element)
                                    <li class="rounded inline-block"
                                        style="border: 2px solid darkgreen; padding: 5px; margin: 5px; background-color: white; display: flex; flex-direction: column; align-items: center;">
                                        <div
                                            style="border: 2px solid black; border-radius: 5px; background-color: {{ $game_element->darts_count > 0 ? 'darkgreen' : 'red' }}; padding: 5px; font-weight: bold; width: 100%; text-align: center;">
                                            Given number :
                                            <span
                                                style="background-color: lightgray; padding: 5px; border: 2px solid black; display: inline-block; margin-top: 5px;">
                                    {{ $game_element->given_number }}
                                </span>
                                        </div>
                                        <div
                                            style="border: 2px solid black; border-radius: 5px; background-color:{{ $game_element->darts_count > 0 ? 'darkgreen' : 'red' }}; padding: 5px; font-weight: bold; width: 100%; text-align: center; margin-top: 5px;">
                                            Dart count :
                                            <span
                                                style="background-color: {{ $game_element->darts_count > 0 ? 'lightgreen' : 'lightcoral' }}; padding: 5px; border: 2px solid black; display: inline-block; margin-top: 5px;">
                                    {{ $game_element->darts_count > 0 ? $game_element->darts_count : 'miss'}}
                                </span>
                                        </div>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button wire:click="endGame({{ $game->id }})"
                                type="button"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Finish game
                        </button>
                    </div>
                </div>
            </div>

        @else
            <header class="bg-white shadow">
                <div class="max-w-7xl ">
                    @if(session('game_started'))
                        <div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
                             role="alert">
                            <div class="flex items-center justify-center">
                                <div class="py-1">
                                    <svg class="fill-current h-6 w-6 text-teal-500 mr-4"
                                         xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20">
                                        <path
                                            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-bold">{{ session('game_started') }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                    @if(session('round_selected'))
                        <div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
                             role="alert">
                            <div class="flex items-center justify-center">
                                <div class="py-1">
                                    <svg class="fill-current h-6 w-6 text-teal-500 mr-4"
                                         xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20">
                                        <path
                                            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-bold">{{ session('round_selected') }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                    @if(session('round_selected_miss'))
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 shadow-md" role="alert">
                            <div class="flex items-center justify-center">
                                <div class="py-1">
                                    <svg class="fill-current h-6 w-6 text-teal-500 mr-4"
                                         xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20"
                                         wire:loading>
                                        <path
                                            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                                    </svg>

                                </div>
                                <div>
                                    <p class="font-bold">{{ session('round_selected_miss') }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </header>
            <main class="h-full flex flex-col">
                <!-- First Row: Split into Two Pieces -->
                <div class="flex-1 flex bg-gray-100 p-4">
                    <!-- Left Side with "Hello World" -->
                    <div class="flex-1 flex items-center justify-center">
                        <livewire:ten-of-ten-board-active>
                    </div>
                    <!-- Right Side with Active Element -->
                    <div class="flex-1 flex items-center justify-center">
                        <div class="text-8xl font-bold text-green-800">
                            {{ $game->activeElement->given_number }}
                        </div>
                    </div>
                </div>
                <!-- Second Row: Three Sections -->
                <div class="bg-gray-200 p-4 space-y-4">
                    @if($counter_active)
                        <div class="grid grid-cols-1 gap-4">
                            <!-- First Row -->
                            <div class="grid grid-cols-4 gap-4">
                                @for ($i = 1; $i <= 4; $i++)
                                    <button wire:click="setValue({{ $i }})"
                                            class="flex items-center justify-center px-2 py-2 rounded-md text-black font-bold bg-white border border-green-800 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="h-5 w-5 mr-2">
                                            <path fill="#00c4b3"
                                                  d="M35.2 34.9l-8.3-8.3v59.7l.1 2.8c0 1.3.2 2.8.7 4.3l65.6 23.1 16.3-7.2-74.4-74.4z"/>
                                            <path
                                                d="M27.7 93.4zm81.9 15.9l-16.3 7.2-65.4-23.1c1.3 4.8 4 10.1 7 13.2l21.3 21.2 47.6.1 5.8-18.6z"
                                                fill="#22d3c5"/>
                                            <path fill="#0075c9"
                                                  d="M1.7 65.1C-.4 67.3.7 72 4 75.5l14.7 14.8 9.2 3.3c-.3-1.5-.7-3-.7-4.3l-.1-2.8-.2-59.8m82.7 82.6l7.2-16.4-23-65.6c-1.5-.3-3-.6-4.3-.7l-2.9-.1-59.6.1"/>
                                            <path
                                                d="M93.6 27.3c.2 0 .2 0 0 0 .2 0 .2 0 0 0zm16 82l17.7-5.8V54.8l-20.4-20.5c-3-3-8.3-5.8-13.2-7l23.1 65.6"
                                                fill="#00a8e1"/>
                                            <path fill="#00c4b3"
                                                  d="M90.5 18.2L75.7 3.5c-3.4-3.4-8-4.4-10.4-2.3L26.9 26.6h59.5l2.9.1c1.3 0 2.8.2 4.3.7l-3.1-9.2z"/>
                                        </svg>
                                        {{ $i }}
                                    </button>
                                @endfor
                            </div>

                            <!-- Second Row -->
                            <div class="grid grid-cols-4 gap-4">
                                @for ($i = 5; $i <= 8; $i++)
                                    <button wire:click="setValue({{ $i }})"
                                            class="flex items-center justify-center px-1 py-2 rounded-md text-black font-bold bg-white border border-green-800 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="h-5 w-5 mr-2">
                                            <path fill="#00c4b3"
                                                  d="M35.2 34.9l-8.3-8.3v59.7l.1 2.8c0 1.3.2 2.8.7 4.3l65.6 23.1 16.3-7.2-74.4-74.4z"/>
                                            <path
                                                d="M27.7 93.4zm81.9 15.9l-16.3 7.2-65.4-23.1c1.3 4.8 4 10.1 7 13.2l21.3 21.2 47.6.1 5.8-18.6z"
                                                fill="#22d3c5"/>
                                            <path fill="#0075c9"
                                                  d="M1.7 65.1C-.4 67.3.7 72 4 75.5l14.7 14.8 9.2 3.3c-.3-1.5-.7-3-.7-4.3l-.1-2.8-.2-59.8m82.7 82.6l7.2-16.4-23-65.6c-1.5-.3-3-.6-4.3-.7l-2.9-.1-59.6.1"/>
                                            <path
                                                d="M93.6 27.3c.2 0 .2 0 0 0 .2 0 .2 0 0 0zm16 82l17.7-5.8V54.8l-20.4-20.5c-3-3-8.3-5.8-13.2-7l23.1 65.6"
                                                fill="#00a8e1"/>
                                            <path fill="#00c4b3"
                                                  d="M90.5 18.2L75.7 3.5c-3.4-3.4-8-4.4-10.4-2.3L26.9 26.6h59.5l2.9.1c1.3 0 2.8.2 4.3.7l-3.1-9.2z"/>
                                        </svg>
                                        {{ $i }}
                                    </button>
                                @endfor
                            </div>

                            <!-- Third Row -->
                            <div class="grid grid-cols-2 gap-4">
                                @for ($i = 9; $i <= 10; $i++)
                                    <button wire:click="setValue({{ $i }})"
                                            class="flex items-center justify-center px-1 py-2 rounded-md text-black font-bold bg-white border border-green-800 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="h-5 w-5 mr-2">
                                            <path fill="#00c4b3"
                                                  d="M35.2 34.9l-8.3-8.3v59.7l.1 2.8c0 1.3.2 2.8.7 4.3l65.6 23.1 16.3-7.2-74.4-74.4z"/>
                                            <path
                                                d="M27.7 93.4zm81.9 15.9l-16.3 7.2-65.4-23.1c1.3 4.8 4 10.1 7 13.2l21.3 21.2 47.6.1 5.8-18.6z"
                                                fill="#22d3c5"/>
                                            <path fill="#0075c9"
                                                  d="M1.7 65.1C-.4 67.3.7 72 4 75.5l14.7 14.8 9.2 3.3c-.3-1.5-.7-3-.7-4.3l-.1-2.8-.2-59.8m82.7 82.6l7.2-16.4-23-65.6c-1.5-.3-3-.6-4.3-.7l-2.9-.1-59.6.1"/>
                                            <path
                                                d="M93.6 27.3c.2 0 .2 0 0 0 .2 0 .2 0 0 0zm16 82l17.7-5.8V54.8l-20.4-20.5c-3-3-8.3-5.8-13.2-7l23.1 65.6"
                                                fill="#00a8e1"/>
                                            <path fill="#00c4b3"
                                                  d="M90.5 18.2L75.7 3.5c-3.4-3.4-8-4.4-10.4-2.3L26.9 26.6h59.5l2.9.1c1.3 0 2.8.2 4.3.7l-3.1-9.2z"/>
                                        </svg>
                                        {{ $i }}
                                    </button>
                                @endfor
                            </div>
                        </div>

                        <div class="flex justify-center">
                            <button wire:click="setValue(-1)"
                                    class="px-4 py-2 rounded-md text-white bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                Miss
                            </button>
                            &nbsp;
                            <button wire:click="@if (Auth::check())
                pauseGame
            @else
                endGame
            @endif({{$game->id}})"
                                    class="px-4 py-2 rounded-md text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                @if (Auth::check())
                                    Pause game
                                @else
                                    Cancel game
                                @endif
                            </button>
                        </div>
                    @else
                        <div class="flex justify-center">
                            <button wire:click="setValue(-2)"
                                    class="px-4 py-2 rounded-md text-white bg-orange-700 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                Close
                            </button>
                            &nbsp;
                            <button wire:click="setValue(-1)"
                                    class="px-4 py-2 rounded-md text-white bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                Miss
                            </button>
                            &nbsp;
                            <button wire:click="@if (Auth::check())
                pauseGame
            @else
                endGame
            @endif({{$game->id}})"
                                    class="px-4 py-2 rounded-md text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                @if (Auth::check())
                                    Pause game
                                @else
                                    Cancel game
                                @endif
                            </button>
                        </div>
                    @endif
                </div>

            </main>
        @endif
    </div>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        var modal = document.getElementById('modal');
        var closeModalButton = document.getElementById('closeModal');

        if (modal) {
            // Show the modal
            modal.classList.add('open');
        }

        if (closeModalButton) {
            // Close the modal when the close button is clicked
            closeModalButton.addEventListener('click', function () {
                modal.classList.remove('open');
            });
        }
    });
</script>
