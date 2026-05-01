# Diagrama de Casos de Uso - Sistema EcoPneu

## Diagrama Principal

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuário Não\nAutenticado" as Usuario
actor "Usuário\nAutenticado" as UsuarioAutenticado

rectangle "Sistema EcoPneu" {
  package "Autenticação" #e3f2fd {
    usecase UC1 as "Fazer Login"
    usecase UC2 as "Criar Conta"
    usecase UC3 as "Fazer Logout"
  }
  
  package "Dashboard" #f3e5f5 {
    usecase UC4 as "Visualizar Dashboard"
    usecase UC5 as "Visualizar Métricas"
    usecase UC6 as "Visualizar Gráficos"
  }
  
  package "Veículos" #e8f5e9 {
    usecase UC7 as "Listar Veículos"
    usecase UC8 as "Cadastrar Veículo"
    usecase UC9 as "Filtrar Veículos"
    usecase UC10 as "Remover Veículo"
  }
  
  package "Pneus" #fff3e0 {
    usecase UC11 as "Listar Pneus"
    usecase UC12 as "Cadastrar Pneu"
    usecase UC13 as "Filtrar Pneus"
    usecase UC14 as "Visualizar Saúde\ndo Pneu"
  }
  
  package "Viagens" #fce4ec {
    usecase UC15 as "Listar Viagens"
    usecase UC16 as "Registrar Viagem"
    usecase UC17 as "Filtrar Viagens"
    usecase UC18 as "Visualizar Detalhes\nda Viagem"
  }
}

' Relacionamentos - Autenticação
Usuario --> UC1
Usuario --> UC2
UsuarioAutenticado --> UC3

' Relacionamentos - Dashboard
UsuarioAutenticado --> UC4
UC4 ..> UC5 : <<include>>
UC4 ..> UC6 : <<include>>

' Relacionamentos - Veículos
UsuarioAutenticado --> UC7
UsuarioAutenticado --> UC8
UsuarioAutenticado --> UC9
UsuarioAutenticado --> UC10

' Relacionamentos - Pneus
UsuarioAutenticado --> UC11
UsuarioAutenticado --> UC12
UsuarioAutenticado --> UC13
UsuarioAutenticado --> UC14

' Relacionamentos - Viagens
UsuarioAutenticado --> UC15
UsuarioAutenticado --> UC16
UsuarioAutenticado --> UC17
UsuarioAutenticado --> UC18

@enduml
```

## Descrição dos Casos de Uso

### 📋 Módulo de Autenticação

| Caso de Uso | Ator | Descrição |
|-------------|------|-----------|
| **UC1 - Fazer Login** | Usuário Não Autenticado | Permite que o usuário acesse o sistema com email e senha |
| **UC2 - Criar Conta** | Usuário Não Autenticado | Permite cadastro de novo usuário (pessoa física ou empresa) |
| **UC3 - Fazer Logout** | Usuário Autenticado | Permite que o usuário saia do sistema |

### 📊 Módulo Dashboard

| Caso de Uso | Ator | Descrição |
|-------------|------|-----------|
| **UC4 - Visualizar Dashboard** | Usuário Autenticado | Exibe visão geral do sistema |
| **UC5 - Visualizar Métricas** | Sistema | Exibe cards com vida média dos pneus, veículos, etc. |
| **UC6 - Visualizar Gráficos** | Sistema | Exibe gráficos de viagens, custos e saúde dos pneus |

### 🚗 Módulo Veículos

| Caso de Uso | Ator | Descrição |
|-------------|------|-----------|
| **UC7 - Listar Veículos** | Usuário Autenticado | Exibe todos os veículos cadastrados |
| **UC8 - Cadastrar Veículo** | Usuário Autenticado | Adiciona novo veículo (caminhão, carro, moto) |
| **UC9 - Filtrar Veículos** | Usuário Autenticado | Filtra veículos por tipo |
| **UC10 - Remover Veículo** | Usuário Autenticado | Remove veículo da lista |

### 🛞 Módulo Pneus

| Caso de Uso | Ator | Descrição |
|-------------|------|-----------|
| **UC11 - Listar Pneus** | Usuário Autenticado | Exibe todos os pneus cadastrados |
| **UC12 - Cadastrar Pneu** | Usuário Autenticado | Adiciona novo pneu vinculado a um veículo |
| **UC13 - Filtrar Pneus** | Usuário Autenticado | Filtra pneus por tipo de veículo |
| **UC14 - Visualizar Saúde do Pneu** | Usuário Autenticado | Visualiza vida útil e status do pneu |

### 🗺️ Módulo Viagens

| Caso de Uso | Ator | Descrição |
|-------------|------|-----------|
| **UC15 - Listar Viagens** | Usuário Autenticado | Exibe todas as viagens registradas |
| **UC16 - Registrar Viagem** | Usuário Autenticado | Registra nova viagem com dados de distância, peso, etc. |
| **UC17 - Filtrar Viagens** | Usuário Autenticado | Filtra viagens por tipo de veículo |
| **UC18 - Visualizar Detalhes da Viagem** | Usuário Autenticado | Exibe informações detalhadas da viagem |

## Fluxos Principais

### 🔐 Fluxo de Autenticação

```plantuml
@startuml
actor Usuário as U
participant "Login Page" as L
participant "AuthContext" as A
participant "LocalStorage" as LS
participant "Dashboard" as D

U -> L: Acessa /login
U -> L: Digita email e senha
U -> L: Clica "Entrar"
L -> A: login(email, password)
A -> LS: Busca usuários registrados
LS --> A: Lista de usuários
A -> A: Valida credenciais

alt Credenciais válidas
    A -> LS: Salva currentUser
    A --> L: Success (true)
    L -> D: Redireciona para /
else Credenciais inválidas
    A --> L: Error (false)
    L -> U: Exibe mensagem de erro
end

@enduml
```

### 🚗 Fluxo de Cadastro de Veículo

```plantuml
@startuml
actor Usuário as U
participant "Vehicles Page" as V
participant "State" as S

U -> V: Acessa /vehicles
U -> V: Preenche formulário
U -> V: Clica "Cadastrar Veículo"
V -> S: Adiciona veículo ao state
S --> V: Atualiza lista
V -> U: Exibe veículo na tabela

@enduml
```

### 🛞 Fluxo de Monitoramento de Pneus

```plantuml
@startuml
actor Usuário as U
participant "Tires Page" as T
participant "State" as S

U -> T: Acessa /tires
T -> U: Exibe cards de pneus
U -> T: Visualiza saúde (%)

alt Vida útil >= 80%
    T -> U: Badge verde "Excelente"
else Vida útil >= 50%
    T -> U: Badge amarelo "Atenção"
else Vida útil < 50%
    T -> U: Badge vermelho "Crítico"
end

@enduml
```

## Regras de Negócio

### Autenticação
- RN01: Senha deve ter no mínimo 6 caracteres
- RN02: Email deve ser válido e único
- RN03: Usuário pode ser Pessoa Física ou Empresa
- RN04: Empresa deve informar CNPJ e razão social

### Veículos
- RN05: Tipos permitidos: Caminhão, Carro, Moto
- RN06: Placa é obrigatória e deve ser única
- RN07: Ano do veículo deve ser informado

### Pneus
- RN08: Pneu deve estar vinculado a um veículo
- RN09: Vida útil é medida de 0% a 100%
- RN10: Status é calculado automaticamente pela vida útil
- RN11: Eixo pode ser Dianteiro ou Traseiro

### Viagens
- RN12: Distância, altitude e peso são obrigatórios
- RN13: Valor é calculado com base na distância
- RN14: Tipo de carga deve ser informado
- RN15: Data é registrada automaticamente

---

**Legenda:**
- 🔵 Autenticação
- 🟣 Dashboard
- 🟢 Veículos
- 🟠 Pneus
- 🔴 Viagens
