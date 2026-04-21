<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('friendships')) {
            return;
        }

        $now = now();

        $pairs = [];

        if (Schema::hasTable('friend_requests')) {
            $rows = DB::table('friend_requests')->where('status', 'accepted')->get(['requester_id', 'addressee_id']);
            foreach ($rows as $r) {
                $pairs[] = [(int) $r->requester_id, (int) $r->addressee_id];
            }
        }

        $existing = DB::table('friendships')->select('user_id', 'friend_user_id')->get();
        foreach ($existing as $f) {
            $pairs[] = [(int) $f->user_id, (int) $f->friend_user_id];
        }

        foreach ($pairs as [$a, $b]) {
            if ($a <= 0 || $b <= 0 || $a === $b) {
                continue;
            }
            foreach ([[$a, $b], [$b, $a]] as [$u, $v]) {
                DB::table('friendships')->insertOrIgnore([
                    'user_id'         => $u,
                    'friend_user_id'  => $v,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Nav droša veida atgriezeniski dzēst tikai šīs rindas — atstājam tukšu.
    }
};
