
export enum CodeCategory {
  DANGEROUS = 'dangerous',
  PREDATOR = 'predator',
  HARMLESS = 'harmless'
}

export interface CodeDefinition {
  id: number;
  code: string;
  meaningKey: string;
  category: CodeCategory;
}

export interface Code extends CodeDefinition {
  meaning: string;
}
