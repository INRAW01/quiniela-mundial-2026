export default async function handler(req, res) {
  // Configuración de cabeceras para permitir peticiones desde tu propio dominio
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  
  const API_KEY = "356a49f5da904439a26625cac68c380e";
  const url = "https://api.football-data.org/v4/competitions/WC/matches";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-Auth-Token": API_KEY }
    });
    
    const data = await response.json();
    
    // Devolvemos la data al frontend
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Fallo en la conexión al servidor de API" });
  }
}
