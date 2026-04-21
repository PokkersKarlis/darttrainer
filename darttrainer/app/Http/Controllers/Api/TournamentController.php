<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TournamentController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Tournament::query()
            ->withCount('tournamentMatches')
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (Tournament $t) => [
                'id'            => $t->id,
                'name'          => $t->name,
                'status'        => $t->status,
                'format'        => $t->format,
                'created_by'    => $t->created_by,
                'matches_count' => $t->tournament_matches_count,
                'created_at'    => $t->created_at,
            ])
            ->values();

        return response()->json(['items' => $items]);
    }

    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|min:3|max:100',
            'players'   => 'required|array|min:2|max:64',
            'players.*' => 'required|integer|exists:users,id',
        ]);

        $playerIds = collect($data['players'])->unique()->values();
        if ($playerIds->count() < 2) {
            return response()->json(['error' => 'Turnīram vajag vismaz 2 unikālus spēlētājus.'], 422);
        }

        $tournament = DB::transaction(function () use ($data, $playerIds) {
            $bracketSize = $this->nextPowerOfTwo($playerIds->count());
            $rounds = (int) log($bracketSize, 2);

            $tournament = Tournament::create([
                'name'       => $data['name'],
                'format'     => 'single_elimination',
                'status'     => 'active',
                'created_by' => Auth::id(),
                'config'     => [
                    'players'      => $playerIds->all(),
                    'bracket_size' => $bracketSize,
                    'rounds'       => $rounds,
                ],
            ]);

            $slots = array_pad($playerIds->all(), $bracketSize, null);
            $matchesByRound = [];

            for ($round = 1; $round <= $rounds; $round++) {
                $matchesInRound = (int) ($bracketSize / (2 ** $round));
                for ($position = 1; $position <= $matchesInRound; $position++) {
                    $player1 = null;
                    $player2 = null;
                    if ($round === 1) {
                        $idx = ($position - 1) * 2;
                        $player1 = $slots[$idx] ?? null;
                        $player2 = $slots[$idx + 1] ?? null;
                    }

                    $matchesByRound[$round][$position] = TournamentMatch::create([
                        'tournament_id' => $tournament->id,
                        'round'         => $round,
                        'position'      => $position,
                        'player1_id'    => $player1,
                        'player2_id'    => $player2,
                    ]);
                }
            }

            foreach ($matchesByRound[1] ?? [] as $match) {
                $this->autoAdvanceByeWinner($matchesByRound, $match);
            }

            return $tournament;
        });

        return response()->json($this->tournamentResource($tournament->fresh('tournamentMatches')), 201);
    }

    public function show(Tournament $tournament): JsonResponse
    {
        return response()->json($this->tournamentResource($tournament->load('tournamentMatches')));
    }

    public function advance(Request $request, Tournament $tournament): JsonResponse
    {
        $data = $request->validate([
            'match_id'  => 'required|integer|exists:tournament_matches,id',
            'winner_id' => 'required|integer|exists:users,id',
        ]);

        $matches = $tournament->tournamentMatches()->get()->groupBy('round');
        $match = $tournament->tournamentMatches()->where('id', $data['match_id'])->firstOrFail();
        $winnerId = (int) $data['winner_id'];

        if (!in_array($winnerId, [(int) $match->player1_id, (int) $match->player2_id], true)) {
            return response()->json(['error' => 'Uzvarētājam jābūt vienam no match spēlētājiem.'], 422);
        }

        DB::transaction(function () use ($match, $winnerId, $matches) {
            $match->winner_id = $winnerId;
            $match->save();

            $this->placeWinnerIntoNextRound($matches->map(fn ($round) => $round->keyBy('position'))->all(), $match, $winnerId);
        });

        $tournament->refresh();
        $this->updateTournamentStatus($tournament);

        return response()->json($this->tournamentResource($tournament->fresh('tournamentMatches')));
    }

    private function placeWinnerIntoNextRound(array $matchesByRound, TournamentMatch $match, int $winnerId): void
    {
        $nextRound = $match->round + 1;
        if (!isset($matchesByRound[$nextRound])) {
            return;
        }

        $nextPosition = (int) ceil($match->position / 2);
        /** @var TournamentMatch|null $next */
        $next = $matchesByRound[$nextRound][$nextPosition] ?? null;
        if (!$next) {
            return;
        }

        if ($match->position % 2 === 1) {
            $next->player1_id = $winnerId;
        } else {
            $next->player2_id = $winnerId;
        }
        $next->save();

        $this->autoAdvanceByeWinner($matchesByRound, $next);
    }

    private function autoAdvanceByeWinner(array $matchesByRound, TournamentMatch $match): void
    {
        $hasOnePlayer = ($match->player1_id && !$match->player2_id) || (!$match->player1_id && $match->player2_id);
        if (!$hasOnePlayer || $match->winner_id) {
            return;
        }

        $winnerId = (int) ($match->player1_id ?: $match->player2_id);
        $match->winner_id = $winnerId;
        $match->save();

        $this->placeWinnerIntoNextRound($matchesByRound, $match, $winnerId);
    }

    private function updateTournamentStatus(Tournament $tournament): void
    {
        $lastRound = (int) ($tournament->tournamentMatches()->max('round') ?? 1);
        $final = $tournament->tournamentMatches()
            ->where('round', $lastRound)
            ->where('position', 1)
            ->first();

        if ($final?->winner_id) {
            $tournament->status = 'finished';
            $tournament->save();
        }
    }

    private function tournamentResource(Tournament $tournament): array
    {
        $matchPlayerIds = $tournament->tournamentMatches
            ->flatMap(fn (TournamentMatch $m) => [$m->player1_id, $m->player2_id, $m->winner_id])
            ->filter()
            ->unique()
            ->values();

        $users = User::whereIn('id', collect($tournament->config['players'] ?? [])->filter()->merge($matchPlayerIds)->unique()->all())
            ->get()
            ->keyBy('id');

        return [
            'id'         => $tournament->id,
            'name'       => $tournament->name,
            'status'     => $tournament->status,
            'format'     => $tournament->format,
            'config'     => $tournament->config,
            'players'    => collect($tournament->config['players'] ?? [])->map(fn ($id) => [
                'id'   => $id,
                'name' => $users->get($id)?->name ?? 'Unknown',
            ])->values()->all(),
            'matches'    => $tournament->tournamentMatches
                ->sortBy(['round', 'position'])
                ->map(fn (TournamentMatch $m) => [
                    'id'       => $m->id,
                    'round'    => $m->round,
                    'position' => $m->position,
                    'player1'  => $m->player1_id ? ['id' => $m->player1_id, 'name' => $users->get($m->player1_id)?->name] : null,
                    'player2'  => $m->player2_id ? ['id' => $m->player2_id, 'name' => $users->get($m->player2_id)?->name] : null,
                    'winner'   => $m->winner_id ? ['id' => $m->winner_id, 'name' => $users->get($m->winner_id)?->name] : null,
                ])
                ->values()
                ->all(),
        ];
    }

    private function nextPowerOfTwo(int $value): int
    {
        $power = 1;
        while ($power < $value) {
            $power <<= 1;
        }

        return $power;
    }
}
