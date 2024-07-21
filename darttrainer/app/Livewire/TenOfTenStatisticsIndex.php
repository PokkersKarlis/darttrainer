<?php

namespace App\Livewire;

use App\Models\GameCloseTheNumber;
use App\Models\GameTenOfTen;
use App\Models\GameTenOfTenElement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Livewire\Component;

class TenOfTenStatisticsIndex extends Component
{
    public $results = [];

    public const NUMBER_ARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, -1, -2];

    public function render()
    {
        $player_id = Auth::id();

        $game_ids = GameTenOfTen::where('player_id', $player_id)
            ->where('finished', 2)
            ->pluck('id');


        $allRecordsExceptLast = collect();

        foreach (self::NUMBER_ARRAY as $number) {
            for ($i = 1; $i <= 3; $i++) {
                // Get all records for the given number, sorted by updated_at
                $records = GameTenOfTenElement::whereIn('game_id', $game_ids)
                    ->where('given_number', $number)
                    ->where('given_number_type', $i)
                    ->orderBy('updated_at', 'desc')
                    ->get();

                $result = [];

                if ($records->isNotEmpty()) {
                    $dart_count_sum = 0;
                    foreach ($records as $record) {
                        $dart_count_sum += $record->darts_count;
                    }
                    $all_records_average = round($dart_count_sum / count($records), 2);

                    $records_except_last = $records->skip(1);

                    // Merge the results into the collection
                    $allRecordsExceptLast = $allRecordsExceptLast->merge($records_except_last);

                    $dart_count_without_last_sum = 0;
                    foreach ($allRecordsExceptLast as $record_except_last) {
                        $dart_count_without_last_sum += $record_except_last->darts_count;
                    }
                    $all_records_except_last_average = round($dart_count_without_last_sum / count($allRecordsExceptLast), 2);

                    if ($all_records_average - $all_records_except_last_average < 0) {
                        $result['difference'] = 'down';
                        $result['result'] = (string)$all_records_average . ' (-' . $all_records_except_last_average - $all_records_average . ')';
                    } elseif ($all_records_average - $all_records_except_last_average > 0) {
                        $result['difference'] = 'up';
                        $result['result'] = (string)$all_records_average . ' (+' . $all_records_average- $all_records_except_last_average . ')';
                    } else {
                        $result['difference'] = 'stable';
                        $result['result'] = (string)$all_records_average;
                    }
                } else {
                    $result = 'n/a';
                }
                $this->results[$number][$i] = $result;
            }
        }

        if (Auth::check()) {
            $finished_games = GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 1)
                ->get();
            if ($finished_games->count() > 0) {
                $this->games = $finished_games;
            }
        }

        return view('livewire.ten-of-ten-statistics-index');
    }
}
