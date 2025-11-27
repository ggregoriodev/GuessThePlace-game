# 🌍 GeoGuesser - Jogo de Adivinhação Geográfica

Um jogo interativo de geografia onde os jogadores precisam adivinhar a localização de lugares ao redor do mundo usando Google Street View. Desenvolvido com React e Node.js.

![GeoGuesser](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Google Maps](https://img.shields.io/badge/Google_Maps-API-4285F4?logo=google-maps)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Funciona](#como-funciona)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Funcionalidades](#funcionalidades)
- [Sistema de Pontuação](#sistema-de-pontuação)

## 🎯 Sobre o Projeto

O GeoGuesser é um jogo educativo e divertido que desafia os jogadores a identificar locais ao redor do mundo. O jogo apresenta uma imagem do Google Street View e o jogador deve clicar no mapa para indicar onde acredita estar essa localização. Quanto mais próximo do local real, maior será a pontuação!

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca JavaScript para construção de interfaces de usuário
- **React Router DOM 7.9.4** - Roteamento para aplicações React
- **@react-google-maps/api 2.20.7** - Integração com Google Maps e Street View
- **React Scripts 5.0.1** - Ferramentas de build e desenvolvimento

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express 5.1.0** - Framework web para Node.js
- **Axios 1.10.0** - Cliente HTTP para fazer requisições
- **CORS 2.8.5** - Middleware para habilitar CORS
- **dotenv 17.0.1** - Gerenciamento de variáveis de ambiente
- **MySQL2 3.14.3** - Driver para conexão com banco de dados MySQL
- **Sequelize 6.37.7** - ORM para Node.js

### APIs e Serviços Externos
- **Google Maps JavaScript API** - Para exibição de mapas interativos
- **Google Street View API** - Para visualização panorâmica de locais
- **PHP Backend** - Serviço externo para fornecer lista de cidades

## 🔄 Como Funciona

### Arquitetura Geral

O projeto segue uma arquitetura **cliente-servidor** com separação clara entre frontend e backend:

```
Frontend (React) ←→ Backend (Node.js/Express) ←→ PHP Service ←→ MySQL Database
                    ↓
              Google Maps API
```

### Fluxo de Funcionamento

1. **Inicialização do Jogo**
   - O frontend faz uma requisição para `/api/random-image`
   - O backend busca uma cidade aleatória de um serviço PHP externo
   - As coordenadas são retornadas ao frontend

2. **Exibição do Street View**
   - O componente `StreetViewComponent` utiliza a Google Maps API
   - Carrega uma vista panorâmica 360° do local selecionado
   - O jogador pode explorar o ambiente arrastando e usando zoom

3. **Interação com o Mapa**
   - O componente `MapGuessComponent` renderiza um mapa interativo
   - O jogador clica em qualquer ponto do mapa para fazer seu chute
   - As coordenadas do clique são capturadas e armazenadas

4. **Cálculo da Pontuação**
   - A distância entre o chute e a localização real é calculada usando a **Fórmula de Haversine**
   - A pontuação é calculada com base em uma curva exponencial decrescente
   - Quanto mais próximo, maior a pontuação (máximo de 5000 pontos)

5. **Exibição do Resultado**
   - Mostra marcadores no mapa indicando o chute do jogador e a localização real
   - Desenha uma linha conectando os dois pontos
   - Exibe informações detalhadas: distância, pontos e nome do local

6. **Sistema de Ranking**
   - O jogador pode salvar sua pontuação com seu nome
   - As pontuações são enviadas para um backend PHP que armazena no MySQL

### Componentes Principais

#### `Game.jsx` - Componente Principal do Jogo
- Gerencia o estado do jogo (imagem atual, chute do jogador, pontuação)
- Coordena a comunicação entre Street View e Mapa
- Implementa a lógica de cálculo de distância e pontuação
- Gerencia o modal de salvamento de pontuação

#### `StreetViewComponent.jsx` - Visualização Panorâmica
- Integra a Google Street View API
- Renderiza a vista 360° do local
- Gerencia estados de carregamento e erro
- Permite interação do usuário (arrastar, zoom, navegação)

#### `MapGuessComponent.jsx` - Mapa Interativo
- Renderiza um mapa do Google Maps
- Captura cliques do usuário para fazer chutes
- Exibe marcadores para chute e localização real
- Desenha linha conectando os pontos
- Ajusta zoom automaticamente para mostrar ambos os pontos

#### `GmapsService.js` - Serviço Backend
- Busca lista de cidades de um serviço PHP externo
- Seleciona uma cidade aleatória
- Gera parâmetros aleatórios (heading, pitch) para o Street View
- Retorna dados formatados para o frontend

### Sistema de Pontuação

O sistema de pontuação utiliza uma **curva exponencial** para calcular os pontos:

```javascript
function calculatePoints(dist) {
  const MAX_POINTS = 5000;
  const MAX_DISTANCE = 20000; // 20.000 km
  
  const multiplier = Math.max(0, 1 - (dist / MAX_DISTANCE));
  const points = Math.round(MAX_POINTS * Math.pow(multiplier, 4));
  
  return points > 0 ? points : 10; // Mínimo de 10 pontos
}
```

**Características:**
- **Pontuação máxima**: 5000 pontos (quando a distância é 0 km)
- **Distância máxima**: 20.000 km (acima disso, pontuação mínima)
- **Curva exponencial**: Usa potência de 4, criando uma penalização severa para distâncias maiores
- **Pontuação mínima**: 10 pontos garantidos mesmo para chutes muito distantes

**Exemplos de Pontuação:**
- 0 km → 5000 pontos
- 1.000 km → ~3.164 pontos
- 5.000 km → ~1.580 pontos
- 10.000 km → ~312 pontos
- 20.000 km → 10 pontos

### Cálculo de Distância

A distância é calculada usando a **Fórmula de Haversine**, que calcula a distância entre dois pontos na superfície de uma esfera (Terra):

```javascript
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const dist = R * c;
  
  return dist;
};
```

## 📁 Estrutura do Projeto

```
GMaps/
├── Backend/                 # Servidor Node.js
│   ├── src/
│   │   └── services/
│   │       └── GmapsService.js    # Serviço de busca de cidades
│   ├── server.js            # Servidor Express
│   └── package.json
│
├── frontend/                # Aplicação React
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── Components/
│       │   ├── Game.jsx            # Componente principal do jogo
│       │   ├── StreetViewComponent.jsx  # Visualização Street View
│       │   ├── MapGuessComponent.jsx    # Mapa interativo
│       │   ├── Startscreen.jsx     # Tela inicial
│       │   └── Ranking.jsx        # Tela de ranking
│       ├── App.js            # Roteamento principal
│       └── index.js          # Ponto de entrada
│
└── package.json             # Scripts do projeto raiz
```

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Chave da API do Google Maps (para Street View e Maps)
- Servidor PHP com MySQL (para o serviço de cidades e ranking)

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/geoguesser.git
   cd geoguesser
   ```

2. **Instale as dependências**
   ```bash
   npm run install-all
   ```
   Este comando instala as dependências do projeto raiz, frontend e backend.

3. **Configure as variáveis de ambiente**

   No arquivo `Backend/.env`:
   ```env
   GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```

   No arquivo `frontend/public/index.html`, adicione sua chave da API do Google Maps:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI&libraries=places"></script>
   ```

4. **Configure o serviço PHP**
   - Certifique-se de que o serviço PHP está rodando em `http://localhost/cities.php`
   - O serviço deve retornar um JSON com array de cidades no formato:
     ```json
     [
       {
         "name": "São Paulo",
         "country": "Brasil",
         "lat": -23.5505,
         "lng": -46.6333,
         "latRange": 0.1,
         "lngRange": 0.1
       }
     ]
     ```

## ▶️ Como Executar

### Desenvolvimento

Para executar frontend e backend simultaneamente:

```bash
npm run dev
```

Isso iniciará:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Executar Separadamente

**Apenas Frontend:**
```bash
npm run frontend
```

**Apenas Backend:**
```bash
npm run backend
```

### Build de Produção

Para criar uma build de produção do frontend:

```bash
npm run build
```

## ✨ Funcionalidades

- 🗺️ **Visualização Street View 360°** - Explore locais ao redor do mundo
- 🎯 **Sistema de Chute Interativo** - Clique no mapa para fazer seu chute
- 📊 **Cálculo de Distância Preciso** - Usa fórmula de Haversine para calcular distâncias
- 🏆 **Sistema de Pontuação** - Pontuação baseada em proximidade com curva exponencial
- 📍 **Visualização de Resultados** - Veja seu chute, localização real e distância
- 🎮 **Ranking de Jogadores** - Salve e compare suas pontuações
- 🎨 **Interface Moderna** - Design responsivo e intuitivo
- ⚡ **Performance Otimizada** - Carregamento rápido e experiência fluida

## 📝 Notas Adicionais

- O projeto requer uma chave válida da Google Maps API
- O serviço PHP externo é necessário para fornecer a lista de cidades
- Certifique-se de que o CORS está configurado corretamente no backend
- O banco de dados MySQL é usado apenas para armazenar o ranking

## 📄 Licença

Este projeto está sob a licença ISC.

---

Desenvolvido com ❤️ usando React e Node.js
