<?php

namespace App\Services;

use App\Events\ShoutboxMessageSent;
use App\Models\ShoutboxMessage;
use App\Models\User;

class ShoutboxService
{
    public const MAX_BODY_LENGTH = 500;

    public const RETENTION_DAYS = 7;

    public const HISTORY_LIMIT = 80;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listRecent(?int $afterId = null): array
    {
        $query = ShoutboxMessage::query()
            ->with('user:id,name')
            ->orderByDesc('id');

        if ($afterId !== null) {
            $query->where('id', '>', $afterId)->orderBy('id');
        } else {
            $query->limit(self::HISTORY_LIMIT);
        }

        $messages = $afterId !== null
            ? $query->get()
            : $query->get()->reverse()->values();

        return $messages
            ->map(fn (ShoutboxMessage $message) => $this->serialize($message))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function post(User $user, string $body): array
    {
        $normalized = $this->normalizeBody($body);

        if ($normalized === '') {
            abort(422, 'chat-empty');
        }

        $message = ShoutboxMessage::query()->create([
            'user_id' => $user->id,
            'body' => $normalized,
        ]);

        broadcast(new ShoutboxMessageSent($message));

        return $this->serialize($message->load('user:id,name'));
    }

    public function pruneExpired(): int
    {
        return ShoutboxMessage::query()
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
    private function serialize(ShoutboxMessage $message): array
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
