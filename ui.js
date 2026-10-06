/* Utilidades de interface compartilhadas entre as telas */

const esc = (t) => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* "2026-02-05" -> "05/02/2026" */
function fmtData(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s || '');
}
/* 6.5 -> "6,5" */
const num = (n) => String(n).replace('.', ',');
const temValor = (v) => v !== '' && v !== null && v !== undefined;
const hojeISO = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso do aparelho

/* Matéria / ano ativos: vazio ou qualquer coisa diferente de NAO conta como ativo */
const ativa = (m) => !['NAO', 'NÃO', 'N', 'FALSE'].includes(String(m.ativa == null ? '' : m.ativa).trim().toUpperCase());

/* Ano letivo em uso: o último escolhido, senão o marcado como ativo, senão o mais recente */
function escolherAno(anos) {
  if (!anos.length) return null;
  const salvo = localStorage.getItem('ce_ano');
  return anos.find(a => a.id === salvo)
    || anos.find(a => String(a.ativo).toUpperCase() === 'SIM')
    || anos[anos.length - 1];
}

/* ---------- avisos rápidos ---------- */
const Toast = {
  mostrar(texto, tipo) {
    let c = document.getElementById('toasts');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toasts';
      c.setAttribute('aria-live', 'polite');
      document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (tipo === 'erro' ? ' erro' : '');
    t.textContent = texto;
    c.appendChild(t);
    setTimeout(() => t.remove(), tipo === 'erro' ? 6000 : 3000);
  }
};

/* Erro vindo de uma ação rápida (sem janela aberta) */
function tratarErro(e) {
  if (e && e.message === 'SESSAO_INVALIDA') { sessaoExpirada(); return; }
  Toast.mostrar((e && e.message) || 'Algo deu errado.', 'erro');
}

/* ---------- janelas (dialog) ---------- */
const Dialogo = {
  _abrir(html) {
    const d = document.createElement('dialog');
    d.className = 'dialogo';
    d.innerHTML = html;
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.showModal();
    return d;
  },

  confirmar({ titulo, texto, ok, perigo }) {
    return new Promise(resolve => {
      const d = this._abrir(`
        <form method="dialog" class="dialogo-corpo">
          <h2>${esc(titulo)}</h2>
          <p>${esc(texto)}</p>
          <div class="dialogo-acoes">
            <span></span>
            <span class="grupo">
              <button class="btn btn-claro" value="nao">Cancelar</button>
              <button class="btn ${perigo ? 'btn-perigo' : ''}" value="sim">${esc(ok || 'Confirmar')}</button>
            </span>
          </div>
        </form>`);
      d.addEventListener('close', () => resolve(d.returnValue === 'sim'));
    });
  },

  /* campos: { id, rotulo, tipo: text|number|date|select|cor, valor, obrigatorio, ajuda, passo, opcoes:[{valor,rotulo}], cores:[] } */
  form({ titulo, campos, ok, onSalvar, onExcluir, rotuloExcluir }) {
    const campoHtml = (c) => {
      const id = 'f-' + c.id;
      const v = c.valor == null ? '' : c.valor;
      const ajuda = c.ajuda ? `<small class="ajuda">${esc(c.ajuda)}</small>` : '';
      let corpo;
      if (c.tipo === 'select') {
        corpo = `<select id="${id}" name="${c.id}">${c.opcoes.map(o =>
          `<option value="${esc(o.valor)}" ${String(o.valor) === String(v) ? 'selected' : ''}>${esc(o.rotulo)}</option>`).join('')}</select>`;
      } else if (c.tipo === 'cor') {
        const lista = c.cores.slice();
        if (v && !lista.some(x => x.toLowerCase() === String(v).toLowerCase())) lista.unshift(v);
        corpo = `<div class="cores" role="radiogroup" aria-label="${esc(c.rotulo)}">${lista.map(x =>
          `<label class="cor"><input type="radio" name="${c.id}" value="${esc(x)}" ${String(x).toLowerCase() === String(v).toLowerCase() ? 'checked' : ''}><span style="background:${esc(x)}"></span></label>`).join('')}</div>`;
      } else {
        const extra = c.tipo === 'number' ? ` step="${esc(c.passo || '1')}" inputmode="decimal"` : '';
        corpo = `<input id="${id}" name="${c.id}" type="${c.tipo || 'text'}" value="${esc(v)}"${extra} placeholder="${esc(c.placeholder || '')}" autocomplete="off">`;
      }
      return `<div class="campo"><label ${c.tipo === 'cor' ? '' : `for="${id}"`}>${esc(c.rotulo)}${c.obrigatorio ? '' : ' <span class="opc">(opcional)</span>'}</label><div class="entrada">${corpo}</div>${ajuda}</div>`;
    };

    const d = this._abrir(`
      <form class="dialogo-corpo" novalidate>
        <h2>${esc(titulo)}</h2>
        <div class="aviso-erro" role="alert" hidden></div>
        ${campos.map(campoHtml).join('')}
        <div class="dialogo-acoes">
          ${onExcluir ? `<button type="button" class="btn btn-perigo-claro" data-x="excluir">${esc(rotuloExcluir || 'Excluir')}</button>` : '<span></span>'}
          <span class="grupo">
            <button type="button" class="btn btn-claro" data-x="cancelar">Cancelar</button>
            <button type="submit" class="btn">${esc(ok || 'Salvar')}</button>
          </span>
        </div>
      </form>`);

    const $f = d.querySelector('form');
    const $erro = d.querySelector('.aviso-erro');
    const $ok = $f.querySelector('button[type=submit]');
    const mostrarErro = (t) => { $erro.textContent = t; $erro.hidden = false; };
    const ocupado = (b, textoOcupado) => {
      $f.querySelectorAll('button').forEach(x => { x.disabled = b; });
      if (textoOcupado) $ok.textContent = b ? textoOcupado : (ok || 'Salvar');
    };
    const expirou = () => { d.close(); sessaoExpirada(); };

    const primeiro = $f.querySelector('input:not([type=radio]), select');
    if (primeiro) primeiro.focus();

    $f.addEventListener('click', async (ev) => {
      const x = ev.target.closest('[data-x]');
      if (!x) return;
      if (x.dataset.x === 'cancelar') { d.close(); return; }
      if (x.dataset.x === 'excluir') {
        const sim = await Dialogo.confirmar({ titulo: 'Excluir?', texto: 'Esta ação não pode ser desfeita.', ok: 'Excluir', perigo: true });
        if (!sim) return;
        $erro.hidden = true;
        ocupado(true);
        try { await onExcluir(); d.close(); }
        catch (e) { if (e.message === 'SESSAO_INVALIDA') return expirou(); mostrarErro(e.message); ocupado(false); }
      }
    });

    $f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      $erro.hidden = true;
      const fd = new FormData($f);
      const valores = {};
      const faltando = [];
      for (const c of campos) {
        let v = fd.get(c.id);
        v = v == null ? '' : String(v).trim();
        if (c.obrigatorio && v === '') faltando.push(c.rotulo);
        if (c.tipo === 'number' && v !== '') {
          const n = Number(v.replace(',', '.'));
          if (Number.isNaN(n)) { mostrarErro(`"${c.rotulo}" precisa ser um número.`); return; }
          v = n;
        }
        valores[c.id] = v;
      }
      if (faltando.length) { mostrarErro('Preencha: ' + faltando.join(', ') + '.'); return; }
      ocupado(true, 'Salvando...');
      try { await onSalvar(valores); d.close(); }
      catch (e) { if (e.message === 'SESSAO_INVALIDA') return expirou(); mostrarErro(e.message); ocupado(false, true); }
    });
    return d;
  }
};
