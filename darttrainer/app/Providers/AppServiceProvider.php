<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Illuminate\Validation\Rules\Password;
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

        // ── Vēstures šifrēšana (aizsardzība pret "Atpakaļ" pogu pēc izlogošanās) ──
        // Inertia v2 šifrē lapu stāvokli klienta pusē (sessionStorage). Kad
        // AuthenticatedSessionController::destroy() izsauc Inertia::clearHistory(),
        // šifrēšanas atslēga tiek dzēsta un jebkura bfcache atjaunota (kešota)
        // lapa vairs neatšifrējas — pārlūkam jāveic jauns pieprasījums uz serveri.
        Inertia::encryptHistory();

        // ── Paroles stipruma prasības (reģistrācija, paroles maiņa/atjaunošana) ──
        // Saskaņots ar frontend PasswordField stipruma indikatoru: min. 8 rakstzīmes,
        // lielie/mazie burti un vismaz viens cipars. Apzināti NEIZMANTOJAM ->uncompromised()
        // (HaveIBeenPwned pārbaude) — tā katrā reģistrācijā/paroles maiņā veiktu ārēju HTTP
        // pieprasījumu, kas padarītu auth plūsmu un CI testus atkarīgus no trešās puses API.
        Password::defaults(function () {
            return Password::min(8)->mixedCase()->numbers();
        });

        // ── Zīmola e-pasti (TrainDart tumšais dizains) ──
        // Teksts nāk no lang/{locale}/emails.php. Valoda tiek noteikta pēc
        // app()->getLocale(), ko attiecīgais kontrolieris (RegisteredUserController,
        // PasswordResetLinkController, EmailVerificationNotificationController)
        // uzstāda TIEŠI PIRMS notification/event izsaukšanas — tātad e-pasts
        // atnāk tādā valodā, kāda bija izvēlēta lietotnē tajā brīdī.

        // E-pasta apstiprināšana
        VerifyEmail::toMailUsing(function (object $notifiable, string $url): MailMessage {
            return (new MailMessage)
                ->subject(__('emails.verify.subject'))
                ->view('emails.branded', [
                    'eyebrow' => __('emails.verify.eyebrow'),
                    'title' => __('emails.verify.title'),
                    'icon' => __('emails.verify.icon'),
                    'lines' => __('emails.verify.lines'),
                    'buttonText' => __('emails.verify.button'),
                    'buttonUrl' => $url,
                    'footerNote' => __('emails.verify.footer'),
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
                ->subject(__('emails.reset.subject'))
                ->view('emails.branded', [
                    'eyebrow' => __('emails.reset.eyebrow'),
                    'title' => __('emails.reset.title'),
                    'icon' => __('emails.reset.icon'),
                    'lines' => __('emails.reset.lines'),
                    'buttonText' => __('emails.reset.button'),
                    'buttonUrl' => $url,
                    'footerNote' => __('emails.reset.footer', ['expire' => $expire]),
                ]);
        });
    }
}
