/* =============================================================================
 * Banco de Palavras — Caça-Palavras Turbo
 * Mais de 1300 palavras em português, organizadas por categorias temáticas.
 * Cada categoria pode ser escolhida no jogo. "Todas" mistura tudo.
 * ========================================================================== */

const WORD_BANK = {
  "Animais": [
    "cachorro","gato","cavalo","vaca","boi","porco","galinha","galo","pato","ganso",
    "peru","coelho","rato","hamster","leao","tigre","onca","jaguar","leopardo","guepardo",
    "urso","lobo","raposa","elefante","girafa","zebra","rinoceronte","hipopotamo","macaco","gorila",
    "chimpanze","orangotango","canguru","coala","panda","preguica","tatu","tamandua","capivara","jacare",
    "crocodilo","cobra","serpente","lagarto","iguana","camaleao","tartaruga","sapo","peixe","tubarao",
    "baleia","golfinho","foca","morsa","polvo","lula","caranguejo","camarao","lagosta","medusa",
    "passaro","aguia","falcao","coruja","papagaio","arara","tucano","pombo","andorinha","pinguim",
    "avestruz","flamingo","pavao","cisne","garca","pelicano","gaivota","abelha","vespa","formiga",
    "borboleta","mariposa","besouro","joaninha","grilo","gafanhoto","libelula","mosquito","mosca","aranha",
    "escorpiao","minhoca","lesma","caracol","morcego","ourico","lontra","castor","esquilo","veado",
    "alce","rena","bufalo","bisao","camelo","dromedario","lhama","alpaca","ovelha","cabra",
    "burro","mula","javali","gambá","furao","texugo","hiena","chacal","suricato","ornitorrinco",
    "dragao","unicornio","guaxinim","salamandra","perereca","gralha","corvo","tordo","canario","periquito",
    "quati","doninha","antilope","gnu","suricate","narval","orca","enguia","sardinha","atum",
  ],
  "Frutas": [
    "banana","maca","laranja","uva","morango","abacaxi","manga","melancia","melao","pera",
    "pessego","ameixa","cereja","kiwi","limao","tangerina","goiaba","mamao","maracuja","caju",
    "coco","figo","romã","framboesa","amora","mirtilo","jabuticaba","acerola","carambola","pitanga",
    "graviola","cupuacu","acai","pitaya","lichia","tamarindo","abacate","damasco","nectarina","caqui",
    "jaca","seriguela","umbu","cajá","bacuri","buriti","pequi","murici","araca","guarana",
    "jambo","groselha","cranberry","physalis","nespera","marmelo","toranja","bergamota",
  ],
  "Legumes e Verduras": [
    "alface","tomate","cenoura","batata","cebola","alho","pimentao","abobora","abobrinha","pepino",
    "beringela","chuchu","quiabo","vagem","ervilha","milho","brocolis","couve","espinafre","rucula",
    "agriao","repolho","acelga","escarola","almeirao","mandioca","inhame","cara","beterraba","rabanete",
    "nabo","gengibre","salsa","cebolinha","coentro","manjericao","alecrim","tomilho","hortela","oregano",
    "aipo","funcho","aspargo","alcachofra","palmito","cogumelo","champignon","mostarda","cará","taioba",
  ],
  "Comidas": [
    "arroz","feijao","macarrao","pizza","hamburguer","lasanha","risoto","panqueca","omelete","sopa",
    "salada","sanduiche","torta","bolo","biscoito","bolacha","pao","queijo","presunto","salame",
    "linguica","salsicha","bacon","churrasco","picanha","costela","frango","bife","almondega","nhoque",
    "polenta","farofa","tapioca","cuscuz","canjica","pamonha","pastel","coxinha","empada","esfiha",
    "quibe","acaraje","vatapa","moqueca","feijoada","escondidinho","strogonoff","yakisoba","sushi","temaki",
    "ceviche","paella","fondue","waffle","crepe","brigadeiro","beijinho","pudim","mousse","gelatina",
    "sorvete","picole","chocolate","brownie","cupcake","cheesecake","churros","donut","cocada","pacoca",
    "quindim","brevidade","suspiro","rocambole","pavê","manjar","curau","doce","geleia","mel",
    "manteiga","margarina","iogurte","requeijao","catupiry","muçarela","parmesao","gorgonzola","provolone","ricota",
  ],
  "Bebidas": [
    "agua","suco","refrigerante","cerveja","vinho","cafe","cha","leite","achocolatado","vitamina",
    "smoothie","milkshake","limonada","caipirinha","cachaca","whisky","vodka","tequila","rum","gin",
    "champanhe","espumante","licor","conhaque","aperitivo","guarana","tonica","energetico","isotonico","chimarrao",
    "capuccino","expresso","mate","refresco","nectar","garapa","kefir","kombucha","sidra","hidromel",
  ],
  "Cores": [
    "vermelho","azul","amarelo","verde","laranja","roxo","rosa","preto","branco","cinza",
    "marrom","bege","violeta","lilas","turquesa","ciano","magenta","dourado","prateado","bronze",
    "coral","salmao","vinho","bordo","carmim","escarlate","indigo","anil","celeste","esmeralda",
    "jade","ambar","ocre","terracota","creme","marfim","grafite","fucsia","lavanda","petroleo",
  ],
  "Corpo Humano": [
    "cabeca","cabelo","rosto","testa","sobrancelha","olho","cilio","nariz","boca","labio",
    "dente","lingua","bochecha","queixo","orelha","pescoco","ombro","braco","cotovelo","antebraco",
    "pulso","mao","dedo","unha","palma","peito","costas","coluna","cintura","quadril",
    "barriga","umbigo","perna","coxa","joelho","canela","tornozelo","calcanhar","pisa","panturrilha",
    "coracao","pulmao","figado","estomago","rim","intestino","cerebro","musculo","osso","esqueleto",
    "sangue","veia","arteria","nervo","pele","cranio","costela","mandibula","femur","tibia",
    "cartilagem","tendao","ligamento","diafragma","pancreas","baco","esofago","traqueia","laringe","faringe",
  ],
  "Profissoes": [
    "medico","enfermeiro","dentista","professor","advogado","juiz","policial","bombeiro","engenheiro","arquiteto",
    "pedreiro","pintor","eletricista","encanador","mecanico","motorista","piloto","aeromoca","cozinheiro","padeiro",
    "acougueiro","garcom","confeiteiro","agricultor","pescador","jardineiro","veterinario","biologo","quimico","fisico",
    "matematico","astronomo","geologo","historiador","jornalista","escritor","poeta","tradutor","bibliotecario","locutor",
    "contador","economista","administrador","gerente","vendedor","caixa","recepcionista","secretaria","porteiro","seguranca",
    "faxineiro","costureira","cabeleireiro","barbeiro","manicure","maquiador","modelo","ator","atriz","cantor",
    "musico","dancarino","fotografo","cineasta","diretor","produtor","designer","programador","analista","cientista",
    "psicologo","terapeuta","fisioterapeuta","farmaceutico","nutricionista","fonoaudiologo","radiologo","cirurgiao","pediatra","cardiologo",
    "topografo","soldador","carpinteiro","marceneiro","ferreiro","joalheiro","relojoeiro","sapateiro","alfaiate","florista",
    "sommelier","barista","apicultor","ceramista","artesao","escultor","astronauta","marinheiro","soldado","general",
  ],
  "Esportes": [
    "futebol","basquete","volei","handebol","tenis","natacao","atletismo","ginastica","judo","karate",
    "boxe","luta","esgrima","remo","canoagem","surfe","skate","ciclismo","corrida","maratona",
    "triatlo","golfe","hoquei","rugby","criquete","badminton","pingpong","sinuca","boliche","dardos",
    "xadrez","damas","escalada","alpinismo","paraquedismo","mergulho","vela","iatismo","polo","equitacao",
    "hipismo","patinacao","esqui","snowboard","capoeira","muaythai","taekwondo","kickboxing","parkour","bodyboard",
    "windsurf","kitesurf","rapel","trekking","pesca",
  ],
  "Paises": [
    "brasil","argentina","chile","uruguai","paraguai","bolivia","peru","colombia","venezuela","equador",
    "mexico","cuba","panama","guatemala","honduras","nicaragua","costa","jamaica","haiti","canada",
    "portugal","espanha","franca","italia","alemanha","inglaterra","irlanda","escocia","holanda","belgica",
    "suica","austria","grecia","turquia","russia","polonia","suecia","noruega","finlandia","dinamarca",
    "islandia","hungria","romenia","bulgaria","croacia","servia","ucrania","china","japao","coreia",
    "india","paquistao","tailandia","vietna","indonesia","filipinas","malasia","singapura","camboja","nepal",
    "egito","marrocos","tunisia","argelia","libia","nigeria","quenia","etiopia","angola","mocambique",
    "africa","gana","senegal","camaroes","australia","zelandia","fiji","israel","iraque","arabia",
    "libano","siria","jordania","emirados","catar","cazaquistao","mongolia","tibete","butao",
  ],
  "Cidades do Brasil": [
    "salvador","recife","fortaleza","natal","maceio","aracaju","teresina","belem","manaus","macapa",
    "palmas","cuiaba","goiania","brasilia","uberlandia","campinas","santos","niteroi","petropolis","vitoria",
    "curitiba","londrina","maringa","joinville","blumenau","florianopolis","pelotas","canoas","gramado","bento",
    "franca","bauru","sorocaba","jundiai","piracicaba","ribeirao","marilia","osasco","guarulhos","diadema",
    "contagem","betim","juiz","ipatinga","governador","olinda","caruaru","petrolina","sobral","imperatriz",
    "marabá","santarem","parintins","boa","cruzeiro","dourados","anapolis","catalao","itabuna","ilheus",
  ],
  "Natureza": [
    "sol","lua","estrela","planeta","cometa","meteoro","galaxia","universo","nuvem","chuva",
    "trovao","relampago","raio","tempestade","vento","furacao","tornado","neve","gelo","granizo",
    "neblina","orvalho","arcoiris","montanha","serra","colina","vale","planicie","deserto","duna",
    "floresta","selva","mata","bosque","campo","pradaria","savana","pantano","lago","lagoa",
    "rio","riacho","cachoeira","cascata","mar","oceano","praia","costa","ilha","peninsula",
    "baia","golfo","estreito","recife","coral","caverna","gruta","penhasco","abismo","vulcao",
    "cratera","terremoto","tsunami","maremoto","erosao","rocha","pedra","areia","argila","terra",
    "lama","barro","cristal","mineral","fossil","carvao","petroleo","diamante","ouro","prata",
  ],
  "Objetos da Casa": [
    "mesa","cadeira","sofa","poltrona","cama","colchao","travesseiro","cobertor","lencol","edredom",
    "armario","comoda","guarda","estante","prateleira","gaveta","criado","escrivaninha","banco","tapete",
    "cortina","persiana","abajur","lampada","lustre","espelho","quadro","relogio","vaso","cesto",
    "geladeira","fogao","forno","microondas","liquidificador","batedeira","cafeteira","torradeira","sanduicheira","fritadeira",
    "panela","frigideira","caçarola","chaleira","bule","xicara","copo","prato","tigela","travessa",
    "garfo","faca","colher","concha","escumadeira","espatula","ralador","peneira","funil","abridor",
    "vassoura","rodo","balde","pano","esponja","escova","aspirador","ferro","tabua","varal",
    "chuveiro","torneira","pia","ralo","descarga","toalha","sabonete","pente","secador","cabide",
    "ventilador","aquecedor","umidificador","extintor","fechadura","dobradica","interruptor","tomada","tesoura","martelo",
  ],
  "Roupas e Acessorios": [
    "camisa","camiseta","blusa","regata","polo","suéter","casaco","jaqueta","blazer","paleto",
    "colete","moletom","cardiga","calca","jeans","bermuda","shorts","saia","vestido","macacao",
    "pijama","roupao","cueca","calcinha","sutia","meia","meiacalca","cinto","suspensorio","gravata",
    "lenco","cachecol","touca","gorro","chapeu","bone","viseira","luva","sapato","tenis",
    "bota","sandalia","chinelo","sapatilha","salto","mocassim","tamanco","oculos","relogio","pulseira",
    "colar","brinco","anel","broche","carteira","bolsa","mochila","guarda",
  ],
  "Transportes": [
    "carro","onibus","caminhao","moto","bicicleta","patinete","trem","metro","bonde","aviao",
    "helicoptero","navio","barco","lancha","iate","canoa","caiaque","jangada","balsa","submarino",
    "foguete","satelite","teleferico","funicular","carroca","charrete","triciclo","monociclo","ambulancia","viatura",
    "trator","empilhadeira","guindaste","escavadeira","betoneira","reboque","carreta","van","furgao","limusine",
    "jipe","picape","conversivel","kart","jetski","dirigivel","planador","ultraleve","zeppelin","catamara",
  ],
  "Instrumentos Musicais": [
    "violao","guitarra","baixo","cavaquinho","bandolim","banjo","ukulele","harpa","violino","viola",
    "violoncelo","contrabaixo","piano","teclado","orgao","acordeon","sanfona","gaita","flauta","clarinete",
    "oboe","fagote","saxofone","trompete","trombone","trompa","tuba","corneta","bateria","tambor",
    "bumbo","caixa","pandeiro","tamborim","reco","triangulo","chocalho","maracas","xilofone","marimba",
  ],
  "Flores e Plantas": [
    "rosa","margarida","girassol","tulipa","orquidea","cravo","violeta","lirio","jasmim","lavanda",
    "hortensia","azaleia","begonia","camelia","dalia","gerbera","petunia","primavera","anturio","bromelia",
    "samambaia","cacto","suculenta","bonsai","palmeira","bambu","hera","trevo","musgo","liquen",
    "flordelis","amorperfeito","copodeleite","boca","estrelicia","flordelotus","narciso","gladiolo","crisantemo","peonia",
    "magnolia","ipê","jacaranda","flamboyant","cerejeira","oliveira","carvalho","pinheiro","eucalipto","sequoia",
  ],
  "Tecnologia": [
    "computador","notebook","tablet","celular","smartphone","teclado","mouse","monitor","tela","impressora",
    "scanner","webcam","microfone","alto","fone","caixa","processador","memoria","placa","disco",
    "pendrive","cabo","bateria","carregador","roteador","modem","servidor","rede","internet","wifi",
    "bluetooth","software","hardware","aplicativo","programa","sistema","arquivo","pasta","documento","planilha",
    "navegador","site","email","senha","usuario","download","upload","backup","nuvem","robo",
    "drone","sensor","chip","codigo","algoritmo","dados","pixel","byte","antena",
  ],
  "Escola": [
    "professor","aluno","diretor","secretaria","sala","carteira","quadro","giz","apagador","caderno",
    "livro","caneta","lapis","borracha","apontador","regua","tesoura","cola","estojo","mochila",
    "lousa","cartaz","mapa","globo","dicionario","enciclopedia","biblioteca","laboratorio","microscopio","calculadora",
    "prova","boletim","nota","materia","aula","recreio","intervalo","merenda","cantina","uniforme",
    "portugues","matematica","ciencias","historia","geografia","biologia","fisica","quimica","ingles","artes",
    "educacao","filosofia","sociologia","gramatica","redacao","leitura",
  ],
  "Verbos": [
    "correr","pular","andar","nadar","voar","saltar","dancar","cantar","tocar","ouvir",
    "falar","gritar","sussurrar","conversar","perguntar","responder","escrever","ler","desenhar","pintar",
    "cozinhar","comer","beber","provar","cheirar","apalpar","sentir","olhar","enxergar","observar",
    "pensar","imaginar","sonhar","lembrar","esquecer","aprender","ensinar","estudar","trabalhar","descansar",
    "dormir","acordar","levantar","sentar","deitar","subir","descer","entrar","sair","chegar",
    "partir","voltar","seguir","parar","comecar","terminar","abrir","fechar","empurrar","puxar",
    "carregar","erguer","arremessar","pegar","soltar","segurar","apertar","abracar","beijar","sorrir",
    "chorar","rir","brincar","jogar","ganhar","perder","vencer","competir","construir","destruir",
    "criar","inventar","descobrir","procurar","encontrar","extraviar","guardar","gastar","comprar","vender",
    "pagar","emprestar","dividir","somar","multiplicar","contar","medir","pesar","cortar","colar",
    "dobrar","costurar","plantar","colher","regar","limpar","lavar","secar","varrer","organizar",
  ],
  "Emocoes e Sentimentos": [
    "alegria","tristeza","raiva","medo","amor","odio","paixao","carinho","ternura","saudade",
    "felicidade","euforia","entusiasmo","esperanca","gratidao","orgulho","vergonha","culpa","inveja","ciume",
    "ansiedade","calma","paz","serenidade","coragem","bravura","timidez","surpresa","espanto","nojo",
    "desprezo","compaixao","empatia","solidao","angustia","tedio","curiosidade","admiracao","respeito","confianca",
    "duvida","frustracao","alivio","satisfacao","desejo",
  ],
};

/* Constrói a lista "Todas" com todas as palavras únicas do banco. */
(function buildTodas() {
  const seen = new Set();
  const all = [];
  for (const cat of Object.keys(WORD_BANK)) {
    for (const w of WORD_BANK[cat]) {
      const key = w.toLowerCase();
      if (!seen.has(key)) { seen.add(key); all.push(w); }
    }
  }
  WORD_BANK["Todas"] = all;
})();

/* Total de palavras (sem contar duplicatas da categoria "Todas"). */
const TOTAL_PALAVRAS = WORD_BANK["Todas"].length;
