import axios from 'axios';

export const fetchSongs = async () => {
  try {
    const response = await axios.get('https://starting-music.onrender.com/music');
    return response.data.songs; 
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return [];
  }
};
