import React, { useEffect, useRef, useState } from 'react';
import './StreetViewComponent.css';

const StreetViewComponent = ({ location, heading = 0, pitch = 0, onReady }) => {
  const streetViewRef = useRef(null);
  const [panorama, setPanorama] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (streetViewRef.current && location && window.google) {
      setIsLoading(true);
      setError(null);

      try {
        const streetViewPanorama = new window.google.maps.StreetViewPanorama(
          streetViewRef.current,
          {
            position: { lat: location[1], lng: location[0] },
            pov: { 
              heading: heading, 
              pitch: pitch 
            },
            zoom: 1,
            visible: true,
            disableDefaultUI: false,
            clickToGo: true,
            scrollwheel: true,
            panControl: true,
            zoomControl: true,
            addressControl: false,
            linksControl: true,
            fullscreenControl: true
          }
        );

      
        streetViewPanorama.addListener('status_changed', () => {
          const status = streetViewPanorama.getStatus();
          if (status === 'OK') {
            setIsLoading(false);
            setPanorama(streetViewPanorama);
            if (onReady) onReady(streetViewPanorama);
          } else {
            setError('Street View não disponível nesta localização');
            setIsLoading(false);
          }
        });

        setPanorama(streetViewPanorama);
      } catch (err) {
        setError('Erro ao carregar Street View');
        setIsLoading(false);
        console.error('Street View Error:', err);
      }
    }
  }, [location, heading, pitch, onReady]);

  return (
    <div className="street-view-wrapper">
      <div 
        ref={streetViewRef} 
        className="street-view-container"
      />
      
      {isLoading && (
        <div className="street-view-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring-active"></div>
          </div>
          <p>Carregando Street View...</p>
        </div>
      )}
      
      {error && (
        <div className="street-view-error">
          <div className="error-icon">🚫</div>
          <p>{error}</p>
        </div>
      )}
      
      {panorama && !isLoading && !error && (
        <div className="street-view-controls">
          <div className="controls-info">
            <span className="control-hint">🖱️ Arraste para olhar ao redor</span>
            <span className="control-hint">🔍 Use a roda do mouse para zoom</span>
            <span className="control-hint">👆 Clique nas setas para andar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreetViewComponent;
