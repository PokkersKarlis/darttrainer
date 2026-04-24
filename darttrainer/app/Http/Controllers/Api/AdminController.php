<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\GameMatch;
use App\Models\GameRoom;
use App\Models\User;
use App\Services\MatchArchiver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct(private readonly MatchArchiver $archiver) {}

    public function overview(): JsonResponse
    {
        $since = now()->subMinutes(30)->getTimestamp();

        $activePlayers = (int) DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $since)
            ->selectRaw('COUNT(DISTINCT user_id) as c')
            ->value('c');

        $sessions = DB::table('sessions')
            ->leftJoin('users', 'users.id', '=', 'sessions.user_id')
            ->where('sessions.last_activity', '>=', $since)
            ->orderByDesc('sessions.last_activity')
            ->limit(50)
            ->select([
                'sessions.id',
                'sessions.user_id',
                'users.name as user_name',
                'sessions.ip_address',
                'sessions.last_activity',
            ])
            ->get()
            ->map(fn ($r) => [
                'session_id'    => $r->id,
                'user_id'       => $r->user_id ? (int) $r->user_id : null,
                'user_name'     => $r->user_name,
                'ip_address'    => $r->ip_address,
                'last_activity' => (int) $r->last_activity,
            ]);

        $activeMatches = GameMatch::query()
            ->where('status', 'active')
            ->with(['room:id,code,game_type,status'])
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->map(fn (GameMatch $m) => [
                'id'        => $m->id,
                'room_id'   => $m->room_id,
                'status'    => $m->status,
                'room_code' => $m->room?->code,
                'game_type' => $m->room?->game_type,
            ]);

        $activeRooms = GameRoom::query()
            ->whereIn('status', ['waiting', 'active'])
            ->orderByDesc('id')
            ->limit(30)
            ->get(['id', 'code', 'game_type', 'status', 'host_user_id']);

        $topSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->selectRaw('user_id, COUNT(*) as cnt')
            ->groupBy('user_id')
            ->orderByDesc('cnt')
            ->limit(10)
            ->get();

        $userNames = User::query()
            ->whereIn('id', $topSessions->pluck('user_id'))
            ->pluck('name', 'id');

        $topSessionsRows = $topSessions->map(fn ($r) => [
            'user_id' => (int) $r->user_id,
            'name'    => $userNames[$r->user_id] ?? ('#' . $r->user_id),
            'count'   => (int) $r->cnt,
        ]);

        $today    = now()->startOfDay();
        $weekAgo  = now()->subDays(7)->startOfDay();

        $analytics = [
            'users_new_today' => User::query()->where('created_at', '>=', $today)->count(),
            'users_new_7d'    => User::query()->where('created_at', '>=', $weekAgo)->count(),
            'solo_x01_finished_today' => (int) DB::table('game_x01_training')
                ->where('finished', 1)
                ->where('updated_at', '>=', $today)
                ->count(),
            'solo_x01_finished_7d' => (int) DB::table('game_x01_training')
                ->where('finished', 1)
                ->where('updated_at', '>=', $weekAgo)
                ->count(),
            'mp_matches_finished_today' => GameMatch::query()
                ->where('status', 'finished')
                ->where('updated_at', '>=', $today)
                ->count(),
            'mp_matches_finished_7d' => GameMatch::query()
                ->where('status', 'finished')
                ->where('updated_at', '>=', $weekAgo)
                ->count(),
            'mp_matches_abandoned_today' => GameMatch::query()
                ->where('status', 'abandoned')
                ->where('updated_at', '>=', $today)
                ->count(),
            'mp_matches_abandoned_7d' => GameMatch::query()
                ->where('status', 'abandoned')
                ->where('updated_at', '>=', $weekAgo)
                ->count(),
        ];

        $lastMigrations = DB::table('migrations')
            ->orderByDesc('id')
            ->limit(8)
            ->pluck('migration')
            ->values()
            ->all();

        $db = $this->dbOverview();

        $visits = $this->dailyVisitsOverview();

        return response()->json([
            'users_total'    => User::query()->count(),
            'active_players' => $activePlayers,
            'games_total'    => GameMatch::query()->count(),
            'matches_active' => GameMatch::query()->where('status', 'active')->count(),
            'sessions'       => $sessions,
            'active_matches' => $activeMatches,
            'active_rooms'   => $activeRooms,
            'top_sessions'   => $topSessionsRows,
            'analytics'      => $analytics,
            'db'             => $db,
            'daily_visits'   => $visits,
            'build'          => [
                'app_version'      => config('app.version'),
                'laravel_version'  => app()->version(),
                'last_migrations'  => $lastMigrations,
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private function dbOverview(): array
    {
        try {
            $conn = DB::connection();
            $driver = (string) $conn->getDriverName();
            $dbName = method_exists($conn, 'getDatabaseName') ? (string) $conn->getDatabaseName() : '';

            if ($driver !== 'mysql' || $dbName === '') {
                return ['driver' => $driver, 'database' => $dbName, 'tables' => [], 'total_bytes' => 0];
            }

            $rows = DB::select(
                'SELECT table_name, table_rows, data_length, index_length
                 FROM information_schema.tables
                 WHERE table_schema = ?
                 ORDER BY (data_length + index_length) DESC',
                [$dbName]
            );

            $tables = [];
            $total = 0;
            foreach ($rows as $r) {
                $data = (int) ($r->data_length ?? 0);
                $idx  = (int) ($r->index_length ?? 0);
                $size = $data + $idx;
                $total += $size;
                $tables[] = [
                    'name'        => (string) ($r->table_name ?? ''),
                    'rows'        => (int) ($r->table_rows ?? 0),
                    'data_bytes'  => $data,
                    'index_bytes' => $idx,
                    'size_bytes'  => $size,
                ];
            }

            return [
                'driver'      => $driver,
                'database'    => $dbName,
                'tables'      => $tables,
                'total_bytes' => $total,
            ];
        } catch (\Throwable $e) {
            return ['driver' => 'unknown', 'database' => null, 'tables' => [], 'total_bytes' => 0];
        }
    }

    /** @return array<string, mixed> */
    private function dailyVisitsOverview(): array
    {
        try {
            $today = now()->toDateString();
            $yesterday = now()->subDay()->toDateString();

            $rows = DB::table('daily_visits')
                ->whereIn('visit_date', [$today, $yesterday])
                ->orderByDesc('hits')
                ->limit(400)
                ->get([
                    'visit_date',
                    'ip_address',
                    'user_id',
                    'user_name',
                    'hits',
                    'hit_login',
                    'hit_register',
                    'first_seen_at',
                    'last_seen_at',
                ]);

            $fmt = fn ($r) => [
                'date'         => (string) $r->visit_date,
                'ip'           => (string) $r->ip_address,
                'user_id'      => (int) $r->user_id ?: null,
                'user_name'    => $r->user_name,
                'hits'         => (int) $r->hits,
                'hit_login'    => (bool) $r->hit_login,
                'hit_register' => (bool) $r->hit_register,
                'first_seen_at'=> $r->first_seen_at ? (string) $r->first_seen_at : null,
                'last_seen_at' => $r->last_seen_at ? (string) $r->last_seen_at : null,
            ];

            $todayRows = $rows->filter(fn ($r) => (string) $r->visit_date === $today)->map($fmt)->values()->all();
            $yesterdayRows = $rows->filter(fn ($r) => (string) $r->visit_date === $yesterday)->map($fmt)->values()->all();

            $todayUnique = (int) DB::table('daily_visits')->where('visit_date', $today)->count();
            $yesterdayUnique = (int) DB::table('daily_visits')->where('visit_date', $yesterday)->count();

            return [
                'today' => [
                    'date'   => $today,
                    'unique' => $todayUnique,
                    'items'  => $todayRows,
                ],
                'yesterday' => [
                    'date'   => $yesterday,
                    'unique' => $yesterdayUnique,
                    'items'  => $yesterdayRows,
                ],
            ];
        } catch (\Throwable) {
            return [
                'today' => ['date' => now()->toDateString(), 'unique' => 0, 'items' => []],
                'yesterday' => ['date' => now()->subDay()->toDateString(), 'unique' => 0, 'items' => []],
            ];
        }
    }

    public function users(Request $request): JsonResponse
    {
        $perPage = min(50, max(5, (int) $request->query('per_page', 25)));

        $validated = $request->validate([
            'search'      => 'nullable|string|max:120',
            'only_admin'  => 'nullable|boolean',
            'only_banned' => 'nullable|boolean',
            'date_from'   => 'nullable|date',
            'date_to'     => 'nullable|date',
        ]);

        $sessAgg = DB::table('sessions')
            ->selectRaw('user_id, MAX(last_activity) as last_activity_ts, COUNT(*) as session_count')
            ->whereNotNull('user_id')
            ->groupBy('user_id');

        $query = User::query()
            ->leftJoinSub($sessAgg, 'sa', fn ($j) => $j->on('users.id', '=', 'sa.user_id'))
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.is_admin',
                'users.is_banned',
                'users.ban_reason',
                'users.created_at',
                'users.updated_at',
                'sa.last_activity_ts',
                DB::raw('COALESCE(sa.session_count, 0) as session_count'),
            ]);

        if (!empty($validated['search'])) {
            $s = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $validated['search']) . '%';
            $query->where(function ($q) use ($s) {
                $q->where('users.name', 'like', $s)
                    ->orWhere('users.email', 'like', $s);
            });
        }

        if (!empty($validated['only_admin'])) {
            $query->where('users.is_admin', true);
        }

        if (!empty($validated['only_banned'])) {
            $query->where('users.is_banned', true);
        }

        if (!empty($validated['date_from'])) {
            $query->where('users.created_at', '>=', $validated['date_from'] . ' 00:00:00');
        }

        if (!empty($validated['date_to'])) {
            $query->where('users.created_at', '<=', $validated['date_to'] . ' 23:59:59');
        }

        $paginator = $query->orderByDesc('users.id')->paginate($perPage);

        return response()->json([
            'items' => collect($paginator->items())->map(fn ($u) => [
                'id'                 => (int) $u->id,
                'name'               => $u->name,
                'email'              => $u->email,
                'is_admin'           => (bool) $u->is_admin,
                'is_banned'          => (bool) $u->is_banned,
                'ban_reason'         => $u->ban_reason,
                'created_at'         => $u->created_at ? \Carbon\Carbon::parse($u->created_at)->toIso8601String() : null,
                'last_activity_ts'   => $u->last_activity_ts ? (int) $u->last_activity_ts : null,
                'session_count'      => (int) $u->session_count,
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'is_admin'    => 'sometimes|boolean',
            'is_banned'   => 'sometimes|boolean',
            'ban_reason'  => 'nullable|string|max:500',
        ]);

        if (array_key_exists('is_admin', $data)) {
            if ((int) $user->id === (int) Auth::id() && $data['is_admin'] === false) {
                return response()->json(['message' => 'You cannot remove your own admin access.'], 422);
            }
            $before = (bool) $user->is_admin;
            $user->is_admin = $data['is_admin'];
            $user->save();
            if ($before !== (bool) $user->is_admin) {
                $this->audit('user.admin_toggle', $user->id, [
                    'before' => $before,
                    'after'  => (bool) $user->is_admin,
                ]);
            }
        }

        if (array_key_exists('is_banned', $data)) {
            if ((int) $user->id === (int) Auth::id() && $data['is_banned']) {
                return response()->json(['message' => 'You cannot ban your own account.'], 422);
            }
            $before = (bool) $user->is_banned;
            $user->is_banned = $data['is_banned'];
            if ($user->is_banned && array_key_exists('ban_reason', $data)) {
                $user->ban_reason = $data['ban_reason'];
            }
            if (!$user->is_banned) {
                $user->ban_reason = null;
            }
            $user->save();
            if ($before !== (bool) $user->is_banned) {
                $this->audit($user->is_banned ? 'user.ban' : 'user.unban', $user->id, [
                    'ban_reason' => $user->ban_reason,
                ]);
            }
        } elseif (array_key_exists('ban_reason', $data) && $user->is_banned) {
            $user->ban_reason = $data['ban_reason'];
            $user->save();
            $this->audit('user.ban_reason', $user->id, ['ban_reason' => $user->ban_reason]);
        }

        $user->refresh();

        return response()->json(['user' => $this->userAdminRow($user)]);
    }

    public function revokeUserSessions(Request $request, User $user): JsonResponse
    {
        $n = DB::table('sessions')->where('user_id', $user->id)->delete();
        $this->audit('user.sessions_revoked', $user->id, ['deleted' => $n]);

        return response()->json(['ok' => true, 'deleted' => $n]);
    }

    public function matchDetail(GameMatch $match): JsonResponse
    {
        $match->load(['room.players.user', 'legs']);

        $room = $match->room;

        return response()->json([
            'match' => [
                'id'            => $match->id,
                'room_id'       => $match->room_id,
                'status'        => $match->status,
                'current_leg'   => $match->current_leg,
                'current_set'   => $match->current_set,
                'started_at'    => $match->started_at?->toIso8601String(),
                'finished_at'   => $match->finished_at?->toIso8601String(),
                'updated_at'    => $match->updated_at?->toIso8601String(),
                'legs_count'    => $match->legs->count(),
            ],
            'room' => $room ? [
                'id'         => $room->id,
                'code'       => $room->code,
                'status'     => $room->status,
                'game_type'  => $room->game_type,
                'host_user_id' => $room->host_user_id,
                'players'    => $room->players->map(fn ($p) => [
                    'id'      => $p->id,
                    'user_id' => $p->user_id,
                    'name'    => $p->display_name,
                    'order'   => $p->order,
                ])->values(),
            ] : null,
        ]);
    }

    public function roomDetail(GameRoom $room): JsonResponse
    {
        $room->load(['players.user', 'matches' => fn ($q) => $q->orderByDesc('id')->limit(5)]);

        return response()->json([
            'room' => [
                'id'           => $room->id,
                'code'         => $room->code,
                'status'       => $room->status,
                'game_type'    => $room->game_type,
                'host_user_id' => $room->host_user_id,
                'game_config'  => $room->game_config,
                'max_players'  => $room->max_players,
                'players'      => $room->players->map(fn ($p) => [
                    'id'      => $p->id,
                    'user_id' => $p->user_id,
                    'name'    => $p->display_name,
                    'order'   => $p->order,
                ])->values(),
                'recent_matches' => $room->matches->map(fn (GameMatch $m) => [
                    'id'     => $m->id,
                    'status' => $m->status,
                ])->values(),
            ],
        ]);
    }

    public function forceAbandonMatch(Request $request, GameMatch $match): JsonResponse
    {
        $request->validate(['confirm' => 'required|boolean']);
        if (!$request->boolean('confirm')) {
            return response()->json(['message' => 'Confirmation required.'], 422);
        }

        if ($match->status !== 'active') {
            return response()->json(['message' => 'Mačs nav aktīvs.'], 422);
        }

        $this->abandonMatchAndRoom($match);
        $this->audit('match.force_abandon', null, ['match_id' => $match->id, 'room_id' => $match->room_id]);

        return response()->json(['ok' => true]);
    }

    public function forceCloseRoom(Request $request, GameRoom $room): JsonResponse
    {
        $request->validate(['confirm' => 'required|boolean']);
        if (!$request->boolean('confirm')) {
            return response()->json(['message' => 'Confirmation required.'], 422);
        }

        $room->load('ongoingMatch');
        if ($room->ongoingMatch && in_array($room->ongoingMatch->status, ['active', 'suspended'], true)) {
            $this->abandonMatchAndRoom($room->ongoingMatch);
        }

        if (in_array($room->status, ['waiting', 'active', 'suspended'], true)) {
            $room->refresh();
            $room->status = 'abandoned';
            $room->save();
        }

        $this->audit('room.force_close', null, ['room_id' => $room->id]);

        return response()->json(['ok' => true]);
    }

    public function auditLog(Request $request): JsonResponse
    {
        $perPage = min(100, max(10, (int) $request->query('per_page', 30)));

        $paginator = AdminAuditLog::query()
            ->with(['admin:id,name', 'targetUser:id,name'])
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'items' => collect($paginator->items())->map(fn (AdminAuditLog $row) => [
                'id'            => $row->id,
                'action'        => $row->action,
                'admin_name'    => $row->admin?->name,
                'target_name'   => $row->targetUser?->name,
                'target_user_id'=> $row->target_user_id,
                'metadata'      => $row->metadata,
                'created_at'    => $row->created_at?->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    private function abandonMatchAndRoom(GameMatch $match): void
    {
        $match->load('room');
        if ($match->status !== 'active') {
            return;
        }
        $match->status      = 'abandoned';
        $match->finished_at = now();
        $match->save();

        if ($room = $match->room) {
            $room->status = 'abandoned';
            $room->save();
        }

        $this->archiver->archiveIfTerminal($match);
    }

    private function audit(string $action, ?int $targetUserId, array $metadata = []): void
    {
        AdminAuditLog::create([
            'admin_user_id'   => Auth::id(),
            'action'          => $action,
            'target_user_id'  => $targetUserId,
            'metadata'        => $metadata ?: null,
        ]);
    }

    private function userAdminRow(User $user): array
    {
        $sess = DB::table('sessions')
            ->where('user_id', $user->id)
            ->selectRaw('MAX(last_activity) as ts, COUNT(*) as c')
            ->first();

        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'is_admin'          => (bool) $user->is_admin,
            'is_banned'         => (bool) $user->is_banned,
            'ban_reason'        => $user->ban_reason,
            'created_at'        => $user->created_at?->toIso8601String(),
            'last_activity_ts'  => $sess && $sess->ts ? (int) $sess->ts : null,
            'session_count'     => $sess ? (int) $sess->c : 0,
        ];
    }
}
