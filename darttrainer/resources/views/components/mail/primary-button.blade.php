@props([
    'href',
    'label',
])
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 26px;">
    <tr>
        <td align="center" bgcolor="#f59e0b" style="border-radius:10px;background-color:#f59e0b;mso-padding-alt:15px 36px;box-shadow:0 4px 14px rgba(245,158,11,0.35);">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $href }}" style="height:50px;v-text-anchor:middle;width:300px;" arcsize="12%" strokecolor="#f59e0b" fillcolor="#f59e0b">
                <w:anchorlock/>
                <center style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">{{ $label }}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="{{ $href }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:800;color:#0f172a;text-decoration:none;border-radius:10px;background-color:#f59e0b;">
                {{ $label }}
            </a>
            <!--<![endif]-->
        </td>
    </tr>
</table>
