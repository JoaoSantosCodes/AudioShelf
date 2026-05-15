export interface Chapter {
  id?: string;
  title: string;
  telegram_file_id: string;
  type?: 'audio' | 'video';
  transcription?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  duration: string;
  purchase_url?: string;
  category?: string;
  summary?: string;
  description?: string;
  progress?: number;
  chapters: Chapter[];
}

export const books: Book[] = [
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    cover: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
    duration: "11h 22min",
    chapters: [
      { title: "Capítulo 1", telegram_file_id: "COLOQUE_AQUI_O_FILE_ID_DO_TELEGRAM" },
      { title: "Capítulo 2", telegram_file_id: "COLOQUE_AQUI_O_FILE_ID_DO_TELEGRAM" },
    ]
  },
  {
    id: "o-alquimista",
    title: "O Alquimista",
    author: "Paulo Coelho",
    cover: "https://m.media-amazon.com/images/I/8166X02O17L._AC_UF1000,1000_QL80_.jpg",
    duration: "4h 15min",
    chapters: [
      { title: "Introdução", telegram_file_id: "COLOQUE_AQUI_O_FILE_ID_DO_TELEGRAM" },
    ]
  }
];
