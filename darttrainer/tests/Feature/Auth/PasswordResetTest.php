<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered()
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class);
        $response->assertSessionHas('status', 'reset-link-sent');
    }

    /**
     * The reset-link request must never crash (500) if the mail server is
     * unreachable — the user should still get a normal response, just with
     * a "failed" status instead of a silent server error.
     */
    public function test_reset_password_link_request_does_not_crash_when_mail_fails()
    {
        $user = User::factory()->create();

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 1,
        ]);

        $response = $this->from('/forgot-password')->post('/forgot-password', ['email' => $user->email]);

        $response->assertRedirect('/forgot-password');
        $response->assertSessionHas('status', 'reset-link-failed');
    }

    public function test_reset_password_screen_can_be_rendered()
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
            $response = $this->get('/reset-password/'.$notification->token);

            $response->assertStatus(200);

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token()
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $response = $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'))
                ->assertSessionHas('status', 'password-reset');

            return true;
        });
    }
}
