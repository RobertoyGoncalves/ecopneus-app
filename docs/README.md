# 📚 Documentação Técnica - Sistema EcoPneu

## 🎯 Visão Geral

O **EcoPneu** é um sistema web de gestão de frota e veículos com foco em sustentabilidade, permitindo o controle completo de veículos, pneus e viagens, com monitoramento inteligente de saúde dos pneus e análise de custos.

---

## 📂 Documentos Disponíveis

### 1. [📋 Diagrama de Casos de Uso](./diagrama-casos-de-uso.md)
Visualize todos os casos de uso do sistema, incluindo:
- ✅ Autenticação (Login, Registro, Logout)
- ✅ Dashboard com métricas e gráficos
- ✅ Gestão de Veículos (CRUD completo)
- ✅ Gestão de Pneus com monitoramento de saúde
- ✅ Gestão de Viagens com cálculo de custos

**Contém:**
- Diagramas UML de casos de uso
- Descrição detalhada de cada caso
- Fluxos de processo (sequências)
- Regras de negócio

---

### 2. [🏗️ Diagrama de Classes](./diagrama-classes.md)
Entenda a estrutura completa do sistema:
- 📦 Classes de domínio (User, Vehicle, Tire, Trip)
- 🔧 Classes de contexto (AuthContext)
- 🎨 Classes de componentes (Pages, Layout)
- 🏷️ Enums e Types (UserType, VehicleType, etc.)

**Contém:**
- Diagrama UML de classes completo
- Estruturas de dados TypeScript
- Métodos principais por classe
- Relacionamentos entre entidades
- Padrões de projeto utilizados

---

### 3. [🏛️ Arquitetura do Sistema](./arquitetura-sistema.md)
Compreenda a arquitetura e fluxos do sistema:
- 🔄 Diagramas de sequência detalhados
- 📁 Estrutura de pastas
- 💻 Stack tecnológico
- ⚡ Performance e otimizações
- 🔒 Segurança e boas práticas

**Contém:**
- 6 diagramas de sequência principais
- Estrutura completa de pastas
- Tecnologias utilizadas
- Decisões de arquitetura
- Fluxo de dados
- Recomendações de produção

---

## 🚀 Principais Funcionalidades

### 🔐 Autenticação
- [x] Login com email e senha
- [x] Registro de usuário (Pessoa Física ou Empresa)
- [x] Logout com limpeza de sessão
- [x] Proteção de rotas privadas
- [x] Persistência de sessão (LocalStorage)

### 📊 Dashboard
- [x] Métricas em tempo real (vida média dos pneus, total de veículos, etc.)
- [x] Gráficos de viagens e custos mensais
- [x] Gráfico de saúde dos pneus
- [x] Tabela de últimas viagens
- [x] Layout responsivo (Desktop/Mobile)

### 🚗 Gestão de Veículos
- [x] Listar todos os veículos
- [x] Cadastrar novo veículo (Caminhão, Carro, Moto)
- [x] Filtrar por tipo de veículo
- [x] Remover veículo
- [x] Visualização em tabela (Desktop) e cards (Mobile)

### 🛞 Gestão de Pneus
- [x] Listar todos os pneus
- [x] Cadastrar novo pneu vinculado a veículo
- [x] Monitorar vida útil (0-100%)
- [x] Status automático (Excelente, Atenção, Crítico)
- [x] Filtrar por tipo de veículo
- [x] Visualização em grid de cards

### 🗺️ Gestão de Viagens
- [x] Listar todas as viagens
- [x] Registrar nova viagem com dados completos
- [x] Calcular custo por distância
- [x] Filtrar por tipo de veículo
- [x] Visualização em tabela (Desktop) e cards (Mobile)

---

## 🎨 Tecnologias Principais

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Frontend** | React | 19 |
| **Linguagem** | TypeScript | Latest |
| **Roteamento** | React Router | 7.13.0 |
| **Estilização** | Tailwind CSS | 4.0 |
| **Gráficos** | Recharts | 2.15.2 |
| **Ícones** | Lucide React | Latest |
| **Build** | Vite | Latest |
| **Persistência** | LocalStorage API | Native |

---

## 📐 Diagramas Disponíveis

### Diagrama de Casos de Uso
```
Visualize interações entre usuários e sistema
├── Autenticação (3 casos de uso)
├── Dashboard (3 casos de uso)
├── Veículos (4 casos de uso)
├── Pneus (4 casos de uso)
└── Viagens (4 casos de uso)
```

### Diagrama de Classes
```
Estrutura completa do sistema
├── Classes de Domínio (5 classes)
├── Classes de Contexto (1 classe)
├── Classes de Componentes (7 classes)
└── Enums/Types (6 enumerações)
```

### Diagramas de Sequência
```
Fluxos detalhados do sistema
├── 1. Autenticação Completa
├── 2. Registro de Usuário
├── 3. Gerenciamento de Veículos
├── 4. Monitoramento de Pneus
├── 5. Registro de Viagem
└── 6. Logout
```

---

## 🏗️ Padrões de Projeto

### Implementados
- ✅ **Context Pattern** - Gerenciamento de autenticação global
- ✅ **Protected Route Pattern** - Proteção de rotas privadas
- ✅ **Composition Pattern** - Composição de componentes
- ✅ **State Management Pattern** - Gerenciamento local de estado
- ✅ **Repository Pattern** - Abstração de persistência

### Arquitetura em Camadas
```
┌─────────────────────────────────┐
│  Camada de Apresentação         │ ← Pages/Componentes
├─────────────────────────────────┤
│  Camada de Componentes          │ ← UI Components
├─────────────────────────────────┤
│  Camada de Lógica de Negócio    │ ← Contexts/Validation
├─────────────────────────────────┤
│  Camada de Persistência         │ ← LocalStorage/State
└─────────────────────────────────┘
```

---

## 📊 Estatísticas do Sistema

### Módulos
- 🔐 **1** módulo de autenticação
- 📊 **1** módulo de dashboard
- 🚗 **1** módulo de veículos
- 🛞 **1** módulo de pneus
- 🗺️ **1** módulo de viagens

### Componentes
- **7** páginas principais
- **3** componentes customizados
- **40+** componentes UI (shadcn/ui)
- **1** contexto global (AuthContext)

### Rotas
- **2** rotas públicas (/login, /cadastro)
- **5** rotas protegidas (/, /vehicles, /tires, /trips)

### Tipos de Dados
- **5** interfaces principais
- **6** enumerações
- **3** tipos customizados

---

## 🔒 Segurança

### Implementado
- ✅ Proteção de rotas privadas
- ✅ Validação de formulários no frontend
- ✅ Sanitização de inputs
- ✅ Verificação de sessão ativa

### Recomendações para Produção
- 🔒 Backend com autenticação JWT
- 🔒 HTTPS obrigatório
- 🔒 Criptografia de senhas (bcrypt)
- 🔒 Rate limiting em endpoints críticos
- 🔒 CSRF/XSS protection

---

## 📱 Responsividade

O sistema é **100% responsivo** e funciona perfeitamente em:

| Dispositivo | Breakpoint | Layout |
|-------------|------------|--------|
| 📱 Mobile | < 768px | Menu hambúrguer, cards verticais |
| 📱 Tablet | 768px - 1024px | Layout híbrido |
| 💻 Desktop | > 1024px | Menu lateral fixo, tabelas |

---

## 🎯 Casos de Uso Principais

### UC1 - Fazer Login
**Ator:** Usuário Não Autenticado  
**Fluxo:**
1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema valida credenciais
4. Se válido: redireciona para dashboard
5. Se inválido: exibe mensagem de erro

### UC8 - Cadastrar Veículo
**Ator:** Usuário Autenticado  
**Fluxo:**
1. Usuário acessa `/vehicles`
2. Preenche formulário (tipo, marca, modelo, ano, placa)
3. Clica em "Cadastrar Veículo"
4. Sistema valida dados
5. Veículo é adicionado à lista

### UC14 - Visualizar Saúde do Pneu
**Ator:** Usuário Autenticado  
**Fluxo:**
1. Usuário acessa `/tires`
2. Sistema exibe cards de pneus
3. Cada card mostra:
   - Vida útil em %
   - Barra de progresso colorida
   - Badge de status (Excelente/Atenção/Crítico)

---

## 📈 Evolução Futura

### Curto Prazo (1-3 meses)
- [ ] Implementar backend REST API
- [ ] Migrar para banco de dados (PostgreSQL)
- [ ] Adicionar autenticação JWT
- [ ] Implementar testes unitários

### Médio Prazo (3-6 meses)
- [ ] Dashboard avançado com mais métricas
- [ ] Relatórios em PDF
- [ ] Notificações de pneus críticos
- [ ] Integração com APIs externas

### Longo Prazo (6-12 meses)
- [ ] App mobile (React Native)
- [ ] IA para predição de manutenção
- [ ] Sistema de alertas em tempo real
- [ ] Multi-tenancy

---

## 📞 Suporte

Para dúvidas sobre a documentação ou arquitetura:
- 📧 Email: dev@ecopneu.com
- 📝 Issues: GitHub Issues
- 💬 Chat: Discord Server

---

## 📝 Como Usar Esta Documentação

1. **Começe pelo [Diagrama de Casos de Uso](./diagrama-casos-de-uso.md)** para entender as funcionalidades
2. **Explore o [Diagrama de Classes](./diagrama-classes.md)** para entender a estrutura de código
3. **Leia a [Arquitetura do Sistema](./arquitetura-sistema.md)** para entender os fluxos e decisões técnicas

---

**Desenvolvido com ❤️ usando React, TypeScript e Tailwind CSS**

*Última atualização: 2026*
