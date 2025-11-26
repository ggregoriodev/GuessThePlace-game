import React from 'react';
import {useNavigate} from 'react-router-dom';
import "./Startscreen.css"

function Startscreen() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Bem vindo ao GuessThePlaces</h1>
            <div className="start-image-container">
              <img src={"./planetaterra-cke-removebg-preview.png"} alt="Start Image" />
            </div>
            <div className="start-button-container">
            <button
              className="start-button"
              onClick={() => navigate('/game')}
              type="button"
            >
              Iniciar Jogo
            </button>
            <button
              className="start-button"
              onClick={() => navigate('/ranking')}
              type="button"
            >
              🏆 Ver Ranking
            </button>
            </div>
        </div>
    )
}
export default Startscreen;