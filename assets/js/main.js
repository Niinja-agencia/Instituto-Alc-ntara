/* ==========================================================================
   Instituto Alcântara — comportamentos de interface
   Sem dependências externas. Cada bloco é independente e degrada com
   segurança caso o elemento correspondente não exista na página.
   ========================================================================== */
(function () {
  'use strict';

  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- Menu mobile ---------- */
  var botaoMenu = document.querySelector('.hamburguer');
  var nav = document.querySelector('.nav');

  if (botaoMenu && nav) {
    botaoMenu.addEventListener('click', function () {
      var aberto = nav.classList.toggle('nav--aberto');
      botaoMenu.setAttribute('aria-expanded', String(aberto));
      document.body.style.overflow = aberto ? 'hidden' : '';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('nav--aberto');
        botaoMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav--aberto')) {
        botaoMenu.click();
      }
    });
  }

  /* --------------------------- Header com sombra + barra de progresso ----- */
  var header = document.querySelector('.header');
  var progresso = document.querySelector('.progresso-leitura');

  function aoRolar() {
    if (header) {
      header.classList.toggle('header--fixo', window.scrollY > 10);
    }
    if (progresso) {
      var alcance = document.documentElement.scrollHeight - window.innerHeight;
      var pct = alcance > 0 ? (window.scrollY / alcance) * 100 : 0;
      progresso.style.height = pct + 'vh';
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  /* --------------------------------------- Revelar ao entrar na tela ------ */
  /* A classe .js-anim vem de um script inline no <head>, para o conteúdo não
     piscar antes de esconder. Aqui ela é retirada quando não há animação. */
  var alvos = document.querySelectorAll('.revela');

  if (!alvos.length || reduzMovimento || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js-anim');
    alvos.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    alvos.forEach(function (el) { observador.observe(el); });
  }

  /* ------------------------- Constelação animada (seção Quem Somos) ------- */
  var canvas = document.querySelector('.quem-somos__particulas');

  if (canvas && canvas.getContext && !reduzMovimento) {
    var ctx = canvas.getContext('2d');
    var pontos = [];
    var largura = 0;
    var altura = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var DISTANCIA = 140;

    function dimensionar() {
      var box = canvas.getBoundingClientRect();
      largura = box.width;
      altura = box.height;
      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var quantidade = Math.max(18, Math.min(46, Math.round((largura * altura) / 26000)));
      pontos = [];
      for (var i = 0; i < quantidade; i++) {
        pontos.push({
          x: Math.random() * largura,
          y: Math.random() * altura,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.9
        });
      }
    }

    function desenhar() {
      ctx.clearRect(0, 0, largura, altura);

      for (var i = 0; i < pontos.length; i++) {
        var p = pontos[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > largura) p.vx *= -1;
        if (p.y < 0 || p.y > altura) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fill();

        for (var j = i + 1; j < pontos.length; j++) {
          var q = pontos[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < DISTANCIA) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(0, 0, 0, ' + (0.11 * (1 - dist / DISTANCIA)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(desenhar);
    }

    dimensionar();
    desenhar();

    var temporizador;
    window.addEventListener('resize', function () {
      clearTimeout(temporizador);
      temporizador = setTimeout(dimensionar, 180);
    });
  }

  /* ------------------------------- Carrossel de parceiros (duplicação) ---- */
  /* `innerHTML += innerHTML` reconstruía todas as imagens do zero: as que já
     tinham baixado voltavam a zero e as cópias, fora da área visível da
     trilha, nunca disparavam o `loading=lazy`. Clonar os nós preserva o que já
     carregou, e as cópias entram com carregamento imediato. */
  document.querySelectorAll('.carrossel__trilha').forEach(function (trilha) {
    if (trilha.dataset.duplicado === 'sim') return;

    Array.prototype.slice.call(trilha.children).forEach(function (item) {
      var copia = item.cloneNode(true);
      copia.setAttribute('aria-hidden', 'true');
      if (copia.tagName === 'IMG') { copia.alt = ''; copia.loading = 'eager'; }
      trilha.appendChild(copia);
    });

    trilha.dataset.duplicado = 'sim';
  });

  /* ---------------------------------------- Vídeos do YouTube sob demanda - */
  document.querySelectorAll('.video[data-video]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var id = item.dataset.video;
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      frame.title = item.getAttribute('aria-label') || 'Vídeo do YouTube';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      item.appendChild(frame);
      item.classList.add('video--ativo');
      item.style.setProperty('--seta', 'none');
      item.querySelectorAll('.video__play').forEach(function (p) { p.remove(); });
    });
  });

  /* ------------------------------------------------- Newsletter (front) --- */
  var formNewsletter = document.querySelector('.newsletter');
  if (formNewsletter) {
    formNewsletter.addEventListener('submit', function (e) {
      e.preventDefault();
      var campo = formNewsletter.querySelector('input[type="email"]');
      var aviso = formNewsletter.querySelector('.newsletter__aviso');
      if (!campo || !campo.value) return;

      if (!aviso) {
        aviso = document.createElement('p');
        aviso.className = 'newsletter__aviso';
        aviso.style.cssText = 'font-size:14px;margin:0;color:#4b4b4b';
        formNewsletter.appendChild(aviso);
      }
      /* Sem back-end: conecte aqui o seu serviço de e-mail marketing. */
      aviso.textContent = 'Obrigado! Cadastre este formulário no seu serviço de e-mail para ativar o envio.';
      campo.value = '';
    });
  }

  /* ---------------------- Busca nas listagens de notícias / agenda -------- */
  document.querySelectorAll('.busca input[type="search"]').forEach(function (campo) {
    var secao = campo.closest('section') || document;
    var lista = document.querySelector('[data-lista]');
    if (!lista) return;

    var vazio = document.querySelector('.sem-resultado');
    var itens = Array.prototype.slice.call(lista.children);

    function filtrar() {
      var termo = campo.value.trim().toLowerCase();
      var achou = 0;

      itens.forEach(function (item) {
        var texto = (item.textContent || '').toLowerCase();
        var combina = !termo || texto.indexOf(termo) !== -1;
        item.hidden = !combina;
        if (combina) achou++;
      });

      if (vazio) vazio.hidden = achou !== 0;
    }

    campo.addEventListener('input', filtrar);
    campo.form && campo.form.addEventListener('submit', function (e) { e.preventDefault(); filtrar(); });
  });

  /* ---------------------------------------------------- Ano do rodapé ----- */
  document.querySelectorAll('[data-ano]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
