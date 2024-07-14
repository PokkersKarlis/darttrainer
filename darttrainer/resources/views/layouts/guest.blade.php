<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-77VRB146DR"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'G-77VRB146DR');
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta property="og:title" content="Darts game trainer - traindart.com"/>
    <meta property="og:url" content="https://traindart.com/"/>
    <meta property="og:image" content="{{ asset('images/open-graph-logo.jpg') }}"/>
    <meta property="og:type" content="webapp"/>
    <meta property="og:description"
          content="Darts game trainer is a web application for training players specific tasks"/>
    <meta property="og:locale" content="en_GB"/>
    <title>Dart trainer</title>
    <meta property="title" content="Dart trainer">
    <meta property="description" content="Darts game trainer is a web application for training players specific tasks">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <!-- Styles -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('/images/favicon/apple-touch-icon.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('/images/favicon/favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('/images/favicon/favicon-16x16.png') }}">
        <link rel="manifest" href="{{ asset('/images/favicon/site.webmanifest') }}">
        <link rel="mask-icon" href="{{ asset('/images/favicon/safari-pinned-tab.svg" color="#5bbad5') }}">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="theme-color" content="#ffffff">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="{{ asset('/css/cookiealert.css') }}">
        <script src="https://cdn.tailwindcss.com"></script>
        @livewireStyles
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
            <div>
                <a href="/" wire:navigate>
                    <img class="w-20 h-10 fill-current text-gray-500" src="{{ asset('/images/logo.png') }}" alt="logo"/>
                </a>
            </div>

            <div class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
                {{ $slot }}
            </div>
        </div>
    </body>
</html>
