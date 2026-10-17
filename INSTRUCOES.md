# Nox Vesper — instalação e painel administrativo

## Requisitos

- Node.js 20 ou superior.
- Um projeto Firebase próprio com Authentication, Cloud Firestore e Storage ativados.
- O domínio local e o domínio publicado cadastrados em Authentication > Configurações > Domínios autorizados.

## Rodar no VS Code

1. Copie `.env.example` para `.env.local`.
2. No Firebase Console, crie um app Web e copie os seis valores de configuração para `.env.local`.
3. Em Authentication, habilite o provedor **E-mail/senha** e crie o usuário `lukas.enginer7@gmail.com` com uma senha forte.
4. Crie o banco Firestore e publique as regras do arquivo `firestore.rules`.
5. Copie o UID do usuário criado e adicione no Firestore o documento `administradores/SEU_UID`, com os campos `email: "lukas.enginer7@gmail.com"` e `ativo: true`. Faça isso pelo Console Firebase, pois o cliente não pode conceder acesso administrativo.
6. Ative Storage e publique as regras do arquivo `storage.rules`.
7. No terminal do VS Code, execute `npm install` e depois `npm run dev`.
8. Abra `http://localhost:3000/admin` para entrar e `http://localhost:3000` para visualizar o site.

O repositório não contém credenciais Firebase nem senha administrativa. `.env.local` é ignorado pelo Git. As chaves de configuração Web do Firebase são identificadores públicos; as regras do Firestore e Storage e o documento administrativo é que protegem os dados.

## Configuração local e validação do Firebase

O arquivo `.env.local` deve conter somente o e-mail administrativo e a configuração
do **app Web** do seu projeto. Os seis campos de `.env.example` correspondem a
`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`
do objeto `firebaseConfig` mostrado em Configurações do projeto > Seus apps.
Copie todos do mesmo app, sem inventar valores. Use o nome exato do bucket
(pode terminar em `.firebasestorage.app` ou `.appspot.com`), sem `gs://`.

Não coloque senha de login, JSON de conta de serviço, `private_key`, tokens ou
credenciais do Admin SDK em variáveis `NEXT_PUBLIC_*`: elas são incorporadas ao
JavaScript entregue ao navegador, inclusive quando estão em `.env.local`.
A chave Web do Firebase identifica o projeto; a autorização depende das regras.
Não envie seu `.env.local` para chats ou repositórios. `.env` e `.env.local`
estão no `.gitignore`; este diretório pode ter sido distribuído sem histórico Git.
Se ambos existirem, `.env.local` tem precedência. Reinicie o servidor após editar.

Validação no seu projeto (pendente até preencher os seis campos):

1. Em Authentication, habilite E-mail/senha, crie o usuário administrativo e
   autorize `localhost` para uso local. Digite a senha somente na tela de login.
2. Use o Firestore `(default)`. Pelo Console, crie `administradores/UID_DO_USUARIO`
   com `email` igual a `lukas.enginer7@gmail.com` e `ativo` booleano igual a `true`.
   O e-mail nas regras está fixo; mudar apenas `NEXT_PUBLIC_ADMIN_EMAIL` não muda
   a autorização no servidor.
3. Confira as regras ativas de Firestore e Storage contra os arquivos locais.
   Caso seja necessário aplicá-las, isso é uma alteração remota separada da
   publicação do site. Nenhuma regra é aplicada automaticamente por este projeto.
   Nas regras de Storage, autorize a integração com Firestore quando o Console
   solicitar, pois elas consultam `administradores` no banco `(default)`.
4. No PowerShell, use `npm.cmd ci`, `npm.cmd run typecheck` e `npm.cmd run build`.
   O build gera arquivos locais e prepara o leitor público do Firestore; não faz
   deploy. Depois execute `npm.cmd run dev` e abra `/admin`. Após mudar a
   configuração, refaça o build para atualizar também a configuração do site público.
5. Entre com o administrador e salve uma alteração de rascunho. Confira
   `site_editor/rascunho` no Console, sem usar o botão de publicar. Faça upload de
   uma imagem de teste para um projeto, sem substituir a logo, e confira o objeto
   em `midias/UID/...` no Storage e sua prévia. Essas ações gravam no seu Firebase;
   use conteúdo de teste e remova-o pelo Console quando terminar.
6. No simulador de regras, confira que um visitante não pode gravar conteúdo nem
   enviar arquivos, que uma conta sem registro administrativo não pode editar e
   que o administrador ativo pode salvar rascunhos e enviar imagens aceitas.
   Somente `site_editor/publicado` é legível publicamente no CMS; rascunhos devem
   continuar privados. As imagens de `midias` têm leitura pública intencionalmente.

Sem configuração e acesso ao projeto, a revisão do código não comprova que os
serviços estão habilitados, que as regras remotas coincidem com os arquivos ou
que login, leituras, gravações e uploads funcionam. Não é necessário publicar o
site para executar as verificações locais acima.

Referências: https://firebase.google.com/docs/projects/api-keys e
https://firebase.google.com/docs/storage/web/start.

## Conferência de deploy na Vercel

- Use o preset **Next.js**, a raiz deste repositório e o comando `npm run build`.
  Remova overrides antigos que apontem a saída para `public` ou a raiz do código;
  este projeto usa exportação estática para `out`.
- A introdução em `/` carrega o portfólio pela rota explícita `/portfolio`.
  A prévia administrativa usa a mesma rota. Se somente a introdução aparecer,
  teste `/portfolio?intro=off` diretamente no domínio publicado.
- Cadastre os seis valores Web do Firebase nas Environment Variables da Vercel
  para o ambiente desejado e gere um novo build. Os arquivos `.env` locais não
  são enviados ao GitHub. Nunca cadastre uma senha ou chave privada como
  `NEXT_PUBLIC_*`.
- Autorize o domínio usado no Firebase Authentication. Isso trata o login;
  um 404 do documento do portfólio deve ser investigado nas rotas do deploy.

## O que o painel administra

- textos de início, projetos, sobre, identidade da logo e contato em português e inglês;
- projetos, links, imagens, tecnologias, estado de publicação e lixeira recuperável;
- upload e endereços de imagens no Firebase Storage;
- título e descrição SEO;
- e-mail, WhatsApp e perfis sociais;
- prévia responsiva desktop, tablet e mobile;
- rascunhos com salvamento automático, publicação manual, histórico de até 20 versões e registro de publicação.

Para enviar mensagens para `mensagens` e vê-las na área administrativa, configure depois um endpoint protegido de e-mail (Cloud Functions ou serviço equivalente) que valide e limite envios. O formulário já abre o aplicativo de e-mail do visitante com destinatário, assunto, nome e mensagem preenchidos. Isso evita aceitar gravações públicas ou deixar uma chave privada de e-mail no navegador.

## WhatsApp e e-mail

O WhatsApp direciona para `+55 86 99449-13282`. O formulário e os links de e-mail direcionam para `lukas.enginer7@gmail.com`. O sistema de e-mail utilizado é o aplicativo configurado pelo visitante.

## Estrutura

- `app/admin/`: painel e autenticação.
- `app/admin/modelo.ts`: conteúdo inicial e tipos do CMS.
- `src/js/public-cms.ts`: sincronização pública das alterações publicadas.
- `scripts/build-public.mjs`: empacota a integração e lê `.env.local` antes da exportação.
- `firestore.rules` e `storage.rules`: autorização e validação dos arquivos.
- `public/assets/raven-original.png`: logo original preservada.
