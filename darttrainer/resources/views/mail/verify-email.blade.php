{{-- Tabulu izkārtojums + inline stili: Outlook, Gmail, Apple Mail, Yahoo u.c. --}}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
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
        td, th, div, p, a { font-family: Arial, Helvetica, sans-serif; }
        a { text-decoration: none; }
    </style>
    <![endif]-->
    <style type="text/css">
        /* Daži klienti atļauj tikai šo bloku; turēsim minimālu */
        @media only screen and (max-width: 620px) {
            .dt-email-outer { width: 100% !important; }
            .dt-email-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;width:100%;word-break:break-word;-webkit-text-size-adjust:100%;background-color:#f1f5f9;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
        {{ __('mail.verify_preheader') }}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;
    </div>
    <table role="presentation" class="dt-email-outer" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0;padding:0;width:100%;background-color:#f1f5f9;">
        <tr>
            <td align="center" style="padding:24px 12px;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
                    <tr>
                        <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:24px 28px;border:1px solid #1e293b;border-bottom:0;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">
                                {{ e($appName) }}
                            </p>
                            <h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:700;color:#f8fafc;">
                                {{ __('mail.verify_title') }}
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="dt-email-pad" style="background-color:#ffffff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 28px 32px;">
                            @if ($hasName)
                            <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#0f172a;">
                                {{ __('mail.verify_greeting', ['name' => e($salutationName)]) }}
                            </p>
                            @else
                            <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#0f172a;">
                                {{ __('mail.verify_greeting_anon') }}
                            </p>
                            @endif
                            <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#334155;">
                                {{ __('mail.verify_lead', ['app' => $appName]) }}
                            </p>

                            <!-- Bulletproof poga (tabula, ne flex) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 28px;">
                                <tr>
                                    <td align="center" bgcolor="#059669" style="border-radius:8px;background-color:#059669;mso-padding-alt:14px 32px;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $verifyUrl }}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="10%" strokecolor="#059669" fillcolor="#059669">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">{{ __('mail.verify_button') }}</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-- -->
                                        <a href="{{ $verifyUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#059669;">
                                            {{ __('mail.verify_button') }}
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b;">
                                {{ __('mail.verify_fallback_label') }}
                            </p>
                            <p style="margin:0 0 24px;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:18px;color:#0f172a;word-break:break-all;">
                                {{ $verifyUrl }}
                            </p>

                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b;">
                                {{ __('mail.verify_expiry') }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:20px 16px 8px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#64748b;">
                                {{ __('mail.verify_footer', ['app' => $appName]) }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
