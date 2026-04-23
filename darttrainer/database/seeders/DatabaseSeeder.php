<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Lokālai izstrādei: visiem parole ir `password` (sk. UserFactory).
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'player1',
            'email' => 'player1@dart.lv',
        ]);
        $admin->forceFill(['is_admin' => true])->save();

        foreach (range(2, 8) as $n) {
            User::factory()->create([
                'name' => 'player'.$n,
                'email' => 'player'.$n.'@dart.lv',
            ]);
        }

        User::factory(6)->create();
    }
}
