# Local, repeatable image delivery variants. Originals remain untouched.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$imageRoot = Join-Path $projectRoot 'public/images'
$outputRoot = Join-Path $imageRoot 'optimized'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$manifest = [ordered]@{}
foreach ($file in Get-ChildItem -LiteralPath $imageRoot -Filter '*.jpg') {
  $source = [System.Drawing.Image]::FromFile($file.FullName)
  try {
    $widths = if ($file.BaseName -eq 'hero') { @(640, 1280, 1920) } elseif ($source.Width -gt 1000) { @(480, 960, 1400) } else { @(240, 480, 900) }
    $variants = @()
    foreach ($width in $widths) {
      if ($width -gt $source.Width) { continue }
      $height = [int][Math]::Round($source.Height * $width / $source.Width)
      $bitmap = [System.Drawing.Bitmap]::new($width, $height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
        $name = "$($file.BaseName)-$width.jpg"
        $bitmap.Save((Join-Path $outputRoot $name), $codec, $parameters)
        $variants += [ordered]@{ width=$width; src="/images/optimized/$name"; bytes=(Get-Item -LiteralPath (Join-Path $outputRoot $name)).Length }
      } finally { $graphics.Dispose(); $bitmap.Dispose() }
    }
    $manifest[$file.BaseName] = [ordered]@{ width=$source.Width; height=$source.Height; originalBytes=$file.Length; variants=$variants }
  } finally { $source.Dispose() }
}
$parameters.Dispose()
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'src/image-manifest.json') -Encoding utf8
Write-Output "Generated responsive variants for $($manifest.Count) photographs."
