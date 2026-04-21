<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>{{ config('app.name', 'DartTrainer') }}</title>
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
