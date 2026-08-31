# =============================================================================
#  Gerador de paginas do site do Instituto Alcantara.
#
#  Junta _fonte/cabecalho.html + _fonte/conteudo-<pagina>.html + _fonte/rodape.html
#  e grava os arquivos .html finais na raiz do projeto.
#
#  Uso:  powershell -ExecutionPolicy Bypass -File gerar.ps1
#
#  O titulo e a descricao de cada pagina saem das duas primeiras linhas do
#  arquivo de conteudo, no formato:
#      <!-- titulo: ... -->
#      <!-- descricao: ... -->
#  (esses arquivos sao UTF-8, entao acentos funcionam normalmente ali).
#
#  Rode este script sempre que alterar o cabecalho, o rodape ou o conteudo de
#  uma pagina em _fonte/. Se preferir, edite os .html da raiz direto: eles sao
#  HTML puro e funcionam sozinhos. (Este script e mantido em ASCII puro de
#  proposito - veja a observacao no topo de servidor.ps1.)
# =============================================================================

$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$Fonte = Join-Path $Raiz '_fonte'
$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

$cabecalho = [System.IO.File]::ReadAllText((Join-Path $Fonte 'cabecalho.html'), [System.Text.Encoding]::UTF8)
$rodape    = [System.IO.File]::ReadAllText((Join-Path $Fonte 'rodape.html'),    [System.Text.Encoding]::UTF8)

$ATIVO = ' aria-current="page"'

$paginas = @(
  @{ arquivo = 'quem-somos.html';       fonte = 'conteudo-quem-somos.html';       ativo = 'quem-somos' }
  @{ arquivo = 'agenda.html';           fonte = 'conteudo-agenda.html';           ativo = 'agenda' }
  @{ arquivo = 'noticias.html';         fonte = 'conteudo-noticias.html';         ativo = 'noticias' }
  @{ arquivo = 'trabalhe-conosco.html'; fonte = 'conteudo-trabalhe-conosco.html'; ativo = 'trabalhe' }
  @{ arquivo = 'mosi.html';             fonte = 'conteudo-mosi.html';             ativo = 'mosi' }
)

foreach ($p in $paginas) {
  $caminho  = Join-Path $Fonte $p.fonte
  $conteudo = [System.IO.File]::ReadAllText($caminho, [System.Text.Encoding]::UTF8)

  # Le os metadados dos comentarios do topo e os remove do corpo da pagina.
  $titulo = 'Instituto Alcantara'
  $desc   = ''
  $m = [regex]::Match($conteudo, '<!--\s*titulo:\s*(.*?)\s*-->')
  if ($m.Success) { $titulo = $m.Groups[1].Value }
  $m = [regex]::Match($conteudo, '<!--\s*descricao:\s*(.*?)\s*-->')
  if ($m.Success) { $desc = $m.Groups[1].Value }
  $conteudo = [regex]::Replace($conteudo, '<!--\s*(titulo|descricao):.*?-->\r?\n?', '')

  $topo = $cabecalho
  $topo = $topo.Replace('{{TITULO}}', $titulo)
  $topo = $topo.Replace('{{DESCRICAO}}', $desc)

  if ($p.ativo -eq 'quem-somos') { $topo = $topo.Replace('{{ATIVO_QUEM_SOMOS}}', $ATIVO) }
  if ($p.ativo -eq 'agenda')     { $topo = $topo.Replace('{{ATIVO_AGENDA}}', $ATIVO) }
  if ($p.ativo -eq 'noticias')   { $topo = $topo.Replace('{{ATIVO_NOTICIAS}}', $ATIVO) }

  # Limpa os marcadores que sobraram
  $topo = $topo.Replace('{{ATIVO_QUEM_SOMOS}}', '')
  $topo = $topo.Replace('{{ATIVO_AGENDA}}', '')
  $topo = $topo.Replace('{{ATIVO_NOTICIAS}}', '')

  $saida = $topo + "`n" + $conteudo + "`n" + $rodape

  [System.IO.File]::WriteAllText((Join-Path $Raiz $p.arquivo), $saida, $utf8SemBom)
  Write-Host ("gerado  " + $p.arquivo + "   -> " + $titulo) -ForegroundColor Green
}

Write-Host ""
Write-Host "Pronto. A index.html nao e gerada por aqui: ela e editada direto." -ForegroundColor Yellow
