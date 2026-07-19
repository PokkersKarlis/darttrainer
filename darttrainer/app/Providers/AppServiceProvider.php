<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Inertia\Inertia;

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
        if (env('VITE_BUILD_DIR')) {
            Vite::useBuildDirectory(env('VITE_BUILD_DIR'));
        }
        // ── Zīmola e-pasti (TrainDart tumšais dizains) ──

        // E-pasta apstiprināšana
        VerifyEmail::toMailUsing(function (object $notifiable, string $url): MailMessage {
            return (new MailMessage)
                ->subject('Apstiprini savu TrainDart e-pastu')
                ->view('emails.branded', [
                    'title' => 'Apstiprini e-pastu',
                    'lines' => [
                        'Paldies, ka pievienojies TrainDart! Lai atbloķētu tiešsaistes spēles, statistiku un draugus, apstiprini savu e-pasta adresi.',
                    ],
                    'buttonText' => 'Apstiprināt e-pastu',
                    'buttonUrl' => $url,
                    'footerNote' => 'Ja neizveidoji šo kontu, vari ignorēt šo vēstuli.',
                ]);
        });

        // Paroles atjaunošana
        ResetPassword::toMailUsing(function (object $notifiable, string $token): MailMessage {
            $url = route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

            $expire = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);

            return (new MailMessage)
                ->subject('TrainDart paroles atjaunošana')
                ->view('emails.branded', [
                    'title' => 'Atjauno paroli',
                    'lines' => [
                        'Saņēmām pieprasījumu atjaunot tavu TrainDart paroli. Noklikšķini uz pogas, lai izvēlētos jaunu paroli.',
                    ],
                    'buttonText' => 'Atjaunot paroli',
                    'buttonUrl' => $url,
                    'footerNote' => "Šī saite ir derīga {$expire} minūtes. Ja neveici šo pieprasījumu, vari ignorēt šo vēstuli.",
                ]);
        });
    }
}
