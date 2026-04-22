# public/images/og/og-image.png (1200x630) — Open Graph, WhatsApp, u.c.
# Fonti: Segoe UI. Birkas (krāsaini tagi) + kartiņas kā Home.vue.
# Palaid: powershell -ExecutionPolicy Bypass -File scripts/generate-og-png.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

function New-RoundRectPath {
    param([float]$x, [float]$y, [float]$width, [float]$height, [float]$r)
    $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2.0
    $p.AddLine($x + $r, $y, $x + $width - $d, $y) | Out-Null
    $p.AddArc($x + $width - $d, $y, $d, $d, 270, 90) | Out-Null
    $p.AddLine($x + $width, $y + $r, $x + $width, $y + $height - $d) | Out-Null
    $p.AddArc($x + $width - $d, $y + $height - $d, $d, $d, 0, 90) | Out-Null
    $p.AddLine($x + $width - $d, $y + $height, $x + $r, $y + $height) | Out-Null
    $p.AddArc($x, $y + $height - $d, $d, $d, 90, 90) | Out-Null
    $p.AddLine($x, $y + $height - $d, $x, $y + $r) | Out-Null
    $p.AddArc($x, $y, $d, $d, 180, 90) | Out-Null
    $p.CloseFigure() | Out-Null
    return $p
}

function Get-UiFont {
    param([string[]]$Names, [int]$SizePx, [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular)
    $u = [System.Drawing.GraphicsUnit]::Pixel
    foreach ($n in $Names) {
        try { return [System.Drawing.Font]::new($n, $SizePx, $Style, $u) } catch { }
    }
    return [System.Drawing.Font]::new('Segoe UI', $SizePx, $Style, $u)
}

function Draw-PillColored {
    param(
        $G,
        [float]$x,
        [float]$y,
        [string]$Text,
        $Font,
        [System.Drawing.Color]$Border,
        [System.Drawing.Color]$Fill,
        [System.Drawing.Color]$TextC
    )
    $fBrush = [System.Drawing.SolidBrush]::new($TextC)
    $sz = $G.MeasureString($Text, $Font)
    $padX, $padY, $r = 16.0, 8.0, 12.0
    $pw = [math]::Max([float]$sz.Width + $padX * 2, 56.0)
    $ph = [float]$sz.Height + $padY * 2
    $path = New-RoundRectPath -x $x -y $y -width $pw -height $ph -r $r
    $bFill = [System.Drawing.SolidBrush]::new($Fill)
    $G.FillPath($bFill, $path)
    $bFill.Dispose()
    $pen = [System.Drawing.Pen]::new($Border, 2.0)
    $G.DrawPath($pen, $path)
    $G.DrawString($Text, $Font, $fBrush, $x + $padX, $y + $padY)
    $fBrush.Dispose()
    $pen.Dispose()
    $path.Dispose()
    return $pw + 10.0
}

$W, $H = 1200, 630
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$all = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$bg1 = [System.Drawing.Color]::FromArgb(255, 15, 28, 48)
$bg2 = [System.Drawing.Color]::FromArgb(255, 4, 10, 22)
$gcb = [System.Drawing.Drawing2D.LinearGradientBrush]::new($all, $bg1, $bg2, 48.0)
[void]$g.FillRectangle($gcb, $all)
$gcb.Dispose()

$goldTop = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(230, 245, 158, 11))
$g.FillRectangle($goldTop, 0, 0, $W, 3)
$goldTop.Dispose()
$goldBot = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 245, 158, 11))
$g.FillRectangle($goldBot, 0, $H - 3, $W, 3)
$goldBot.Dispose()

$root = Split-Path $PSScriptRoot -Parent
$logoPath = Join-Path $root 'public\images\logo.png'
$out = Join-Path $root 'public\images\og\og-image.png'
if (-not (Test-Path (Split-Path $out))) { New-Item -ItemType Directory -Path (Split-Path $out) -Force | Out-Null }

$cardW, $cardH, $cardR = 400, 200, 18
$cardX, $cardY = 64, 88
$cardPath = New-RoundRectPath -x $cardX -y $cardY -width $cardW -height $cardH -r $cardR
$cardFill = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$g.FillPath($cardFill, $cardPath)
$cardPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(80, 30, 48, 80), 1.5)
$g.DrawPath($cardPen, $cardPath)
$cardFill.Dispose()
$cardPen.Dispose()
$cardPath.Dispose()

if (Test-Path $logoPath) {
    $img = [System.Drawing.Image]::FromFile($logoPath)
    $maxLogoW = 360.0
    $scale = $maxLogoW / $img.Width
    $lw = $maxLogoW
    $lh = $img.Height * $scale
    if ($lh -gt 165) {
        $scale = 165.0 / $img.Height
        $lh = 165.0
        $lw = $img.Width * $scale
    }
    $lx = $cardX + ($cardW - $lw) / 2.0
    $ly = $cardY + ($cardH - $lh) / 2.0
    $g.DrawImage($img, $lx, $ly, $lw, $lh)
    $img.Dispose()
}

$fsBold = [System.Drawing.FontStyle]::Bold
$fsReg = [System.Drawing.FontStyle]::Regular
$tx = 500
$ty = 100

$titleText = 'TrainDart.com'
$ts = 44
$titleFont = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx $ts -Style $fsBold
while ($g.MeasureString($titleText, $titleFont).Width -gt 640 -and $ts -ge 30) {
    $titleFont.Dispose()
    $ts--
    $titleFont = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx $ts -Style $fsBold
}
$headBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$g.DrawString($titleText, $titleFont, $headBrush, $tx, $ty)

$subFont = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx 25 -Style $fsReg
$subBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
$subY = $ty + $ts + 16
$g.DrawString("Train  $([char]0x00B7)  Play  $([char]0x00B7)  Win", $subFont, $subBrush, $tx, $subY)

$hint = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx 15 -Style $fsReg
$hintBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
# UTF-16 simboli (PS faila kodējums vairs nemaina latviešu burtu attēlošanu)
$hintText = "Krikets, X01, statistika, draugi $([char]0x2014) viss vienuviet"
$g.DrawString($hintText, $hint, $hintBrush, $tx, ($subY + 36))

# Krāsainas birkas (centrētas, zem apakšteksta)
$pillY = 242.0
$pillFont = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx 15 -Style $fsBold
$pillDefs = @(
    @{ T = '501 & Cricket';  B = '245, 158, 11';  F = '32, 22, 10';   Tx = '251, 191, 36'  },
    @{ T = 'X01 solo';    B = '99, 102, 241';  F = '24, 24, 40';  Tx = '165, 180, 252'  },
    @{ T = 'Stats';         B = '16, 185, 129';  F = '12, 32, 28';  Tx = '110, 231, 183'  },
    @{ T = 'Friends';        B = '244, 63, 94';  F = '32, 20, 26';  Tx = '253, 186, 200'  }
)
$pillWTotal = 0.0
foreach ($pd in $pillDefs) {
    $s = $g.MeasureString($pd.T, $pillFont)
    $pillWTotal += [math]::Max($s.Width + 32, 56) + 10
}
$pillWTotal -= 10.0
$pillStartX = [float](($W - $pillWTotal) / 2.0)
$pxP = $pillStartX
foreach ($pd in $pillDefs) {
    $bParts = $pd.B.Split(',') | ForEach-Object { $_.Trim() }
    $fParts = $pd.F.Split(',') | ForEach-Object { $_.Trim() }
    $tParts = $pd.Tx.Split(',') | ForEach-Object { $_.Trim() }
    $BB = [System.Drawing.Color]::FromArgb(255, [int]$bParts[0], [int]$bParts[1], [int]$bParts[2])
    $FF = [System.Drawing.Color]::FromArgb(255, [int]$fParts[0], [int]$fParts[1], [int]$fParts[2])
    $TT = [System.Drawing.Color]::FromArgb(255, [int]$tParts[0], [int]$tParts[1], [int]$tParts[2])
    $n = [float](Draw-PillColored -G $g -x $pxP -y $pillY -Text $pd.T -Font $pillFont -Border $BB -Fill $FF -TextC $TT)
    $pxP += $n
}

$navT = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx 15 -Style $fsBold
$navS = Get-UiFont -Names @('Segoe UI', 'Arial') -SizePx 12 -Style $fsReg
$emj = Get-UiFont -Names @('Segoe UI Emoji', 'Segoe UI', 'Arial') -SizePx 24 -Style $fsReg

# Četras centrētas kartiņas — birkas + kartiņa augstums + atstarpe
$btnW, $btnH, $gapR = 186.0, 132.0, 14.0
$pillH = 40.0
$rowY = $pillY + $pillH + 18.0
$totalW = 4.0 * $btnW + 3.0 * $gapR
$startX = [float](($W - $totalW) / 2.0)

# Apakšvirsraksti (UTF-16 caur [char] — pareiza latviešu sasaiste visās sistēmās)
$subStat = "Rangs, v$([char]0x0113)sture, grafiki"
$subDru = "Iepaz$([char]0x012B)sties, sp$([char]0x0113)l$([char]0x0113) kop$([char]0x0101)"
$subX0 = "501 $([char]0x00B7) 301 $([char]0x00B7) solo treni$([char]0x0146)$([char]0x0161)"
$subCri = "Lobby, standarts, nejau$([char]0x0161)s"

# Kārtība: statistika, draugi, x01, cricket
# Statistika: mīksts zils / ciāna gradients (analītika)
# Draugi: sil/violeta gradients (sociālais)
$cards = @(
    @{
        C1 = '8, 47, 73';  C2 = '4, 24, 44'
        Bd = '56, 189, 248'
        Tt = '224, 242, 254';  St = '125, 211, 252'
        Ti = 'Statistika'
        Em = "$([char]0xD83D)$([char]0xDCCA)"
        Grad = $true
    }
    @{
        C1 = '67, 20, 80';  C2 = '32, 15, 42'
        Bd = '192, 38, 211'
        Tt = '250, 232, 255';  St = '244, 114, 182'
        Ti = 'Draugi'
        Em = "$([char]0xD83D)$([char]0xDC65)"
        Grad = $true
    }
    @{
        C1 = '30, 27, 75';  C2 = '49, 46, 129'
        Bd = '67, 56, 202'
        Tt = '165, 180, 252';  St = '99, 102, 241'
        Ti = 'X01'
        Em = "$([char]0xD83C)$([char]0xDFAF)"
        Grad = $true
    }
    @{
        C1 = '5, 46, 22';  C2 = '6, 78, 59'
        Bd = '16, 185, 129'
        Tt = '167, 243, 208';  St = '16, 185, 129'
        Ti = 'Cricket'
        Em = "$([char]0xD83C)$([char]0xDFCF)"
        Grad = $true
    }
)
$cardSubtitles = @($subStat, $subDru, $subX0, $subCri)

$x0 = $startX
$si = 0
foreach ($c in $cards) {
    $p1 = $c.C1.Split(',') | ForEach-Object { $_.Trim() }
    $p2 = $c.C2.Split(',') | ForEach-Object { $_.Trim() }
    $bd = $c.Bd.Split(',') | ForEach-Object { $_.Trim() }
    $cTt = $c.Tt.Split(',') | ForEach-Object { $_.Trim() }
    $cSt = $c.St.Split(',') | ForEach-Object { $_.Trim() }
    $C1 = [System.Drawing.Color]::FromArgb(255, [int]$p1[0], [int]$p1[1], [int]$p1[2])
    $C2 = [System.Drawing.Color]::FromArgb(255, [int]$p2[0], [int]$p2[1], [int]$p2[2])
    $Bdr = [System.Drawing.Color]::FromArgb(255, [int]$bd[0], [int]$bd[1], [int]$bd[2])
    $TiC = [System.Drawing.Color]::FromArgb(255, [int]$cTt[0], [int]$cTt[1], [int]$cTt[2])
    $SuC = [System.Drawing.Color]::FromArgb(255, [int]$cSt[0], [int]$cSt[1], [int]$cSt[2])

    $rct = New-RoundRectPath -x $x0 -y $rowY -width $btnW -height $btnH -r 14.0
    if ($c.Grad) {
        $rr = [System.Drawing.RectangleF]::new($x0, $rowY, $btnW, $btnH)
        $fbr = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rr, $C1, $C2, 50.0)
        $g.FillPath($fbr, $rct)
        $fbr.Dispose()
    } else {
        $sol = [System.Drawing.SolidBrush]::new($C1)
        $g.FillPath($sol, $rct)
        $sol.Dispose()
    }
    $p = [System.Drawing.Pen]::new($Bdr, 1.0)
    $g.DrawPath($p, $rct)
    $p.Dispose()
    $rct.Dispose()
    $bEm = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.DrawString($c.Em, $emj, $bEm, $x0 + 12, $rowY + 10)
    $bEm.Dispose()
    $bTi = [System.Drawing.SolidBrush]::new($TiC)
    $bSu = [System.Drawing.SolidBrush]::new($SuC)
    $g.DrawString($c.Ti, $navT, $bTi, $x0 + 12, $rowY + 44)
    $g.DrawString($cardSubtitles[$si], $navS, $bSu, $x0 + 12, $rowY + 78)
    $bTi.Dispose()
    $bSu.Dispose()
    $si++
    $x0 += $btnW + $gapR
}

$titleFont.Dispose()
$headBrush.Dispose()
$subFont.Dispose()
$subBrush.Dispose()
$hint.Dispose()
$hintBrush.Dispose()
$pillFont.Dispose()
$navT.Dispose()
$navS.Dispose()
$emj.Dispose()
$g.Dispose()
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "Wrote $out ($(Get-Item $out | ForEach-Object Length) bytes)"
