<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url): MailMessage {
            $salutationName = trim((string) ($notifiable->name ?? ''));
            $hasName = $salutationName !== '';
            $appName = (string) config('app.name');

            return (new MailMessage)
                ->subject(__('mail.verify_subject', ['app' => $appName]))
                ->view('mail.verify-email', [
                    'verifyUrl' => $url,
                    'salutationName' => $salutationName,
                    'hasName' => $hasName,
                    'appName' => $appName,
                ])
                ->text('mail.verify-email-text', [
                    'verifyUrl' => $url,
                    'salutationName' => $salutationName,
                    'hasName' => $hasName,
                    'appName' => $appName,
                ]);
        });
    }
}
