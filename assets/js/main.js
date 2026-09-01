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

  /* --------------------- Inscrição nas oficinas do MOSI ------------------- */
  var formOficinas = document.querySelector('#form-oficinas');

  if (formOficinas) {
    var recebido = document.querySelector('#inscricao-recebida');
    var erroGeral = document.querySelector('#erro-geral');
    var erroOficina = document.querySelector('#erro-oficina');
    var blocoAcess = document.querySelector('#acessibilidade-detalhe');
    var acessQual = document.querySelector('#acessibilidade-qual');
    var blocoResp = document.querySelector('#bloco-responsavel');
    var avisoSemDestino = document.querySelector('#aviso-sem-destino');

    /* Enquanto não houver destino configurado, o aviso aparece ANTES de a
       pessoa preencher, para ninguém perder tempo com um formulário mudo. */
    if (avisoSemDestino) avisoSemDestino.hidden = !!formOficinas.dataset.destino;

    /* A idade é contada na data de início do MOSI, não na data da inscrição:
       quem faz 18 anos antes do evento não precisa de responsável. */
    var INICIO_MOSI = new Date(2026, 8, 14);

    function idadeNoEvento(valor) {
      var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '');
      if (!partes) return null;
      var nasc = new Date(+partes[1], +partes[2] - 1, +partes[3]);
      if (isNaN(nasc.getTime())) return null;
      var idade = INICIO_MOSI.getFullYear() - nasc.getFullYear();
      var mes = INICIO_MOSI.getMonth() - nasc.getMonth();
      if (mes < 0 || (mes === 0 && INICIO_MOSI.getDate() < nasc.getDate())) idade--;
      return idade;
    }

    /* Contador de caracteres */
    document.querySelectorAll('[data-contador]').forEach(function (saida) {
      var campo = document.getElementById(saida.dataset.contador);
      if (!campo) return;
      var atualiza = function () { saida.textContent = campo.value.length; };
      campo.addEventListener('input', atualiza);
      atualiza();
    });

    /* Campo de acessibilidade: só aparece (e só é obrigatório) no "Sim" */
    formOficinas.querySelectorAll('input[name="acessibilidade"]').forEach(function (opcao) {
      opcao.addEventListener('change', function () {
        var precisa = opcao.checked && opcao.value === 'Sim';
        blocoAcess.hidden = !precisa;
        if (!precisa) { acessQual.value = ''; acessQual.removeAttribute('aria-invalid'); }
      });
    });

    /* Bloco do responsável: só para quem tem menos de 18 anos no início do MOSI */
    var nascimento = document.querySelector('#nascimento');
    nascimento.addEventListener('change', function () {
      var idade = idadeNoEvento(nascimento.value);
      var menor = idade !== null && idade < 18;
      blocoResp.hidden = !menor;
      if (!menor) {
        blocoResp.querySelectorAll('input').forEach(function (c) {
          if (c.type === 'checkbox') c.checked = false; else c.value = '';
          c.removeAttribute('aria-invalid');
        });
      }
    });

    function marcar(campo, invalido) {
      if (invalido) campo.setAttribute('aria-invalid', 'true');
      else campo.removeAttribute('aria-invalid');
      return invalido;
    }

    function validar() {
      var faltando = [];

      /* 1. pelo menos uma oficina */
      var oficinas = formOficinas.querySelectorAll('input[name="oficina"]:checked');
      erroOficina.hidden = oficinas.length > 0;
      if (!oficinas.length) faltando.push(formOficinas.querySelector('input[name="oficina"]'));

      /* 2. campos de texto obrigatórios que estão visíveis */
      formOficinas.querySelectorAll('input[required], textarea[required]').forEach(function (campo) {
        if (campo.type === 'radio' || campo.type === 'checkbox') return;
        if (campo.closest('[hidden]')) return;
        var vazio = !campo.value.trim() || (campo.type === 'email' && !campo.checkValidity());
        if (marcar(campo, vazio)) faltando.push(campo);
      });

      /* 3. grupos de escolha única obrigatórios */
      ['disponibilidade', 'experiencia', 'compromisso', 'acessibilidade'].forEach(function (nome) {
        var grupo = formOficinas.querySelectorAll('input[name="' + nome + '"]');
        var marcado = formOficinas.querySelector('input[name="' + nome + '"]:checked');
        if (!marcado && grupo.length) faltando.push(grupo[0]);
      });

      /* 4. detalhe da acessibilidade, quando o bloco está aberto */
      if (!blocoAcess.hidden && marcar(acessQual, !acessQual.value.trim())) faltando.push(acessQual);

      /* 5. dados do responsável, quando o participante é menor de idade */
      if (!blocoResp.hidden) {
        blocoResp.querySelectorAll('input[type="text"], input[type="tel"]').forEach(function (campo) {
          if (marcar(campo, !campo.value.trim())) faltando.push(campo);
        });
        var autoriza = document.querySelector('#responsavel-autoriza');
        if (!autoriza.checked) faltando.push(autoriza);
      }

      /* 6. consentimento de dados */
      var lgpd = formOficinas.querySelector('input[name="lgpd"]');
      if (!lgpd.checked) faltando.push(lgpd);

      return faltando;
    }

    formOficinas.addEventListener('submit', function (e) {
      e.preventDefault();
      erroGeral.hidden = true;

      var faltando = validar();
      if (faltando.length) {
        erroGeral.textContent = 'Faltou preencher ' + faltando.length +
          (faltando.length === 1 ? ' item obrigatório.' : ' itens obrigatórios.') +
          ' Os campos estão destacados abaixo.';
        erroGeral.hidden = false;
        faltando[0].focus({ preventScroll: true });
        faltando[0].scrollIntoView({ block: 'center' });
        return;
      }

      var destino = formOficinas.dataset.destino;

      /* Sem destino configurado o formulário NÃO finge que enviou: avisa e
         oferece os canais diretos, para ninguém achar que se inscreveu. */
      if (!destino) {
        erroGeral.textContent = 'O envio automático ainda não está ligado. ' +
          'Envie sua inscrição pelo WhatsApp (31) 2026-0374 ou para gestaoinstitutoalcantara@gmail.com.';
        erroGeral.hidden = false;
        return;
      }

      var botao = formOficinas.querySelector('button[type="submit"]');
      botao.disabled = true;
      botao.textContent = 'ENVIANDO...';

      /* URLSearchParams e não FormData: vira application/x-www-form-urlencoded,
         que o Apps Script do Google lê em e.parameters e que o navegador manda
         sem preflight de CORS. Com multipart o script recebe o corpo cru. */
      fetch(destino, {
        method: 'POST',
        body: new URLSearchParams(new FormData(formOficinas))
      }).then(function (resposta) {
        if (!resposta.ok) throw new Error('falha no envio');
        formOficinas.hidden = true;
        recebido.hidden = false;
        recebido.scrollIntoView({ block: 'center' });
      }).catch(function () {
        botao.disabled = false;
        botao.textContent = 'ENVIAR INSCRIÇÃO';
        erroGeral.textContent = 'Não conseguimos enviar agora. Tente de novo em instantes ou ' +
          'fale pelo WhatsApp (31) 2026-0374.';
        erroGeral.hidden = false;
      });
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
