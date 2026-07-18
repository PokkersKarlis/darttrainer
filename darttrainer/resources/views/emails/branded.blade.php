{{--
    TrainDart zīmola e-pasts (email-safe: table layout, inline stili, bez SVG).
    Parametri: $title, $lines (array), $buttonText, $buttonUrl, $footerNote (nav obligāts).
--}}
<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
</head>
<body style="margin:0; padding:0; background:#0b0f19; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19; padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#131a26; border:1px solid #1f2937; border-radius:16px;">
                    <tr>
                        <td style="padding:28px 32px 6px;">
                            <span style="font-size:22px; font-weight:800; letter-spacing:1px; color:#f4f4f5;">TRAIN<span style="color:#39ff14;">DART</span></span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 32px 26px;">
                            <h1 style="margin:12px 0 10px; font-size:22px; line-height:1.25; color:#f4f4f5;">{{ $title }}</h1>

                            @foreach ($lines as $line)
                                <p style="margin:0 0 14px; font-size:15px; line-height:1.6; color:#94a3b8;">{{ $line }}</p>
                            @endforeach

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;">
                                <tr>
                                    <td align="center" style="border-radius:10px; background:#39ff14;">
                                        <a href="{{ $buttonUrl }}" target="_blank"
                                           style="display:inline-block; padding:14px 30px; font-size:15px; font-weight:800; color:#0b0f19; text-decoration:none; letter-spacing:0.5px; text-transform:uppercase;">
                                            {{ $buttonText }}
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:16px 0 0; font-size:12px; line-height:1.5; color:#64748b;">
                                Ja poga nedarbojas, kopē šo saiti pārlūkā:<br>
                                <a href="{{ $buttonUrl }}" target="_blank" style="color:#39ff14; word-break:break-all;">{{ $buttonUrl }}</a>
                            </p>

                            @isset($footerNote)
                                <p style="margin:18px 0 0; font-size:12px; line-height:1.5; color:#64748b;">{{ $footerNote }}</p>
                            @endisset
                        </td>
                    </tr>
                </table>

                <p style="margin:18px 0 0; font-size:11px; color:#475569;">© {{ date('Y') }} TrainDart. Visas tiesības aizsargātas.</p>
            </td>
        </tr>
    </table>
</body>
</html>
