@if ($hasName)
{{ __('mail.verify_text_opening_named', ['name' => $salutationName, 'app' => $appName]) }}
@else
{{ __('mail.verify_text_opening_anon', ['app' => $appName]) }}
@endif
{{ __('mail.verify_text_action', ['url' => $verifyUrl]) }}

{{ __('mail.verify_text_expiry') }}
{{ __('mail.verify_footer', ['app' => $appName]) }}
{{ __('mail.verify_official_site', ['host' => $siteHost]) }}
