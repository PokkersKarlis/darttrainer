<?php

namespace Tests\Feature\Web;

use Tests\TestCase;

/**
 * Viena lapa (dart-spa) ar Vue Router — serveris atgriež to pašu skatu, JSON pieprasījumi 404.
 */
class SpaShellRouteTest extends TestCase
{
    public function test_login_and_register_return_spa_view(): void
    {
        foreach (['/login', '/register'] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertViewIs('dart-spa');
        }
    }

    public function test_unknown_path_returns_spa_for_html(): void
    {
        $this->get('/nonexistent-lobby-xyz-123')
            ->assertOk()
            ->assertViewIs('dart-spa');
    }

    public function test_api_style_unknown_json_returns_404(): void
    {
        $this->getJson('/definitely-missing-api-route-12345')
            ->assertNotFound();
    }
}
