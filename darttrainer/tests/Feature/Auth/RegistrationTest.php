<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }

    /**
     * Confirms the fix for the User model's MustVerifyEmail interface: a real
     * verification email must actually be dispatched on registration. This
     * was silently broken before (the interface was commented out), so this
     * test guards against that regression.
     */
    public function test_registration_sends_email_verification_notification()
    {
        Notification::fake();

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => true,
        ]);

        $user = User::where('email', 'test@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    /**
     * If the mail server is unreachable, account creation must still
     * succeed — a broken SMTP connection should never block registration.
     */
    public function test_registration_still_succeeds_when_verification_email_fails_to_send()
    {
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 1,
        ]);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_registration_requires_terms_acceptance(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => false,
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('terms_accepted');
    }

    public function test_registration_rejects_honeypot_submissions(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => true,
            'company' => 'https://spam.example',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_registration_rejects_weak_passwords(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_accepted' => true,
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('password');
    }

    public function test_registration_ignores_privileged_fields(): void
    {
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => true,
            'is_admin' => true,
            'is_banned' => true,
            'account_type' => 'admin',
        ]);

        $user = User::where('email', 'test@example.com')->firstOrFail();

        $this->assertFalse((bool) $user->is_admin);
        $this->assertFalse((bool) $user->is_banned);
    }

    public function test_authenticated_users_are_redirected_from_registration(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/register');

        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_registration_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms_accepted' => false,
        ];

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->post('/register', $payload)->assertSessionHasErrors('terms_accepted');
        }

        $this->post('/register', $payload)->assertStatus(429);
    }
}
