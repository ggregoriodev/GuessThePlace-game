import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Ranking.css";

function Ranking() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost/ranking.php");
      const data = await response.json();

      if (data.success) {
        setRankings(data.data);
      } else {
        setError("Erro ao carregar ranking");
      }
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="loading-state">
          <p>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchRankings}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-card">
        <h1>🏆 Ranking</h1>
        <div className="ranking-table-container">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Pontos</th>
                <th>Distância (km)</th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    Nenhuma pontuação ainda. Seja o primeiro!
                  </td>
                </tr>
              ) : (
                rankings.map((player, index) => (
                  <tr key={player.id}>
                    <td className="rank">{index + 1}</td>
                    <td className="name">{player.playerName}</td>
                    <td className="score">{Math.round(player.score).toLocaleString()}</td>
                    <td className="distance">{parseFloat(player.distance).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="ranking-buttons">
          <button onClick={() => navigate("/game")} className="play-button">
            🎮 Jogar Novamente
          </button>
          <button onClick={() => navigate("/")} className="home-button">
            🏠 Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ranking;

