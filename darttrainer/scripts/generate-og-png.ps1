# Generates public/images/og/og-image.png (1200x630) for Open Graph / WhatsApp.
# WhatsApp does not reliably show SVG; use this PNG in meta tags.
Add-Type -AssemblyName System.Drawing
$w, $h = 1200, 630
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$c1 = [System.Drawing.Color]::FromArgb(255, 15, 28, 48)
$c2 = [System.Drawing.Color]::FromArgb(255, 6, 13, 24)
$gcb = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $c1, $c2, 45.0)
[void]$g.FillRectangle($gcb, $rect)
$gcb.Dispose()
$gbar = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(230, 245, 158, 11))
$g.FillRectangle($gbar, 0, 0, $w, 4)
$gbar2 = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(153, 245, 158, 11))
$g.FillRectangle($gbar2, 0, $h - 4, $w, 4)
$gbar.Dispose()
$gbar2.Dispose()
$fsBold = [System.Drawing.FontStyle]::Bold
$fsRegular = [System.Drawing.FontStyle]::Regular
$uPix = [System.Drawing.GraphicsUnit]::Pixel
$titleFont = [System.Drawing.Font]::new('Segoe UI', 64, $fsBold, $uPix)
$titleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$g.DrawString('DartTrainer', $titleFont, $titleBrush, 120, 220)
$subFont = [System.Drawing.Font]::new('Segoe UI', 30, $fsBold, $uPix)
$subBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("TRAIN  $([char]0x00B7)  PLAY  $([char]0x00B7)  WIN", $subFont, $subBrush, 120, 320)
$tagFont = [System.Drawing.Font]::new('Segoe UI', 20, $fsRegular, $uPix)
$tagBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
$g.DrawString('Multiplayer 501 and Cricket, X01 solo, stats and friends', $tagFont, $tagBrush, 120, 390)
# PSScriptRoot = .../darttrainer/scripts → repo app root = parent
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'public\images\og\og-image.png'
$dir = Split-Path $out
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$titleFont.Dispose()
$subFont.Dispose()
$tagFont.Dispose()
$titleBrush.Dispose()
$subBrush.Dispose()
$tagBrush.Dispose()
$bmp.Dispose()
Write-Output "Wrote $out ($(Get-Item $out | ForEach-Object Length) bytes)"
