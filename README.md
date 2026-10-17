# Nox Vesper — portfólio e CMS

Repositório: `meu_portfolio`.

Frontend responsivo de Lucas Neves, com direção cinematográfica Vice City e a logo original do corvo preservada.

## Começar

1. Copie .env.example para .env.local e preencha os dados do seu Firebase.
2. Siga INSTRUCOES.md para ativar Firebase Authentication, Firestore, Storage e o usuário administrador.
3. Execute npm install e npm run dev.
4. Abra http://localhost:3000 para o site ou http://localhost:3000/admin para a administração.

## Estrutura

- app/: páginas Next.js, experiência The Awakening e administração.
- app/admin/: painel, dados iniciais, login Firebase e áreas do CMS.
- src/css e src/js: interface pública, animações e integração de conteúdo.
- public/assets: imagens aprovadas, projetos reais e a logo oficial.
- firestore.rules e storage.rules: autorização e proteção do conteúdo.
- scripts/build-public.mjs: sincroniza a configuração local com o pacote estático público durante o build.

## Contato

WhatsApp: +55 86 99449-13282  
E-mail: lukas.enginer7@gmail.com

O formulário abre o cliente de e-mail da pessoa com os dados da mensagem preenchidos. O envio direto pelo servidor e a caixa de mensagens exigem configurar um provedor de e-mail seguro.
