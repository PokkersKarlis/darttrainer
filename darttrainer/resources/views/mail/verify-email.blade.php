{{-- Tumšā tēma kā vietnē (#060d18, dzeltens akcents); tabulas + inline — e-pasta klientiem --}}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>{{ __('mail.verify_subject', ['app' => $appName]) }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <style type="text/css">
        table { border-collapse: collapse; }
        td, th, div, p, a { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif; }
        a { text-decoration: none; }
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 620px) {
            .dt-email-outer { width: 100% !important; }
            .dt-email-pad { padding-left: 18px !important; padding-right: 18px !important; }
            .dt-email-h1 { font-size: 20px !important; line-height: 1.25 !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;width:100%;word-break:break-word;-webkit-text-size-adjust:100%;background-color:#060d18;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
        {{ __('mail.verify_preheader') }}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;
    </div>
    <table role="presentation" class="dt-email-outer" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0;padding:0;width:100%;background-color:#060d18;">
        <tr>
            <td align="center" style="padding:28px 14px;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
                    {{-- Dzeltens akcents --}}
                    <tr>
                        <td style="height:4px;line-height:4px;font-size:4px;background-color:#f59e0b;border-radius:14px 14px 0 0;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="background:linear-gradient(180deg,#0f1c30 0%,#0a1120 100%);background-color:#0f1c30;padding:22px 28px 20px;border-left:1px solid #1e3050;border-right:1px solid #1e3050;border-bottom:1px solid #1e3050;">
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <p style="margin:0;font-size:22px;line-height:1.2;">🎯</p>
                                        <p style="margin:6px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;">
                                            {{ e($appName) }}
                                        </p>
                                        <h1 class="dt-email-h1" style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;font-weight:800;color:#f8fafc;">
                                            {{ __('mail.verify_title') }}
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="dt-email-pad" style="background-color:#0a1120;border-left:1px solid #1e3050;border-right:1px solid #1e3050;border-bottom:1px solid #1e3050;border-radius:0 0 14px 14px;padding:26px 28px 30px;">
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

                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 26px;">
                                <tr>
                                    <td align="center" bgcolor="#f59e0b" style="border-radius:10px;background-color:#f59e0b;mso-padding-alt:15px 36px;box-shadow:0 4px 14px rgba(245,158,11,0.35);">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $verifyUrl }}" style="height:50px;v-text-anchor:middle;width:300px;" arcsize="12%" strokecolor="#f59e0b" fillcolor="#f59e0b">
                                            <w:anchorlock/>
                                            <center style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">{{ __('mail.verify_button') }}</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-- -->
                                        <a href="{{ $verifyUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:800;color:#0f172a;text-decoration:none;border-radius:10px;background-color:#f59e0b;">
                                            {{ __('mail.verify_button') }}
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#64748b;">
                                {{ __('mail.verify_fallback_label') }}
                            </p>
                            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background-color:#060d18;border:1px solid #1e3050;border-radius:10px;">
                                <tr>
                                    <td style="padding:12px 14px;font-family:'Consolas','Courier New',Courier,monospace;font-size:11px;line-height:17px;color:#cbd5e1;word-break:break-all;">
                                        {{ $verifyUrl }}
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#64748b;">
                                {{ __('mail.verify_expiry') }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:22px 16px 8px;">
                            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#475569;">
                                {{ __('mail.verify_footer', ['app' => $appName]) }}
                            </p>
                            <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#475569;">
                                {{ __('mail.verify_official_site', ['host' => $siteHost]) }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
