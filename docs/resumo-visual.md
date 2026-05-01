# 📊 Resumo Visual - Sistema EcoPneu

## 🎯 Mapa do Sistema em 1 Minuto

```plantuml
@startmindmap
* EcoPneu
** Autenticação
*** Login
*** Registro
*** Logout
*** Proteção de Rotas
** Dashboard
*** Métricas
**** Vida Média Pneus
**** Total Veículos
**** Total Pneus
**** Total Viagens
*** Gráficos
**** Viagens Mensais
**** Custos
**** Saúde dos Pneus
*** Últimas Viagens
** Veículos
*** Listar
*** Cadastrar
*** Filtrar
*** Remover
*** Tipos
**** Caminhão
**** Carro
**** Moto
** Pneus
*** Listar
*** Cadastrar
*** Monitorar Saúde
*** Status
**** Excelente
**** Atenção
**** Crítico
** Viagens
*** Listar
*** Registrar
*** Filtrar
*** Calcular Custos
@endmindmap
```

## 🔄 Fluxo do Usuário

```plantuml
@startuml
title Jornada do Usuário no EcoPneu

|Acesso|
start
:Acessar site (★★★★★);
note right: Visitante
:Ver tela de login (★★★☆☆);
note right: Visitante
:Criar conta (★★★★☆);
note right: Visitante
:Fazer login (★★★★★);
note right: Usuário

|Uso Diário|
:Ver dashboard (★★★★★);
note right: Usuário
:Cadastrar veículo (★★★★☆);
note right: Usuário
:Registrar pneus (★★★★☆);
note right: Usuário
:Monitorar saúde (★★★★★);
note right: Usuário
:Registrar viagem (★★★★☆);
note right: Usuário

|Fim|
:Visualizar relatórios (★★★★★);
note right: Usuário
:Fazer logout (★★★★★);
note right: Usuário
stop

@enduml
```

## 📦 Entidades Principais

```plantuml
@startuml

entity USER {
    * fullName : string
    * email : string
    * password : string
    * userType : enum
    companyName : string
}

entity VEHICLE {
    * id : int
    * type : enum
    * brand : string
    * model : string
    * year : string
    * plate : string
}

entity TIRE {
    * id : int
    * model : string
    * brand : string
    * axis : enum
    * health : int
    * vehicle : string
}

entity TRIP {
    * id : int
    * vehicle : string
    * distance : int
    * altitude : int
    * weight : int
    * value : float
    * date : date
}

USER ||--o{ VEHICLE : possui
USER ||--o{ TIRE : gerencia
USER ||--o{ TRIP : registra
VEHICLE ||--o{ TIRE : tem
VEHICLE ||--o{ TRIP : realiza

@enduml
```

## 🏗️ Stack Tecnológico Visual

```plantuml
@startuml
!define REACT_COLOR #61dafb
!define TS_COLOR #3178c6
!define TAILWIND_COLOR #06b6d4
!define STORAGE_COLOR #ffd700

package "Frontend" {
    [React 19] as A REACT_COLOR
    [TypeScript] as B TS_COLOR
    [Tailwind CSS v4] as C TAILWIND_COLOR
    [React Router 7] as D
}

package "Componentes" {
    [Recharts] as E
    [Lucide Icons] as F
    [Shadcn/ui] as G
}

package "Estado" {
    [React Context] as H
    [React State] as I
}

package "Persistência" {
    [LocalStorage] as J STORAGE_COLOR
}

package "Build" {
    [Vite] as K
}

A --> H
A --> I
B --> A
C --> A
D --> A
E --> A
F --> A
G --> A
H --> J
I --> J
K --> A

@enduml
```

## 🎨 Paleta de Cores por Módulo

```plantuml
@startuml
rectangle "Autenticação" #e3f2fd {
    [Login/Register] as A1
}

rectangle "Dashboard" #f3e5f5 {
    [Métricas] as D1
    [Gráficos] as D2
}

rectangle "Veículos" #e8f5e9 {
    [CRUD Veículos] as V1
}

rectangle "Pneus" #fff3e0 {
    [Monitoramento] as P1
}

rectangle "Viagens" #fce4ec {
    [Registro] as T1
}

@enduml
```

## 📱 Responsividade Visual

```plantuml
@startuml
left to right direction

package "Mobile < 768px" #fce4ec {
    [Menu Hambúrguer] as M1
    [Cards Verticais] as M2
    [Stack Layout] as M3
}

package "Tablet 768-1024px" #fff3e0 {
    [Menu Lateral] as T1
    [Grid 2 Colunas] as T2
    [Tabelas Scrolláveis] as T3
}

package "Desktop > 1024px" #e8f5e9 {
    [Menu Fixo] as D1
    [Grid 4 Colunas] as D2
    [Tabelas Completas] as D3
}

M1 ..> T1 : Cresce
M2 ..> T2 : Cresce
M3 ..> T3 : Cresce
T1 ..> D1 : Cresce
T2 ..> D2 : Cresce
T3 ..> D3 : Cresce

@enduml
```

## 🔐 Fluxo de Autenticação Simplificado

```plantuml
@startuml
[*] --> NãoAutenticado

NãoAutenticado --> Login : Visita /login
NãoAutenticado --> Registro : Visita /cadastro

Login --> Validação : Envia credenciais
Registro --> Validação : Envia dados

Validação --> Autenticado : ✅ Sucesso
Validação --> Login : ❌ Erro
Validação --> Registro : ❌ Erro

Autenticado --> Dashboard : Redireciona
Autenticado --> Veículos : Navega
Autenticado --> Pneus : Navega
Autenticado --> Viagens : Navega

Autenticado --> Logout : Clica Sair
Logout --> NãoAutenticado : Limpa sessão

note right of Autenticado
    Estado salvo em
    LocalStorage
end note

@enduml
```

## 📊 Status de Saúde dos Pneus

```plantuml
@startuml
left to right direction

package "Vida Útil" {
    [100%] as A
    [80%] as B
    [50%] as C
    [0%] as D
}

package "Status Visual" {
    [🟢 Excelente] as E #4caf50
    [🟡 Atenção] as F #ff9800
    [🔴 Crítico] as G #f44336
}

A --> B
B --> C
C --> D

B ..> E
C ..> F
D ..> G

@enduml
```

## 🎯 Cobertura Funcional

```plantuml
@startuml
title Distribuição de Funcionalidades

salt
{#
. | **Módulo** | **Cobertura (%)** 
+ | Autenticação | 15%
+ | Dashboard | 20%
+ | Veículos | 20%
+ | Pneus | 25%
+ | Viagens | 20%
}
@enduml
```

## 📈 Métricas do Dashboard

```plantuml
@startuml
package "Cards de Métricas" {
    [Vida Média\ndos Pneus\n85.2%] as M1 #4caf50
    [Veículos\nCadastrados\n42] as M2 #2196f3
    [Pneus\nCadastrados\n148] as M3 #9c27b0
    [Viagens\nRegistradas\n1,247] as M4 #ff9800
}

package "Gráficos" {
    [Linha:\nViagens x Custos] as G1
    [Barra:\nSaúde Pneus] as G2
}

package "Tabela" {
    [Últimas\n5 Viagens] as T1
}

M1 --> G2
M2 --> T1
M3 --> G2
M4 --> G1

@enduml
```

## 🔄 Ciclo de Vida de um Veículo

```plantuml
@startuml
[*] --> Cadastrado : Usuário cadastra
Cadastrado --> ComPneus : Adiciona pneus
ComPneus --> EmViagem : Registra viagem
EmViagem --> ComPneus : Viagem concluída
ComPneus --> Manutenção : Pneu crítico
Manutenção --> ComPneus : Pneu trocado
ComPneus --> Removido : Usuário remove
Removido --> [*]

note right of Manutenção
    Vida útil < 50%
    Alerta automático
end note

@enduml
```

## 🎨 Hierarquia de Componentes

```plantuml
@startuml
!define APP_COLOR #61dafb
!define AUTH_COLOR #ffd700
!define PROTECTED_COLOR #ff6b6b
!define LAYOUT_COLOR #4ecdc4

[App.tsx] as App APP_COLOR
[BrowserRouter] as BR
[AuthProvider] as AP AUTH_COLOR
[AppRoutes] as Routes

package "Rotas Públicas" as Public {
    [Login]
    [Register]
}

package "Rotas Protegidas" as Protected {
    [ProtectedRoute] as PR PROTECTED_COLOR
}

[Layout] as Layout LAYOUT_COLOR

[Dashboard]
[Vehicles]
[Tires]
[Trips]

[Sidebar]
[Header Mobile] as Header
[User Menu + Logout] as UserMenu

[Metric Cards] as Metrics
[Recharts] as Charts
[Trips Table] as Table

App --> BR
BR --> AP
AP --> Routes

Routes --> Public
Routes --> Protected

Protected --> PR
PR --> Layout

Layout --> Dashboard
Layout --> Vehicles
Layout --> Tires
Layout --> Trips

Layout --> Sidebar
Layout --> Header
Layout --> UserMenu

Dashboard --> Metrics
Dashboard --> Charts
Dashboard --> Table

@enduml
```

## 🚀 Quick Stats

| Métrica | Valor |
|---------|-------|
| 📄 Páginas | 7 |
| 🧩 Componentes | 50+ |
| 🎯 Casos de Uso | 18 |
| 📦 Classes | 13 |
| 🔀 Rotas | 7 |
| 🎨 Temas | Tailwind CSS v4 |
| 📱 Responsivo | 100% |
| 🔒 Seguro | Protected Routes |
| ⚡ Performance | Otimizado |

---

**💡 Dica:** Para detalhes completos, consulte os outros documentos:
- 📋 [Casos de Uso Completos](./diagrama-casos-de-uso.md)
- 🏗️ [Diagrama de Classes](./diagrama-classes.md)
- 🏛️ [Arquitetura Detalhada](./arquitetura-sistema.md)
- 📚 [README Principal](./README.md)
