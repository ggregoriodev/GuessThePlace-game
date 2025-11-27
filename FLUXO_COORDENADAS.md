# 📍 Fluxo de Coordenadas - Como o Código Pega os Dois Pontos

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDENADAS REAIS                         │
│              (Localização do Street View)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Backend busca cidade aleatória do PHP                   │
│     GmapsService.js → fetchCitiesFromPhp()                  │
│     Retorna: { lat: -23.5505, lng: -46.6333 }               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Backend formata coordenadas                              │
│     coordinates: [lng, lat] = [-46.6333, -23.5505]          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Backend envia para frontend                              │
│     GET /api/random-image                                    │
│     Response: { coordinates: [-46.6333, -23.5505] }         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Frontend armazena no estado                              │
│     Game.jsx → setImage(data.image)                         │
│     image.coordinates = [-46.6333, -23.5505]                │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│              COORDENADAS DO CHUTE                            │
│            (Onde o usuário clicou)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Usuário clica no mapa                                    │
│     MapGuessComponent → addListener('click')                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Google Maps extrai coordenadas do clique                 │
│     event.latLng.lat() → -25.5505                           │
│     event.latLng.lng() → -48.6333                           │
│     coords = { lat: -25.5505, lng: -48.6333 }               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Envia para componente pai via callback                   │
│     onGuessSelect(coords)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Game.jsx recebe e armazena                               │
│     handleMapClick(coords) → setGuess(coords)               │
│     guess = { lat: -25.5505, lng: -48.6333 }                │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                  COMPARAÇÃO DOS PONTOS                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  calculateDistance(                                          │
│    guess.lat,              // -25.5505                     │
│    guess.lng,               // -48.6333                     │
│    image.coordinates[1],    // -23.5505 (lat real)          │
│    image.coordinates[0]     // -46.6333 (lng real)          │
│  )                                                           │
│  → Retorna distância em km                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Detalhamento do Código

### 1️⃣ Coordenadas Reais - Fluxo Completo

#### Backend: Busca Cidade (GmapsService.js)
```javascript
// Linha 56-58
const randomCity = cities[Math.floor(Math.random() * cities.length)];
const lat = randomCity.lat;  // Exemplo: -23.5505
const lng = randomCity.lng;  // Exemplo: -46.6333
```

#### Backend: Formata Coordenadas (GmapsService.js)
```javascript
// Linha 67
return {
  coordinates: [parseFloat(lng), parseFloat(lat)],
  // Formato: [longitude, latitude]
  // Resultado: [-46.6333, -23.5505]
};
```

#### Backend: Envia para Frontend (server.js)
```javascript
// Linha 39
res.json({
  success: true,
  image: {
    coordinates: streetView.coordinates,  // [-46.6333, -23.5505]
    // ...
  }
});
```

#### Frontend: Recebe e Armazena (Game.jsx)
```javascript
// Linha 29-33
const response = await fetch("http://localhost:3001/api/random-image");
const data = await response.json();

if (data.success) {
  setImage(data.image);
  // image.coordinates = [-46.6333, -23.5505]
  // image.coordinates[0] = longitude (-46.6333)
  // image.coordinates[1] = latitude (-23.5505)
}
```

### 2️⃣ Coordenadas do Chute - Fluxo Completo

#### Usuário Clica no Mapa (MapGuessComponent.jsx)
```javascript
// Linha 23-28
initialMap.addListener('click', (event) => {
  if (showResult) return;
  
  // Google Maps fornece as coordenadas do clique
  const lat = event.latLng.lat();  // Extrai latitude
  const lng = event.latLng.lng();   // Extrai longitude
  const coords = { lat, lng };      // { lat: -25.5505, lng: -48.6333 }
  
  setUserClick(coords);
  if (typeof onGuessSelect === 'function') {
    onGuessSelect(coords);  // Envia para Game.jsx
  }
});
```

#### Game.jsx Recebe o Chute
```javascript
// Linha 54-57
const handleMapClick = (coords) => {
  console.log("📍 Usuário clicou em:", coords);
  // coords = { lat: -25.5505, lng: -48.6333 }
  
  setGuess(coords);  // Armazena no estado
  setShowResult(true);
  
  // Agora temos os dois pontos para comparar!
};
```

### 3️⃣ Comparação dos Dois Pontos

#### Cálculo da Distância (Game.jsx)
```javascript
// Linha 59-64
const distance = calculateDistance(
  coords.lat,              // Chute latitude: -25.5505
  coords.lng,              // Chute longitude: -48.6333
  image.coordinates[1],     // Real latitude: -23.5505
  image.coordinates[0]      // Real longitude: -46.6333
);
```

**Por que `image.coordinates[1]` e `image.coordinates[0]`?**

```javascript
// image.coordinates está no formato [longitude, latitude]
image.coordinates = [-46.6333, -23.5505]
//                    [0]       [1]
//                    lng       lat

// Para calcular distância, precisamos:
// calculateDistance(lat1, lng1, lat2, lng2)
calculateDistance(
  guess.lat,              // lat1 (chute)
  guess.lng,              // lng1 (chute)
  image.coordinates[1],    // lat2 (real) - índice [1] = latitude
  image.coordinates[0]     // lng2 (real) - índice [0] = longitude
);
```

#### Exibição no Mapa (MapGuessComponent.jsx)
```javascript
// Linha 75-87: Marcador do chute
userMarkerRef.current = new window.google.maps.Marker({
  position: userGuess,  // { lat: -25.5505, lng: -48.6333 }
  // ...
});

// Linha 90-102: Marcador da localização real
realMarkerRef.current = new window.google.maps.Marker({
  position: { 
    lat: realLocation[1],  // -23.5505 (latitude)
    lng: realLocation[0]   // -46.6333 (longitude)
  },
  // ...
});

// Linha 105-114: Linha conectando os dois pontos
lineRef.current = new window.google.maps.Polyline({
  path: [
    userGuess,                              // { lat: -25.5505, lng: -48.6333 }
    { lat: realLocation[1], lng: realLocation[0] }  // { lat: -23.5505, lng: -46.6333 }
  ],
  // ...
});
```

## 🔑 Pontos Importantes

### Formato das Coordenadas

**Coordenadas Reais (Backend):**
- Formato: `[longitude, latitude]` (array)
- Exemplo: `[-46.6333, -23.5505]`
- Acesso: `image.coordinates[0]` (lng), `image.coordinates[1]` (lat)

**Coordenadas do Chute (Frontend):**
- Formato: `{ lat: ..., lng: ... }` (objeto)
- Exemplo: `{ lat: -25.5505, lng: -48.6333 }`
- Acesso: `guess.lat`, `guess.lng`

### Por que formatos diferentes?

1. **Backend (array):** Formato comum em APIs (GeoJSON usa `[lng, lat]`)
2. **Frontend (objeto):** Mais legível e fácil de usar
3. **Google Maps:** Aceita ambos os formatos

### Conversão entre Formatos

```javascript
// De array para objeto
const [lng, lat] = image.coordinates;
const coords = { lat, lng };

// De objeto para array
const coords = { lat: -23.5505, lng: -46.6333 };
const array = [coords.lng, coords.lat];  // [longitude, latitude]
```

## 📊 Exemplo Prático

```javascript
// COORDENADAS REAIS (São Paulo)
image.coordinates = [-46.6333, -23.5505]
//                    lng       lat

// CHUTE DO USUÁRIO (Curitiba)
guess = { lat: -25.5505, lng: -48.6333 }

// CÁLCULO DA DISTÂNCIA
calculateDistance(
  -25.5505,   // lat do chute (Curitiba)
  -48.6333,   // lng do chute (Curitiba)
  -23.5505,   // lat real (São Paulo) - image.coordinates[1]
  -46.6333    // lng real (São Paulo) - image.coordinates[0]
)
// Resultado: ~408 km de distância
```

## 🎯 Resumo

1. **Coordenadas Reais:** Vêm do backend → formato `[lng, lat]` → armazenadas em `image.coordinates`
2. **Coordenadas do Chute:** Vêm do clique no mapa → formato `{ lat, lng }` → armazenadas em `guess`
3. **Comparação:** Usa `calculateDistance()` com os dois pontos
4. **Exibição:** Mostra marcadores e linha conectando os dois pontos no mapa

