/**
 * Converts markdown formatted text to plain text
 */
export const convertMarkdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';
  
  let plainText = markdown
    // Remove headers
    .replace(/#+\s+(.*)/g, '$1')
    // Remove bold/italic formatting
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Convert bullet lists to plain text with dashes
    .replace(/^\s*[\-\*]\s+(.*)/gm, '- $1')
    // Convert numbered lists to plain text with numbers
    .replace(/^\s*\d+\.\s+(.*)/gm, '$1')
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^\s*>\s+(.*)/gm, '$1')
    // Convert links to text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^\s*[\-=_]{3,}\s*$/gm, '')
    // Replace multiple newlines with just two
    .replace(/\n{3,}/g, '\n\n')
    // Trim extra whitespace
    .trim();
    
  return plainText;
};