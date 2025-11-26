import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CITIES_ENDPOINT = "http://localhost/cities.php";

async function fetchCitiesFromPhp() {
  try {
    const response = await axios.get(CITIES_ENDPOINT, { timeout: 5000 });
    
    console.log("📥 Resposta do PHP:", response.data);
    console.log("📥 Tipo da resposta:", typeof response.data);
    
    let citiesData = response.data;
    
    if (typeof citiesData === 'string') {
      try {
        citiesData = JSON.parse(citiesData);
      } catch (e) {
        throw new Error(`PHP retornou string inválida: ${citiesData.substring(0, 100)}`);
      }
    }
    
    if (!Array.isArray(citiesData)) {
      console.error("❌ Dados recebidos não são um array:", citiesData);
      throw new Error(`PHP não retornou um array. Tipo: ${typeof citiesData}, Valor: ${JSON.stringify(citiesData).substring(0, 200)}`);
    }
 
    return citiesData.map((c) => ({
      name: c.name,
      country: c.country || '',
      lat: Number(c.lat),
      lng: Number(c.lng),
      latRange: Number(c.latRange) || 0,
      lngRange: Number(c.lngRange) || 0,
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar cidades do PHP:", error.message);
    if (error.response) {
      console.error("❌ Status do erro:", error.response.status);
      console.error("❌ Dados do erro:", error.response.data);
    }
    throw error;
  }
}

async function getRandomStreetView() {
  try {
    const cities = await fetchCitiesFromPhp();
    
    if (!cities || cities.length === 0) {
      throw new Error("Nenhuma cidade encontrada");
    }

    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const lat = randomCity.lat;
    const lng = randomCity.lng;
    const heading = Math.floor(Math.random() * 360);
    const pitch = Math.floor(Math.random() * 20) - 10;
    
    console.log(`✅ Street view gerado para ${randomCity.name}`);
    
    return {
      panoId: null,
      imageUrl: null,
      coordinates: [parseFloat(lng), parseFloat(lat)],
      cityName: randomCity.name,
      countryName: randomCity.country,
      heading: heading,
      pitch: pitch,
      date: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao gerar Street View:", error);
    throw error;
  }
}

export { getRandomStreetView };