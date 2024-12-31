export interface Music {
    id: string;
    nome: string;
    artista: string;
    image_url: string;
    url: string;
    tags?: Tags[];
    artistaId?: string[];
    loadingBtn?: boolean;
    data_lanc?: Date;
    isPlaying?: boolean
    duracao?: string;
  }
  
  export interface User {
    artist?: any;
    id: string;
    email: string;
    nome: string;
    cargo: string;
    foto_perfil: string;
    banner_perfil: string;
    data_nasc: Date;
    songs: Music[];
    tags: Tags[];
    desc?: string;
  }
  
  export interface Tags {
    id: string;
    nome: string;
    ativo: boolean;
    musicas: Music[];
  }
  
  export interface Album {
    id:string;
    lancamento: string;
    nome: string;
    artista: string;
    desc: string
    image_url: string
    data_lanc: Date
    musicas: Music[];
    artistaId: string[];
    tags: Tags[];
  }
  export interface MusicRec {
    id: string;
    nome: string;
    artista: string;
    url: string;
    duracao: string;
    data_lanc: string;
    image_url: string;
    albumId: number;
    tags: [];
    artistId: number[];
    playlist: any[];
    userLiked: any[]; 
    
  }