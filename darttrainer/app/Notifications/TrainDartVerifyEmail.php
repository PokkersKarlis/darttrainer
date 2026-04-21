<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as FrameworkVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * E-pasta apstiprināšana ar pielāgotu HTML (nav Laravel Markdown / «Laravel» zīmola).
 */
class TrainDartVerifyEmail extends Notification
{
    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        if (! $notifiable instanceof MustVerifyEmail) {
            throw new \InvalidArgumentException('Notifiable must implement MustVerifyEmail.');
        }

        $url = $this->verificationUrl($notifiable);

        $salutationName = trim((string) ($notifiable->name ?? ''));
        $hasName = $salutationName !== '';
        $appName = (string) config('app.name');
        $siteHost = parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'traindart.com';

        return (new MailMessage)
            ->subject(__('mail.verify_subject', ['app' => $appName]))
            ->view('mail.verify-email', [
                'verifyUrl' => $url,
                'salutationName' => $salutationName,
                'hasName' => $hasName,
                'appName' => $appName,
                'siteHost' => $siteHost,
            ])
            ->text('mail.verify-email-text', [
                'verifyUrl' => $url,
                'salutationName' => $salutationName,
                'hasName' => $hasName,
                'appName' => $appName,
                'siteHost' => $siteHost,
            ]);
    }

    protected function verificationUrl(MustVerifyEmail $notifiable): string
    {
        if (FrameworkVerifyEmail::$createUrlCallback !== null) {
            return \call_user_func(FrameworkVerifyEmail::$createUrlCallback, $notifiable);
        }

        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ],
        );
    }
}
