export const rand = (): number => {
  return Math.random();
};

export const randInArray = <T>(array: T[]): T => {
  return array[Math.floor(rand() * array.length)];
};

export const randInRange = (min: number, max: number): number => {
  return Math.floor(rand() * (max - min + 1)) + min;
};

export const splitDelimTrim = (text: string, delim: string): string[] => {
  return text.split(delim).map(s => s.trim());
};
