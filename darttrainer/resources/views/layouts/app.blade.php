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
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet"/>
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
            max-width: 100%; /* Ensures the SVG scales with its parent */
            max-height: 100%; /* Ensures the SVG scales with its parent */
            width: 100%;
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

<body class="antialiased font-sans">
<div class="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
    <div
        class="relative min-h-screen flex flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
        <div class="relative w-full max-w-2xl px-6 lg:max-w-7xl">
            <header class="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3"
                    style="background-image: url('/images/header.jpg');">
                <div class="flex lg:justify-center lg:col-start-2">
                    <a href="/"><img src="{{asset('/images/logo.png')}}" alt="logo"></a>
                </div>
                @if (Route::has('login'))
                    <livewire:welcome.navigation/>
                @endif
            </header>
            @yield('content')

            <footer style="background-color: #333; color: white; margin-top: 35px; text-align: center;"
                    class="rounded-lg p-6">
                <div>
                    <p>Contact us: <a href="mailto:karlis@pokkers.lv" style="color: #ff532b;">karlis@pokkers.lv</a></p>
                    <p>
                        Created and powered by
                        <a href="https://pokkers.lv" style="color: #ff532b;">Pokkers</a>
                    </p>
                    <p>
                        <a href="https://www.facebook.com/carlopokker" style="color: #ff532b;">
                            <i class="fa fa-facebook-f"></i> carlopokker
                        </a> |
                        <a href="https://www.instagram.com/carlopokker" style="color: #ff532b;">
                            <i class="fa fa-instagram"></i> carlopokker
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    </div>
</div>
<div class="container" style="z-index: 999999">
    <div class="row">
        <div class="col-12">
            <div class="alert text-center cookiealert" role="alert">
                <p>@lang('cookies.cookies_title')</p> <a href="{{ asset('/cookies') }}" target="_blank"
                                                         style="color: white">@lang('cookies.learn')</a>

                <button type="button" class="btn btn-sm acceptcookies" style="background-color: #1cdea0; padding: 5px">
                    @lang('cookies.agree')
                </button>
            </div>
        </div>
    </div>
</div>
<script src="{{ asset('/js/cookiealert.js') }}"></script>
@livewireScripts
</body>
</html>

