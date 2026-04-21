@props([
    'url',
    'label',
])
<p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#64748b;">
    {{ $label }}
</p>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background-color:#060d18;border:1px solid #1e3050;border-radius:10px;">
    <tr>
        <td style="padding:12px 14px;font-family:'Consolas','Courier New',Courier,monospace;font-size:11px;line-height:17px;color:#cbd5e1;word-break:break-all;">
            {{ $url }}
        </td>
    </tr>
</table>
