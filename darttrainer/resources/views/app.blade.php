<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- TrainDart favikona: tumšs aplis + neona zaļš gredzens un centrs (dartboard motīvs) --}}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="alternate icon" href="/favicon.svg">
        <link rel="apple-touch-icon" href="/favicon.svg">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        {{-- TrainDart dizaina fonti: Barlow Condensed (virsraksti) + Inter (teksts) --}}
        <link href="https://fonts.bunny.net/css?family=barlow-condensed:600,700,800,900|inter:400,500,600,700,800" rel="stylesheet" />

        @routes
        @vite(['resources/js/app.ts'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
