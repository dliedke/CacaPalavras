# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

Caça-Palavras Turbo é um jogo de caça-palavras em **HTML + CSS + JavaScript puro, sem build e sem dependências**. Todo o jogo roda no navegador a partir de `wwwroot/`; não há backend real. Há um pequeno host ASP.NET Core (`Program.cs`) cuja única função é servir os arquivos estáticos de `wwwroot/` localmente via F5/debug no Visual Studio — ele não expõe API nem contém lógica de jogo.

O jogo também é publicado como site estático no GitHub Pages (https://dliedke.github.io/CacaPalavras/), abrindo `wwwroot/index.html` diretamente, sem precisar do host ASP.NET Core.

## Comandos

- Rodar localmente com o host ASP.NET Core: `dotnet run` (ou F5 no Visual Studio) — abre `https://localhost:64203` / `http://localhost:64204` (ver `Properties/launchSettings.json`).
- Alternativa sem .NET: abrir `wwwroot/index.html` diretamente no navegador, ou servir `wwwroot/` com qualquer servidor estático.
- Não há testes automatizados, linter ou etapa de build no projeto — é JS/CSS/HTML puro consumido diretamente pelo navegador.

## Arquitetura

Toda a lógica do jogo vive em três scripts carregados em ordem por `wwwroot/index.html`, cada um expondo um único objeto/estado global (sem módulos ES/bundler):

1. **`js/words.js`** — `WORD_BANK`, um objeto `{ categoria: [palavras...] }` com mais de 1300 palavras em português em ~21 categorias, mais a chave especial `"Todas"`. Também define `TOTAL_PALAVRAS`.
2. **`js/audio.js`** — `SoundFX`, um IIFE que sintetiza todos os efeitos sonoros na hora via Web Audio API (osciladores/ruído — nenhum arquivo de áudio é usado). Expõe métodos como `tick()`, `click()`, `found(streak)`, `error()`, `hint()`, `win()`, `start()`, além de `unlock()`/`setMuted()`/`isMuted()`.
3. **`js/game.js`** — IIFE principal com toda a lógica de jogo, dividida em seções internas (ver comentários de bloco no arquivo):
   - **Configuração** — `DIFICULDADES` (facil/medio/dificil/expert: tamanho da grade, nº de palavras, nº de direções permitidas, `segundos` iniciais do modo regressivo), `MODOS` (os modos de jogo), `TEMAS` (temas visuais) e `TODAS_DIRECOES` (os 8 vetores de direção; cada dificuldade usa um prefixo dessa lista).
   - **Tema da rodada** — toda rodada usa palavras de UMA categoria só. Com uma categoria escolhida no seletor, é ela; com a opção "Todas", `sortearCategoriaDaRodada()` sorteia por partida uma das categorias que tenham candidatas suficientes para a dificuldade (`candidatasDa`), guardando o resultado em `estado.categoriaRodada` — que também vale para a palavra secreta e é exibido no chip `#categoria-rodada`. O botão "Trocar" mantém o tema, porque não re-sorteia.
   - **Geração da grade** — `escolherPalavras` seleciona candidatas do `WORD_BANK` (via `candidatasDa`, já restrito ao tema da rodada); `gerarGradeCom` tenta posicionar palavras na grade (maiores primeiro) chamando `colocarComCota`/`tentarColocar`/`podeColocar`/`colocar`, com múltiplas tentativas globais até atingir um mínimo de palavras colocadas; `finalizarGrade` esconde a palavra bônus e preenche o restante com letras aleatórias. `gerarGrade()` sorteia palavras novas; `gerarGradeMesmasPalavras()` (usado no botão "Trocar") reposiciona as mesmas palavras da rodada atual.
   - **Cotas de direção** — diagonais cabem em bem menos lugares que as retas, então o sorteio "escorregava" para horizontal/vertical (medido: 44% das rodadas no Difícil saíam sem nenhuma diagonal). `minDiagonais`/`minInvertidas` em `DIFICULDADES` (3/3 no Difícil, 5/5 no Expert; 0 nas outras) definem cotas mínimas por rodada: `colocarComCota` tenta primeiro as direções ainda devidas (`ehDiagonal`/`ehInvertida`) e cai para qualquer direção permitida se não couber. A cota é validada no fim de cada tentativa global; se nenhuma tentativa cumprir, `gerarGradeCom` usa a `reserva` (primeira grade válida sem cota) em vez de deixar o jogador sem partida.
   - **Seleção (drag)** — unifica mouse e toque via `coordDoEvento`/`iniciarSelecao`/`moverSelecao`/`terminarSelecao`. Suporta gesto de pinça no mobile (cancela a seleção se um 2º dedo aparece, para não atrapalhar o zoom). A validação da palavra em `avaliarSelecao` faz duas passadas: correspondência exata primeiro, depois uma correspondência "tolerante" (`selecaoCobrePalavra`, via produto vetorial) — pensada para facilitar a seleção por toque. A tolerância é assimétrica de propósito: a seleção pode **sobrar** até `SOBRA_MAX` (3) células além de cada ponta da palavra, mas só pode **faltar** `FALTA_MAX` (1) — sobrar é o dedo escorregando, enquanto faltar demais deixaria varrer a linha inteira para achar qualquer palavra nela.
   - **Placar/pontuação** — pontos por palavra combinam tamanho da palavra, bônus de sequência (combo) e multiplicador de dificuldade (`tempoBonus`); há também bônus de tempo ao vencer (`vitoria()`).
   - **Palavra secreta bônus** — `tentarColocarBonus` tenta esconder, best-effort, UMA palavra extra na grade que não aparece na lista (`estado.bonus`), sempre do mesmo tema da rodada. É detectada numa 3ª passada em `avaliarSelecao` (depois das passadas normais de `estado.solucoes`, e com a mesma tolerância delas), não conta para a vitória/contagem de achadas e não afeta a sequência de combo — só dá pontos extra e uma celebração própria (`marcarBonusAchado`, classe CSS `.cel.bonus`, `SoundFX.bonus()`, toast `.toast-bonus`).
   - **Modos de jogo** — `MODOS` define quatro modos (`classico`, `relogio`, `zen`, `cegas`), cada um com um multiplicador de pontos (`mult`) e flags que ligam/desligam regras: `regressivo` (relógio conta para trás e zerar leva a `derrota()`), `semRelogio` (Zen: sem cronômetro e sem bônus de tempo), `mostraPalavras` (`false` no Às Cegas mascara a lista via `mascarar()`), `penalizaErro` e `dicaGratis`. Os botões são gerados por `preencherModos()` a partir do objeto — para criar um modo novo basta acrescentar uma entrada em `MODOS`.
   - **Relógio** — `iniciarTimer`/`atualizarTempo` atendem aos três casos (crescente, regressivo e sem relógio); `ganharTempo()` soma segundos no modo Contra o Relógio e `tempoRestante()`/`tempoDecorrido()` são as fontes de tempo usadas na pontuação final (`calcularBonusFinal`).
   - **Derrota** — só existe no modo regressivo: `derrota()` para o jogo, abre `#modal-derrota` e chama `revelarNaoAchadas()`, que marca na grade (classe `.cel.revelada`) as palavras que ficaram faltando.
   - **Opções do jogador** — objeto `opcoes` salvo em `localStorage` (chave `cacapalavras.opcoes.v1`, funções `carregarOpcoes`/`salvarOpcoes`/`aplicarOpcoes`): tema visual, palavra secreta, som, animações, cronômetro visível e a última dificuldade/categoria/modo escolhidos (retomados em `init()`). Os temas só trocam variáveis CSS em `body[data-tema="..."]`; desligar animações adiciona `body.sem-animacao`.
   - **Recorde persistente** — melhor pontuação por **dificuldade + modo** é salva em `localStorage` (chave `cacapalavras.recordes.v2`, com migração automática da `v1`, que era só por dificuldade; funções `carregarRecordes`/`salvarRecordes`/`chaveRecorde`/`recordeAtual`) e exibida ao vivo no placar (`#recorde`). Comparado e atualizado em `vitoria()`; se bater o recorde, mostra `#vit-recorde-msg` no modal e toca `SoundFX.recorde()`.
   - **Estado** — um único objeto `estado` (não reativo) guarda dificuldade/categoria/modo atuais, a grade, as soluções (`solucoes`, com `{palavra, exibicao, celulas, achado, revelado, cor}`), a palavra bônus (`bonus`, ou `null`), pontuação, sequência e o timer (`inicio`, `fimTempo`). Toda mudança de estado é seguida por chamadas manuais de re-render (`renderGrade`, `renderLista`, `atualizarPlacar`).
   - **Início** — `init()`, chamado em `DOMContentLoaded`, retoma as preferências salvas, preenche categorias/modos/temas, liga os event listeners e inicia o primeiro jogo.

`wwwroot/css/style.css` contém todo o visual/animações/responsividade (incluindo confete e o destaque persistente de dica, feito sem depender de animação para respeitar "reduzir movimento").

### Convenções específicas deste projeto

- Nomes de variáveis, funções e comentários no código são em **português**, refletindo o público do jogo; siga essa convenção ao editar `game.js`/`audio.js`/`words.js`.
- Ao adicionar palavras em `words.js`, use apenas letras minúsculas sem acento/cedilha na lista bruta — `normalizar()` em `game.js` remove acentos e força maiúsculas para a grade, enquanto `embelezar()` gera a versão exibida na lista (capitaliza a primeira letra, mantendo o texto original digitado). Ou seja: se quiser acentos na exibição, digite a palavra já acentuada em `words.js` (ex.: `"romã"`); a normalização para a grade é automática.
- Os arquivos JS/CSS são referenciados no `index.html` com um query string de versão (`?v=9`) para cache-busting; ao alterar `words.js`, `audio.js`, `game.js` ou `style.css`, incremente esse número em todas as tags `<script>`/`<link>` no `index.html`.
