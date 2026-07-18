<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Sākumlapa (/). Tievs kontrolieris — atgriež Inertia lapu.
 *
 * Autentificētais lietotājs jau nāk caur kopīgajiem props (HandleInertiaRequests),
 * tāpēc pamata Home nevajag papildu datus. Dzīvās spēles / aktīvās istabas tiks
 * pievienotas vēlāk caur HomeService (nākamais solis), turot kontrolieri tievu.
 */
class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home');
    }
}
