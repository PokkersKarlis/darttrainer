@props([
    'appName',
    'heading',
])
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
                        {{ $heading }}
                    </h1>
                </td>
            </tr>
        </table>
    </td>
</tr>
