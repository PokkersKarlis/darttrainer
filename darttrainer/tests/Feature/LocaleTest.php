<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\AppLocale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_inertia_shares_default_locale(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('locale', AppLocale::default())
        );
    }

    public function test_guest_can_update_locale_via_post(): void
    {
        $response = $this->from('/')->post('/locale', ['locale' => 'en']);

        $response->assertRedirect('/');
        $this->assertSame('en', session(AppLocale::SESSION_KEY));

        $this->get('/')->assertInertia(fn ($page) => $page->where('locale', 'en'));
    }

    public function test_authenticated_user_locale_is_persisted(): void
    {
        $user = User::factory()->create(['locale' => 'lv']);

        $this->actingAs($user)
            ->from('/settings/profile')
            ->post('/locale', ['locale' => 'en'])
            ->assertRedirect('/settings/profile');

        $this->assertSame('en', $user->fresh()->locale);
        $this->assertSame('en', session(AppLocale::SESSION_KEY));
    }

    public function test_invalid_locale_is_rejected(): void
    {
        $this->from('/')
            ->post('/locale', ['locale' => 'de'])
            ->assertSessionHasErrors('locale');
    }

    public function test_password_reset_flash_uses_opaque_status_key(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email, 'locale' => 'en']);

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $user,
            \Illuminate\Auth\Notifications\ResetPassword::class,
            function ($notification) use ($user) {
                $this->post('/reset-password', [
                    'token' => $notification->token,
                    'email' => $user->email,
                    'password' => 'Password123',
                    'password_confirmation' => 'Password123',
                ])->assertRedirect(route('login'))
                    ->assertSessionHas('status', 'password-reset');

                return true;
            }
        );
    }
}
