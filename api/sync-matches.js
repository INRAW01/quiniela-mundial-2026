// api/sync-matches.js
export default async function handler(req, res) {
  const API_KEY = "356a49f5da904439a26625cac68c380e";
  const url = "https://api.football-data.org/v4/competitions/WC/matches";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-Auth-Token": API_KEY }
    });
    
    const data = await response.json();
    
    // Si la API nos responde bien, pasamos los datos al frontend
    res.status(200).json(data);
  } catch (error) {
    // Si falla, enviamos un error que tu frontend pueda capturar
    res.status(500).json({ error: "Error conectando con Football-Data" });
  }
}
