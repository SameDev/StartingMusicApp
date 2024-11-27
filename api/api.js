import axios from 'axios';

export const fetchSongs = async (id) => {
  try {
    const response = await axios.get('https://startingmusic-ai.onrender.com/recommend?user_id='+id);
    return response.data.songs; 
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return [];
  }
};

export const fetchArtists = async () => {
  const response = await axios.get('https://starting-music.onrender.com/user/artists');
  return response.data;
};
