export enum CodeCategory {
  DANGEROUS = 'dangerous',
  PREDATOR = 'predator',
  HARMLESS = 'harmless'
}

export interface Code {
  code: string;
  meaning: string;
  category: CodeCategory;
  lang?: 'en' | 'es' | 'ka';
}