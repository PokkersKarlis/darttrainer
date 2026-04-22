<?php

namespace App\Providers;

use App\Notifications\TrainDartVerifyEmail;
use App\View\SeoViewData;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
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
        $appUrl = config('app.url');
        if (is_string($appUrl) && str_starts_with($appUrl, 'https://')) {
            URL::forceScheme('https');
        }

        /*
         * Ja kāds ceļš joprojām izsauc framework Illuminate\Auth\Notifications\VerifyEmail
         * (vecā User bez pārrakstījuma, rinda, OPcache), vēstule tomēr būs TrainDart HTML, ne «Laravel» Markdown.
         */
        VerifyEmail::toMailUsing(function (object $notifiable, string $verificationUrl) {
            if (! $notifiable instanceof MustVerifyEmail) {
                throw new \InvalidArgumentException('Notifiable must implement MustVerifyEmail.');
            }

            return TrainDartVerifyEmail::mailMessage($notifiable, $verificationUrl);
        });

        View::composer('dart-spa', function ($view) {
            $view->with(SeoViewData::forDartSpa());
        });
    }
}
