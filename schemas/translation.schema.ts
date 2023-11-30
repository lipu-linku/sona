export type Translation = {
  [word: string]: {
    def: string;
    commentary: string;
    sitelen_pona_etymology: string;
    etymology: Array<{
      language: string;
      word: string;
      alt: string;
      definition: string;
    }>;
  };
};
