/**
 * MOSI 2026 - recebe as inscrições das oficinas e grava na planilha.
 *
 * Cole este arquivo em Extensões > Apps Script da planilha e publique como
 * App da Web ("Executar como: Eu", "Quem pode acessar: Qualquer pessoa").
 * O passo a passo completo está em docs/inscricoes-mosi.md.
 */

var ABA = 'Inscrições';

/* Primeira posição = título da coluna na planilha.
   Segunda = atributo name do campo no formulário. Se um for renomeado, o outro
   precisa acompanhar, senão a coluna chega vazia. */
var CAMPOS = [
  ['Oficinas escolhidas', 'oficina'],
  ['Nome completo', 'nome'],
  ['Nome social', 'nome_social'],
  ['Data de nascimento', 'nascimento'],
  ['Cidade', 'cidade'],
  ['Bairro', 'bairro'],
  ['Telefone/WhatsApp', 'telefone'],
  ['E-mail', 'email'],
  ['Disponibilidade', 'disponibilidade'],
  ['Experiência', 'experiencia'],
  ['Motivação', 'motivacao'],
  ['Compromisso', 'compromisso'],
  ['Precisa de acessibilidade', 'acessibilidade'],
  ['Qual recurso', 'acessibilidade_qual'],
  ['Nome do responsável', 'responsavel_nome'],
  ['Telefone do responsável', 'responsavel_telefone'],
  ['Autorização do responsável', 'responsavel_autoriza'],
  ['LGPD', 'lgpd'],
  ['Uso de imagem', 'imagem']
];

function doPost(e) {
  /* Duas pessoas enviando ao mesmo tempo escreveriam na mesma linha sem isto. */
  var trava = LockService.getScriptLock();
  trava.waitLock(30000);

  try {
    var aba = preparaAba_();
    var linha = [new Date()];

    for (var i = 0; i < CAMPOS.length; i++) {
      var valores = (e && e.parameters && e.parameters[CAMPOS[i][1]]) || [];
      /* Quem marca as duas oficinas manda o campo repetido; vira "A | B". */
      linha.push(valores.join(' | '));
    }

    aba.appendRow(linha);
    return resposta_({ ok: true });
  } catch (erro) {
    return resposta_({ ok: false, erro: String(erro) });
  } finally {
    trava.releaseLock();
  }
}

/* Bate na URL pelo navegador para conferir se a implantação está de pé. */
function doGet() {
  return resposta_({ ok: true, servico: 'Inscrições MOSI 2026' });
}

function preparaAba_() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);

  if (!aba) {
    aba = planilha.insertSheet(ABA);
    var cabecalho = ['Recebido em'];
    for (var i = 0; i < CAMPOS.length; i++) cabecalho.push(CAMPOS[i][0]);
    aba.appendRow(cabecalho);
    aba.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
    aba.setFrozenRows(1);
  }

  return aba;
}

function resposta_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
