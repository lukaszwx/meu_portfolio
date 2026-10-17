/* Ponto de integração. A Home usa conteúdo local até a configuração do Firebase existir. */
window.ravenViceRepository = {
  origem: 'local',
  firebaseDisponivel: false,
  async carregarPagina(slug, idioma) {
    // Substituir por consulta à versão publicada do Firestore após configurar o projeto.
    return { slug, idioma, origem: this.origem };
  },
  async enviarMensagem(dados) {
    // Conectar a uma Cloud Function/API validada; não gravar mensagens direto do cliente.
    return { enviada: false, motivo: 'endpoint-nao-configurado', campos: Object.keys(dados) };
  }
};
