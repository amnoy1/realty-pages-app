export const slugify = (text: string): string => {
  if (!text) return '';
  
  // We want to keep Hebrew characters, numbers, and basic English characters
  // Modern browsers and Next.js handle Unicode in URLs perfectly.
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s,._'"`()]+/g, '-')     // Replace spaces and specific special chars with -
    .replace(/[^\u0590-\u05FFa-z0-9-]/g, '') // Remove anything that isn't Hebrew, English, numbers or a dash
    .replace(/--+/g, '-')              // Replace multiple dashes with a single one
    .replace(/^-+/, '')                // Trim leading dash
    .replace(/-+$/, '');               // Trim trailing dash
};