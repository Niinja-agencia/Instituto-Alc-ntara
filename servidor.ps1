# =============================================================================
#  Servidor estatico local para o site do Instituto Alcantara.
#
#  Uso:    powershell -ExecutionPolicy Bypass -File servidor.ps1
#  Abrir:  http://localhost:5173
#  Parar:  Ctrl+C nesta janela.
#
#  Observacao: este arquivo e mantido em ASCII puro de proposito. O Windows
#  PowerShell 5.1 le scripts sem BOM usando a codepage ANSI, e acentos ou
#  travessoes acabam virando aspas e quebrando o parser.
# =============================================================================

param(
  [int]$Porta = 5173
)

$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$Prefixo = "http://localhost:$Porta/"

$tipos = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'application/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.gif'   = 'image/gif'
  '.ico'   = 'image/x-icon'
  '.woff2' = 'font/woff2'
  '.woff'  = 'font/woff'
  '.txt'   = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($Prefixo)

try {
  $listener.Start()
} catch {
  Write-Host "Nao foi possivel abrir a porta $Porta." -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

Write-Host ""
Write-Host "  Instituto Alcantara - servidor local no ar" -ForegroundColor Yellow
Write-Host "  $Prefixo" -ForegroundColor Green
Write-Host "  Pasta: $Raiz"
Write-Host "  (Ctrl+C para parar)"
Write-Host ""

$raizCompleta = [System.IO.Path]::GetFullPath($Raiz)

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch {
    break
  }

  $req = $ctx.Request
  $res = $ctx.Response

  # Caminho pedido pelo navegador -> arquivo em disco.
  $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

  $arquivo = Join-Path $Raiz $rel
  if (Test-Path $arquivo -PathType Container) {
    $arquivo = Join-Path $arquivo 'index.html'
  }
  # Aceita /quem-somos como atalho para /quem-somos.html
  if (-not (Test-Path $arquivo -PathType Leaf) -and (Test-Path ($arquivo + '.html') -PathType Leaf)) {
    $arquivo = $arquivo + '.html'
  }

  # Nao deixa escapar da pasta do site.
  try {
    $completo = [System.IO.Path]::GetFullPath($arquivo)
  } catch {
    $completo = $raizCompleta
  }
  if (-not $completo.StartsWith($raizCompleta, [StringComparison]::OrdinalIgnoreCase)) {
    $res.StatusCode = 403
    $res.Close()
    continue
  }

  if (Test-Path $completo -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($completo).ToLower()
    if ($tipos.ContainsKey($ext)) {
      $res.ContentType = $tipos[$ext]
    } else {
      $res.ContentType = 'application/octet-stream'
    }
    $res.Headers.Add('Cache-Control', 'no-store')
    try {
      $bytes = [System.IO.File]::ReadAllBytes($completo)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "200  /$rel"
    } catch {
      $res.StatusCode = 500
      Write-Host "500  /$rel" -ForegroundColor Red
    }
  } else {
    $res.StatusCode = 404
    $res.ContentType = 'text/html; charset=utf-8'
    $msg = [System.Text.Encoding]::UTF8.GetBytes('<h1>404</h1><p>Arquivo nao encontrado.</p>')
    $res.OutputStream.Write($msg, 0, $msg.Length)
    Write-Host "404  /$rel" -ForegroundColor DarkYellow
  }

  $res.Close()
}

$listener.Stop()
