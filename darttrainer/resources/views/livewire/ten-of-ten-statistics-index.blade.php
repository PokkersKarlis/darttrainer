<div>
    <div class="bg-white p-8 rounded shadow-md w-full" style="padding: 20px">
        <div class="container mx-auto">
            <div class="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table class="min-w-full bg-white border-collapse border border-gray-200">
                    <thead class="bg-gray-800 text-white">
                    <tr>
                        <th class="text-center py-2 px-2 uppercase font-semibold text-xs border border-gray-200">
                            Number
                        </th>
                        <th class="text-center py-2 px-2 uppercase font-semibold text-xs border border-gray-200">
                            Single
                        </th>
                        <th class="text-center py-2 px-2 uppercase font-semibold text-xs border border-gray-200">
                            Double
                        </th>
                        <th class="text-center py-2 px-2 uppercase font-semibold text-xs border border-gray-200">
                            Triple
                        </th>
                    </tr>
                    </thead>
                    <tbody class="text-gray-700">
                    @foreach($results as $number => $result)
                        @if($number >= 1)
                            <tr>
                                <td class="text-left py-3 px-4 border border-gray-200">
                                    <div class="py-2 px-2 uppercase font-bold text-xs border-black text-center
                    {{ in_array($number, [1, 4, 6, 15, 17, 19, 16, 11, 9, 5], true) ? 'bg-green-600' : 'bg-red-600' }}
                    rounded border-2">
                                        {{ $number }}
                                    </div>
                                </td>

                                {{-- First result column --}}
                                @if(is_array($result[1]))
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[1]['result'] }} d/av
                                        @if($result[1]['difference'] === 'up')
                                            <div class="text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M5 15l7-7 7 7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[1]['difference'] === 'down')
                                            <div class="text-green-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[1]['difference'] === 'stable')
                                            <div class="text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
                                                </svg>
                                            </div>
                                        @endif
                                    </td>
                                @else
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[1] }}
                                    </td>
                                @endif

                                {{-- Second result column --}}
                                @if(is_array($result[2]))
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[2]['result'] }} d/av
                                        @if($result[2]['difference'] === 'up')
                                            <div class="text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M5 15l7-7 7 7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[2]['difference'] === 'down')
                                            <div class="text-green-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[2]['difference'] === 'stable')
                                            <div class="text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
                                                </svg>
                                            </div>
                                        @endif
                                    </td>
                                @else
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[2] }}
                                    </td>
                                @endif

                                {{-- Third result column --}}
                                @if(is_array($result[3]))
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[3]['result'] }} d/av
                                        @if($result[3]['difference'] === 'up')
                                            <div class="text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M5 15l7-7 7 7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[3]['difference'] === 'down')
                                            <div class="text-green-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </div>
                                        @elseif($result[3]['difference'] === 'stable')
                                            <div class="text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
                                                </svg>
                                            </div>
                                        @endif
                                    </td>
                                @else
                                    <td class="text-left py-3 px-4 border border-gray-200">
                                        {{ $result[3] }}
                                    </td>
                                @endif

                            </tr>
                        @endif
                    @endforeach


                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
