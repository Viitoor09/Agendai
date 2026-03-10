# 📅 Agendai

O **Agendai** é um ecossistema de agendamento e gestão financeira desenvolvido para prestadores de serviços, com foco inicial em barbearias. O sistema funciona como um **PWA (Progressive Web App)**, permitindo que o profissional gerencie sua agenda e finanças diretamente pelo celular ou computador como se fosse um aplicativo nativo.

---

## 🚀 Funcionalidades Principais

* **PWA Instalável:** Graças ao `manifest.json` e Service Workers, o app pode ser instalado na tela inicial do celular.
* **Agendamento Dinâmico:** Sistema de reserva de horários que identifica o profissional através de parâmetros na URL (ex: `?b=vitor123`).
* **Gestão Financeira com Dashboards:** * Monitoramento de meta diária de faturamento (Ex: R$ 200,00).
    * Gráficos interativos de serviços prestados e faturamento semanal usando **Chart.js**.
    * Controle de despesas e cálculo de lucro líquido.
* **Ranking de Clientes:** Inteligência de dados para identificar os clientes mais fiéis e gerar estratégias de fidelização.
* **Multi-usuário:** Sistema de cadastro e login para diferentes barbeiros gerenciarem seus próprios perfis.

---

## 🛠️ Stack Técnica

* **Frontend:** HTML5, CSS3 (Design Mobile-First com tema Dark/Gold) e JavaScript Vanilla (manipulação de DOM e lógica de SPA).
* **Backend & Banco de Dados:** * **Firebase Firestore:** Persistência de dados em tempo real para agendamentos e configurações.
    * **Firebase Auth:** Autenticação segura de usuários.
    * **Firebase Hosting:** Hospedagem de alta performance.
* **Visualização de Dados:** Chart.js para geração de relatórios gráficos.
* **Integrações:** API do WhatsApp para comunicação direta com clientes.

---

## 📂 Estrutura do Projeto

* `index.html`: Estrutura principal e containers de visualização.
* `script.js`: Toda a lógica de integração com Firebase, cálculos financeiros e manipulação de interface.
* `style.css`: Estilização personalizada com foco em UX móvel.
* `manifest.json`: Configurações de instalação do Web App.

---

## 📈 Objetivo

Este projeto demonstra a aplicação prática de conceitos de **Análise e Desenvolvimento de Sistemas**, como modelagem de dados NoSQL, integração de APIs de terceiros, segurança em autenticação e desenvolvimento de interfaces responsivas.