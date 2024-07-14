<div class="w-full">
    <div class="bg-indigo-900 text-center py-4 lg:px-4 relative overflow-hidden">
        <div class="rounded-full bg-indigo-500 uppercase px-4 py-2 text-xs font-bold">Most active players :</div>
        <div class="p-2 animate-slide text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex items-center" role="alert">
            @if(!empty($closing_game))
                <div class="flex rounded-full bg-indigo-500 uppercase px-4 py-2 text-xs font-bold mr-6">Close the number</div>
                <div class="flex whitespace-nowrap">
                    @foreach ($closing_game as $text)
                        <span class="font-semibold mr-2 text-left flex-auto"><span style="color: #ff532b">{{ $text['name'] }} :</span> {{ $text['count'] }} games </span>
                    @endforeach
                </div>
            @endif
            @if(!empty($ten_of_ten_game))
                <div class="flex rounded-full bg-indigo-500 uppercase px-4 py-2 text-xs font-bold mr-6">Ten of ten</div>
                <div class="flex whitespace-nowrap">
                    @foreach ($ten_of_ten_game as $text)
                        <span class="font-bold mr-2 text-left flex-auto"><span style="color: #ff532b">{{ $text['name'] }} :</span> {{ $text['count'] }} games </span>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
