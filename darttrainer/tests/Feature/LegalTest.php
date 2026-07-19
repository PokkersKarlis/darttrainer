<?php

namespace Tests\Feature;

use Tests\TestCase;

class LegalTest extends TestCase
{
    public function test_terms_page_can_be_rendered(): void
    {
        $response = $this->get('/terms');

        $response->assertStatus(200);
    }

    public function test_privacy_page_can_be_rendered(): void
    {
        $response = $this->get('/privacy');

        $response->assertStatus(200);
    }
}
