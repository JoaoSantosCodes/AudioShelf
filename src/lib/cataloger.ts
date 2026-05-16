'use client';

export interface RefinedMetadata {
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
}

/**
 * Simulates an AI-powered metadata extraction.
 * In a real-world scenario, this would call an LLM (GPT-4/Gemini) 
 * or a specialized Book API.
 */
export async function autoCatalogMedia(rawTitle: string): Promise<RefinedMetadata> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const lowerTitle = rawTitle.toLowerCase();

  // Basic "Intelligence" simulation
  if (lowerTitle.includes('berserk')) {
    return {
      title: 'Berserk - Deluxe Edition',
      author: 'Kentaro Miura',
      description: 'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have the man take everything away from him for the sake of his own ambitions.',
      category: 'Manga',
      tags: ['Seinen', 'Dark Fantasy', 'Action']
    };
  }

  if (lowerTitle.includes('harry potter')) {
    return {
      title: 'Harry Potter and the Sorcerer\'s Stone',
      author: 'J.K. Rowling',
      description: 'Harry Potter, an eleven-year-old orphan, discovers that he is a wizard and is invited to attend Hogwarts School of Witchcraft and Wizardry.',
      category: 'Audiobook',
      tags: ['Fantasy', 'Adventure', 'Magic']
    };
  }

  // Fallback for generic entries
  return {
    title: rawTitle.split('.')[0], // Remove extension if any
    author: 'Autor Desconhecido',
    description: 'A inteligência artificial não encontrou uma sinopse exata, mas este item foi catalogado com sucesso na sua biblioteca premium.',
    category: 'Mídia',
    tags: ['Nova Mídia', 'MediaShelf']
  };
}
