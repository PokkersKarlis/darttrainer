<x-mail.document
    :page-title="__('mail.verify_subject', ['app' => $appName])"
    :preheader="__('mail.verify_preheader')"
>
    <x-mail.amber-accent-row />
    <x-mail.card-header :app-name="$appName" :heading="__('mail.verify_title')" />
    <x-mail.card-body>
        @if ($hasName)
            <p style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;font-weight:600;color:#f1f5f9;">
                {{ __('mail.verify_greeting', ['name' => $salutationName]) }}
            </p>
        @else
            <p style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;font-weight:600;color:#f1f5f9;">
                {{ __('mail.verify_greeting_anon') }}
            </p>
        @endif
        <p style="margin:0 0 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#94a3b8;">
            {{ __('mail.verify_lead', ['app' => $appName]) }}
        </p>

        <x-mail.primary-button :href="$verifyUrl" :label="__('mail.verify_button')" />

        <x-mail.url-fallback :url="$verifyUrl" :label="__('mail.verify_fallback_label')" />

        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#64748b;">
            {{ __('mail.verify_expiry') }}
        </p>
    </x-mail.card-body>
    <x-mail.footer-block>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#475569;">
            {{ __('mail.verify_footer', ['app' => $appName]) }}
        </p>
        <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#475569;">
            {{ __('mail.verify_official_site', ['host' => $siteHost]) }}
        </p>
    </x-mail.footer-block>
</x-mail.document>
