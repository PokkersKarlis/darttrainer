<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CricketState extends Model
{
    public $timestamps = false;

    protected $table = 'cricket_state';

    protected $fillable = [
        'match_id', 'leg_id', 'player_id',
        'seg_15', 'seg_16', 'seg_17', 'seg_18', 'seg_19', 'seg_20', 'seg_bull',
        'points', 'seg_data',
    ];

    protected $casts = [
        'updated_at' => 'datetime',
        'seg_data'   => 'array',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(RoomPlayer::class, 'player_id');
    }

    public function leg(): BelongsTo
    {
        return $this->belongsTo(Leg::class, 'leg_id');
    }

    public function getSegmentHits(int $segment): int
    {
        // Use seg_data JSON as the primary source (supports arbitrary segments)
        $data = $this->seg_data ?? [];
        return (int) ($data[$segment] ?? 0);
    }

    public function setSegmentHits(int $segment, int $hits): void
    {
        $data = $this->seg_data ?? [];
        $data[$segment] = $hits;
        $this->seg_data = $data;

        // Also keep legacy columns in sync for standard segments
        match ($segment) {
            15 => $this->seg_15 = $hits,
            16 => $this->seg_16 = $hits,
            17 => $this->seg_17 = $hits,
            18 => $this->seg_18 = $hits,
            19 => $this->seg_19 = $hits,
            20 => $this->seg_20 = $hits,
            25 => $this->seg_bull = $hits,
            default => null,
        };
    }

    public function isSegmentClosed(int $segment): bool
    {
        return $this->getSegmentHits($segment) >= 3;
    }

    public function allClosed(array $segments): bool
    {
        foreach ($segments as $seg) {
            if (!$this->isSegmentClosed($seg)) {
                return false;
            }
        }
        return true;
    }
}
