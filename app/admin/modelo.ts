export type Idioma = 'pt' | 'en';

export type Projeto = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  imagem: string;
  url: string;
  tecnologias: string;
  publicado: boolean;
  removidoEm?: number | null;
};

export type ConteudoSite = {
  textos: Record<Idioma, Record<string, string>>;
  projetos: Projeto[];
  configuracoes: {
    email: string;
    whatsapp: string;
    github: string;
    linkedin: string;
    tituloSeo: string;
    descricaoSeo: string;
    imagemPerfil: string;
    imagemHero: string;
    imagemHabilidades: string;
    imagemJiuJitsu: string;
    imagemTecnologia: string;
    imagemCinema: string;
    imagemDesign: string;
  };
  midias: Array<{ nome: string; url: string; tipo: string; criadaEm: number }>;
};

export const conteudoInicial: ConteudoSite = {
  textos: {
    pt: {
      heroRotulo: 'DESENVOLVEDOR FULLSTACK',
      heroDescricao: 'Interfaces, sistemas e experiências digitais com atenção a detalhe e desempenho.',
      projetosDescricao: 'Interfaces e sistemas desenvolvidos para uso real, com cuidado visual e atenção ao desempenho.',
      sobreTitulo: 'DESENVOLVIMENTO COM IDENTIDADE',
      sobreBio: 'Sou Lucas Neves, estudante de Análise e Desenvolvimento de Sistemas. Desenvolvo aplicações web e interfaces, explorando frontend, backend e experiências interativas.',
      sobreComplemento: 'Nos meus projetos, junto organização de código, usabilidade e direção visual — da estrutura ao acabamento da interface.',
      identidadeTitulo: 'O CORVO NOX VESPER',
      identidadeDescricao: 'O corvo geométrico e o raio vermelho e laranja formam a assinatura visual de Nox Vesper. A marca combina contraste, presença e movimento com uma atmosfera de cidade costeira neon. O desenho original do corvo permanece preservado no site e na introdução.',
      contatoDescricao: 'Projetos, parcerias ou uma conversa sobre tecnologia. Envie uma mensagem com o contexto do que você está criando.',
      habilidadesTitulo: 'DO CONCEITO À REALIDADE',
      habilidadesDescricao: 'Desenvolvimento de interfaces, sistemas e experiências digitais com atenção a performance e usabilidade.',
      frontendDescricao: 'Interfaces modernas, responsivas e acessíveis para diferentes telas.',
      backendDescricao: 'Estrutura de dados, integrações e regras de negócio para aplicações web.',
      criativoDescricao: 'Direção visual e movimento aplicados à identidade de cada projeto.',
      interessesTitulo: 'O QUE FAZ PARTE DISSO',
      interessesDescricao: 'Referências e interesses que atravessam meu dia a dia e aparecem, de um jeito ou de outro, no que crio.',
      interesseJiuJitsu: 'Jiu-jitsu',
      interesseTecnologia: 'Projetos digitais',
      interesseCinema: 'Games & cinema',
      interesseDesign: 'Arte & design',
      processoDescricao: 'Etapas claras, da ideia à entrega.',
      rodapeDescricao: 'Desenvolvimento fullstack com foco em performance e design.',
      habilidadesTecnologias: 'JavaScript, React, TypeScript, Node.js, Python, Firebase, Tailwind CSS, GSAP, Three.js, Git',
      processoEtapas: 'Planejamento|Escopo e definição da solução;Desenvolvimento|Implementação organizada;Testes|Revisão e ajustes finais;Entrega|Preparação para publicação',
    },
    en: {
      heroRotulo: 'FULL STACK DEVELOPER',
      heroDescricao: 'Interfaces, systems and digital experiences with attention to detail and performance.',
      projetosDescricao: 'Interfaces and systems built for real use, with visual care and attention to performance.',
      sobreTitulo: 'DEVELOPMENT WITH IDENTITY',
      sobreBio: 'I’m Lucas Neves, a Systems Analysis and Development student. I build web applications and interfaces across frontend, backend and interactive experiences.',
      sobreComplemento: 'My projects bring together organized code, usability and visual direction — from structure to interface finish.',
      identidadeTitulo: 'THE NOX VESPER RAVEN',
      identidadeDescricao: 'The geometric raven and red-orange lightning bolt form Nox Vesper’s visual signature. The mark pairs contrast, presence and movement with a neon coastal-city atmosphere. The original raven artwork remains untouched across the site and introduction.',
      contatoDescricao: 'Projects, partnerships or a conversation about technology. Send a note with a little context about what you are building.',
      habilidadesTitulo: 'FROM CONCEPT TO REALITY',
      habilidadesDescricao: 'Interfaces, systems and digital experiences built with attention to performance and usability.',
      frontendDescricao: 'Modern, responsive and accessible interfaces for every screen.',
      backendDescricao: 'Data structures, integrations and business rules for web applications.',
      criativoDescricao: 'Visual direction and motion shaped around each project’s identity.',
      interessesTitulo: 'WHAT SHAPES THE WORK',
      interessesDescricao: 'References and interests from everyday life that find their way into what I build.',
      interesseJiuJitsu: 'Jiu-jitsu',
      interesseTecnologia: 'Digital projects',
      interesseCinema: 'Games & cinema',
      interesseDesign: 'Art & design',
      processoDescricao: 'Clear steps, from idea to delivery.',
      rodapeDescricao: 'Full stack development focused on performance and design.',
      habilidadesTecnologias: 'JavaScript, React, TypeScript, Node.js, Python, Firebase, Tailwind CSS, GSAP, Three.js, Git',
      processoEtapas: 'Planning|Scope and solution definition;Development|Organized implementation;Testing|Review and final adjustments;Delivery|Preparing the release',
    },
  },
  projetos: [
    { id: 'sunset-stories', nome: 'Sunset Stories', categoria: 'web', descricao: 'Uma galeria autoral de Vice City, com navegação por cenas, acesso de usuários e gestão de conteúdo.', imagem: 'assets/sunset-real-project.jpg', url: 'https://vi-sunset-stories.epiccow8.chatgpt.site', tecnologias: 'JavaScript, Firebase, GSAP, Three.js', publicado: true },
    { id: 'brasa-burger', nome: 'Brasa Burger', categoria: 'commerce', descricao: 'Cardápio digital para explorar produtos, revisar o pedido e seguir para a finalização pelo WhatsApp.', imagem: 'assets/brasa-real-project.jpg', url: 'https://brasa-burger-lucas-demo.epiccow8.chatgpt.site', tecnologias: 'Web, Cardápio digital, WhatsApp', publicado: true },
  ],
  configuracoes: {
    email: 'lukas.enginer7@gmail.com',
    whatsapp: '869944913282',
    github: 'https://github.com/lukaszwx',
    linkedin: '',
    tituloSeo: 'Nox Vesper — Lucas Neves',
    descricaoSeo: 'Lucas Neves — desenvolvimento full stack, interfaces e experiências digitais.',
    imagemPerfil: 'assets/lucas-neves-profile.webp',
    imagemHero: 'assets/hero-raven-city.jpg',
    imagemHabilidades: 'assets/vice-city-backdrop.png',
    imagemJiuJitsu: 'assets/interest-jiujitsu-raven.webp',
    imagemTecnologia: 'assets/sunset-real-project.jpg',
    imagemCinema: 'assets/hero-raven-city.jpg',
    imagemDesign: 'assets/name-neves-beach.jpg',
  },
  midias: [],
};

export const camposDeTexto = [
  { grupo: 'Início', chave: 'heroRotulo', rotulo: 'Assinatura do Hero' },
  { grupo: 'Início', chave: 'heroDescricao', rotulo: 'Descrição principal' },
  { grupo: 'Projetos', chave: 'projetosDescricao', rotulo: 'Introdução dos projetos' },
  { grupo: 'Sobre', chave: 'sobreTitulo', rotulo: 'Título da apresentação' },
  { grupo: 'Sobre', chave: 'sobreBio', rotulo: 'Biografia' },
  { grupo: 'Sobre', chave: 'sobreComplemento', rotulo: 'Complemento da biografia' },
  { grupo: 'Identidade', chave: 'identidadeTitulo', rotulo: 'Título da marca' },
  { grupo: 'Identidade', chave: 'identidadeDescricao', rotulo: 'História da logo' },
  { grupo: 'Contato', chave: 'contatoDescricao', rotulo: 'Texto de contato' },
  { grupo: 'Habilidades', chave: 'habilidadesTitulo', rotulo: 'Título da seção' },
  { grupo: 'Habilidades', chave: 'habilidadesDescricao', rotulo: 'Introdução de habilidades' },
  { grupo: 'Habilidades', chave: 'frontendDescricao', rotulo: 'Descrição de frontend' },
  { grupo: 'Habilidades', chave: 'backendDescricao', rotulo: 'Descrição de backend' },
  { grupo: 'Habilidades', chave: 'criativoDescricao', rotulo: 'Descrição de desenvolvimento criativo' },
  { grupo: 'Habilidades', chave: 'habilidadesTecnologias', rotulo: 'Tecnologias (separadas por vírgula)' },
  { grupo: 'Interesses', chave: 'interessesTitulo', rotulo: 'Título da seção' },
  { grupo: 'Interesses', chave: 'interessesDescricao', rotulo: 'Introdução da seção' },
  { grupo: 'Interesses', chave: 'interesseJiuJitsu', rotulo: 'Título · Jiu-jitsu' },
  { grupo: 'Interesses', chave: 'interesseTecnologia', rotulo: 'Título · Tecnologia' },
  { grupo: 'Interesses', chave: 'interesseCinema', rotulo: 'Título · Cinema e jogos' },
  { grupo: 'Interesses', chave: 'interesseDesign', rotulo: 'Título · Design' },
  { grupo: 'Processo', chave: 'processoDescricao', rotulo: 'Introdução do processo' },
  { grupo: 'Processo', chave: 'processoEtapas', rotulo: 'Etapas no formato título|descrição; título|descrição' },
  { grupo: 'Rodapé', chave: 'rodapeDescricao', rotulo: 'Descrição do rodapé' },
] as const;
