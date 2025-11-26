import React, { useEffect, useRef, useState } from 'react';

function MapGuessComponent({ onGuessSelect, realLocation, userGuess, showResult }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userClick, setUserClick] = useState(null);
  const userMarkerRef = useRef(null);
  const realMarkerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initialMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      mapTypeId: 'roadmap',
      streetViewControl: false,
    });

    setMap(initialMap);

    initialMap.addListener('click', (event) => {
      if (showResult) return; // Não permite cliques após mostrar resultado
      
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const coords = { lat, lng };

      setUserClick(coords);
      if (typeof onGuessSelect === 'function') {
        onGuessSelect(coords);
      }
    });
  }, [onGuessSelect, showResult]);

  // ✅ Efeito para atualizar marcadores e linha
  useEffect(() => {
    if (!map) return;

    // Limpar marcadores e linha anteriores
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    if (realMarkerRef.current) {
      realMarkerRef.current.setMap(null);
      realMarkerRef.current = null;
    }
    if (lineRef.current) {
      lineRef.current.setMap(null);
      lineRef.current = null;
    }

    // ✅ Adicionar marcador do usuário se existir
    if (userClick && !showResult) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userClick,
        map,
        label: 'U',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    }

    // ✅ Mostrar resultado quando necessário
    if (showResult && userGuess && realLocation) {
      // Marcador do chute do usuário
      userMarkerRef.current = new window.google.maps.Marker({
        position: userGuess,
        map,
        label: 'Seu chute',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // Marcador da localização real
      realMarkerRef.current = new window.google.maps.Marker({
        position: { lat: realLocation[1], lng: realLocation[0] },
        map,
        label: 'Local real',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4ECDC4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // ✅ Desenhar linha reta entre os dois pontos
      lineRef.current = new window.google.maps.Polyline({
        path: [
          userGuess,
          { lat: realLocation[1], lng: realLocation[0] }
        ],
        geodesic: true,
        strokeColor: '#FF6B6B',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });

      lineRef.current.setMap(map);

      // ✅ Ajustar o zoom para mostrar ambos os pontos
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userGuess);
      bounds.extend({ lat: realLocation[1], lng: realLocation[0] });
      map.fitBounds(bounds);

      // Adicionar um pouco de padding
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 10) map.setZoom(10);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, userClick, userGuess, realLocation, showResult]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px' }}
    />
  );
}

export default MapGuessComponent;