<?php

namespace App\Services;

use App\Models\CricketState;
use App\Models\GameMatch;
use App\Models\Leg;
use App\Models\Turn;
use Illuminate\Support\Facades\DB;

class MatchArchiver
{
    public function __construct(
        private readonly MatchReportService $matchReport,
    ) {}

    /**
     * Idempotent.
     * - Creates protocol snapshot (match_protocols) for finished/abandoned matches.
     * - Copies turns/darts/cricket_state into archive tables.
     * - Deletes hot turns/darts/cricket_state (keeps only archive + snapshot).
     */
    public function archiveIfTerminal(GameMatch $match): void
    {
        $match->refresh();
        if (!in_array($match->status, ['finished', 'abandoned'], true)) {
            return;
        }

        DB::transaction(function () use ($match) {
            $match->refresh();
            if (!in_array($match->status, ['finished', 'abandoned'], true)) {
                return;
            }

            // Snapshot protocol once.
            $exists = DB::table('match_protocols')->where('match_id', $match->id)->exists();
            if (!$exists) {
                $payload = $this->buildProtocolPayload($match);
                DB::table('match_protocols')->insert([
                    'match_id'    => $match->id,
                    'payload'     => json_encode($payload, JSON_UNESCAPED_UNICODE),
                    'created_at'  => now(),
                ]);
            }

            // Copy turns + darts to archive (preserve IDs).
            $turnRows = DB::table('turns')
                ->where('match_id', $match->id)
                ->orderBy('id')
                ->get();

            if ($turnRows->isNotEmpty()) {
                $turnIds = $turnRows->pluck('id')->map(fn ($v) => (int) $v)->all();

                foreach ($turnRows->chunk(500) as $chunk) {
                    $ins = [];
                    foreach ($chunk as $t) {
                        $ins[] = [
                            'id'          => (int) $t->id,
                            'match_id'    => (int) $t->match_id,
                            'leg_id'      => (int) $t->leg_id,
                            'player_id'   => (int) $t->player_id,
                            'turn_number' => (int) $t->turn_number,
                            'score_before' => $t->score_before !== null ? (int) $t->score_before : null,
                            'score_after'  => $t->score_after !== null ? (int) $t->score_after : null,
                            'total_scored' => (int) $t->total_scored,
                            'is_bust'      => (bool) $t->is_bust,
                            'is_checkout'  => (bool) $t->is_checkout,
                            'is_undone'    => (bool) $t->is_undone,
                            'created_at'   => $t->created_at,
                        ];
                    }
                    DB::table('turns_archive')->upsert($ins, ['id'], []);
                }

                $dartRows = DB::table('darts')
                    ->whereIn('turn_id', $turnIds)
                    ->orderBy('id')
                    ->get();

                foreach ($dartRows->chunk(1000) as $chunk) {
                    $ins = [];
                    foreach ($chunk as $d) {
                        $ins[] = [
                            'id'          => (int) $d->id,
                            'turn_id'     => (int) $d->turn_id,
                            'dart_number' => (int) $d->dart_number,
                            'segment'     => (int) $d->segment,
                            'multiplier'  => (int) $d->multiplier,
                            'value'       => (int) $d->value,
                            'created_at'  => $d->created_at,
                        ];
                    }
                    DB::table('darts_archive')->upsert($ins, ['id'], []);
                }

                // Delete hot darts first (FK).
                DB::table('darts')->whereIn('turn_id', $turnIds)->delete();
                DB::table('turns')->whereIn('id', $turnIds)->delete();
            }

            // Archive cricket_state (if exists).
            $cs = DB::table('cricket_state')->where('match_id', $match->id)->get();
            if ($cs->isNotEmpty()) {
                foreach ($cs->chunk(500) as $chunk) {
                    $ins = [];
                    foreach ($chunk as $r) {
                        $ins[] = [
                            'id'       => (int) $r->id,
                            'match_id' => (int) $r->match_id,
                            'leg_id'   => (int) $r->leg_id,
                            'player_id' => (int) $r->player_id,
                            'seg_15'   => (int) $r->seg_15,
                            'seg_16'   => (int) $r->seg_16,
                            'seg_17'   => (int) $r->seg_17,
                            'seg_18'   => (int) $r->seg_18,
                            'seg_19'   => (int) $r->seg_19,
                            'seg_20'   => (int) $r->seg_20,
                            'seg_bull' => (int) $r->seg_bull,
                            'points'   => (int) $r->points,
                            'updated_at' => $r->updated_at,
                        ];
                    }
                    DB::table('cricket_state_archive')->upsert($ins, ['id'], []);
                }

                DB::table('cricket_state')->where('match_id', $match->id)->delete();
            }

            if ($match->archived_at === null) {
                $match->archived_at = now();
                $match->save();
            }
        });
    }

    private function buildProtocolPayload(GameMatch $match): array
    {
        $match->load(['room.activePlayers.user', 'winner']);
        $room = $match->room;
        $players = $room->activePlayers->map(fn ($p) => [
            'id'   => $p->id,
            'name' => $p->display_name,
        ])->values();

        $legs = Leg::query()
            ->where('match_id', $match->id)
            ->with([
                'winner',
                'turns' => fn ($q) => $q->with(['player', 'darts'])->orderBy('turn_number'),
            ])
            ->orderBy('set_number')
            ->orderBy('leg_number')
            ->get();

        $legsPayload = $legs->map(function (Leg $leg) {
            $winner = null;
            if ($leg->winner_player_id && $leg->winner) {
                $winner = [
                    'id'   => (int) $leg->winner_player_id,
                    'name' => $leg->winner->display_name,
                ];
            }

            $turns = $leg->turns->map(function (Turn $t) {
                return [
                    'turn_number'  => $t->turn_number,
                    'player_id'    => $t->player_id,
                    'player'       => $t->player?->display_name,
                    'darts'        => $t->darts->map(fn ($d) => $d->getLabel())->values()->all(),
                    'total_scored' => (int) $t->total_scored,
                    'score_before' => $t->score_before,
                    'score_after'  => $t->score_after,
                    'is_bust'      => (bool) $t->is_bust,
                    'is_checkout'  => (bool) $t->is_checkout,
                    'is_undone'    => (bool) $t->is_undone,
                ];
            })->values();

            return [
                'id'          => $leg->id,
                'set_number'  => (int) $leg->set_number,
                'leg_number'  => (int) $leg->leg_number,
                'winner'      => $winner,
                'turns'       => $turns,
            ];
        })->values();

        return [
            'match' => [
                'id'           => $match->id,
                'game_type'    => $room->game_type,
                'game_config'  => $room->game_config,
                'legs_config'  => $match->legs_config,
                'status'       => $match->status,
                'room_code'    => $room->code,
                'winner'       => $match->winner ? [
                    'id'   => $match->winner->id,
                    'name' => $match->winner->display_name,
                ] : null,
            ],
            'players' => $players,
            'legs'    => $legsPayload,
            'report'  => $this->matchReport->build($match),
        ];
    }
}

