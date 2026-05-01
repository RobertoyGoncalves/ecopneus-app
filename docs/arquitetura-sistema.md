# Arquitetura do Sistema EcoPneu

## Visão Geral

Sistema web de gestão de frota e veículos com foco em sustentabilidade e monitoramento de pneus.

## Diagramas de Sequência Detalhados

### 1. Fluxo Completo de Autenticação

```plantuml
@startuml
actor Usuário as Usuario
participant "Navegador" as Browser
participant "LoginPage" as Login
participant "AuthContext" as Auth
participant "LocalStorage" as LS
participant "ProtectedRoute" as Protected
participant "Layout" as Layout
participant "Dashboard" as Dashboard

== Tentativa de Acesso sem Login ==
Usuario -> Browser: Acessa "/"
Browser -> Protected: Renderiza ProtectedRoute
Protected -> Auth: isAuthenticated?
Auth --> Protected: false
Protected -> Browser: <Navigate to="/login" />
Browser -> Usuario: Exibe /login

== Processo de Login ==
Usuario -> Login: Digita email
Usuario -> Login: Digita senha
Usuario -> Login: Clica "Entrar"

Login -> Login: validateForm()

alt Formulário Válido
    Login -> Auth: login(email, password)
    Auth -> LS: getItem("ecopneu_users")
    LS --> Auth: JSON string de usuários
    Auth -> Auth: JSON.parse()
    Auth -> Auth: find(user => email && password match)
    
    alt Credenciais Corretas
        Auth -> Auth: setUser(foundUser)
        Auth -> LS: setItem("ecopneu_currentUser", user)
        Auth --> Login: return true
        Login -> Browser: navigate("/")
        Browser -> Protected: Renderiza ProtectedRoute
        Protected -> Auth: isAuthenticated?
        Auth --> Protected: true
        Protected -> Layout: Renderiza Layout
        Layout -> Dashboard: Renderiza Dashboard
        Dashboard --> Usuario: Exibe Dashboard
    else Credenciais Incorretas
        Auth --> Login: return false
        Login -> Login: setErrors({ login: true })
        Login --> Usuario: Exibe "Email ou senha incorretos"
    end
else Formulário Inválido
    Login -> Login: setErrors({ email/password: true })
    Login --> Usuario: Exibe erros de validação
end

@enduml
```

### 2. Fluxo de Registro de Usuário

```plantuml
@startuml
actor Usuário as Usuario
participant "RegisterPage" as Register
participant "AuthContext" as Auth
participant "LocalStorage" as LS
participant "Navegador" as Browser

Usuario -> Register: Acessa /cadastro
Usuario -> Register: Seleciona tipo (individual/empresa)

alt Tipo = Empresa
    Register --> Usuario: Exibe campos CNPJ e Razão Social
end

Usuario -> Register: Preenche formulário
Usuario -> Register: Clica "Criar conta"

Register -> Register: validateForm()

alt Validação OK
    Register -> Auth: register(userData)
    Auth -> LS: getItem("ecopneu_users")
    LS --> Auth: Array de usuários existentes
    
    Auth -> Auth: Verifica email duplicado
    
    alt Email único
        Auth -> Auth: users.push(newUser)
        Auth -> LS: setItem("ecopneu_users", users)
        Auth -> Auth: setUser(newUser)
        Auth -> LS: setItem("ecopneu_currentUser", user)
        Auth --> Register: Sucesso
        Register -> Browser: navigate("/")
        Browser --> Usuario: Redireciona para Dashboard
    else Email já existe
        Auth --> Register: Email duplicado
        Register --> Usuario: "Email já cadastrado"
    end
else Validação Falhou
    Register -> Register: setErrors()
    Register --> Usuario: Exibe mensagens de erro
end

@enduml
```

### 3. Fluxo de Gerenciamento de Veículos

```plantuml
@startuml
actor Usuário as Usuario
participant "VehiclesPage" as VehiclesPage
participant "React State" as State
participant "Formulário" as Form

== Visualização inicial ==
Usuario -> VehiclesPage: Acessa /vehicles
VehiclesPage -> State: Carrega vehicles[]
State --> VehiclesPage: Lista de veículos
VehiclesPage --> Usuario: Exibe tabela/cards

== Filtro ==
Usuario -> VehiclesPage: Seleciona filtro "Caminhão"
VehiclesPage -> VehiclesPage: setFilterType("Caminhão")
VehiclesPage -> VehiclesPage: getFilteredVehicles()
VehiclesPage --> Usuario: Exibe apenas caminhões

== Cadastro ==
Usuario -> Form: Preenche dados do veículo
Usuario -> Form: Clica "Cadastrar Veículo"

Form -> VehiclesPage: handleSubmit(e)
VehiclesPage -> VehiclesPage: validateForm()

alt Validação OK
    VehiclesPage -> State: setVehicles([newVehicle, ...vehicles])
    State --> VehiclesPage: Atualiza state
    VehiclesPage -> Form: Reset form
    VehiclesPage --> Usuario: Exibe veículo na lista
else Validação Falhou
    VehiclesPage -> VehiclesPage: setErrors()
    VehiclesPage --> Usuario: Exibe erros
end

== Remoção ==
Usuario -> VehiclesPage: Clica "Remover" em veículo
VehiclesPage -> VehiclesPage: handleRemove(id)
VehiclesPage -> State: vehicles.filter(v => v.id !== id)
State --> VehiclesPage: Atualiza lista
VehiclesPage --> Usuario: Remove veículo da tela

@enduml
```

### 4. Fluxo de Monitoramento de Pneus

```plantuml
@startuml
actor Usuário as Usuario
participant "TiresPage" as TiresPage
participant "React State" as State
participant "Tire Card" as Card

Usuario -> TiresPage: Acessa /tires
TiresPage -> State: Carrega tires[]
State --> TiresPage: Lista de pneus

loop Para cada pneu
    TiresPage -> TiresPage: getHealthStatus(tire.health)
    
    alt health >= 80
        TiresPage -> Card: Badge "Excelente" (verde)
    else health >= 50
        TiresPage -> Card: Badge "Atenção" (amarelo)
    else health < 50
        TiresPage -> Card: Badge "Crítico" (vermelho)
    end
    
    TiresPage -> Card: Barra de progresso (health%)
end

TiresPage --> Usuario: Exibe grid de cards

Usuario -> TiresPage: Clica "Novo Pneu"
TiresPage -> TiresPage: setShowForm(true)
TiresPage --> Usuario: Exibe formulário

Usuario -> TiresPage: Preenche dados
Usuario -> TiresPage: Clica "Adicionar Pneu"

TiresPage -> TiresPage: handleSubmit(e)
TiresPage -> State: setTires([...tires, newTire])
TiresPage -> TiresPage: setShowForm(false)
State --> Usuario: Exibe novo pneu no grid

@enduml
```

### 5. Fluxo de Registro de Viagem

```plantuml
@startuml
actor Usuário as Usuario
participant "TripsPage" as TripsPage
participant "React State" as State
participant "Calculadora" as Calculator

Usuario -> TripsPage: Acessa /trips
Usuario -> TripsPage: Preenche formulário de viagem

note over TripsPage
    Campos: veículo, tipo, distância,
    altitude, peso, valor, tipo de carga
end note

Usuario -> TripsPage: Clica "Registrar Viagem"

TripsPage -> TripsPage: handleSubmit(e)
TripsPage -> TripsPage: validateForm()

alt Validação OK
    TripsPage -> Calculator: calculateCost(distance, weight)
    Calculator --> TripsPage: valor calculado
    
    TripsPage -> TripsPage: newTrip = { ...formData, date: now() }
    TripsPage -> State: setTrips([newTrip, ...trips])
    
    State --> TripsPage: Atualiza lista
    
    alt Tela Desktop
        TripsPage --> Usuario: Exibe nova linha na tabela
    else Tela Mobile
        TripsPage --> Usuario: Exibe novo card
    end
    
    TripsPage -> TripsPage: Reset form
else Validação Falhou
    TripsPage -> TripsPage: setErrors()
    TripsPage --> Usuario: Exibe mensagens de erro
end

@enduml
```

### 6. Fluxo de Logout

```plantuml
@startuml
actor Usuário as Usuario
participant "Layout" as Layout
participant "AuthContext" as Auth
participant "LocalStorage" as LS
participant "Navegador" as Browser

Usuario -> Layout: Visualiza menu lateral
Layout --> Usuario: Exibe nome, email, botão "Sair"

Usuario -> Layout: Clica "Sair da Conta"

Layout -> Layout: handleLogout()
Layout -> Layout: closeMobileMenu() [se mobile]
Layout -> Auth: logout()

Auth -> Auth: console.log("🚪 Fazendo logout...")
Auth -> Auth: setUser(null)
Auth -> LS: removeItem("ecopneu_currentUser")
Auth -> Browser: navigate("/login")

Browser --> Usuario: Redireciona para /login

@enduml
```

## Estrutura de Pastas

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Componentes UI reutilizáveis
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── Layout.tsx       # Layout principal com menu
│   │   ├── ProtectedRoute.tsx  # Proteção de rotas
│   │   ├── Button.tsx       # Botão customizado
│   │   ├── Card.tsx         # Card customizado
│   │   └── Input.tsx        # Input customizado
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx    # Página principal
│   │   ├── Vehicles.tsx     # Gestão de veículos
│   │   ├── Tires.tsx        # Gestão de pneus
│   │   ├── Trips.tsx        # Gestão de viagens
│   │   ├── NewLogin.tsx     # Página de login
│   │   └── Register.tsx     # Página de registro
│   │
│   ├── App.tsx              # Componente raiz
│   └── routes.tsx           # Configuração de rotas
│
├── styles/
│   ├── theme.css            # Tema Tailwind
│   └── fonts.css            # Importação de fontes
│
└── docs/                    # Documentação
    ├── diagrama-casos-de-uso.md
    ├── diagrama-classes.md
    └── arquitetura-sistema.md
```

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19 | Framework UI |
| TypeScript | Latest | Tipagem estática |
| React Router | 7.13.0 | Roteamento |
| Tailwind CSS | 4.0 | Estilização |
| Recharts | 2.15.2 | Gráficos |
| Lucide React | Latest | Ícones |
| Vite | Latest | Build tool |

### Persistência
| Tecnologia | Uso |
|------------|-----|
| LocalStorage | Armazenamento de usuários e sessão |
| React State | Estado local dos componentes |
| React Context | Estado global (autenticação) |

## Decisões de Arquitetura

### 1. Por que React Context para autenticação?
- ✅ Estado global acessível em toda aplicação
- ✅ Evita prop drilling
- ✅ Performance adequada para este caso de uso
- ✅ Fácil integração com Protected Routes

### 2. Por que LocalStorage?
- ✅ Persistência simples sem necessidade de backend
- ✅ Dados disponíveis offline
- ✅ Adequado para protótipo/MVP
- ⚠️ Limitação: Não é seguro para produção (usar backend real)

### 3. Por que Protected Routes?
- ✅ Segurança de navegação
- ✅ Experiência do usuário melhorada
- ✅ Código mais organizado
- ✅ Reutilizável

### 4. Por que Tailwind CSS v4?
- ✅ Utility-first para desenvolvimento rápido
- ✅ Responsividade nativa
- ✅ Customização via CSS variables
- ✅ Performance otimizada

## Fluxo de Dados

```plantuml
@startuml
!define USER_COLOR #e3f2fd
!define CONTEXT_COLOR #fff3e0
!define PERSIST_COLOR #f3e5f5
!define DISPLAY_COLOR #e8f5e9

package "User Actions" {
    [Click/Input] as A USER_COLOR
}

package "Components" {
    [Event Handler] as B
    [State Update] as C
}

package "Context" {
    [AuthContext] as D CONTEXT_COLOR
}

package "Persistence" {
    [LocalStorage] as E PERSIST_COLOR
}

package "UI Update" {
    [Re-render] as F
    [Display] as G DISPLAY_COLOR
}

A --> B
B --> C
C --> D
D --> E
E --> D
D --> C
C --> F
F --> G

@enduml
```

## Performance e Otimizações

### Implementadas
- ✅ Lazy loading de rotas
- ✅ Memoização de cálculos (health status, badges)
- ✅ Componentes controlados para forms
- ✅ Keys únicas em listas
- ✅ CSS otimizado (Tailwind purge)

### Sugestões para Produção
- 🔄 Implementar React.memo em componentes pesados
- 🔄 Usar useMemo para filtros complexos
- 🔄 Implementar virtual scrolling para listas grandes
- 🔄 Code splitting por rota
- 🔄 Service Workers para cache

## Segurança

### Implementado
- ✅ Protected Routes
- ✅ Validação de formulários
- ✅ Sanitização de inputs
- ✅ Verificação de sessão

### Para Produção
- 🔒 Implementar backend com autenticação JWT
- 🔒 HTTPS obrigatório
- 🔒 Rate limiting em login
- 🔒 Criptografia de senhas (bcrypt)
- 🔒 CSRF protection
- 🔒 XSS protection
- 🔒 SQL injection prevention

## Escalabilidade

### Limitações Atuais
- LocalStorage limitado a ~5MB
- Sem paginação em listas
- Sem otimização de renderização em listas grandes

### Melhorias Futuras
- Migrar para backend REST/GraphQL
- Implementar banco de dados (PostgreSQL)
- Adicionar paginação
- Implementar busca server-side
- Cache com Redis
- CDN para assets

---

**Documentação gerada para o sistema EcoPneu v1.0**
