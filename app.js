/* Controle Estudantil — Etapa 1: login, estrutura do app e tela inicial */

const $raiz = document.getElementById('raiz');

/* ---------- utilidades ---------- */
const primeiroNome = (n) => String(n || '').trim().split(/\s+/)[0] || '';

/* ---------- mascote ---------- */
const ROTULO_MASCOTE = { padrao: 'Padrão', estudando: 'Estudando', chateado: 'Chateado', bravo: 'Com raiva' };

const Mascote = {
  html(estado, alt) {
    const src = window.APP_CONFIG.MASCOTE[estado] || window.APP_CONFIG.MASCOTE.padrao;
    return `<img class="mascote" src="${esc(src)}" alt="${esc(alt || 'Mascote')}" data-estado="${esc(estado)}" onerror="Mascote.provisorio(this)">`;
  },
  /* Desenho provisório, usado enquanto a imagem real não estiver em img/ */
  provisorio(img) {
    const e = img.dataset.estado;
    const rosto = {
      padrao:    '<path d="M72 128 Q100 154 128 128" />',
      estudando: '<circle cx="72" cy="94" r="17"/><circle cx="128" cy="94" r="17"/><path d="M89 94 H111"/><path d="M76 132 Q100 150 124 132" />',
      chateado:  '<path d="M72 148 Q100 122 128 148" /><path d="M64 70 L88 78 M136 70 L112 78" stroke-width="4"/>',
      bravo:     '<path d="M56 72 L90 88 M144 72 L110 88" stroke-width="7"/><path d="M78 142 H122" />'
    }[e] || '';
    const lagrima = e === 'chateado' ? '<path d="M128 108 q8 12 0 18 q-8 -6 0 -18z" fill="#9fdbfc" stroke="none"/>' : '';
    const faceCor = e === 'bravo' ? '#E6A1C8' : '#b071ea';
    img.outerHTML = `<svg class="mascote-provisorio" viewBox="0 0 200 200" role="img" aria-label="Mascote (${esc(ROTULO_MASCOTE[e] || '')})">
      <circle cx="100" cy="104" r="78" fill="${faceCor}" stroke="#18265A" stroke-width="5"/>
      <g fill="#18265A" stroke="none"><circle cx="72" cy="94" r="8"/><circle cx="128" cy="94" r="8"/></g>
      <g fill="none" stroke="#18265A" stroke-width="5" stroke-linecap="round">${rosto}</g>${lagrima}
    </svg>`;
  }
};
window.Mascote = Mascote;

/* ---------- rotas ---------- */
const ROTAS = [
  { id: 'inicio',       nome: 'Início',          ico: '🏠', etapa: 1 },
  { id: 'plano',        nome: 'Plano de estudos', ico: '📋', etapa: 5, texto: 'Aqui você vai ver o progresso do dia por matéria e tudo o que ficou atrasado.' },
  { id: 'agenda',       nome: 'Agenda',          ico: '🗓️', etapa: 5, texto: 'Aqui você vai ver a semana dia a dia e exportar os estudos para a Agenda Google.' },
  { id: 'cronometro',   nome: 'Cronômetro',      ico: '⏱️', etapa: 6, texto: 'Aqui você vai escolher a matéria, dar o play e o tempo estudado é contado sozinho.' },
  { id: 'provas',       nome: 'Provas',          ico: '📝', etapa: 3, texto: 'Aqui você vai cadastrar as provas e receber um tempo de preparação nos dias anteriores.' },
  { id: 'trabalhos',    nome: 'Trabalhos',       ico: '📎', etapa: 3, texto: 'Aqui você vai cadastrar os trabalhos, acompanhar o checklist de cada um e registrar a nota.' },
  { id: 'notas',        nome: 'Notas',           ico: '🏅', etapa: 3, texto: 'Aqui você vai lançar as notas do bimestre e ver quantos pontos faltam para passar.' },
  { id: 'metas',        nome: 'Metas e regras',  ico: '🎯', etapa: 4, texto: 'Aqui você vai definir quanto tempo estuda por dia e ajustar como o tempo é dividido entre as matérias.' },
  { id: 'estatisticas', nome: 'Estatísticas',    ico: '📊', etapa: 8, texto: 'Aqui você vai ver horas estudadas, meta atingida, notas e o mapa de consistência do ano.' },
  { id: 'ano',          nome: 'Ano letivo',      ico: '📚', etapa: 2, texto: 'Aqui você vai cadastrar bimestres, matérias, dias de aula e materiais didáticos.' },
  { id: 'config',       nome: 'Configurações',   ico: '⚙️', etapa: 1 }
];

let rotaAtual = null;

/* Cada tela é uma função que recebe o elemento #tela e devolve o HTML (ou desenha sozinha). */
const VIEWS = { inicio: viewInicio, config: viewConfig };

function sessaoExpirada() {
  Sessao.limpar();
  mostrarLogin('Sua sessão expirou. Entre de novo.');
}

/* ---------- login ---------- */
function mostrarLogin(mensagem) {
  rotaAtual = null;
  $raiz.innerHTML = `
  <main class="login">
    <section class="login-lado" aria-hidden="true">
      <div class="login-lado-conteudo">
        ${Mascote.html('padrao', '')}
        <h1>Estudar um pouquinho a cada dia</h1>
        <p>Seu cronograma, suas provas, seus trabalhos e suas notas em um só lugar.</p>
      </div>
    </section>
    <section class="login-form-area">
      <form class="login-form" id="form-login" novalidate>
        <div>
          <h2>Entrar</h2>
        </div>
        <p class="sub">Use o e-mail e a senha que a escola ou a sua família cadastrou.</p>
        <div class="aviso-erro" id="erro-login" role="alert" ${mensagem ? '' : 'hidden'}>${esc(mensagem || '')}</div>
        <div class="campo">
          <label for="email">E-mail</label>
          <div class="entrada"><input id="email" type="email" autocomplete="username" inputmode="email" required></div>
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <div class="entrada">
            <input id="senha" type="password" autocomplete="current-password" required>
            <button type="button" class="ver" id="ver-senha" aria-label="Mostrar senha">Mostrar</button>
          </div>
        </div>
        <button class="btn" id="btn-entrar" type="submit">Entrar</button>
        <p class="login-ajuda">Esqueceu a senha? Peça para quem fez o seu cadastro.</p>
      </form>
    </section>
  </main>`;

  const $erro = document.getElementById('erro-login');
  const $senha = document.getElementById('senha');
  document.getElementById('ver-senha').addEventListener('click', (ev) => {
    const mostrando = $senha.type === 'text';
    $senha.type = mostrando ? 'password' : 'text';
    ev.target.textContent = mostrando ? 'Mostrar' : 'Ocultar';
    ev.target.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Ocultar senha');
  });

  document.getElementById('form-login').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = $senha.value;
    const $btn = document.getElementById('btn-entrar');
    $erro.hidden = true;
    if (!email || !senha) {
      $erro.textContent = 'Preencha o e-mail e a senha.';
      $erro.hidden = false;
      return;
    }
    $btn.disabled = true; $btn.textContent = 'Entrando...';
    try {
      const r = await Api.login(email, senha);
      Sessao.salvar(r.token, r.usuario);
      iniciarApp();
    } catch (err) {
      $erro.textContent = err.message;
      $erro.hidden = false;
      $btn.disabled = false; $btn.textContent = 'Entrar';
    }
  });
}

function sair() {
  Sessao.limpar();
  mostrarLogin();
}

/* ---------- estrutura do app ---------- */
function iniciarApp() {
  const u = Sessao.usuario();
  if (!u) { mostrarLogin(); return; }

  $raiz.innerHTML = `
  <div class="app">
    <aside class="lateral">
      <div class="marca">${Mascote.html('padrao', '')}<strong>${esc(window.APP_CONFIG.NOME_APP)}</strong></div>
      <nav class="nav" aria-label="Principal">
        ${ROTAS.map(r => `<a href="#/${r.id}" data-rota="${r.id}"><span class="ico" aria-hidden="true">${r.ico}</span>${esc(r.nome)}</a>`).join('')}
      </nav>
      <div class="lateral-rodape">
        <div class="quem">${esc(primeiroNome(u.nome))}<small>${esc(u.email)}</small></div>
        <button type="button" id="btn-sair">Sair</button>
      </div>
    </aside>
    <main class="conteudo" id="conteudo" tabindex="-1">
      <div class="topo-mobile"><span>${esc(primeiroNome(u.nome))}</span><button type="button" id="btn-sair-m">Sair</button></div>
      <div id="tela"></div>
    </main>
  </div>`;
  document.getElementById('btn-sair').addEventListener('click', sair);
  document.getElementById('btn-sair-m').addEventListener('click', sair);
  if (!location.hash) location.hash = '#/inicio';
  rotear();
}

async function rotear() {
  if (!Sessao.token()) return;
  const id = (location.hash.replace(/^#\/?/, '') || 'inicio');
  const rota = ROTAS.find(r => r.id === id) || ROTAS[0];
  rotaAtual = rota.id;
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.dataset.rota === rota.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const $tela = document.getElementById('tela');
  if (!$tela) return;
  document.title = rota.nome + ' · ' + window.APP_CONFIG.NOME_APP;
  window.scrollTo(0, 0);

  $tela.onclick = null; $tela.onchange = null;
  const view = VIEWS[rota.id];
  if (!view) { $tela.innerHTML = viewEmBreve(rota); return; }
  $tela.innerHTML = carregando();
  try {
    const html = await view($tela);
    if (rotaAtual === rota.id && typeof html === 'string') $tela.innerHTML = html;
  } catch (err) {
    if (err.message === 'SESSAO_INVALIDA') { sessaoExpirada(); return; }
    if (rotaAtual === rota.id) {
      $tela.innerHTML = `<div class="painel"><h2>Não foi possível carregar</h2>
        <p class="dica">${esc(err.message)}</p>
        <button class="btn" onclick="rotear()">Tentar de novo</button></div>`;
    }
  }
}
window.addEventListener('hashchange', rotear);

const carregando = () => `<div class="carregando">${Mascote.html('estudando', '')}<span>Carregando...</span></div>`;

function viewEmBreve(rota) {
  return `<header><h1>${esc(rota.nome)}</h1></header>
  <section class="painel em-breve">
    ${Mascote.html('estudando', '')}
    <h2>Esta área chega na etapa ${rota.etapa}</h2>
    <p>${esc(rota.texto || '')}</p>
  </section>`;
}

/* ---------- Início ---------- */
function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function chipsDoDia(dia, materias, grade) {
  const ids = [...new Set(grade.filter(g => Number(g.dia_semana) === dia).map(g => String(g.materia_id)))];
  const porId = Object.fromEntries(materias.map(m => [String(m.id), m]));
  const lista = ids.map(id => porId[id]).filter(Boolean)
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  if (!lista.length) return null;
  return `<div class="chips">${lista.map(m =>
    `<span class="chip"><i style="background:${esc(m.cor || '#b071ea')}"></i>${esc(m.nome)}</span>`).join('')}</div>`;
}

async function viewInicio() {
  const u = Sessao.usuario();
  const [anos, todasMaterias, grade] = await Promise.all([Api.listar('AnoLetivo'), Api.listar('Materias'), Api.listar('Grade')]);
  const ano = escolherAno(anos);
  const materias = ano ? todasMaterias.filter(m => m.ano_id === ano.id && ativa(m)) : [];
  const semMaterias = materias.length === 0;
  const hoje = new Date();
  const dow = hoje.getDay() || 7;        // 1 = segunda ... 7 = domingo
  const amanha = (dow % 7) + 1;
  const dataTxt = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const cadastre = '<p class="vazio">Cadastre suas matérias para ver tudo aqui. <a href="#/ano">Ir para Ano letivo</a></p>';
  const hojeHtml = chipsDoDia(dow, materias, grade) || (semMaterias ? cadastre : '<p class="vazio">Hoje não tem aula cadastrada.</p>');
  const amanhaHtml = chipsDoDia(amanha, materias, grade) || (semMaterias ? cadastre : '<p class="vazio">Amanhã não tem aula cadastrada.</p>');

  return `
  <section class="boas-vindas">
    <div>
      <h1>${saudacao()}, ${esc(primeiroNome(u.nome))}!</h1>
      <p>${esc(dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1))}. Veja o que tem para estudar hoje.</p>
    </div>
    ${Mascote.html('padrao', 'Mascote sorrindo')}
  </section>
  <div class="duas-colunas">
    <section class="painel">
      <h2>Revisar hoje</h2>
      <p class="dica">Matérias que tiveram aula hoje.</p>
      ${hojeHtml}
    </section>
    <section class="painel">
      <h2>Estudar com antecedência</h2>
      <p class="dica">Matérias da aula de amanhã.</p>
      ${amanhaHtml}
    </section>
  </div>`;
}

/* ---------- Configurações ---------- */
async function viewConfig() {
  const r = await Api.me();
  Sessao.atualizarUsuario(r.usuario);
  const u = r.usuario;
  const linha = (rot, v) => `<dt>${rot}</dt><dd>${v ? esc(v) : '<span class="vazio">Não informado</span>'}</dd>`;
  return `
  <header><h1>Configurações</h1><p>Seus dados de cadastro. Para alterar, peça a quem cadastrou você.</p></header>
  <div class="stack">
    <section class="painel">
      <h2>Minha conta</h2>
      <dl class="dados-lista" style="margin-top:14px">
        ${linha('Nome', u.nome)}${linha('E-mail', u.email)}
        ${linha('Responsável', u.nome_responsavel)}${linha('E-mail do responsável', u.email_responsavel)}
        ${linha('Agenda Google', u.calendar_id)}
      </dl>
    </section>
    <section class="painel">
      <h2>Mascote</h2>
      <p class="dica">As quatro imagens que o sistema usa. Se aparecer um desenho provisório, a imagem ainda não está na pasta img.</p>
      <div class="galeria">
        ${['padrao', 'estudando', 'chateado', 'bravo'].map(e =>
          `<figure>${Mascote.html(e, ROTULO_MASCOTE[e])}<figcaption>${ROTULO_MASCOTE[e]}</figcaption></figure>`).join('')}
      </div>
    </section>
  </div>`;
}

/* ---------- partida ---------- */
(async function boot() {
  if (!Api.configurada()) {
    mostrarLogin('O endereço do Apps Script ainda não foi colocado em js/config.js.');
    return;
  }
  if (!Sessao.token()) { mostrarLogin(); return; }
  $raiz.innerHTML = carregando();
  try {
    const r = await Api.me();
    Sessao.atualizarUsuario(r.usuario);
    iniciarApp();
  } catch (err) {
    Sessao.limpar();
    mostrarLogin(err.message === 'SESSAO_INVALIDA' ? '' : err.message);
  }
})();
