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
    <meta property="og:title" content="Dart trainer"/>
    <meta property="og:url" content="https://traindart.com/"/>
    <meta property="og:image" content="{{ asset('images/open-graph-logo.jpg') }}"/>
    <meta property="og:type" content="webapp"/>
    <meta property="og:description" content="Dart trainer is a planned web application for training darts players"/>
    <meta property="og:locale" content="en_GB"/>
    <title>Dart trainer</title>
    <meta property="title" content="Dart trainer">
    <meta property="description" content="Dart trainer is a planned web application for training darts players">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet"/>
    <style>
        /* Define a CSS class to highlight the path */
        .parent-div {
            position: relative;
            width: 100%; /* Ensures the parent div takes full width */
            height: auto; /* Ensures height is relative to width */
        }

        #svg {
            max-width: 100%; /* Ensures the SVG scales with its parent */
            max-height: 100%; /* Ensures the SVG scales with its parent */
            width: 100%;
        }

        .highlighted {
            fill: #469def;
        }

        @media (min-width: 1400px) {
            .button-container {
                margin-top: 100px !important;
            }
        }

        @media (max-width: 600px) {
            .button-container {
                margin-top: 100px !important;
            }

            .button {
                min-width: 40% !important;
            }
        }

        .button {
            background-color: #ff532b;
            border: none;
            color: white;
            padding: 15px 16px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 8px;
            transition: background-color 0.3s ease;
            width: 100%;
        }

        .singles {
            background-color: #ff532b;
        }

        .doubles {
            background-color: #e04627;
        }

        .triples {
            background-color: #c03e22;
        }

        .mixed {
            background-color: #a0371e;
        }

        .singles:hover {
            background-color: #e04627;
        }

        .doubles:hover {
            background-color: #c03e22;
        }

        .triples:hover {
            background-color: #a0371e;
        }

        .mixed:hover {
            background-color: #802f19;
        }

        .highlighted {
            fill: #469def;
        }

    </style>
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
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Define a CSS class to highlight the path */
        .parent-div {
            position: relative;
            width: 100%; /* Ensures the parent div takes full width */
            height: auto; /* Ensures height is relative to width */
            margin-left: 50%;
            transform: translate(-50%);
            padding: 35px 0 0 0;
        }

        .parent-div-game {
            position: relative;
            width: 100%; /* Ensures the parent div takes full width */
            height: auto; /* Ensures height is relative to width */
        }

        #svg {
            max-width: 91%; /* Ensures the SVG scales with its parent */
            max-height: 91%; /* Ensures the SVG scales with its parent */
            width: 91%;
        }

        @media (min-width: 1400px) {
            .button-container {
                margin-top: 100px !important;
            }
        }

        @media (min-width: 1024px) {
            .game-info {
                min-height: 920px !important;
            }
            .parent-div-game {
                position: relative;
                width: 100%; /* Ensures the parent div takes full width */
                height: auto; /* Ensures height is relative to width */
                margin-left: 50%;
                transform: translate(-50%);
            }
        }

        @media (max-width: 600px) {
            .button-container {
                margin-top: 100px !important;
            }

            .button {
                min-width: 40% !important;
            }
        }

        .button {
            background-color: #ff532b;
            border: none;
            color: white;
            padding: 15px 16px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 8px;
            transition: background-color 0.3s ease;
            width: 100%;
        }

        .singles {
            background-color: #ff532b;
        }

        .doubles {
            background-color: #e04627;
        }

        .triples {
            background-color: #c03e22;
        }

        .mixed {
            background-color: #a0371e;
        }

        .singles:hover {
            background-color: #e04627;
        }

        .doubles:hover {
            background-color: #c03e22;
        }

        .triples:hover {
            background-color: #a0371e;
        }

        .mixed:hover {
            background-color: #802f19;
        }

        .highlighted {
            fill: #33FFFF
        }

        ol {
            list-style: circle !important;
        }

        .modal {
            display: none;
        }

        .modal.open {
            display: flex;
        }

    </style>
</head>
<body class="font-sans antialiased">
<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <livewire:layout.navigation/>

    <!-- Page Heading -->
    @if (isset($header))
        <header class="bg-white dark:bg-gray-800 shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {{ $header }}
            </div>
        </header>
    @endif

    <!-- Page Content -->
    <main>
        {{ $slot }}
    </main>
</div>
@livewireScripts
</body>
</html>
