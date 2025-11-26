import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Game from './Components/Game';
import './App.css';
import Startscreen from './Components/Startscreen';
import Ranking from './Components/Ranking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Startscreen />} />
        <Route path="/game" element={<Game />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
