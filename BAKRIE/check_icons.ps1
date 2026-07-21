Add-Type -AssemblyName System.Drawing
$icons = Get-ChildItem 'd:\DRL GITHUB\DRL\BAKRIE\public\assets\icons\*.png'
foreach ($f in $icons) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    Write-Host "$($f.Name): $($img.Width)x$($img.Height)"
    $img.Dispose()
}
