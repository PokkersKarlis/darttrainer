{{--
    TrainDart zīmola e-pasts (email-safe: table layout, inline stili, bez SVG/webfontiem).

    Parametri:
    - $title        (string)
    - $lines        (array<string>)
    - $buttonText   (string)
    - $buttonUrl    (string)
    - $footerNote   (string, nav obligāts)
    - $eyebrow      (string, nav obligāts) — mazs uzraksts virs virsraksta, piem. "E-PASTA APSTIPRINĀŠANA"
    - $icon         (string, nav obligāts) — emoji ikona (universāli atbalstīta bez attēlu hostinga), noklusējums 🎯

    Saderības piezīmes (caniemail.com pārbaude):
    - Nekāds <style> bloks, viss inline — Gmail un daudzi klienti ignorē <head><style>.
    - Krāsas dublētas gan CSS 'background', gan HTML 'bgcolor' — daži klienti respektē tikai vienu no tiem.
    - <body> stili NEDRĪKST būt vienīgais avots — tie dublēti uz ārējās tabulas, jo <body> atbalsts ir vājš (~39%).
    - Garā saite apakšā izmanto word-break + overflow-wrap + word-wrap kopā, jo word-break vien tiek
      atbalstīts tikai ~28% klientu — bez dublēšanas garas saites var izlauzties no maketa.
    - Pogas teksts jau ir UPPERCASE no servera puses (Str::upper), nevis paļaujas tikai uz
      text-transform:uppercase CSS (~87% atbalsts) — tā pat nesupportējošos klientos teksts izskatās pareizi.
    - line-height dublēts ar mso-line-height-rule:exactly priekš Outlook precīzas rindstarpas.
--}}
@php
    $eyebrow = $eyebrow ?? null;
    $icon = $icon ?? '🎯';
@endphp
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark light">
    <meta name="supported-color-schemes" content="dark light">
    <title>{{ $title }}</title>
</head>
<body bgcolor="#0b0f19" style="margin:0; padding:0; background:#0b0f19; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0b0f19" style="background:#0b0f19; padding:36px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" bgcolor="#131a26"
                       style="max-width:480px; width:100%; background:#131a26; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">

                    {{-- Neona akcenta josla augšā --}}
                    <tr>
                        <td height="6" bgcolor="#39ff14" style="background:#39ff14; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>

                    {{-- Logo --}}
                    <tr>
                        <td style="padding:32px 32px 4px;">
                            <span style="font-size:22px; font-weight:800; letter-spacing:1px; color:#f4f4f5;">TRAIN<span style="color:#39ff14;">DART</span></span>
                        </td>
                    </tr>

                    {{-- Ikonas nozīme (apļa fons + emoji, drošs visos klientos bez attēlu hostinga) --}}
                    <tr>
                        <td style="padding:22px 32px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="56" height="56" align="center" valign="middle" bgcolor="#0d1220"
                                        style="width:56px; height:56px; background:rgba(57,255,20,0.12); background-color:#0d1220; border:1px solid #1f2937; border-radius:14px; font-size:26px; line-height:56px; text-align:center;">
                                        {{ $icon }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 32px 30px;">
                            @if ($eyebrow)
                                <p style="margin:0 0 10px; font-size:11px; font-weight:800; letter-spacing:1.5px; color:#39ff14; text-transform:uppercase;">{{ Str::upper($eyebrow) }}</p>
                            @endif

                            <h1 style="margin:0 0 14px; font-size:24px; line-height:1.3; mso-line-height-rule:exactly; color:#f4f4f5;">{{ $title }}</h1>

                            @foreach ($lines as $line)
                                <p style="margin:0 0 16px; font-size:15px; line-height:1.65; mso-line-height-rule:exactly; color:#94a3b8;">{{ $line }}</p>
                            @endforeach

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;">
                                <tr>
                                    <td align="center" bgcolor="#39ff14" style="border-radius:10px; background:#39ff14;">
                                        <a href="{{ $buttonUrl }}" target="_blank"
                                           style="display:inline-block; padding:16px 34px; font-size:15px; font-weight:800; color:#0b0f19; text-decoration:none; letter-spacing:0.5px; text-transform:uppercase;">
                                            {{ Str::upper($buttonText) }}
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:20px 0 0; font-size:12px; line-height:1.5; mso-line-height-rule:exactly; color:#64748b;">
                                {{ __('emails.fallback_link_intro') }}<br>
                                <a href="{{ $buttonUrl }}" target="_blank"
                                   style="color:#39ff14; word-break:break-all; overflow-wrap:break-word; word-wrap:break-word;">{{ $buttonUrl }}</a>
                            </p>

                            @isset($footerNote)
                                <p style="margin:20px 0 0; font-size:12px; line-height:1.5; mso-line-height-rule:exactly; color:#64748b;">{{ $footerNote }}</p>
                            @endisset
                        </td>
                    </tr>
                </table>

                <p style="margin:20px 0 0; font-size:11px; color:#475569;">© {{ date('Y') }} TrainDart. {{ __('emails.rights_reserved') }}</p>
            </td>
        </tr>
    </table>
</body>
</html>
