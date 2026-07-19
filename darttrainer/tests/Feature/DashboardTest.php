<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Piezīme: dashboard ir noņemts — sākumlapa (/) ir publiska.
// Pārsauc failu par HomeTest.php, kad ērti.
class HomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_view_the_home_page()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_authenticated_users_can_view_the_home_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/');
        $response->assertStatus(200);
    }
}
