/* Armazém de dados em memória: cada tela carrega o que precisa em UMA chamada ao servidor. */
const Dados = {
  t: {},

  async carregar(tabelas) {
    const r = await Api.listarVarias(tabelas);
    tabelas.forEach(n => { this.t[n] = r[n] || []; });
    return this.t;
  },

  async salvar(tabela, dados) {
    const reg = await Api.salvar(tabela, dados);
    const lista = this.t[tabela] || (this.t[tabela] = []);
    const i = lista.findIndex(x => x.id === reg.id);
    if (i >= 0) lista[i] = reg; else lista.push(reg);
    return reg;
  },

  async excluir(tabela, id) {
    await Api.excluir(tabela, id);
    this.t[tabela] = (this.t[tabela] || []).filter(x => x.id !== id);
  }
};

/* Tudo o que o motor do cronograma precisa */
const TABELAS_MOTOR = ['AnoLetivo', 'Bimestres', 'Materias', 'Grade', 'Metas', 'Regras', 'Provas', 'Trabalhos', 'Notas', 'Registros', 'Plano'];
