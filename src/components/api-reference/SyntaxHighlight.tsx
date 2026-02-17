import React from 'react';

/**
 * Lightweight syntax highlighter for code blocks on the API reference page.
 * No external dependencies — uses regex-based token matching.
 * Designed for the dark theme with copper/cream palette.
 */

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'flag' | 'url' | 'plain';
  value: string;
}

const KEYWORDS = new Set([
  // Python
  'import', 'from', 'def', 'return', 'if', 'else', 'elif', 'class', 'async', 'await',
  'const', 'let', 'var', 'function', 'require', 'export', 'module',
  // Shell
  'curl', 'bash', 'python3', 'node', 'set', 'echo', 'cd', 'mkdir', 'cp',
  // JS/TS
  'app', 'res', 'req',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  // Combined regex: comments, strings, URLs, flags, numbers, words
  const regex = /(#[^\n]*|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(https?:\/\/[^\s"'`,)]+)|(-[A-Za-z][\w-]*)|(\b\d+\.?\d*\b)|(\b[a-zA-Z_][\w.]*\b(?=\s*\())|(\b[a-zA-Z_][\w]*\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      tokens.push({ type: 'comment', value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'string', value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'url', value: match[3] });
    } else if (match[4]) {
      tokens.push({ type: 'flag', value: match[4] });
    } else if (match[5]) {
      tokens.push({ type: 'number', value: match[5] });
    } else if (match[6]) {
      tokens.push({ type: 'function', value: match[6] });
    } else if (match[7]) {
      tokens.push({
        type: KEYWORDS.has(match[7]) ? 'keyword' : 'plain',
        value: match[7],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', value: code.slice(lastIndex) });
  }

  return tokens;
}

const TOKEN_COLORS: Record<Token['type'], string> = {
  keyword: 'text-[hsl(var(--landing-copper))]',
  string: 'text-[hsl(120,33%,65%)]',
  comment: 'text-[hsl(var(--landing-cream)/0.3)] italic',
  number: 'text-[hsl(280,60%,70%)]',
  function: 'text-[hsl(200,70%,70%)]',
  flag: 'text-[hsl(var(--landing-cream)/0.6)]',
  url: 'text-[hsl(var(--landing-cream)/0.5)]',
  plain: '',
};

export function HighlightedCode({ code, className }: { code: string; className?: string }) {
  const tokens = tokenize(code);

  return (
    <code className={className}>
      {tokens.map((token, i) => {
        const color = TOKEN_COLORS[token.type];
        return color ? (
          <span key={i} className={color}>{token.value}</span>
        ) : (
          <React.Fragment key={i}>{token.value}</React.Fragment>
        );
      })}
    </code>
  );
}
