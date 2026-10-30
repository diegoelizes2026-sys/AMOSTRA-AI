# Mostra Aí — primeira base do produto

Projeto independente para a plataforma SaaS Mostra Aí. Esta entrega é uma primeira base navegável de interface, não uma aplicação SaaS pronta para produção.

## Executar localmente

Requer Node.js e conexão à internet para baixar o utilitário `serve` na primeira execução:

```bash
npm start
```

Abra http://localhost:3000.

Também é possível abrir `public/index.html` diretamente no navegador.

## O que esta versão contém

- Página inicial comercial do Mostra Aí.
- Painel administrativo com navegação entre visão geral, produtos, pedidos, clientes, CRM, criação de site com IA, relatórios e configurações.
- Cadastro local de produtos e filtro de busca para demonstração.
- Rascunho de criação de site por descrição, sem chamada real a modelo de IA.
- Layout responsivo.

## Ainda não conectado

- Supabase Auth e banco de dados multiempresa.
- Políticas RLS e isolamento de tenants.
- API real de IA (chave apenas no servidor).
- Upload persistente de imagens.
- Pagamentos/assinaturas, WhatsApp Business e publicação de sites.

Os números e registros visíveis na interface são dados demonstrativos, não dados reais de clientes. Não inserir dados pessoais ou comerciais reais nesta versão.

## Próximas fases

1. Definir projeto Supabase exclusivo e esquema multi-tenant.
2. Implementar autenticação, organizações, papéis e RLS.
3. Persistir catálogo, estoque, pedidos e CRM.
4. Implementar geração estruturada de sites com IA e editor seguro.
5. Integrar publicação, domínios e assinaturas.
6. Testes de segurança, isolamento e fluxos comerciais.

## Separação de projetos

Este repositório/pasta é exclusivo do Mostra Aí. Não contém arquivos de Coisas de Casa 49 nem de qualquer site de cliente.
