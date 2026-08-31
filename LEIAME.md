# Instituto Alcântara — site em código

Recriação do site `institutoalcantara.org.br` em HTML, CSS e JavaScript puros,
sem WordPress, sem plugins e sem dependências externas.

---

## Como ver o site

**Opção 1 — servidor local** (recomendado, é como o site roda de verdade):

```bash
powershell -ExecutionPolicy Bypass -File "servidor.ps1"
```

Depois abra <http://localhost:5173>. Para parar, `Ctrl+C` na janela do terminal.

**Opção 2 — abrir direto:** dê um duplo clique em `index.html`. Funciona, mas o
servidor é mais fiel (URLs limpas, cache desligado).

---

## Estrutura

```
Instituto Alcantara/
├── index.html                 página inicial (editada direto)
├── quem-somos.html            ┐
├── agenda.html                │ geradas por gerar.ps1
├── noticias.html              │ a partir de _fonte/
├── trabalhe-conosco.html      │
├── mosi.html                  ┘ landing do MOSI (responde em /mosi)
│
├── assets/
│   ├── css/style.css          todo o estilo do site
│   ├── js/main.js             todos os comportamentos
│   ├── fonts/                 Montserrat, Roboto e Anton (locais, sem Google Fonts)
│   ├── imprensa/              release e artes em alta para a imprensa baixar
│   └── img/                   imagens do site
│       ├── agenda/            capas dos eventos
│       ├── noticias/          capas das notícias
│       ├── equipe/            diretoria e conselho fiscal
│       ├── mosi/              artes do MOSI em versão web
│       └── ods/               os 9 quadros de ODS
│
├── _fonte/                    peças reaproveitadas das páginas internas
│   ├── cabecalho.html         topo + menu (aparece em todas as páginas)
│   ├── rodape.html            faixa "Inspirando" + rodapé + créditos
│   └── conteudo-*.html        só o miolo de cada página interna
│
├── vercel.json                faz /mosi servir mosi.html na Vercel
├── gerar.ps1                  monta as páginas internas a partir de _fonte/
├── servidor.ps1               servidor local
└── _referencia-wordpress/     HTML original capturado do site antigo
                               (só consulta — pode apagar quando quiser)
```

### A landing do MOSI

A página do MOSI é gerada como qualquer outra: o miolo fica em
`_fonte/conteudo-mosi.html` e a entrada dela está na lista de páginas do
`gerar.ps1`. O estilo próprio do evento (vermelho e amarelo) está isolado no
fim do `style.css`, no bloco marcado como MOSI, e não afeta o resto do site.

Para trocar o release que a imprensa baixa, substitua os arquivos em
`assets/imprensa/` mantendo os mesmos nomes. Nada mais precisa ser alterado.

---

## Como alterar o site

### Mudar um texto, imagem ou link de uma página interna

Edite o arquivo correspondente em `_fonte/conteudo-*.html` e rode:

```bash
powershell -ExecutionPolicy Bypass -File "gerar.ps1"
```

O título e a descrição de cada página ficam nas duas primeiras linhas do arquivo
de conteúdo:

```html
<!-- titulo: Agenda - Instituto Alcântara -->
<!-- descricao: Confira a agenda cultural do Instituto Alcântara... -->
```

> Se preferir, pode editar os `.html` da raiz direto — são HTML puro e funcionam
> sozinhos. Só lembre que rodar `gerar.ps1` depois sobrescreve essas alterações.

### Mudar o menu, o rodapé ou os contatos

Edite `_fonte/cabecalho.html` e/ou `_fonte/rodape.html`, rode `gerar.ps1`, e
aplique a mesma alteração em `index.html` (que não passa pelo gerador).

### Mudar a página inicial

Edite `index.html` direto.

### Mudar cores, fontes e espaçamentos

Tudo está no topo de `assets/css/style.css`, no bloco `:root`:

```css
--amarelo:  #ffcc00;   /* amarelo da marca */
--preto:    #000000;
--creme:    #f8f3ef;   /* fundo da seção de doações */
--raio-botao: 100px 10px;  /* o canto assimétrico dos botões */

/* larguras medidas no site original */
--largura-conteudo: 1400px;  /* seções de conteúdo e rodapé */
--largura-topbar:   1540px;  /* a barra preta do topo é mais larga */
--largura-rodape:   1400px;
```

O cabeçalho não usa container: ele ocupa a largura toda com `padding: 2% 4%` e
distribui logo, menu e botões com `space-around`, igual ao original.

Trocar `--amarelo` muda a cor em todo o site de uma vez.

### Adicionar uma notícia ou um evento

Copie um bloco `<article class="card">` inteiro dentro de
`_fonte/conteudo-noticias.html` (ou `conteudo-agenda.html`), troque a imagem, o
título e o resumo, e rode `gerar.ps1`. A busca da página filtra os novos cards
automaticamente — não precisa mexer no JavaScript.

---

## O que foi mantido igual ao original

- Paleta, tipografia e medidas conferidas lado a lado com o site antigo, no
  mesmo viewport (Montserrat 45px/600 nos títulos, Roboto 18px/500 nos cards,
  Anton na faixa do rodapé, botões com raio `100px 10px`).
- Larguras de container por área (1140 / 1240 / 1280) e o card de notícia
  reproduzido elemento a elemento: 660px de altura, com a imagem, o selo, o
  título, o resumo e o botão nas mesmas posições do original.
- Todas as seções da home, na mesma ordem e com as mesmas proporções — a altura
  total da página ficou em 6711px contra 6769px do original (0,9%).
- Imagens, logos de parceiros, fotos da equipe e quadros de ODS baixados do site.
- Cabeçalho fixo, animação de entrada ao rolar, constelação animada na seção
  "Quem Somos", carrossel de parceiros, barra de progresso de leitura, menu
  mobile e botão flutuante do WhatsApp.

## O que mudou de propósito

- **Fontes locais** em vez do Google Fonts — carrega mais rápido e não depende
  de terceiros.
- **Vídeos do YouTube sob demanda:** a capa é uma imagem e o player só carrega
  quando alguém clica. O site antigo carregava os embeds sempre.
- **Ícones em SVG embutido** no lugar do Font Awesome inteiro.
- **~50 plugins a menos.** O site antigo carregava 68 arquivos CSS e 47 de
  JavaScript; este carrega 1 de cada.

## O que precisa de atenção

Três coisas do site antigo dependiam de serviços externos e ficaram como
espaço reservado, prontas para você conectar:

1. **Feed do Instagram** — o token do site antigo está expirado ("The access
   token could not be decrypted"). Em `index.html`, na seção `.instagram__grid`,
   há um comentário indicando onde ligar um widget (LightWidget, Behold,
   EmbedSocial) ou colocar as imagens na mão.
2. **Newsletter** — o formulário do rodapé valida e responde na tela, mas ainda
   não envia para lugar nenhum. Ligue no seu serviço de e-mail marketing
   (Mailchimp, Brevo, RD Station) apontando o `action` do `<form>`.
3. **Formulário do Trabalhe Conosco** — mesma situação: precisa de um destino
   (um serviço de formulários como Formspree, ou um endpoint próprio).

Também vale conferir: as páginas de notícia e evento individuais ainda não
existem — os botões "Ler notícia" e "Mais informações" das listagens apontam
para `#`. Se quiser, dá para criar uma página por matéria seguindo o mesmo
padrão de `_fonte/`.

## Publicar

Como é um site estático, sobe em qualquer lugar sem configuração:
Netlify, Vercel, Cloudflare Pages, GitHub Pages ou uma hospedagem comum via FTP.
Basta enviar tudo menos `_fonte/`, `_referencia-wordpress/`, `gerar.ps1` e
`servidor.ps1` — esses são ferramentas de trabalho, não fazem parte do site.
