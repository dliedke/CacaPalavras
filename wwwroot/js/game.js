/* =============================================================================
 * Caça-Palavras Turbo — Lógica do Jogo
 * Grade gerada dinamicamente com palavras em 8 direções (inclusive diagonais
 * e de trás pra frente). Suporta mouse e toque, dificuldades e categorias.
 * ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------- Configurações ---------------------------- */
  const DIFICULDADES = {
    facil:   { nome: "Fácil",   grid: 10, palavras: 6,  dirs: 2, maxLen: 8,  tempoBonus: 1.0 },
    medio:   { nome: "Médio",   grid: 12, palavras: 9,  dirs: 4, maxLen: 10, tempoBonus: 1.3 },
    dificil: { nome: "Difícil", grid: 14, palavras: 12, dirs: 8, maxLen: 12, tempoBonus: 1.7 },
    expert:  { nome: "Expert",  grid: 16, palavras: 16, dirs: 8, maxLen: 14, tempoBonus: 2.2 },
  };

  // Direções: [dLinha, dColuna]. As primeiras são as mais fáceis.
  //  →  ↓  ↘  ↗   ←  ↑  ↖  ↙
  const TODAS_DIRECOES = [
    [0, 1],   // horizontal →
    [1, 0],   // vertical ↓
    [1, 1],   // diagonal ↘
    [-1, 1],  // diagonal ↗
    [0, -1],  // horizontal ← (trás pra frente)
    [-1, 0],  // vertical ↑
    [-1, -1], // diagonal ↖
    [1, -1],  // diagonal ↙
  ];

  const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const CORES_ACHADO = [
    "#ff5d8f", "#ff9f1c", "#ffd23f", "#8ac926", "#3aa0ff",
    "#4cc9f0", "#7b2ff7", "#f15bb5", "#00bbf9", "#00f5d4",
    "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0",
  ];

  /* ------------------------------- Estado --------------------------------- */
  const estado = {
    dificuldade: "medio",
    categoria: "Todas",
    tamanho: 12,
    grade: [],           // matriz de letras
    solucoes: [],        // {palavra, exibicao, celulas:[{l,c}], achado, cor}
    bonus: null,          // palavra secreta oculta: {palavra, exibicao, celulas, achado} ou null
    achadas: 0,
    pontos: 0,
    sequencia: 0,
    inicio: 0,
    timerId: null,
    jogando: false,
    dicasUsadas: 0,
  };

  /* --------------------------- Recorde persistente ------------------------- */
  // Guarda a melhor pontuação de cada dificuldade no navegador do jogador.
  const CHAVE_RECORDES = "cacapalavras.recordes.v1";

  function carregarRecordes() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_RECORDES)) || {};
    } catch (e) {
      return {};
    }
  }

  function salvarRecordes() {
    try {
      localStorage.setItem(CHAVE_RECORDES, JSON.stringify(recordes));
    } catch (e) {
      /* localStorage indisponível (ex.: modo privado) — recorde só dura a sessão. */
    }
  }

  const recordes = carregarRecordes(); // { [dificuldade]: { pontos, tempo } }

  function recordeAtual() {
    const r = recordes[estado.dificuldade];
    return r ? r.pontos : 0;
  }

  /* ------------------------- Utilidades de texto -------------------------- */
  // Remove acentos e cedilha, converte para MAIÚSCULAS (para a grade).
  function normalizar(txt) {
    return txt
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();
  }

  // Versão "bonita" para exibir na lista (mantém acentos, primeira maiúscula).
  function embelezar(txt) {
    const t = txt.charAt(0).toUpperCase() + txt.slice(1);
    return t;
  }

  function letraAleatoria() {
    return ALFABETO[(Math.random() * ALFABETO.length) | 0];
  }

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* -------------------------- Seleção de palavras ------------------------- */
  function escolherPalavras(conf) {
    const banco = WORD_BANK[estado.categoria] || WORD_BANK["Todas"];
    // Candidatas: normalizadas, dentro do tamanho, únicas, com 3+ letras.
    const vistas = new Set();
    const candidatas = [];
    for (const original of embaralhar(banco)) {
      const norm = normalizar(original);
      if (norm.length < 3 || norm.length > Math.min(conf.maxLen, conf.grid)) continue;
      if (vistas.has(norm)) continue;
      vistas.add(norm);
      candidatas.push({ norm, exibicao: embelezar(original) });
      if (candidatas.length >= conf.palavras * 3) break;
    }
    // Prioriza variedade de tamanhos: ordena por tamanho e intercala.
    return candidatas;
  }

  /* --------------------------- Geração da grade --------------------------- */
  function podeColocar(grade, palavra, l, c, dir, tamanho) {
    for (let i = 0; i < palavra.length; i++) {
      const nl = l + dir[0] * i;
      const nc = c + dir[1] * i;
      if (nl < 0 || nl >= tamanho || nc < 0 || nc >= tamanho) return false;
      const atual = grade[nl][nc];
      if (atual !== "" && atual !== palavra[i]) return false;
    }
    return true;
  }

  function colocar(grade, palavra, l, c, dir) {
    const celulas = [];
    for (let i = 0; i < palavra.length; i++) {
      const nl = l + dir[0] * i;
      const nc = c + dir[1] * i;
      grade[nl][nc] = palavra[i];
      celulas.push({ l: nl, c: nc });
    }
    return celulas;
  }

  function tentarColocar(grade, palavra, dirsPermitidas, tamanho) {
    const dirs = embaralhar(dirsPermitidas);
    for (let tentativa = 0; tentativa < 120; tentativa++) {
      const dir = dirs[tentativa % dirs.length];
      const l = (Math.random() * tamanho) | 0;
      const c = (Math.random() * tamanho) | 0;
      if (podeColocar(grade, palavra, l, c, dir, tamanho)) {
        return { celulas: colocar(grade, palavra, l, c, dir) };
      }
    }
    return null;
  }

  // Tenta esconder UMA palavra bônus extra na grade, fora da lista visível.
  // Não é obrigatória: se não achar espaço, o jogo segue normalmente sem ela.
  function tentarColocarBonus(grade, solucoes, dirsPermitidas, tamanho, conf) {
    const banco = WORD_BANK[estado.categoria] || WORD_BANK["Todas"];
    const usadas = new Set(solucoes.map((s) => s.palavra));
    let tentativas = 0;
    for (const original of embaralhar(banco)) {
      if (tentativas >= 60) break;
      const norm = normalizar(original);
      if (norm.length < 3 || norm.length > Math.min(conf.maxLen, conf.grid)) continue;
      if (usadas.has(norm)) continue;
      usadas.add(norm);
      tentativas++;
      const res = tentarColocar(grade, norm, dirsPermitidas, tamanho);
      if (res) {
        return { palavra: norm, exibicao: embelezar(original), celulas: res.celulas, achado: false };
      }
    }
    return null;
  }

  // Gera uma grade a partir de um "fornecedor" de candidatas.
  // fornecerCandidatas() é chamado a cada tentativa e deve devolver a lista
  // de palavras {norm, exibicao} a posicionar.
  function gerarGradeCom(fornecerCandidatas, opcoes) {
    const conf = DIFICULDADES[estado.dificuldade];
    estado.tamanho = conf.grid;
    const tamanho = conf.grid;
    const dirsPermitidas = TODAS_DIRECOES.slice(0, conf.dirs);
    const maxTentativas = (opcoes && opcoes.tentativas) || 25;
    const minObrigatorio =
      opcoes && opcoes.minObrigatorio != null
        ? opcoes.minObrigatorio
        : Math.min(conf.palavras, 4);

    // Tenta gerar uma grade válida algumas vezes.
    for (let global = 0; global < maxTentativas; global++) {
      const grade = Array.from({ length: tamanho }, () => Array(tamanho).fill(""));
      const solucoes = [];
      const candidatas = fornecerCandidatas();
      // Coloca as maiores primeiro (mais difíceis de encaixar).
      candidatas.sort((a, b) => b.norm.length - a.norm.length);

      for (const cand of candidatas) {
        if (solucoes.length >= conf.palavras) break;
        const res = tentarColocar(grade, cand.norm, dirsPermitidas, tamanho);
        if (res) {
          solucoes.push({
            palavra: cand.norm,
            exibicao: cand.exibicao,
            celulas: res.celulas,
            achado: false,
            cor: null,
          });
        }
      }

      if (solucoes.length >= minObrigatorio) {
        // Tenta esconder uma palavra bônus extra (best-effort, pode falhar).
        const bonus = tentarColocarBonus(grade, solucoes, dirsPermitidas, tamanho, conf);

        // Preenche vazios com letras aleatórias.
        for (let l = 0; l < tamanho; l++)
          for (let c = 0; c < tamanho; c++)
            if (grade[l][c] === "") grade[l][c] = letraAleatoria();

        estado.grade = grade;
        estado.solucoes = solucoes;
        estado.bonus = bonus;
        return true;
      }
    }
    return false;
  }

  // Novo jogo: sorteia um conjunto novo de palavras da categoria atual.
  function gerarGrade() {
    return gerarGradeCom(() =>
      escolherPalavras(DIFICULDADES[estado.dificuldade])
    );
  }

  // Trocar: reposiciona as MESMAS palavras da rodada atual em novos lugares.
  function gerarGradeMesmasPalavras() {
    const palavras = estado.solucoes.map((s) => ({
      norm: s.palavra,
      exibicao: s.exibicao,
    }));
    // Exige recolocar TODAS as palavras da rodada; mais tentativas para isso.
    return gerarGradeCom(() => palavras.slice(), {
      minObrigatorio: palavras.length,
      tentativas: 80,
    });
  }

  /* --------------------------- Referências DOM ---------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const gridEl = $("#grid");
  const listaEl = $("#lista-palavras");
  const contadorEl = $("#contador");
  const pontosEl = $("#pontos");
  const tempoEl = $("#tempo");
  const sequenciaEl = $("#sequencia");
  const recordeEl = $("#recorde");

  let celulasEl = []; // matriz de elementos DOM

  /* ------------------------- Renderização da grade ------------------------ */
  function renderGrade() {
    const t = estado.tamanho;
    gridEl.style.setProperty("--n", t);
    gridEl.innerHTML = "";
    celulasEl = Array.from({ length: t }, () => Array(t));
    for (let l = 0; l < t; l++) {
      for (let c = 0; c < t; c++) {
        const cel = document.createElement("div");
        cel.className = "cel";
        cel.textContent = estado.grade[l][c];
        cel.dataset.l = l;
        cel.dataset.c = c;
        gridEl.appendChild(cel);
        celulasEl[l][c] = cel;
      }
    }
    ajustarFonteGrade();
  }

  // Ajusta o tamanho da fonte das letras conforme o tamanho real da célula,
  // para que as letras fiquem grandes e legíveis em qualquer grade/tela.
  function ajustarFonteGrade() {
    requestAnimationFrame(() => {
      if (!celulasEl.length || !celulasEl[0][0]) return;
      const largura = celulasEl[0][0].getBoundingClientRect().width;
      if (largura > 0) {
        gridEl.style.setProperty("--cel-fonte", (largura * 0.6).toFixed(1) + "px");
      }
    });
  }

  function renderLista() {
    listaEl.innerHTML = "";
    // ordena por tamanho para uma lista bonita
    const ordenadas = estado.solucoes
      .map((s, i) => ({ s, i }))
      .sort((a, b) => a.s.exibicao.localeCompare(b.s.exibicao));
    for (const { s, i } of ordenadas) {
      const li = document.createElement("li");
      li.className = "palavra-item" + (s.achado ? " achado" : "");
      li.dataset.idx = i;
      li.textContent = s.exibicao;
      if (s.achado && s.cor) li.style.setProperty("--cor-item", s.cor);
      listaEl.appendChild(li);
    }
    contadorEl.textContent = `${estado.achadas}/${estado.solucoes.length}`;
  }

  /* ----------------------------- Seleção (drag) --------------------------- */
  let selecionando = false;
  let inicioCel = null;
  let celulasSelecionadas = [];
  let ultimoTick = -1;

  // Destaque da dica (persiste até o próximo toque do jogador).
  let dicaAtual = { cel: null, item: null, timer: null };

  function limparDica() {
    if (dicaAtual.timer) { clearTimeout(dicaAtual.timer); dicaAtual.timer = null; }
    if (dicaAtual.cel) { dicaAtual.cel.classList.remove("dica"); dicaAtual.cel = null; }
    if (dicaAtual.item) { dicaAtual.item.classList.remove("destaque"); dicaAtual.item = null; }
  }

  function coordDoEvento(ev) {
    const ponto = ev.touches ? ev.touches[0] : ev;
    const el = document.elementFromPoint(ponto.clientX, ponto.clientY);
    if (el && el.classList.contains("cel")) {
      return { l: +el.dataset.l, c: +el.dataset.c, el };
    }
    return null;
  }

  function limparSelecaoTemp() {
    for (const cel of celulasSelecionadas) cel.classList.remove("sel");
    celulasSelecionadas = [];
  }

  // Retorna a lista de células em linha reta entre início e fim, se válida.
  function celulasEntre(a, b) {
    const dl = b.l - a.l;
    const dc = b.c - a.c;
    const passoL = Math.sign(dl);
    const passoC = Math.sign(dc);
    const alinhado =
      dl === 0 || dc === 0 || Math.abs(dl) === Math.abs(dc); // reta ou diagonal
    if (!alinhado) return null;
    const passos = Math.max(Math.abs(dl), Math.abs(dc));
    const cels = [];
    for (let i = 0; i <= passos; i++) {
      cels.push({ l: a.l + passoL * i, c: a.c + passoC * i });
    }
    return cels;
  }

  function atualizarSelecao(fim) {
    if (!inicioCel) return;
    const cels = celulasEntre(inicioCel, fim);
    if (!cels) return;
    limparSelecaoTemp();
    celulasSelecionadas = cels.map(({ l, c }) => celulasEl[l][c]);
    for (const cel of celulasSelecionadas) cel.classList.add("sel");
    if (cels.length - 1 !== ultimoTick) {
      ultimoTick = cels.length - 1;
      SoundFX.tick();
    }
  }

  // Cancela a seleção em andamento (ex.: quando um 2º dedo entra para o zoom).
  function cancelarSelecao() {
    selecionando = false;
    limparSelecaoTemp();
    inicioCel = null;
  }

  function iniciarSelecao(ev) {
    if (!estado.jogando) return;
    // Com 2+ dedos, deixa o navegador fazer o zoom de pinça.
    if (ev.touches && ev.touches.length > 1) { cancelarSelecao(); return; }
    const coord = coordDoEvento(ev);
    if (!coord) return;
    ev.preventDefault();
    limparDica(); // primeiro toque remove o destaque da dica
    selecionando = true;
    inicioCel = { l: coord.l, c: coord.c };
    ultimoTick = -1;
    limparSelecaoTemp();
    celulasSelecionadas = [celulasEl[coord.l][coord.c]];
    celulasEl[coord.l][coord.c].classList.add("sel");
  }

  function moverSelecao(ev) {
    // Segundo dedo detectado no meio do arraste: cancela p/ permitir o zoom.
    if (ev.touches && ev.touches.length > 1) { cancelarSelecao(); return; }
    if (!selecionando) return;
    const coord = coordDoEvento(ev);
    if (!coord) return;
    ev.preventDefault();
    atualizarSelecao({ l: coord.l, c: coord.c });
  }

  function terminarSelecao() {
    if (!selecionando) return;
    selecionando = false;
    avaliarSelecao();
    limparSelecaoTemp();
    inicioCel = null;
  }

  function textoDaSelecao(cels) {
    return cels.map((cel) => cel.textContent).join("");
  }

  function mesmaLinha(celsA, solCels) {
    if (celsA.length !== solCels.length) return false;
    const setA = celsA.map((c) => `${c.dataset.l},${c.dataset.c}`).sort().join("|");
    const setB = solCels.map((c) => `${c.l},${c.c}`).sort().join("|");
    return setA === setB;
  }

  // Coordenadas {l,c} das células selecionadas.
  function coordsDaSelecao() {
    return celulasSelecionadas.map((c) => ({ l: +c.dataset.l, c: +c.dataset.c }));
  }

  // Produto vetorial 2D (zero => vetores paralelos/colineares).
  function cruz(a, b) {
    return a.l * b.c - a.c * b.l;
  }

  // Seleção "tolerante": aceita se a seleção cobre a palavra na mesma linha,
  // permitindo errar até UMA célula em cada ponta (uma letra a mais ou a menos).
  // Ignora o sentido do arraste (funciona de trás pra frente também).
  function selecaoCobrePalavra(sel, palavra) {
    if (sel.length < 2 || palavra.length < 2) return false;
    const W0 = palavra[0];
    const WD = {
      l: Math.sign(palavra[1].l - W0.l),
      c: Math.sign(palavra[1].c - W0.c),
    };
    const S0 = sel[0];
    const Sn = sel[sel.length - 1];
    const D = { l: Math.sign(Sn.l - S0.l), c: Math.sign(Sn.c - S0.c) };
    if (D.l === 0 && D.c === 0) return false;
    // A seleção precisa ser paralela à direção da palavra...
    if (cruz(D, WD) !== 0) return false;
    // ...e estar exatamente sobre a mesma linha da grade.
    if (cruz({ l: S0.l - W0.l, c: S0.c - W0.c }, WD) !== 0) return false;
    // Índice de cada célula ao longo da linha (0 = início da palavra).
    const t = (X) =>
      WD.l !== 0 ? (X.l - W0.l) * WD.l : (X.c - W0.c) * WD.c;
    const a = t(S0);
    const b = t(Sn);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const L = palavra.length;
    // Pontas podem diferir em no máximo 1 célula em relação à palavra.
    return Math.abs(lo - 0) <= 1 && Math.abs(hi - (L - 1)) <= 1;
  }

  function avaliarSelecao() {
    if (celulasSelecionadas.length < 2) return;
    const texto = textoDaSelecao(celulasSelecionadas);
    const invertido = texto.split("").reverse().join("");

    // 1ª passada: correspondência exata (letras + células).
    for (const sol of estado.solucoes) {
      if (sol.achado) continue;
      const bate =
        (texto === sol.palavra || invertido === sol.palavra) &&
        mesmaLinha(celulasSelecionadas, sol.celulas);
      if (bate) {
        marcarAchado(sol);
        return;
      }
    }

    // 2ª passada: correspondência tolerante (±1 letra na ponta) para
    // facilitar a seleção, principalmente no toque.
    const sel = coordsDaSelecao();
    for (const sol of estado.solucoes) {
      if (sol.achado) continue;
      if (selecaoCobrePalavra(sel, sol.celulas)) {
        marcarAchado(sol);
        return;
      }
    }

    // 3ª passada: palavra secreta bônus (não aparece na lista de palavras).
    if (estado.bonus && !estado.bonus.achado) {
      const bateBonus =
        (texto === estado.bonus.palavra || invertido === estado.bonus.palavra) &&
        mesmaLinha(celulasSelecionadas, estado.bonus.celulas);
      if (bateBonus) {
        marcarBonusAchado();
        return;
      }
    }

    // Não achou nada
    SoundFX.error();
    estado.sequencia = 0;
    atualizarPlacar();
    piscarErro();
  }

  function piscarErro() {
    for (const cel of celulasSelecionadas) {
      cel.classList.add("erro");
      setTimeout(() => cel.classList.remove("erro"), 350);
    }
  }

  function marcarAchado(sol) {
    sol.achado = true;
    sol.cor = CORES_ACHADO[(Math.random() * CORES_ACHADO.length) | 0];
    estado.achadas++;
    estado.sequencia++;

    // Pontuação: base pelo tamanho + bônus de sequência + bônus de dificuldade.
    const conf = DIFICULDADES[estado.dificuldade];
    const base = sol.palavra.length * 10;
    const bonusSeq = (estado.sequencia - 1) * 5;
    const ganho = Math.round((base + bonusSeq) * conf.tempoBonus);
    estado.pontos += ganho;

    for (const { l, c } of sol.celulas) {
      const cel = celulasEl[l][c];
      cel.classList.add("achado");
      cel.style.setProperty("--cor", sol.cor);
      cel.classList.add("pop");
      setTimeout(() => cel.classList.remove("pop"), 400);
    }

    SoundFX.found(estado.sequencia);
    mostrarGanho(ganho);
    atualizarPlacar();
    renderLista();

    if (estado.achadas === estado.solucoes.length) {
      vitoria();
    }
  }

  function mostrarGanho(valor, bonus) {
    const flut = document.createElement("div");
    flut.className = "ganho-flutuante" + (bonus ? " bonus" : "");
    flut.textContent = (bonus ? "🎁 +" : "+") + valor;
    const alvo = celulasSelecionadas[0] || gridEl;
    const rect = (alvo.getBoundingClientRect ? alvo : gridEl).getBoundingClientRect();
    flut.style.left = rect.left + rect.width / 2 + "px";
    flut.style.top = rect.top + "px";
    document.body.appendChild(flut);
    setTimeout(() => flut.remove(), 1000);
  }

  // Palavra secreta encontrada: pontos extra + celebração própria, mas não
  // conta para o total de palavras nem mexe na sequência de combo.
  function marcarBonusAchado() {
    const bonus = estado.bonus;
    bonus.achado = true;

    const conf = DIFICULDADES[estado.dificuldade];
    const ganho = Math.round((bonus.palavra.length * 15 + 40) * conf.tempoBonus);
    estado.pontos += ganho;

    for (const { l, c } of bonus.celulas) {
      const cel = celulasEl[l][c];
      cel.classList.add("bonus", "pop");
      setTimeout(() => cel.classList.remove("pop"), 400);
    }

    SoundFX.bonus();
    mostrarGanho(ganho, true);
    mostrarToastBonus(bonus.exibicao);
    atualizarPlacar();
  }

  function mostrarToastBonus(exibicao) {
    const toast = document.createElement("div");
    toast.className = "toast-bonus";
    toast.textContent = `🎁 Palavra secreta: ${exibicao}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("saindo"), 2200);
    setTimeout(() => toast.remove(), 2700);
  }

  /* ------------------------------- Placar --------------------------------- */
  function atualizarPlacar() {
    pontosEl.textContent = estado.pontos;
    contadorEl.textContent = `${estado.achadas}/${estado.solucoes.length}`;
    sequenciaEl.textContent = estado.sequencia > 1 ? `🔥 ${estado.sequencia}x` : "—";
    recordeEl.textContent = recordeAtual();
  }

  function formatarTempo(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function iniciarTimer() {
    estado.inicio = Date.now();
    if (estado.timerId) clearInterval(estado.timerId);
    estado.timerId = setInterval(() => {
      tempoEl.textContent = formatarTempo(Date.now() - estado.inicio);
    }, 500);
  }

  function pararTimer() {
    if (estado.timerId) clearInterval(estado.timerId);
    estado.timerId = null;
  }

  /* ------------------------------- Dica ----------------------------------- */
  function darDica() {
    if (!estado.jogando) return;
    const naoAchadas = estado.solucoes.filter((s) => !s.achado);
    if (!naoAchadas.length) return;
    const sol = naoAchadas[(Math.random() * naoAchadas.length) | 0];
    estado.dicasUsadas++;
    estado.pontos = Math.max(0, estado.pontos - 15);
    estado.sequencia = 0;
    atualizarPlacar();
    SoundFX.hint();

    limparDica(); // remove uma dica anterior, se houver

    const { l, c } = sol.celulas[0];
    const cel = celulasEl[l][c];

    // Rola até o tabuleiro para a dica ficar visível (essencial no mobile,
    // onde o board fica acima dos controles).
    try {
      gridEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    } catch (e) {
      gridEl.scrollIntoView();
    }

    // Marca a primeira letra em amarelo e MANTÉM até o próximo toque
    // (não depende de animação, então funciona com "Reduzir movimento").
    cel.classList.add("dica");
    dicaAtual.cel = cel;

    // Destaca também o item correspondente na lista.
    const item = listaEl.querySelector(`[data-idx="${estado.solucoes.indexOf(sol)}"]`);
    if (item) {
      item.classList.add("destaque");
      dicaAtual.item = item;
    }

    // Segurança: some sozinha após 12s caso o jogador não toque em nada.
    dicaAtual.timer = setTimeout(limparDica, 12000);
  }

  /* ------------------------------ Vitória --------------------------------- */
  function vitoria() {
    estado.jogando = false;
    pararTimer();
    SoundFX.win();
    lancarConfete();

    const tempo = Date.now() - estado.inicio;
    // Bônus de tempo e de dificuldade final.
    const conf = DIFICULDADES[estado.dificuldade];
    const bonusTempo = Math.max(0, Math.round((300000 - tempo) / 1000)) ;
    const bonusFinal = Math.round(bonusTempo * conf.tempoBonus);
    estado.pontos += bonusFinal;

    // Verifica e salva novo recorde para a dificuldade atual.
    const novoRecorde = estado.pontos > recordeAtual();
    if (novoRecorde) {
      recordes[estado.dificuldade] = { pontos: estado.pontos, tempo };
      salvarRecordes();
      setTimeout(() => SoundFX.recorde(), 550);
    }
    atualizarPlacar();

    const modal = $("#modal-vitoria");
    $("#vit-pontos").textContent = estado.pontos;
    $("#vit-tempo").textContent = formatarTempo(tempo);
    $("#vit-palavras").textContent = estado.solucoes.length;
    $("#vit-dicas").textContent = estado.dicasUsadas;
    $("#vit-bonus").textContent = "+" + bonusFinal;
    $("#vit-recorde-msg").hidden = !novoRecorde;
    modal.classList.add("aberto");
  }

  /* ------------------------------ Confete --------------------------------- */
  function lancarConfete() {
    const cores = ["#ff5d8f", "#ffd23f", "#8ac926", "#4cc9f0", "#7b2ff7", "#ff9f1c", "#00f5d4"];
    const total = 140;
    const cont = document.createElement("div");
    cont.className = "confete-container";
    document.body.appendChild(cont);
    for (let i = 0; i < total; i++) {
      const p = document.createElement("div");
      p.className = "confete";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = cores[(Math.random() * cores.length) | 0];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      p.style.animationDuration = 2 + Math.random() * 2 + "s";
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      const tam = 6 + Math.random() * 8;
      p.style.width = tam + "px";
      p.style.height = tam * (0.4 + Math.random()) + "px";
      cont.appendChild(p);
    }
    setTimeout(() => cont.remove(), 4500);
  }

  /* --------------------------- Novo jogo / fluxo -------------------------- */
  function novoJogo() {
    SoundFX.unlock();
    fecharModais();
    limparDica();
    estado.achadas = 0;
    estado.pontos = 0;
    estado.sequencia = 0;
    estado.dicasUsadas = 0;
    estado.bonus = null;
    estado.jogando = true;

    const ok = gerarGrade();
    if (!ok) {
      // fallback: tenta com "Todas" caso a categoria não gere palavras suficientes
      const catAntiga = estado.categoria;
      estado.categoria = "Todas";
      gerarGrade();
      estado.categoria = catAntiga;
    }

    renderGrade();
    renderLista();
    atualizarPlacar();
    tempoEl.textContent = "00:00";
    iniciarTimer();
    SoundFX.start();
  }

  // "Trocar": mantém as mesmas palavras da rodada, mas embaralha as posições
  // na grade e zera o progresso. Se ainda não houver rodada, começa uma nova.
  function trocarDisposicao() {
    if (!estado.solucoes.length) { novoJogo(); return; }
    SoundFX.unlock();
    fecharModais();
    limparDica();
    estado.achadas = 0;
    estado.pontos = 0;
    estado.sequencia = 0;
    estado.dicasUsadas = 0;
    estado.bonus = null;
    estado.jogando = true;

    const ok = gerarGradeMesmasPalavras();
    if (!ok) { novoJogo(); return; }

    renderGrade();
    renderLista();
    atualizarPlacar();
    tempoEl.textContent = "00:00";
    iniciarTimer();
    SoundFX.start();
  }

  function fecharModais() {
    document.querySelectorAll(".modal.aberto").forEach((m) => m.classList.remove("aberto"));
  }

  /* --------------------------- Preencher menus ---------------------------- */
  function preencherCategorias() {
    const sel = $("#sel-categoria");
    const cats = Object.keys(WORD_BANK).filter((c) => c !== "Todas");
    cats.sort((a, b) => a.localeCompare(b));
    const ordem = ["Todas", ...cats];
    for (const cat of ordem) {
      const opt = document.createElement("option");
      opt.value = cat;
      const n = WORD_BANK[cat].length;
      opt.textContent = cat === "Todas" ? `🎲 Todas (${n} palavras)` : `${cat} (${n})`;
      sel.appendChild(opt);
    }
    sel.value = estado.categoria;
  }

  /* ------------------------------ Eventos --------------------------------- */
  function ligarEventos() {
    // Seleção por mouse
    gridEl.addEventListener("mousedown", iniciarSelecao);
    window.addEventListener("mousemove", moverSelecao);
    window.addEventListener("mouseup", terminarSelecao);

    // Seleção por toque
    gridEl.addEventListener("touchstart", iniciarSelecao, { passive: false });
    gridEl.addEventListener("touchmove", moverSelecao, { passive: false });
    window.addEventListener("touchend", terminarSelecao);
    window.addEventListener("touchcancel", terminarSelecao);

    // Botões
    $("#btn-novo").addEventListener("click", () => { SoundFX.click(); novoJogo(); });
    $("#btn-dica").addEventListener("click", () => { SoundFX.click(); darDica(); });
    $("#btn-embaralhar").addEventListener("click", () => { SoundFX.click(); trocarDisposicao(); });
    $("#btn-jogar-novamente").addEventListener("click", () => { SoundFX.click(); novoJogo(); });
    $("#btn-fechar-modal").addEventListener("click", () => { SoundFX.click(); fecharModais(); });

    // Ajuda
    $("#btn-ajuda").addEventListener("click", () => { SoundFX.click(); $("#modal-ajuda").classList.add("aberto"); });
    $("#btn-fechar-ajuda").addEventListener("click", () => { SoundFX.click(); fecharModais(); });

    // Mudança de dificuldade / categoria
    document.querySelectorAll(".dif-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        document.querySelectorAll(".dif-btn").forEach((b) => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        estado.dificuldade = btn.dataset.dif;
        novoJogo();
      });
    });

    $("#sel-categoria").addEventListener("change", (e) => {
      estado.categoria = e.target.value;
      novoJogo();
    });

    // Mudo
    const btnMudo = $("#btn-mudo");
    btnMudo.addEventListener("click", () => {
      const novo = !SoundFX.isMuted();
      SoundFX.setMuted(novo);
      btnMudo.textContent = novo ? "🔇" : "🔊";
      btnMudo.classList.toggle("mutado", novo);
      if (!novo) SoundFX.click();
    });

    // Fechar modal clicando no fundo
    document.querySelectorAll(".modal").forEach((m) => {
      m.addEventListener("click", (e) => { if (e.target === m) fecharModais(); });
    });

    // Evita menu de contexto atrapalhando o toque longo
    gridEl.addEventListener("contextmenu", (e) => e.preventDefault());

    // Recalcula o tamanho das letras ao redimensionar/girar a tela.
    let resizeTid = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTid);
      resizeTid = setTimeout(ajustarFonteGrade, 120);
    });
    window.addEventListener("orientationchange", () => setTimeout(ajustarFonteGrade, 200));
  }

  /* ------------------------------- Início --------------------------------- */
  function init() {
    preencherCategorias();
    ligarEventos();
    document.querySelectorAll(".dif-btn").forEach((b) =>
      b.classList.toggle("ativo", b.dataset.dif === estado.dificuldade)
    );
    $("#total-banco").textContent = TOTAL_PALAVRAS;
    novoJogo();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
