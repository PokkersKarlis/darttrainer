<?php

namespace App\Services\Darts;

use App\Models\DartMatch;
use App\Models\DartX01ArchivedTurnEdit;
use App\Models\DartX01SoloActiveTurn;
use App\Models\DartX01TurnEdit;
use App\Models\User;

class X01TurnEditAuditService
{
    /**
     * @return array{
     *     throws: list<array{sector: int, multiplier: int}>,
     *     points_scored: int,
     *     remaining_points: int,
     *     is_bust: bool
     * }
     */
    public function snapshotTurn(DartX01SoloActiveTurn $turn): array
    {
        $turn->loadMissing('throws');

        return [
            'throws' => $turn->throws
                ->sortBy('throw_number')
                ->map(fn ($throw) => [
                    'sector' => (int) $throw->sector,
                    'multiplier' => (int) $throw->multiplier,
                ])
                ->values()
                ->all(),
            'points_scored' => (int) $turn->points_scored,
            'remaining_points' => (int) $turn->remaining_points,
            'is_bust' => (bool) $turn->is_bust,
        ];
    }

    /**
     * @param  array{
     *     throws: list<array{sector: int, multiplier: int}>,
     *     points_scored: int,
     *     remaining_points: int,
     *     is_bust: bool
     * }  $before
     * @param  array{
     *     throws: list<array{sector: int, multiplier: int}>,
     *     points_scored: int,
     *     remaining_points: int,
     *     is_bust: bool
     * }  $after
     */
    public function recordEdit(
        DartMatch $match,
        User $editor,
        DartX01SoloActiveTurn $turn,
        int $legNumber,
        array $before,
        array $after,
    ): void {
        DartX01TurnEdit::query()->create([
            'match_id' => $match->id,
            'match_uuid' => $match->uuid,
            'leg_number' => $legNumber,
            'turn_number' => (int) $turn->turn_number,
            'player_id' => $turn->player_id,
            'edited_by_user_id' => $editor->id,
            'before_throws' => $before['throws'],
            'after_throws' => $after['throws'],
            'before_points_scored' => $before['points_scored'],
            'after_points_scored' => $after['points_scored'],
            'before_remaining_points' => $before['remaining_points'],
            'after_remaining_points' => $after['remaining_points'],
            'before_is_bust' => $before['is_bust'],
            'after_is_bust' => $after['is_bust'],
            'edited_at' => now(),
        ]);
    }

    public function archiveForMatch(DartMatch $match): void
    {
        $edits = DartX01TurnEdit::query()
            ->where('match_id', $match->id)
            ->with('player')
            ->orderBy('edited_at')
            ->get();

        if ($edits->isEmpty()) {
            return;
        }

        $rows = [];

        foreach ($edits as $edit) {
            $rows[] = [
                'match_uuid' => $edit->match_uuid,
                'leg_number' => $edit->leg_number,
                'turn_number' => $edit->turn_number,
                'turn_owner_user_id' => $edit->player?->user_id,
                'edited_by_user_id' => $edit->edited_by_user_id,
                'before_throws' => json_encode($edit->before_throws),
                'after_throws' => json_encode($edit->after_throws),
                'before_points_scored' => $edit->before_points_scored,
                'after_points_scored' => $edit->after_points_scored,
                'before_remaining_points' => $edit->before_remaining_points,
                'after_remaining_points' => $edit->after_remaining_points,
                'before_is_bust' => $edit->before_is_bust,
                'after_is_bust' => $edit->after_is_bust,
                'edited_at' => $edit->edited_at,
                'archived_at' => now(),
            ];
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DartX01ArchivedTurnEdit::query()->insert($chunk);
        }

        DartX01TurnEdit::query()->where('match_id', $match->id)->delete();
    }
}
