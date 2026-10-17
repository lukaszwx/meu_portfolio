'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { autenticacao, banco, armazenamento, emailAdministrador, firebaseConfigurado } from './firebase';
import { camposDeTexto, conteudoInicial, type ConteudoSite, type Idioma, type Projeto } from './modelo';
import './painel.css';

type Area = 'visao-geral' | 'paginas' | 'projetos' | 'midias' | 'mensagens' | 'seo' | 'configuracoes' | 'historico';

const navegacao: Array<{ id: Area; nome: string; icone: string }> = [
  { id: 'visao-geral', nome: 'Visão geral', icone: '◫' },
  { id: 'paginas', nome: 'Páginas', icone: '▤' },
  { id: 'projetos', nome: 'Projetos', icone: '▧' },
  { id: 'midias', nome: 'Biblioteca de mídia', icone: '▣' },
  { id: 'mensagens', nome: 'Mensagens', icone: '✉' },
  { id: 'seo', nome: 'SEO', icone: '⌕' },
  { id: 'configuracoes', nome: 'Configurações', icone: '⚙' },
  { id: 'historico', nome: 'Histórico', icone: '◷' },
];

function formatarErro(erro: unknown) {
  const codigo = (erro as { code?: string })?.code;
  const mensagens: Record<string, string> = {
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/network-request-failed': 'Não foi possível conectar ao Firebase.',
    'permission-denied': 'Sua conta não está autorizada para administrar este site.',
  };
  return mensagens[codigo || ''] || 'Não foi possível concluir. Confira o Firebase e tente novamente.';
}

function urlDoWhatsApp(numero: string) {
  const digitos = numero.replace(/\D/g, '');
  return 'https://wa.me/' + (digitos.startsWith('55') ? digitos : '55' + digitos);
}

export default function PainelAdministrativo() {
  const [usuario, definirUsuario] = useState<User | null>(null);
  const [autorizado, definirAutorizado] = useState(false);
  const [carregando, definirCarregando] = useState(true);
  const [area, definirArea] = useState<Area>('visao-geral');
  const [idioma, definirIdioma] = useState<Idioma>('pt');
  const [conteudo, definirConteudo] = useState<ConteudoSite>(conteudoInicial);
  const [estadoSalvamento, definirEstadoSalvamento] = useState('Carregando');
  const [erro, definirErro] = useState('');
  const [email, definirEmail] = useState(emailAdministrador);
  const [senha, definirSenha] = useState('');
  const [entrando, definirEntrando] = useState(false);
  const [projetoAtual, definirProjetoAtual] = useState<Projeto | null>(null);
  const [visualizacao, definirVisualizacao] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [versoes, definirVersoes] = useState<Array<{ id: string; data?: string; conteudo?: ConteudoSite }>>([]);
  const [mensagens, definirMensagens] = useState<Array<Record<string, unknown>>>([]);
  const [soLixeira, definirSoLixeira] = useState(false);
  const temporizadorSalvar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revisao = useRef(0);

  const atualizarConteudo = useCallback((atualizador: (anterior: ConteudoSite) => ConteudoSite) => {
    revisao.current += 1;
    definirConteudo(atualizador);
  }, []);

  useEffect(() => {
    const rota = window.location.pathname.replace(/\/+$/, '').split('/').pop();
    const areaInicial: Record<string, Area> = {
      admin: 'visao-geral',
      projetos: 'projetos',
      paginas: 'paginas',
      midias: 'midias',
      mensagens: 'mensagens',
      seo: 'seo',
      configuracoes: 'configuracoes',
      historico: 'historico',
      login: 'visao-geral',
    };
    if (rota && areaInicial[rota]) definirArea(areaInicial[rota]);
  }, []);

  useEffect(() => {
    if (!autenticacao || !banco) {
      definirCarregando(false);
      return;
    }
    return onAuthStateChanged(autenticacao, async conta => {
      definirEntrando(false);
      definirUsuario(conta);
      if (!conta) {
        definirAutorizado(false);
        definirCarregando(false);
        return;
      }
      try {
        const emailPermitido = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'lukas.enginer7@gmail.com').toLowerCase();
        const registro = await getDoc(doc(banco!, 'administradores', conta.uid));
        if (!registro.exists() || registro.data().ativo !== true || conta.email?.toLowerCase() !== emailPermitido) {
          await signOut(autenticacao!);
          definirErro('Esta conta não está na lista de administradores autorizados.');
          definirAutorizado(false);
          definirCarregando(false);
          return;
        }
        const rascunho = await getDoc(doc(banco!, 'site_editor', 'rascunho'));
        if (rascunho.exists() && rascunho.data().conteudo) definirConteudo({ ...conteudoInicial, ...rascunho.data().conteudo });
        definirAutorizado(true);
      } catch (falha) {
        definirErro(formatarErro(falha));
        definirAutorizado(false);
      } finally {
        definirCarregando(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!autorizado || !banco) return;
    if (temporizadorSalvar.current) clearTimeout(temporizadorSalvar.current);
    definirEstadoSalvamento('Alterações pendentes');
    localStorage.setItem('nox-previa-rascunho', JSON.stringify(conteudo));
    temporizadorSalvar.current = setTimeout(async () => {
      const numeroRevisao = revisao.current;
      definirEstadoSalvamento('Salvando…');
      try {
        await setDoc(doc(banco!, 'site_editor', 'rascunho'), {
          conteudo,
          atualizadoEm: serverTimestamp(),
          uid: usuario?.uid,
          revisao: numeroRevisao,
        });
        if (numeroRevisao === revisao.current) definirEstadoSalvamento('Rascunho salvo');
      } catch (falha) {
        definirEstadoSalvamento('Falha ao salvar');
        definirErro(formatarErro(falha));
      }
    }, 800);
    return () => { if (temporizadorSalvar.current) clearTimeout(temporizadorSalvar.current); };
  }, [conteudo, autorizado, usuario]);

  useEffect(() => {
    if (!autorizado || !banco || !['historico', 'mensagens', 'visao-geral'].includes(area)) return;
    const carregarListas = async () => {
      try {
        if (area === 'historico' || area === 'visao-geral') {
          const consulta = query(collection(banco!, 'site_versoes'), orderBy('criadaEm', 'desc'), limit(20));
          const resultado = await getDocs(consulta);
          definirVersoes(resultado.docs.map(item => ({ id: item.id, ...item.data() as { data?: string; conteudo?: ConteudoSite } })));
        }
        if (area === 'mensagens' || area === 'visao-geral') {
          const consulta = query(collection(banco!, 'mensagens'), orderBy('criadaEm', 'desc'), limit(30));
          const resultado = await getDocs(consulta);
          definirMensagens(resultado.docs.map(item => ({ id: item.id, ...item.data() })));
        }
      } catch (falha) {
        if ((falha as { code?: string })?.code !== 'permission-denied') definirErro(formatarErro(falha));
      }
    };
    void carregarListas();
  }, [autorizado, area]);

  const projetosAtuais = useMemo(() => conteudo.projetos.filter(item => soLixeira ? Boolean(item.removidoEm) : !item.removidoEm), [conteudo.projetos, soLixeira]);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!autenticacao) return;
    definirEntrando(true);
    definirErro('');
    try {
      if (email.toLowerCase() !== emailAdministrador.toLowerCase()) throw new Error('email-administrador');
      await signInWithEmailAndPassword(autenticacao!, email, senha);
    } catch (falha) {
      definirErro((falha as Error).message === 'email-administrador' ? 'Use o e-mail de administrador configurado.' : formatarErro(falha));
      definirEntrando(false);
    }
  }

  async function publicar() {
    if (!banco || !usuario) return;
    const incompletos = (['pt', 'en'] as Idioma[]).some(id => !conteudo.textos[id].heroDescricao.trim() || !conteudo.textos[id].sobreBio.trim());
    const projetoInvalido = conteudo.projetos.some(item => item.publicado && !item.removidoEm && (!item.nome.trim() || !item.descricao.trim() || !item.imagem.trim()));
    if (incompletos || projetoInvalido) {
      definirErro('Complete o conteúdo obrigatório em português e inglês e revise os projetos publicados.');
      return;
    }
    definirErro('');
    definirEstadoSalvamento('Publicando…');
    try {
      const marca = Date.now();
      const lote = writeBatch(banco!);
      const snapshot = doc(collection(banco!, 'site_versoes'), String(marca));
      lote.set(snapshot, { conteudo, criadaEm: serverTimestamp(), uid: usuario.uid, versao: marca });
      lote.set(doc(banco!, 'site_editor', 'publicado'), { conteudo, versaoAtual: String(marca), atualizadoEm: serverTimestamp() });
      lote.set(doc(banco!, 'site_auditoria', String(marca)), { acao: 'publicacao', uid: usuario.uid, entidade: 'site', criadaEm: serverTimestamp() });
      await lote.commit();
      const antigas = await getDocs(query(collection(banco!, 'site_versoes'), orderBy('criadaEm', 'desc')));
      const excedentes = antigas.docs.slice(20).filter(item => item.id !== String(marca));
      await Promise.all(excedentes.map(item => deleteDoc(item.ref)));
      definirEstadoSalvamento('Publicado');
      definirErro('Conteúdo publicado. A página pública será atualizada ao carregar novamente.');
    } catch (falha) {
      definirEstadoSalvamento('Falha na publicação');
      definirErro(formatarErro(falha));
    }
  }

  function restaurarVersao(versao: { conteudo?: ConteudoSite }) {
    if (!versao.conteudo) return;
    atualizarConteudo(() => JSON.parse(JSON.stringify(versao.conteudo)));
    definirArea('paginas');
    definirErro('Versão carregada como rascunho. Revise e publique quando estiver pronta.');
  }

  async function salvarProjeto(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!projetoAtual) return;
    const formulario = new FormData(evento.currentTarget);
    const atualizado: Projeto = {
      ...projetoAtual,
      nome: String(formulario.get('nome') || ''),
      categoria: String(formulario.get('categoria') || 'web'),
      descricao: String(formulario.get('descricao') || ''),
      imagem: String(formulario.get('imagem') || ''),
      url: String(formulario.get('url') || ''),
      tecnologias: String(formulario.get('tecnologias') || ''),
      publicado: formulario.get('publicado') === 'on',
    };
    atualizarConteudo(anterior => ({ ...anterior, projetos: anterior.projetos.some(p => p.id === atualizado.id) ? anterior.projetos.map(p => p.id === atualizado.id ? atualizado : p) : [...anterior.projetos, atualizado] }));
    definirProjetoAtual(null);
  }

  async function enviarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo || !armazenamento || !usuario) return;
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(arquivo.type) || arquivo.size > 8 * 1024 * 1024) {
      definirErro('Escolha uma imagem JPG, PNG, WebP, AVIF ou GIF de até 8 MB.');
      return;
    }
    try {
      const caminho = 'midias/' + usuario.uid + '/' + Date.now() + '-' + arquivo.name.replace(/[^\p{L}\p{N}._-]/gu, '-');
      const arquivoRef = ref(armazenamento, caminho);
      await uploadBytes(arquivoRef, arquivo, { contentType: arquivo.type });
      const url = await getDownloadURL(arquivoRef);
      atualizarConteudo(anterior => ({ ...anterior, midias: [{ nome: arquivo.name, url, tipo: arquivo.type, criadaEm: Date.now() }, ...anterior.midias] }));
      definirErro('Imagem enviada. Copie o endereço da biblioteca para usar em um projeto ou na foto de perfil.');
      evento.target.value = '';
    } catch (falha) {
      definirErro(formatarErro(falha));
    }
  }

  if (carregando) return <main className="adm-tela-carregando"><span className="adm-luz" />Conferindo acesso administrativo…</main>;
  if (!firebaseConfigurado) return <main className="adm-configuracao"><div className="adm-configuracao__marca">N<span>V</span></div><p className="adm-sobretitulo">NOX VESPER · ÁREA RESTRITA</p><h1>O painel está<br /><em>preparado.</em></h1><p>Para liberar o acesso, configure o Firebase Auth, Firestore e Storage seguindo o arquivo <b>INSTRUCOES.md</b> incluído no projeto.</p><a href="/">Voltar ao site <span>→</span></a></main>;
  if (!usuario || !autorizado) return <main className="adm-login"><a className="adm-voltar" href="/">← Voltar ao site</a><section className="adm-login__painel"><div className="adm-configuracao__marca">N<span>V</span></div><p className="adm-sobretitulo">NOX VESPER · ÁREA RESTRITA</p><h1>Administração</h1><p>Acesse o conteúdo, os projetos e as configurações do site.</p><form onSubmit={entrar}><label>E-mail<input type="email" value={email} onChange={e => definirEmail(e.target.value)} autoComplete="username" required /></label><label>Senha<input type="password" value={senha} onChange={e => definirSenha(e.target.value)} autoComplete="current-password" required /></label><button disabled={entrando}>{entrando ? 'Verificando…' : 'Entrar no painel'} <span>→</span></button></form>{erro && <p className="adm-aviso" role="alert">{erro}</p>}<small>Somente a conta autorizada pode entrar. Não existe cadastro público.</small></section></main>;

  return (
    <main className="adm-painel">
      <aside className="adm-lateral">
        <a href="/" className="adm-marca"><img src="/assets/raven-original.png" alt="" /><span>NOX <b>VESPER</b><small>PAINEL DE CONTROLE</small></span></a>
        <div className="adm-lateral__secao">ESPAÇO DE TRABALHO</div>
        <nav>{navegacao.map(item => <button key={item.id} className={area === item.id ? 'ativo' : ''} onClick={() => definirArea(item.id)}><i>{item.icone}</i>{item.nome}{item.id === 'mensagens' && mensagens.length > 0 && <b>{mensagens.length}</b>}</button>)}</nav>
        <div className="adm-lateral__rodape"><span className="adm-status-online" />Firebase conectado <button onClick={() => autenticacao && signOut(autenticacao!)}>Sair da conta</button></div>
      </aside>
      <section className="adm-principal">
        <header className="adm-topo"><div><p className="adm-sobretitulo">NOX VESPER / CMS</p><h1>{navegacao.find(item => item.id === area)?.nome}</h1></div><div className="adm-topo__acoes"><span className="adm-salvamento"><i className={estadoSalvamento === 'Rascunho salvo' || estadoSalvamento === 'Publicado' ? 'salvo' : ''} />{estadoSalvamento}</span><a href="/" target="_blank" rel="noreferrer" className="adm-abrir-site">Abrir site ↗</a><button className="adm-publicar" onClick={publicar}>Publicar alterações <span>↗</span></button></div></header>
        {erro && <div className="adm-aviso adm-aviso--painel" role="status"><span>{erro}</span><button aria-label="Fechar aviso" onClick={() => definirErro('')}>×</button></div>}
        {area === 'visao-geral' && <section className="adm-conteudo">
          <div className="adm-boas-vindas"><div><small>ÁREA ADMINISTRATIVA</small><h2>Olá, Lucas<span>.</span></h2><p>O que você quer atualizar no site hoje?</p></div><button onClick={() => definirArea('paginas')}>Editar conteúdo <span>→</span></button></div>
          <div className="adm-metricas"><article><span>PROJETOS NO PORTFÓLIO</span><b>{conteudo.projetos.filter(p => !p.removidoEm).length.toString().padStart(2, '0')}</b><small>itens cadastrados</small></article><article><span>PUBLICADOS</span><b>{conteudo.projetos.filter(p => p.publicado && !p.removidoEm).length.toString().padStart(2, '0')}</b><small>visíveis no site</small></article><article><span>VERSÕES DO SITE</span><b>{versoes.length.toString().padStart(2, '0')}</b><small>no histórico recente</small></article><article><span>MENSAGENS RECEBIDAS</span><b>{mensagens.length.toString().padStart(2, '0')}</b><small>na caixa de entrada</small></article></div>
          <div className="adm-grade-inicio"><article className="adm-cartao adm-atividade"><div className="adm-cartao__topo"><div><small>ATIVIDADE</small><h3>Últimas publicações</h3></div><button onClick={() => definirArea('historico')}>Ver histórico ↗</button></div>{versoes.length ? versoes.slice(0, 4).map(item => <div className="adm-linha-versao" key={item.id}><i /><div><b>Site publicado</b><span>Versão {item.id.slice(-5)}</span></div><small>{item.data || 'Publicada'}</small></div>) : <div className="adm-vazio">As publicações aparecerão aqui depois da primeira atualização.</div>}</article><article className="adm-cartao adm-acesso-rapido"><small>ACESSO RÁPIDO</small><h3>Edite uma área</h3>{[['projetos','Projetos e estudos de caso'],['midias','Imagens e biblioteca de mídia'],['seo','Título e descrição para buscadores'],['configuracoes','Contato e redes sociais']].map(([id,nome])=><button key={id} onClick={() => definirArea(id as Area)}><span>{nome}</span><b>↗</b></button>)}</article></div>
        </section>}
        {area === 'paginas' && <section className="adm-editor-paginas">
          <div className="adm-editor-paginas__cabecalho"><div><small>CONTEÚDO PUBLICADO NO SITE</small><h2>Textos e seções</h2><p>Edite os textos principais. As alterações ficam em rascunho até você publicar.</p></div><div className="adm-idiomas"><button className={idioma === 'pt' ? 'ativo' : ''} onClick={() => definirIdioma('pt')}>PT-BR</button><button className={idioma === 'en' ? 'ativo' : ''} onClick={() => definirIdioma('en')}>EN</button></div></div>
          <div className="adm-editor-dividido"><div className="adm-campos">{['Início','Projetos','Sobre','Identidade','Contato','Habilidades','Interesses','Processo','Rodapé'].map(grupo => <section className="adm-grupo" key={grupo}><small>{grupo.toUpperCase()}</small>{camposDeTexto.filter(campo => campo.grupo === grupo).map(campo => <label key={campo.chave}>{campo.rotulo}<textarea rows={campo.chave.includes('Descricao') || campo.chave.includes('Bio') || campo.chave.includes('Complemento') || campo.chave === 'processoEtapas' ? 4 : 2} value={conteudo.textos[idioma][campo.chave] || ''} onChange={evento => atualizarConteudo(anterior => ({ ...anterior, textos: { ...anterior.textos, [idioma]: { ...anterior.textos[idioma], [campo.chave]: evento.target.value } } }))} /></label>)}</section>)}<section className="adm-grupo"><small>IMAGENS DAS SEÇÕES</small>{[['imagemHero','Cenário do início'],['imagemHabilidades','Fundo de habilidades'],['imagemPerfil','Foto da apresentação'],['imagemJiuJitsu','Card de jiu-jitsu'],['imagemTecnologia','Card de tecnologia'],['imagemCinema','Card de cinema e jogos'],['imagemDesign','Card de arte e design']].map(([campo,rotulo])=><label key={campo}>{rotulo}<input value={conteudo.configuracoes[campo as keyof ConteudoSite['configuracoes']]} onChange={e => atualizarConteudo(anterior => ({ ...anterior, configuracoes: { ...anterior.configuracoes, [campo]: e.target.value } }))} /></label>)}</section></div><div className="adm-previa"><div className="adm-previa__barra"><span>PRÉVIA · {idioma === 'pt' ? 'PT-BR' : 'EN'}</span><div>{(['desktop','tablet','mobile'] as const).map((tela,index) => <button key={tela} className={visualizacao === tela ? 'ativo' : ''} title={tela} onClick={() => definirVisualizacao(tela)}>{['▭','▯','▯'][index]}</button>)}</div></div><div className={'adm-previa__moldura ' + visualizacao}><iframe title="Prévia do site" src={'/home.html?modoPreview=rascunho&idioma=' + idioma} /></div></div></div>
        </section>}
        {area === 'projetos' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>PORTFÓLIO · ESTUDOS DE CASO</small><h2>Projetos</h2><p>Organize os projetos e escolha quais aparecem na página inicial.</p></div><button className="adm-botao-claro" onClick={() => definirProjetoAtual({ id: 'projeto-' + Date.now(), nome: '', categoria: 'web', descricao: '', imagem: '', url: '', tecnologias: '', publicado: false })}>＋ Novo projeto</button></div><div className="adm-lista-filtros"><button className={!soLixeira ? 'ativo' : ''} onClick={() => definirSoLixeira(false)}>Projetos ativos</button><button className={soLixeira ? 'ativo' : ''} onClick={() => definirSoLixeira(true)}>Lixeira recuperável</button><span>As imagens originais ficam sem deformação.</span></div><div className="adm-projetos-grid">{projetosAtuais.map(projeto => <article className="adm-projeto" key={projeto.id}><div className="adm-projeto__imagem">{projeto.imagem && <img src={projeto.imagem.startsWith('http') ? projeto.imagem : '/' + projeto.imagem} alt="" />}<span className={projeto.publicado ? 'publicado' : ''}>{projeto.publicado ? 'Publicado' : 'Rascunho'}</span></div><div className="adm-projeto__corpo"><small>{projeto.categoria.toUpperCase()}</small><h3>{projeto.nome || 'Projeto sem título'}</h3><p>{projeto.descricao}</p><div><button onClick={() => definirProjetoAtual(projeto)}>Editar</button>{soLixeira ? <button onClick={() => atualizarConteudo(anterior => ({ ...anterior, projetos: anterior.projetos.map(item => item.id === projeto.id ? { ...item, removidoEm: null } : item) }))}>Restaurar</button> : <button onClick={() => atualizarConteudo(anterior => ({ ...anterior, projetos: anterior.projetos.map(item => item.id === projeto.id ? { ...item, removidoEm: Date.now(), publicado: false } : item) }))}>Mover para lixeira</button>}</div></div></article>)}</div>{projetoAtual && <div className="adm-modal-fundo" role="presentation" onClick={() => definirProjetoAtual(null)}><form className="adm-modal-projeto" onSubmit={salvarProjeto} onClick={evento => evento.stopPropagation()}><button type="button" className="adm-modal-fechar" onClick={() => definirProjetoAtual(null)}>×</button><small>DETALHES DO PROJETO</small><h2>{projetoAtual.nome || 'Novo projeto'}</h2>{[['nome','Nome'],['categoria','Categoria'],['descricao','Descrição'],['imagem','Endereço da imagem'],['url','Link do projeto'],['tecnologias','Tecnologias separadas por vírgula']].map(([nome,rotulo])=><label key={nome}>{rotulo}{nome === 'descricao' ? <textarea name={nome} defaultValue={projetoAtual[nome as keyof Projeto] as string} rows={3} /> : <input name={nome} defaultValue={projetoAtual[nome as keyof Projeto] as string} />}</label>)}<label className="adm-check"><input type="checkbox" name="publicado" defaultChecked={projetoAtual.publicado} /> Exibir no site ao publicar</label><button className="adm-publicar" type="submit">Salvar projeto <span>→</span></button></form></div>}</section>}
        {area === 'midias' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>ARQUIVOS DO SITE</small><h2>Biblioteca de mídia</h2><p>Envie imagens para o Firebase Storage e reutilize os endereços nos projetos.</p></div><label className="adm-botao-claro adm-upload">＋ Enviar imagem<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={enviarArquivo} /></label></div><div className="adm-upload-nota">JPG, PNG, WebP, AVIF ou GIF · até 8 MB por arquivo</div>{conteudo.midias.length ? <div className="adm-midias-grid">{conteudo.midias.map((midia,index) => <article key={midia.url + index}><img src={midia.url} alt={midia.nome} /><div><b>{midia.nome}</b><small>{midia.tipo}</small><button onClick={() => { void navigator.clipboard.writeText(midia.url); definirErro('Endereço da imagem copiado.'); }}>Copiar endereço</button></div></article>)}</div> : <div className="adm-vazio adm-vazio--alto"><b>▣</b><h3>Sua biblioteca está pronta</h3><p>Imagens enviadas aparecerão aqui. A logo original é mantida nos arquivos do site e não é substituída.</p></div>}</section>}
        {area === 'mensagens' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>CAIXA DE ENTRADA</small><h2>Mensagens</h2><p>Mensagens enviadas pelo formulário aparecerão quando um endpoint seguro for configurado.</p></div></div>{mensagens.length ? <div className="adm-tabela"><div className="adm-tabela__linha cabecalho"><span>CONTATO</span><span>ASSUNTO</span><span>MENSAGEM</span><span>RECEBIDA EM</span></div>{mensagens.map((mensagem,index)=><article className="adm-tabela__linha" key={String(mensagem.id || index)}><span><b>{String(mensagem.nome || 'Visitante')}</b><small>{String(mensagem.email || mensagem.contato || '')}</small></span><span>{String(mensagem.assunto || '—')}</span><span>{String(mensagem.corpo || mensagem.mensagem || '')}</span><span>{String(mensagem.dataExibicao || '—')}</span></article>)}</div> : <div className="adm-vazio adm-vazio--alto"><b>✉</b><h3>Nenhuma mensagem recebida</h3><p>O e-mail já abre uma mensagem endereçada para você. O armazenamento de mensagens depende de um serviço de envio seguro.</p><a href={'mailto:' + conteudo.configuracoes.email}>Abrir e-mail <span>→</span></a></div>}</section>}
        {area === 'seo' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>BUSCADORES E COMPARTILHAMENTO</small><h2>SEO do site</h2><p>Edite como Nox Vesper aparece em mecanismos de busca e prévias de links.</p></div></div><div className="adm-form-padrao"><label>Título da página<input value={conteudo.configuracoes.tituloSeo} onChange={e => atualizarConteudo(anterior => ({ ...anterior, configuracoes: { ...anterior.configuracoes, tituloSeo: e.target.value } }))} /></label><label>Descrição para buscadores<textarea rows={4} value={conteudo.configuracoes.descricaoSeo} onChange={e => atualizarConteudo(anterior => ({ ...anterior, configuracoes: { ...anterior.configuracoes, descricaoSeo: e.target.value } }))} /></label><div className="adm-cartao adm-preview-seo"><small>PRÉVIA DO RESULTADO</small><b>{conteudo.configuracoes.tituloSeo}</b><span>noxvesper.com</span><p>{conteudo.configuracoes.descricaoSeo}</p></div></div></section>}
        {area === 'configuracoes' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>IDENTIDADE E CANAIS</small><h2>Configurações</h2><p>Dados públicos e links de contato do portfólio.</p></div></div><div className="adm-form-padrao">{[['email','E-mail de contato'],['whatsapp','WhatsApp com DDD'],['github','URL do GitHub'],['linkedin','URL do LinkedIn']].map(([campo,rotulo])=><label key={campo}>{rotulo}<input value={conteudo.configuracoes[campo as keyof ConteudoSite['configuracoes']]} onChange={e => atualizarConteudo(anterior => ({ ...anterior, configuracoes: { ...anterior.configuracoes, [campo]: e.target.value } }))} /></label>)}<div className="adm-teste-contato"><span>Teste de contato</span><a href={urlDoWhatsApp(conteudo.configuracoes.whatsapp)} target="_blank" rel="noreferrer">Abrir conversa no WhatsApp ↗</a><a href={'mailto:' + conteudo.configuracoes.email}>Escrever um e-mail ↗</a></div></div></section>}
        {area === 'historico' && <section className="adm-conteudo"><div className="adm-lista-topo"><div><small>PUBLICAÇÕES ANTERIORES</small><h2>Histórico do site</h2><p>Até 20 versões recentes. Restaurar uma versão cria um novo rascunho.</p></div></div><div className="adm-historico">{versoes.map(versao => <article key={versao.id}><div><i /><b>Publicação do site</b><small>Versão {versao.id.slice(-5)} · {versao.data || 'Data registrada no Firebase'}</small></div><button onClick={() => restaurarVersao(versao)}>Carregar como rascunho</button></article>)}</div>{!versoes.length && <div className="adm-vazio">O histórico será iniciado após a primeira publicação pelo painel.</div>}</section>}
      </section>
    </main>
  );
}
