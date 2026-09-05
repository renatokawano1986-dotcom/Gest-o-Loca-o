# Condo+ (PropTech Operating System) - Master Specification & Agent Guidelines

> **Nota para o Agente Google Antigravity:** Este arquivo contém a especificação completa de requisitos, arquitetura, esquema de dados, rotas de API e integrações de IA do sistema Condo+. Use estas diretrizes para manter, otimizar e evoluir esta aplicação com total fidelidade funcional.

---

## 1. Visão Geral do Sistema
O **Condo+** é um sistema operacional imobiliário (PropTech OS) projetado para automatizar a esteira de locação sob a Lei do Inquilinato brasileira (Lei nº 8.245/1991), o Código Civil e a LGPD.

### Arquitetura Técnica
* **Full-Stack Integrado:** Express.js (Node.js) + Vite + React 18 + TypeScript.
* **Estilização:** Tailwind CSS (tema corporativo slate/indigo, responsivo desktop e mobile).
* **Porta:** 3000 (obrigatória para o container Cloud Run).
* **Camada de IA:** Google Gen AI SDK (`@google/genai`) no backend com modelos multimodais (`gemini-2.5-flash` / `gemini-2.5-pro`) com fallback seguro para emulação quando sem chave configurada.
* **Portais Multi-Persona:**
  * **Admin / Locador:** Painel de controle completo com KPIs, imóveis, contratos, cobrança e vistorias.
  * **Candidato (`?candidate=true`):** Portal de submissão documental com OCR, análise de viabilidade e suporte a cônjuge (renda conjunta).
  * **Inquilino (`?tenant=true`):** Portal de autoatendimento para 2ª via de faturas, PIX, contratos e manutenções.

---

## 2. Estrutura de Arquivos e Componentes
* `/server.ts`: Backend Express com todos os endpoints REST, cálculo de juros/mora e pipelines de IA.
* `/src/App.tsx`: Gerenciador central de abas, modos multi-persona, customizador de cores e sincronização de dados.
* `/src/types.ts`: Tipos e interfaces TypeScript para todas as entidades.
* `/src/components/Dashboard.tsx`: Painel de KPIs, listagem de imóveis, proprietários, links de candidatura e vistoria inteligente.
* `/src/components/CandidatePortal.tsx`: Portal externo do candidato com OCR de RG/CNH, suporte a cônjuge e cálculo de renda conjunta.
* `/src/components/TenantPortal.tsx`: Portal do inquilino para 2ª via de boleto/PIX e solicitações de reparo.
* `/src/components/ContractManagement.tsx`: Editor de minutas com tags dinâmicas, assinatura digital e integração Gov.br.
* `/src/components/FinancialModule.tsx`: Gestão financeira, cálculo de mora, despesas e repasses com conciliação.
* `/src/components/ChatCopilot.tsx`: Assistente conversacional jurídico e operacional.
* `/src/components/AILearningCenter.tsx`: Centro de treinamento e calibração de padrões da IA.
* `/src/components/OnboardingKyc.tsx`: Auditoria cadastral e verificação de crédito.
* `/src/components/InstallPwaModal.tsx`: Modal com instruções de instalação PWA no celular.
* `/src/components/LogoMais.tsx`: Logotipo vetorial padronizado da marca.

---

## 3. Catálogo de Endpoints REST (`server.ts`)

| Método | Endpoint | Função |
| :--- | :--- | :--- |
| `GET` | `/api/db` | Snapshot do banco relacional de dados em memória |
| `POST` | `/api/db/reset` | Reseta a base de dados para o estado inicial |
| `POST` | `/api/tenants` | Cria candidato com análise de renda conjunta e cônjuge |
| `POST` | `/api/tenants/:id/files` | Upload de documentos no vault do candidato |
| `DELETE` | `/api/tenants/:id/files/:fileId` | Exclusão de arquivo do vault |
| `DELETE` | `/api/tenants/:id` | Exclusão do cadastro de inquilino/candidato |
| `POST` | `/api/properties` | Cadastro e atualização de imóveis |
| `DELETE` | `/api/properties/:id` | Exclusão de imóvel |
| `POST` | `/api/proprietarios` | Cadastro de locador e coproprietários com PIX |
| `DELETE` | `/api/proprietarios/:id` | Exclusão de proprietário |
| `POST` | `/api/contracts` | Geração de contrato com amarração de IDs |
| `DELETE` | `/api/contracts/:id` | Exclusão de contrato |
| `POST` | `/api/contracts/:id/archive` | Arquivamento de contrato |
| `POST` | `/api/contracts/:id/sign` | Assinatura digital eletrônica com hash |
| `POST` | `/api/contracts/:id/sign-govbr` | Registro de assinatura via Gov.br (Prata/Ouro) |
| `POST` | `/api/contracts/:id/devolutiva` | Registro de contestação com mediação jurídica |
| `POST` | `/api/financial/calculate` | Cálculo de mora (1% a.m.), juros legais e multa |
| `POST` | `/api/financial/pay/:id` | Baixa de fatura e emissão de recibo de quitação |
| `DELETE` | `/api/financial/invoices/:id` | Cancelamento de fatura |
| `GET/POST`| `/api/financial/expenses` | Gestão de despesas do imóvel |
| `GET` | `/api/financial/repasses` | Lista histórico de repasses |
| `POST` | `/api/financial/repasses/trigger` | Executa repasse descontando taxa e despesas |
| `POST` | `/api/financial/repasses/simulate`| Simula valor líquido do repasse |
| `POST` | `/api/gemini/extract-id` | OCR multimodal de RG/CNH de titular e cônjuge |
| `POST` | `/api/gemini/analyze-income` | Análise de holerites, extratos e renda conjunta |
| `POST` | `/api/gemini/compare-inspections`| Vistoria inteligente comparativa de fotos |
| `POST` | `/api/gemini/summarize-contract`| Resumo executivo de contratos de locação |
| `POST` | `/api/gemini/chat` | Copiloto conversacional da Lei do Inquilinato |
| `POST` | `/api/notifications/send` | Disparo simulado de notificações WhatsApp/Email |
| `GET/POST`| `/api/ai-training-patterns` | Padrões de refinamento da IA |

---

## 4. Regras de Negócio e Cálculos Críticos
1. **Renda Conjunta do Casal (Cônjuge):**
   * Quando `estadoCivil === 'Casado(a)'`, a renda do titular e do cônjuge é somada.
   * Comprometimento máximo recomendado: **30% da renda líquida total** sobre o valor do aluguel.
   * `ratio = (valorAluguel / rendaConjunta) * 100`.
2. **Cálculo de Juros e Multa:**
   * Juros de 1% ao mês *pro-rata die* (Art. 406 do Código Civil).
   * Multa contratual entre 2% e 10% dependendo da cláusula pactuada.
3. **Repasse Líquido ao Locador:**
   * `Repasse = Aluguel Recebido - (Aluguel * TaxaAdm%) - Despesas Autorizadas`.
4. **Vistoria Entrada vs. Saída:**
   * Diferenciação obrigatória entre Desgaste Natural (Art. 22 Lei 8.245) e Dano/Mau Uso (Art. 23).
