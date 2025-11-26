import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StreetViewComponent from "./StreetViewComponent";
import MapGuessComponent from "./MapGuessComponent";
import "./Game.css";

function Main({ onGuess }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guess, setGuess] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [savingScore, setSavingScore] = useState(false); 

  const fetchRandomImage = async () => {
    console.log("🔄 fetchRandomImage chamado - iniciando loading");
    setLoading(true);
    setError(null);
    setGuess(null);
    setShowResult(false);
    setShowNameModal(false);
    setPlayerName("");

    try {
      const response = await fetch("http://localhost:3001/api/random-image");
      const data = await response.json();

      if (data.success) {
        setImage(data.image);
      } else {
        setError(data.message || "Erro ao buscar imagem");
      }
    } catch (err) {
      setError(
        "Erro ao conectar com o servidor. Certifique-se de que o backend está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

  const handleStreetViewReady = useCallback((panorama) => {
    console.log("Street View carregado:", panorama);
  }, []);

  const handleMapClick = (coords) => {
    console.log("📍 Usuário clicou em:", coords);
    setGuess(coords);
    setShowResult(true);
    
    const distance = calculateDistance(
      coords.lat,
      coords.lng,
      image.coordinates[1],
      image.coordinates[0]
    );
    const points = calculatePoints(distance);
    setFinalScore(points);
    setShowNameModal(true);
  };

  // ✅ Função para calcular a distância entre duas coordenadas
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
  
    return dist
  };
  function calculatePoints(dist) {
    
    const MAX_POINTS = 5000;
    const MAX_DISTANCE = 20000; 
    

    const multiplier = Math.max(0, 1 - (dist / MAX_DISTANCE));
    
  
    const points = Math.round(MAX_POINTS * Math.pow(multiplier, 2));
    
    return points > 0 ? points : 10; 
  }

  const saveScoreToBackend = async () => {
    if (!playerName.trim()) {
      alert("Por favor, digite seu nome!");
      return;
    }

    setSavingScore(true);
    try {
      const distance = calculateDistance(
        guess.lat,
        guess.lng,
        image.coordinates[1],
        image.coordinates[0]
      );
      
      const points = calculatePoints(distance);

      const response = await fetch("http://localhost/ranking.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          score: points,
          distance: distance.toFixed(2),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowNameModal(false);
        setPlayerName("");
        alert("Pontuação salva com sucesso! 🎉");
      } else {
        alert("Erro ao salvar pontuação: " + (data.message || "Tente novamente"));
      }
    } catch (error) {
      console.error("Erro ao salvar pontuação:", error);
      alert("Erro ao salvar pontuação. Tente novamente.");
    } finally {
      setSavingScore(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-card-wrapper">
        <div className="card-glow"></div>

        <div className="game-card">
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring-active"></div>
              </div>
              <h3 className="loading-title">Carregando...</h3>
              <p className="loading-subtitle">Buscando uma nova aventura</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <div className="error-content">
                <div className="error-icon">😕</div>
                <h3 className="error-title">Algo deu errado</h3>
                <p className="error-message">{error}</p>
                <button onClick={fetchRandomImage} className="retry-button">
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* Game State */}
          {image && !loading && (
            <div className="game-content">
              {/* Street View */}
              <div className="street-view-section">
                <StreetViewComponent
                  location={image.coordinates}
                  heading={image.heading}
                  pitch={image.pitch}
                  onReady={handleStreetViewReady}
                />
              </div>

              {/* Controls */}
              <div className="controls-section">
                <div className="controls-header">
                  <h3 className="question-title">Onde é este lugar?</h3>
                </div>

                {/* 🗺️ Nosso mapa interativo - ✅ PASSAR AS PROPS NECESSÁRIAS */}
                <MapGuessComponent 
                  onGuessSelect={handleMapClick}
                  realLocation={image.coordinates} // ✅ Coordenadas reais
                  userGuess={guess} // ✅ Chute do usuário
                  showResult={showResult} // ✅ Se deve mostrar resultado
                />

                {/* 🧭 Mostra informações do chute e resultado */}
                {guess && showResult && (
                  <div className="result-info">
                    <p className="guess-info">
                      📍 Seu chute: Lat {guess.lat.toFixed(4)}, Lng {guess.lng.toFixed(4)}
                    </p>
                    <p className="real-info">
                      🎯 Local real: Lat {image.coordinates[1].toFixed(4)}, Lng {image.coordinates[0].toFixed(4)}
                    </p>
                    <p className="distance-info">
                      📏 Distância: {calculateDistance(
                        guess.lat, 
                        guess.lng, 
                        image.coordinates[1], 
                        image.coordinates[0]
                      ).toFixed(2)} km
                    </p>
                    <p className="points-info">
                    🥳 Pontos: {calculatePoints(calculateDistance(guess.lat, 
                        guess.lng, 
                        image.coordinates[1], 
                        image.coordinates[0]))}
                    </p>
                    <p className="location-info">
                      📍 {image.cityName}, {image.countryName}
                    </p>
                  </div>
                )}

                {/* Botões */}
                <div className="game-buttons-container">
                  {showResult && (
                    <button 
                      onClick={fetchRandomImage} 
                      className="new-game-button"
                    >
                      🎮 Nova Imagem
                    </button>
                  )}
                  <button 
                    onClick={() => navigate("/")} 
                    className="home-game-button"
                  >
                    🏠 Voltar ao Início
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showNameModal && (
        <div className="name-modal-overlay">
          <div className="name-modal">
            <h2>🎉 Parabéns!</h2>
            <p>Você fez <strong>{Math.round(finalScore)} pontos</strong>!</p>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="name-input"
              maxLength={50}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  saveScoreToBackend();
                }
              }}
            />
            <div className="modal-buttons">
              <button
                onClick={saveScoreToBackend}
                disabled={savingScore}
                className="save-button"
              >
                {savingScore ? "Salvando..." : "Salvar Pontuação"}
              </button>
              <button
                onClick={() => {
                  setShowNameModal(false);
                  setPlayerName("");
                }}
                className="skip-button"
              >
                Pular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;