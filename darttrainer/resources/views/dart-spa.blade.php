<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="format-detection" content="telephone=no">
    <meta name="theme-color" content="#0a1120">
    <meta name="application-name" content="{{ config('app.name', 'DartTrainer') }}">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'DartTrainer') }}">
    <meta name="robots" content="index,follow">

    <title>{{ config('app.name', 'DartTrainer') }}</title>
    <meta name="description" content="DartTrainer — šautriņu treniņš, multiplayer (501, Cricket) un X01 solo. Statistika un draugi.">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name', 'DartTrainer') }}">
    <meta property="og:title" content="{{ config('app.name', 'DartTrainer') }}">
    <meta property="og:url" content="{{ $seoPageUrl }}">
    <meta property="og:description" content="Šautriņu treniņš, multiplayer un X01 solo — trenējies un seko statistikai. Draugi un tīkla spēles.">
    <meta property="og:locale" content="{{ \Illuminate\Support\Str::startsWith(app()->getLocale(), 'en') ? 'en_US' : 'lv_LV' }}">
    <meta property="og:image" content="{{ $seoImageUrl }}">
    <meta property="og:image:secure_url" content="{{ $seoImageUrl }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="TrainDart.com — Train · Play · Win">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'DartTrainer') }}">
    <meta name="twitter:description" content="Šautriņu treniņš, multiplayer un X01 solo — trenējies un seko statistikai.">
    <meta name="twitter:image" content="{{ $seoImageUrl }}">
    <meta name="twitter:image:alt" content="TrainDart.com — darts web app">

    <link rel="canonical" href="{{ $seoPageUrl }}">
    <link rel="icon" type="image/svg+xml" href="{{ url('/images/favicon/safari-pinned-tab.svg') }}">
    <meta name="msapplication-TileColor" content="#0a1120">

    @vite(['resources/js/dart-app/main.vue'])
</head>
<body>
<div id="app"></div>
<script>
(function () {
  setTimeout(function () {
    var el = document.getElementById('app');
    if (el && !el.hasAttribute('data-app-mounted')) {
      el.setAttribute('data-app-mounted', '');
      console.warn('DartTrainer: boot failsafe — pārbaudi /api (CSRF), tīklu un konsoli');
    }
  }, 14000);
})();
</script>
</body>
</html>
