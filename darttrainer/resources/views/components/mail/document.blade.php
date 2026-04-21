{{-- Pilns HTML dokuments; saturs — iekšējās tabulas rindas (slot). --}}
@props([
    'pageTitle',
    'preheader' => '',
])
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
    <title>{{ $pageTitle }}</title>
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
    @if ($preheader !== '')
        <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
            {{ $preheader }}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;
        </div>
    @endif
    <table role="presentation" class="dt-email-outer" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0;padding:0;width:100%;background-color:#060d18;">
        <tr>
            <td align="center" style="padding:28px 14px;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
                    {{ $slot }}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
