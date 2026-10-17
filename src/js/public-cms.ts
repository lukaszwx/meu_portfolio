import { initializeApp } from 'firebase/app';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';

declare global {
  interface Window {
    noxFirebaseConfig?: Record<string, string>;
  }
}

type ProjetoPublico = {
  id: string; nome: string; categoria: string; descricao: string; imagem: string;
  url: string; tecnologias: string; publicado: boolean; removidoEm?: number | null;
};
type ConteudoPublicado = {
  textos?: Record<string, Record<string, string>>;
  projetos?: ProjetoPublico[];
  configuracoes?: Record<string, string>;
};

const configuracao = window.noxFirebaseConfig;
const modoPreview = new URLSearchParams(location.search).get('modoPreview') === 'rascunho';
const campos: Record<string, string> = {
  heroRotulo: '.hero__content>.eyebrow',
  heroDescricao: '.hero__description',
  projetosDescricao: '.projects .section-intro>p:not(.eyebrow)',
  sobreBio: '.about__copy>p:nth-of-type(2)',
  sobreComplemento: '.about__copy>p:nth-of-type(3)',
  identidadeTitulo: '.brand-story h3',
  identidadeDescricao: '.brand-story>div:nth-child(2)>p:last-child',
  contatoDescricao: '.contact__copy>p:not(.eyebrow)',
  habilidadesDescricao: '.skills__heading>p:not(.eyebrow)',
  frontendDescricao: '.skill-cards article:nth-child(1)>p',
  backendDescricao: '.skill-cards article:nth-child(2)>p',
  criativoDescricao: '.skill-cards article:nth-child(3)>p',
  interessesDescricao: '.interests__intro>p:not(.eyebrow)',
  rodapeDescricao: '.site-footer>span',
};

function aplicarConteudo(conteudo: ConteudoPublicado) {
  const idioma = new URLSearchParams(location.search).get('idioma') === 'en' || document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
  document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
  const textos = conteudo.textos?.[idioma] || conteudo.textos?.pt || {};
  for (const [chave, seletor] of Object.entries(campos)) {
    const elemento = document.querySelector(seletor);
    if (elemento && textos[chave]) elemento.textContent = textos[chave];
  }
  if (textos.sobreTitulo) {
    const titulo = document.querySelector('.about__copy h2');
    if (titulo) titulo.textContent = textos.sobreTitulo;
  }
  const habilidadesTitulo = document.querySelector('.skills__heading h2');
  if (habilidadesTitulo && textos.habilidadesTitulo) habilidadesTitulo.textContent = textos.habilidadesTitulo;
  const interessesTitulo = document.querySelector('.interests__intro h3');
  if (interessesTitulo && textos.interessesTitulo) interessesTitulo.textContent = textos.interessesTitulo;
  const nomesDosInteresses = [textos.interesseJiuJitsu, textos.interesseTecnologia, textos.interesseCinema, textos.interesseDesign];
  document.querySelectorAll('.interest-card h4').forEach((titulo, indice) => {
    if (nomesDosInteresses[indice]) titulo.textContent = nomesDosInteresses[indice];
  });
  if (textos.processoDescricao) {
    const introducao = document.querySelector('.process>p');
    if (introducao?.lastChild) introducao.lastChild.textContent = textos.processoDescricao;
  }
  if (textos.habilidadesTecnologias) {
    const gradeTecnologias = document.querySelector('.tech-list');
    if (gradeTecnologias) {
      gradeTecnologias.replaceChildren();
      textos.habilidadesTecnologias.split(',').map(nome => nome.trim()).filter(Boolean).forEach(nome => {
        const tecnologia = document.createElement('span');
        tecnologia.textContent = nome;
        gradeTecnologias.append(tecnologia);
      });
    }
  }
  if (textos.processoEtapas) {
    const etapas = textos.processoEtapas.split(';').map(etapa => etapa.split('|').map(parte => parte.trim()));
    document.querySelectorAll('.process>div').forEach((cartao, indice) => {
      const etapa = etapas[indice];
      if (!etapa) return;
      const titulo = cartao.querySelector('strong');
      const descricao = cartao.querySelector('span');
      if (titulo) titulo.textContent = etapa[0] || '';
      if (descricao) descricao.textContent = etapa[1] || '';
    });
  }
  const projetos = (conteudo.projetos || []).filter(projeto => projeto.publicado && !projeto.removidoEm);
  const destaque = projetos.find(projeto => projeto.id === 'sunset-stories') || projetos[0];
  if (destaque) {
    const artigo = document.querySelector('.featured-project');
    if (artigo) {
      const titulo = artigo.querySelector('h3');
      if (titulo) titulo.textContent = destaque.nome;
      const descricao = artigo.querySelector('.featured-project__copy>p');
      if (descricao) descricao.textContent = destaque.descricao;
      const imagem = artigo.querySelector('.project-screenshot img') as HTMLImageElement | null;
      if (imagem) {
        imagem.src = imagemDoProjeto(destaque.imagem);
        imagem.alt = 'Captura do projeto ' + destaque.nome;
      }
      artigo.querySelectorAll('a').forEach(ancora => { if (destaque.url) ancora.setAttribute('href', destaque.url); });
      const tags = artigo.querySelector('.tags');
      if (tags) tags.textContent = destaque.tecnologias;
    }
    const miniatura = document.querySelector('.featured .featured__image') as HTMLElement | null;
    if (miniatura) miniatura.style.backgroundImage = 'url("' + imagemDoProjeto(destaque.imagem) + '")';
    const nomeMiniatura = document.querySelector('.featured>span:nth-child(2)>b');
    if (nomeMiniatura) nomeMiniatura.textContent = destaque.nome.toUpperCase();
  }
  const outrosProjetos = projetos.filter(projeto => projeto.id !== (destaque?.id || ''));
  const grade = document.querySelector('.project-cards--real');
  if (grade) {
    grade.replaceChildren();
    for (const projeto of outrosProjetos) {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.dataset.category = projeto.categoria;
      const ancora = document.createElement('a');
      ancora.className = 'project-screenshot project-screenshot--brasa';
      ancora.href = projeto.url || '#contato';
      const imagem = document.createElement('img');
      imagem.src = imagemDoProjeto(projeto.imagem);
      imagem.alt = 'Captura real do projeto ' + projeto.nome;
      const textoLink = document.createElement('span');
      textoLink.textContent = 'Abrir projeto ↗';
      ancora.append(imagem, textoLink);
      const titulo = document.createElement('h3');
      titulo.textContent = projeto.nome;
      const descricao = document.createElement('p');
      descricao.textContent = projeto.descricao;
      const tags = document.createElement('div');
      tags.className = 'tags';
      projeto.tecnologias.split(',').map(item => item.trim()).filter(Boolean).forEach(item => {
        const tag = document.createElement('span');
        tag.textContent = item;
        tags.append(tag);
      });
      card.append(ancora, titulo, descricao, tags);
      grade.append(card);
    }
  }
  const configuracoes = conteudo.configuracoes || {};
  const email = configuracoes.email || 'lukas.enginer7@gmail.com';
  const digitos = (configuracoes.whatsapp || '869944913282').replace(/\D/g, '');
  const numero = digitos.startsWith('55') ? digitos : '55' + digitos;
  const whatsapp = 'https://wa.me/' + numero + '?text=' + encodeURIComponent('Oi, Lucas! Quero conversar sobre um projeto.');
  document.querySelectorAll('a[href^="mailto:"]').forEach(ancora => ancora.setAttribute('href', 'mailto:' + email + '?subject=' + encodeURIComponent('Projeto Nox Vesper')));
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(ancora => ancora.setAttribute('href', whatsapp));
  if (configuracoes.imagemPerfil) {
    const perfil = document.querySelector('.about__visual img') as HTMLImageElement | null;
    if (perfil) perfil.src = imagemDoProjeto(configuracoes.imagemPerfil);
  }
  const imagensDeFundo: Array<[string, string | undefined]> = [
    ['.hero__backdrop', configuracoes.imagemHero],
    ['.skills__backdrop', configuracoes.imagemHabilidades],
  ];
  imagensDeFundo.forEach(([seletor, url]) => {
    const elemento = document.querySelector(seletor) as HTMLElement | null;
    if (elemento && url) elemento.style.backgroundImage = 'url("' + imagemDoProjeto(url) + '")';
  });
  const imagensDosInteresses = [configuracoes.imagemJiuJitsu, configuracoes.imagemTecnologia, configuracoes.imagemCinema, configuracoes.imagemDesign];
  document.querySelectorAll('.interest-card img').forEach((imagem, indice) => {
    if (imagensDosInteresses[indice]) (imagem as HTMLImageElement).src = imagemDoProjeto(imagensDosInteresses[indice]);
  });
  const github = document.querySelectorAll('a[href^="https://github.com/"]');
  github.forEach(ancora => { if (configuracoes.github) ancora.setAttribute('href', configuracoes.github); });
  document.querySelectorAll('a[href="https://www.linkedin.com/"]').forEach(ancora => {
    if (configuracoes.linkedin) ancora.setAttribute('href', configuracoes.linkedin);
    else (ancora as HTMLElement).hidden = true;
  });
  if (configuracoes.tituloSeo) document.title = configuracoes.tituloSeo;
  const descricao = document.querySelector('meta[name="description"]');
  if (descricao && configuracoes.descricaoSeo) descricao.setAttribute('content', configuracoes.descricaoSeo);
}

function imagemDoProjeto(caminho: string) {
  return caminho.startsWith('http') || caminho.startsWith('/') ? caminho : '/' + caminho;
}

if (modoPreview) {
  try {
    const rascunho = localStorage.getItem('nox-previa-rascunho');
    if (rascunho) aplicarConteudo(JSON.parse(rascunho));
  } catch { /* A prévia local continua no conteúdo publicado. */ }
}

if (configuracao?.apiKey && configuracao.projectId && configuracao.appId && !modoPreview) {
  try {
    const banco = getFirestore(initializeApp(configuracao));
    onSnapshot(doc(banco, 'site_editor', 'publicado'), resultado => {
      if (resultado.exists()) aplicarConteudo(resultado.data().conteudo as ConteudoPublicado);
    });
  } catch (erro) {
    console.warn('Não foi possível carregar o conteúdo publicado do Firebase.', erro);
  }
}

const formulario = document.getElementById('contact-form') as HTMLFormElement | null;
formulario?.addEventListener('submit', evento => {
  evento.preventDefault();
  if (!formulario.reportValidity()) return;
  const dados = new FormData(formulario);
  const assunto = encodeURIComponent('Nox Vesper — ' + String(dados.get('subject') || 'Contato'));
  const corpo = encodeURIComponent(
    'Nome: ' + String(dados.get('name') || '') + '\n' +
    'E-mail: ' + String(dados.get('email') || '') + '\n\n' +
    String(dados.get('message') || ''),
  );
  const emailContato = document.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.split('?')[0] || 'mailto:lukas.enginer7@gmail.com';
  const status = document.getElementById('form-status');
  if (status) {
    status.textContent = 'Seu aplicativo de e-mail será aberto com a mensagem endereçada para Lucas.';
    status.classList.add('is-sent');
  }
  location.href = emailContato + '?subject=' + assunto + '&body=' + corpo;
});
