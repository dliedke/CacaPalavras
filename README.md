# 🔤 Caça-Palavras Turbo

Um caça-palavras **colorido, divertido e com som**, feito em **HTML + CSS + JavaScript puro** — funciona em **desktop e mobile**, sem instalação e sem dependências.

👉 **Como jogar:** basta abrir o arquivo [`index.html`](index.html) no navegador.

## ✨ Destaques

- 🧭 **Palavras em todas as direções** — horizontal, vertical, diagonal e **de trás pra frente**.
- 🎚️ **4 níveis de dificuldade:**
  | Nível | Grade | Palavras | Direções |
  |-------|-------|----------|----------|
  | 😃 Fácil | 10×10 | 6 | horizontal e vertical |
  | 🙂 Médio | 12×12 | 9 | + diagonais |
  | 😎 Difícil | 14×14 | 12 | todas as 8 direções |
  | 🤯 Expert | 16×16 | 16 | todas as 8 direções |
- 📚 **Mais de 1300 palavras** em português, divididas em **21 categorias temáticas** (Animais, Frutas, Comidas, Profissões, Países, Natureza, Verbos, e muito mais) — ou jogue com a mistura **"Todas"**.
- 🔊 **Efeitos sonoros** gerados na hora com a Web Audio API (nenhum arquivo de áudio necessário): seleção, acerto, erro, dica e uma fanfarra de vitória. Dá pra silenciar com um clique.
- 🎨 **Visual vibrante e animado:** fundo com gradiente em movimento, título saltitante, cada palavra encontrada ganha uma cor diferente e a vitória solta **confete**.
- 🏆 **Pontuação com combo:** ache palavras em sequência sem errar para multiplicar os pontos, e termine rápido para ganhar um bônus de tempo no final.
- 💡 **Botão de dica** que pisca a primeira letra de uma palavra (custa alguns pontos).
- 📱 **Totalmente responsivo** e com suporte a toque (arraste com o dedo).
- ♿ Respeita a preferência de **movimento reduzido** do sistema.

## 🕹️ Como jogar

1. Escolha a **dificuldade** e a **categoria**.
2. **Arraste** (com o mouse ou o dedo) da primeira até a última letra de uma palavra da lista.
3. A palavra pode estar em qualquer direção — inclusive invertida!
4. Encontre todas as palavras para vencer. 🎉

## 📂 Estrutura do projeto

```
index.html        # estrutura e telas do jogo
css/style.css     # visual, animações e layout responsivo
js/words.js       # banco com mais de 1300 palavras por categoria
js/audio.js       # motor de som (Web Audio API)
js/game.js        # geração da grade, seleção, pontuação e regras
```

Feito com 💜 para jogar em qualquer lugar. Divirta-se! 🇧🇷
