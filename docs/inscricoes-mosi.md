# Inscrições das oficinas do MOSI → planilha do Google

O formulário fica em `/mosi`, na seção **Inscrição**. Ele valida tudo no navegador
e envia para uma planilha do Google. Enquanto o destino não estiver configurado, a
página mostra um aviso no topo do formulário e orienta a pessoa a se inscrever pelo
WhatsApp, em vez de fingir que enviou.

## Ligar o envio (uma vez só)

**1. Crie a planilha**

No Google Drive, crie uma planilha em branco. O nome é livre, por exemplo
"MOSI 2026 - Inscrições nas oficinas". Não precisa criar colunas: o script cria a
aba e o cabeçalho sozinho na primeira inscrição.

**2. Cole o script**

Na planilha, menu **Extensões → Apps Script**. Apague o conteúdo que vier e cole o
arquivo `docs/apps-script-inscricoes.gs` deste repositório. Salve.

**3. Publique como aplicativo da web**

Botão **Implantar → Nova implantação**, engrenagem **→ App da Web**:

- Executar como: **Eu**
- Quem pode acessar: **Qualquer pessoa**

O segundo item é o que costuma ser esquecido. Se ficar como "Somente eu", o site
recebe erro em toda inscrição.

O Google vai pedir autorização e mostrar um aviso de app não verificado. É esperado,
porque o script é seu: **Avançado → Acessar (não seguro)**.

**4. Copie a URL e cole no site**

A implantação devolve uma URL terminada em `/exec`. Ela vai em uma linha só, no
arquivo `_fonte/conteudo-mosi.html`, no `<form>`:

```html
<form class="mosi-form revela" id="form-oficinas" data-destino="COLE_A_URL_AQUI" novalidate>
```

Depois rode `gerar.ps1` e suba. O aviso do topo some sozinho quando o `data-destino`
existe.

## O que chega na planilha

Uma linha por inscrição, com data e hora do recebimento e mais estas colunas:

Oficinas escolhidas · Nome completo · Nome social · Data de nascimento · Cidade ·
Bairro · Telefone/WhatsApp · E-mail · Disponibilidade · Experiência · Motivação ·
Compromisso · Precisa de acessibilidade · Qual recurso · Nome do responsável ·
Telefone do responsável · Autorização do responsável · LGPD · Uso de imagem

Quem marcar as duas oficinas aparece com as duas na mesma célula, separadas por `|`.

## Se precisar mudar as perguntas

Os nomes dos campos no HTML (`name="..."`) são a ligação com as colunas. Se você
renomear um campo, renomeie também na lista `CAMPOS` do Apps Script, senão a coluna
chega vazia.

## Trocar a planilha depois

Basta repetir os passos 1 a 4 com a planilha nova. Nada mais no site precisa mudar.
