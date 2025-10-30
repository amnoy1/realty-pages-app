const transliterationMap: { [key: string]: string } = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v',
  'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l',
  'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'ts',
  'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
  'ך': 'ch', 'ם': 'm', 'ן': 'n', 'ף': 'f', 'ץ': 'ts'
};

export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('')
    .replace(/[\s,._'"`()]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
