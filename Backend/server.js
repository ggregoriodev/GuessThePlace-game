import express from "express";
import { getRandomStreetView } from "./src/services/GmapsService.js";
import cors from "cors";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Permite requisições apenas do frontend
  })
);

// Inicializar o servidor
app.listen(3001, () => {
  console.log("🌍 GeoGuesser Server is running on port 3001");
  console.log("📍 http://localhost:3001");
  console.log("🖼️  Street View API ready!");
});

app.get("/", async (req, res) => {
  const streetView = await getRandomStreetView();
  res.json(streetView);
});

app.get("/api/random-image", async (req, res) => {
  try {
    const streetView = await getRandomStreetView();
    if (streetView) {
      res.json({
        success: true,
        image: {
          id: streetView.panoId,
          url: streetView.imageUrl,
          coordinates: streetView.coordinates,
          cityName: streetView.cityName,
          countryName: streetView.countryName,
          date: streetView.date,
          
        },
      });
    } else {
      res.json({ success: false, message: "Nenhuma imagem do Street View encontrada" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//TODOS OS PARAMETROS DA IMAGEM:
// id: string
// url: string
// coordinates: array
// cityname: string
// country: string
// country_code: string
