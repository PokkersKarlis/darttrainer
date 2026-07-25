<?php

namespace App\Services\Darts;

use App\Events\MatchChatMessageSent;
use App\Models\DartMatch;
use App\Models\MatchChatMessage;
use App\Models\User;
use Illuminate\Support\Collection;

class MatchChatService
{
    public const MAX_BODY_LENGTH = 500;

    public const RETENTION_DAYS = 7;

    public const HISTORY_LIMIT = 100;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listRecent(DartMatch $match, ?int $afterId = null): array
    {
        $query = MatchChatMessage::query()
            ->where('match_id', $match->id)
            ->with('user:id,name')
            ->orderBy('id');

        if ($afterId !== null) {
            $query->where('id', '>', $afterId);
        } else {
            $query->limit(self::HISTORY_LIMIT);
        }

        return $query->get()
            ->map(fn (MatchChatMessage $message) => $this->serialize($message))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function post(DartMatch $match, User $user, string $body): array
    {
        $normalized = $this->normalizeBody($body);

        if ($normalized === '') {
            abort(422, 'chat-empty');
        }

        $message = MatchChatMessage::query()->create([
            'match_id' => $match->id,
            'user_id' => $user->id,
            'body' => $normalized,
        ]);

        broadcast(new MatchChatMessageSent($message, $match->uuid))->toOthers();

        return $this->serialize($message->load('user:id,name'));
    }

    public function pruneExpired(): int
    {
        return MatchChatMessage::query()
            ->where('created_at', '<', now()->subDays(self::RETENTION_DAYS))
            ->delete();
    }

    private function normalizeBody(string $body): string
    {
        $trimmed = trim(preg_replace('/\s+/u', ' ', $body) ?? '');

        if (mb_strlen($trimmed) > self::MAX_BODY_LENGTH) {
            abort(422, 'chat-too-long');
        }

        return strip_tags($trimmed);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(MatchChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'user_id' => $message->user_id,
            'user_name' => $message->user?->name ?? '',
            'body' => $message->body,
            'created_at' => $message->created_at?->toIso8601String(),
        ];
    }
}
