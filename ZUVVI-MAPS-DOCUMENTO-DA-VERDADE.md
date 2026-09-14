# ZUVVI MAPS — DOCUMENTO DA VERDADE

**Projeto:** Zuvvi Maps  
**Finalidade:** plataforma própria de mapas, busca, rotas e navegação  
**Início do processo controlado:** 14/09/2026  
**Baseline da `main`:** `4b85fca8e611aa35e8def8bbf4111c84235ddd85`  
**Repositório:** `zuvvimaps-create/zuvvi-maps-core`  
**Supabase:** `ZUVVI-MAPS` — `ovdoxwalfawrmlfaegrc`  
**Status:** FUNDAÇÃO / PROTÓTIPO VISUAL

## 1. Trava máxima de identidade

Este documento pertence exclusivamente ao **Zuvvi Maps**.

- O Zuvvi Maps é um produto novo, construído do zero.
- Ele não é o Zuvvi Mobilidade/Oficial, não é uma branch dele e não utiliza o banco dele.
- É proibido copiar migrations, credenciais, tabelas, dados, Auth ou regras do Zuvvi Mobilidade para este projeto.
- Repositório, banco, branches, commits, PRs, deploys, ambientes, segredos e documentação devem permanecer separados.
- Antes de cada alteração, confirmar os identificadores deste cabeçalho. Divergência significa **ABORTAR SEM ALTERAR**.

## 2. Visão do produto

O Zuvvi Maps será uma aplicação premium, mobile-first e instalável, com experiência inspirada na clareza de produtos como Google Maps, sem copiar marca, código ou ativos proprietários.

Objetivo funcional:

- mapa em tela cheia;
- localização atual;
- busca de endereços, estabelecimentos e pontos de interesse;
- detalhes dos lugares;
- lugares salvos e histórico;
- cálculo e comparação de rotas;
- navegação passo a passo;
- trânsito e incidentes em fases posteriores;
- contribuições e correções da comunidade;
- painel administrativo e operação da plataforma;
- APIs que futuramente possam atender outros produtos Zuvvi por integração formal e documentada.

## 3. Decisão de cadastro e login

O mapa básico e a busca pública devem funcionar **sem exigir login**.

Cadastro/login será exigido para recursos pessoais ou de confiança:

- sincronizar Casa, Trabalho e favoritos;
- manter histórico entre dispositivos;
- criar listas e preferências;
- contribuir com lugares, fotos, avaliações, incidentes e correções;
- usar recursos administrativos ou empresariais;
- gerenciar privacidade, exportação e exclusão da conta.

Modelo inicial:

- visitante: mapa, busca, detalhes e rotas básicas;
- usuário autenticado: recursos pessoais sincronizados;
- colaborador: contribuições sujeitas a moderação;
- empresa: gestão de locais reivindicados;
- moderador/admin: validação e operação.

Autorização nunca usará `user_metadata`. Papéis de segurança serão armazenados em dados controlados pelo servidor e reforçados por RLS.

## 4. Estado comprovado do baseline

### Repositório

- Aplicação React 19 + TanStack Start/Router + TypeScript.
- MapLibre GL como motor de renderização.
- Interface premium com mapa, busca, pins, painel de local, rotas, navegação, favoritos e perfil demonstrativos.
- Providers desacoplados com implementações `demo` e contratos REST.
- Build de produção: **APROVADO**.
- TypeScript `tsc --noEmit`: **APROVADO**.
- Lint: **REPROVADO** — 28 erros e 11 avisos.
- Bundle do MapLibre acima de 1 MB antes de gzip; otimização futura necessária.

### Banco

- Projeto Supabase ativo e saudável, Postgres 17, região `sa-east-1`.
- Tabelas públicas: nenhuma.
- Migrations: nenhuma.
- Advisors de segurança e desempenho: sem alertas, pois o banco ainda está vazio.
- Auth ainda não integrado ao código.

### Simulações e dependências temporárias

- Lugares, busca, rotas, motoristas, viagens e administração usam providers de demonstração.
- Centro e dados demonstrativos atuais estão em Lisboa.
- Estilos de mapa atuais usam CARTO.
- Imagem de satélite atual usa ArcGIS.
- Portanto, a interface existe, mas o serviço cartográfico próprio ainda não existe.

## 5. Princípio de independência cartográfica

O objetivo final é reduzir dependência operacional de provedores cartográficos de terceiros.

Arquitetura-alvo:

- dados geográficos sob controle do projeto;
- PostGIS para dados próprios e operacionais;
- pipeline de importação e atualização cartográfica;
- tiles vetoriais hospedados pelo Zuvvi Maps;
- estilo visual e sprites próprios;
- geocodificação hospedada pelo projeto;
- roteamento hospedado pelo projeto;
- APIs próprias com cache, limites e observabilidade;
- MapLibre mantido como biblioteca aberta de renderização no aplicativo.

Dados abertos de terceiros só poderão ser usados com licença compatível, atribuição e registro de origem. “Infraestrutura própria” não elimina obrigações de licenciamento dos dados de origem.

## 6. Processo obrigatório por microetapa

1. Confirmar projeto, repositório, branch, SHA, Supabase ref e ambiente.
2. Auditar antes de alterar.
3. Criar branch exclusiva a partir da `main` confirmada.
4. Declarar objetivo, arquivos/tabelas permitidos e escopo proibido.
5. Implementar somente uma microetapa.
6. Auditar todo o diff.
7. Rodar build, TypeScript, lint e testes aplicáveis.
8. Testar manualmente o comportamento.
9. Produzir contra-prova.
10. Criar commit único e abrir PR.
11. Não fazer merge antes da aprovação explícita do proprietário.
12. Revalidar a `main` antes do merge.
13. Fazer merge controlado.
14. Confirmar SHA final e executar smoke test.
15. Depois de cada merge, entregar ao proprietário um roteiro simples e completo informando: onde abrir, o que clicar/fazer, quais dados usar quando aplicável e qual resultado deve aparecer.
16. O proprietário executa ou acompanha o teste pós-merge e informa o resultado.
17. Atualizar este documento/logbook e somente então fechar a etapa.

### Regra obrigatória de orientação pós-merge

Nenhum merge será comunicado apenas com informações técnicas. A comunicação de fechamento deve sempre conter:

- link exato do ambiente ou tela a abrir;
- passo a passo do teste em linguagem simples;
- resultado esperado em cada passo;
- aviso claro quando a mudança for somente documental e não produzir alteração visual;
- identificação da branch, commit, PR e SHA final da `main`;
- pendências ou limitações que ainda não fazem parte da etapa;
- solicitação de confirmação do proprietário após o teste.

Se o ambiente publicado ainda não estiver disponível ou atualizado, isso deverá ser informado explicitamente; nunca declarar que o teste visual está pronto sem contraprova do deploy.

É proibido reescrever histórico publicado, fazer force push, rebase destrutivo ou amend de commits já enviados, pois o repositório está sincronizado ao Lovable.

## 7. Plano mestre

### ZVM-BASE-00 — Documento da Verdade

Status: **FECHADA após o merge autorizado do PR #1 e a contraprova na `main`**

- Registrar identidade, baseline, visão, decisões e travas.
- Alteração documental apenas.
- Nenhuma alteração no banco ou aplicação.

### ZVM-BASE-01 — Qualidade e CI

Status: **FECHADA após o merge autorizado do PR #2 e a contraprova na `main`**

- Branch: `chore/zvm-base-01-quality-ci`.
- PR: `#2`.
- Baseline: 28 erros e 11 avisos de lint.
- Resultado: lint sem erros e sem avisos.
- TypeScript: aprovado com `tsc --noEmit`.
- Testes automatizados: 7 aprovados, cobrindo formatação, cálculos geográficos e seleção de providers.
- Build de produção: aprovado.
- Smoke test HTTP local: aprovado com resposta `200`.
- CI: validação automática de lint, tipos, testes e build em PRs e pushes na `main`.
- Alteração visual intencional: nenhuma.
- Banco/Supabase: nenhuma alteração.
- Pendência conhecida mantida fora desta microetapa: otimização do bundle do MapLibre.
- Contraprova visual pós-merge no Android: **REPROVADA**. A interface, os 11 lugares e a busca carregaram, mas a cartografia e os pins permaneceram invisíveis sobre uma área preta.

- Corrigir lint em microetapa isolada.
- Adicionar CI obrigatório para build, TypeScript e lint.
- Criar testes mínimos do shell, serviços e configurações.
- Não modificar experiência visual durante a limpeza.

### ZVM-MAP-FIX-01 — Cartografia móvel

Status: **EM EXECUÇÃO**

- Branch: `fix/zvm-map-fix-01-mobile-cartography`.
- Evidência: quatro capturas fornecidas pelo proprietário após o PR #2.
- Diagnóstico reproduzido: o estilo JSON da CARTO respondeu, mas seu endpoint de TileJSON vetorial expirou; somente o fundo preto foi renderizado.
- Substituir o padrão temporário por tiles raster diretos, sem dependência de TileJSON, sprites ou fontes externas.
- Preservar a configuração para a futura infraestrutura cartográfica própria.
- Exibir mensagem e ação de nova tentativa quando a cartografia não carregar.
- Confirmar ruas, pins, busca e movimentação do mapa em novo teste no Android.

### ZVM-AUTH-01 — Fundação de Auth

- Integrar Supabase com chave publicável no cliente.
- Cadastro por e-mail, confirmação, login, recuperação, logout e sessão.
- Criar tabela de perfis com RLS e trigger seguro.
- Manter mapa e rotas básicas públicas.
- Proteger áreas pessoais, empresariais, colaborativas e administrativas.
- Testar usuário A contra dados do usuário B e acessos anônimos.

### ZVM-DATA-01 — Modelo geográfico inicial

- Habilitar PostGIS após validação de versão/extensão.
- Modelar perfis, lugares salvos, histórico e preferências.
- Modelar lugares, categorias, fontes, versões e moderação.
- Registrar licença, procedência e data de atualização de cada fonte.

### ZVM-MAP-01 — Cartografia própria inicial

- Definir território piloto no Brasil.
- Construir pipeline de dados e tiles vetoriais.
- Criar estilo Zuvvi Maps claro/escuro.
- Substituir CARTO no ambiente de teste.
- Satélite fica desabilitado até existir fonte licenciada e sustentável.

### ZVM-SEARCH-01 — Busca própria

- Importar índice do território piloto.
- Autocomplete, endereço e pontos de interesse.
- Ranking, normalização brasileira e cache.
- Testes de qualidade com lista fixa de endereços reais.

### ZVM-ROUTE-01 — Rotas próprias

- Grafo viário do território piloto.
- Perfis carro, moto, bicicleta e caminhada conforme cobertura.
- Alternativas, instruções e recálculo.
- Testes contra rotas conhecidas e restrições de via.

### ZVM-ACCOUNT-01 — Conta e sincronização

- Casa, Trabalho, favoritos, listas, histórico e preferências.
- Privacidade, consentimento, exportação e exclusão.

### ZVM-CONTRIB-01 — Comunidade e empresas

- Sugestão de local/correção.
- Avaliação, foto, incidente e moderação.
- Reivindicação de estabelecimento com verificação.

### ZVM-NAV-01 — Navegação

- HUD real, instruções, progresso, recálculo e voz.
- Teste seguro em campo e comportamento offline.

### ZVM-OPS-01 — Administração e produção

- Painel de moderação, fontes, importações e incidentes.
- Observabilidade, rate limits, backups e rollback.
- Piloto territorial antes de expansão.

## 8. Critério de “funcional”

Uma tela bonita ou provider de demonstração não será registrado como funcional.

Só será considerado funcional o recurso que possuir:

- fonte de dados real;
- regras de segurança;
- tratamento de erro e estado vazio;
- teste automático aplicável;
- teste manual aprovado;
- contra-prova;
- commit, PR e merge confirmados;
- smoke test no ambiente publicado.

## 9. Próxima microetapa depois deste documento

Após aprovação e merge da `ZVM-BASE-00`, executar `ZVM-BASE-01`. A implementação de Auth começará somente depois que o baseline de qualidade e CI estiver confiável.
