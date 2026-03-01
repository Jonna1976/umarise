import { useState, useEffect } from "react";

const files: { name: string; language: string; code: string }[] = [
  {
    name: "index.ts",
    language: "typescript",
    code: `export { anchor } from './anchor';
export { verify } from './verify';
export { proof } from './proof';
export { hashBuffer } from './hash';
export { AnchorError } from './errors';

export type {
  AnchorResult,
  AnchorOptions,
  VerifyResult,
  VerifyOptions,
  ProofResult,
  ProofOptions,
} from './anchor';`,
  },
  {
    name: "anchor.ts",
    language: "typescript",
    code: `import { AnchorError } from './errors';

const DEFAULT_BASE_URL = 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1';
const DEFAULT_TIMEOUT = 12_000;

export interface AnchorOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface AnchorResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending';
}

function normalizeHash(input: string): string {
  const raw = input.startsWith('sha256:') ? input.slice(7) : input;
  if (!/^[a-f0-9]{64}$/i.test(raw)) {
    throw new AnchorError('INVALID_HASH', 400, 'Not a valid SHA-256 hash');
  }
  return \`sha256:\${raw.toLowerCase()}\`;
}

export async function anchor(
  hash: string,
  options: AnchorOptions,
): Promise<AnchorResult> {
  const normalized = normalizeHash(hash);
  const base = options.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(\`\${base}/v1-core-origins\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey,
      },
      body: JSON.stringify({ hash: normalized }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const code =
        res.status === 409 ? 'DUPLICATE_HASH' :
        res.status === 401 ? 'UNAUTHORIZED' :
        res.status === 429 ? 'RATE_LIMITED' :
        res.status === 400 ? 'INVALID_HASH' : 'UNKNOWN';
      const retryAfter =
        res.status === 429
          ? Number(res.headers.get('retry-after') ?? body.retryAfter ?? 60)
          : undefined;
      throw new AnchorError(code, res.status, body.error ?? res.statusText, retryAfter);
    }

    const data = await res.json();
    return {
      originId: data.origin_id,
      hash: normalized,
      capturedAt: data.captured_at,
      proofStatus: 'pending',
    };
  } finally {
    clearTimeout(timer);
  }
}`,
  },
  {
    name: "verify.ts",
    language: "typescript",
    code: `import { AnchorError } from './errors';

const DEFAULT_BASE_URL = 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1';
const DEFAULT_TIMEOUT = 12_000;

export interface VerifyOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface VerifyResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending' | 'anchored';
  proofUrl: string;
}

export async function verify(
  hash: string,
  options?: VerifyOptions,
): Promise<VerifyResult | null> {
  const base = options?.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(\`\${base}/v1-core-verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash }),
      signal: controller.signal,
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new AnchorError('UNKNOWN', res.status, body.error ?? res.statusText);
    }

    const data = await res.json();
    return {
      originId: data.origin_id,
      hash: data.hash,
      capturedAt: data.captured_at,
      proofStatus: data.proof_status ?? 'pending',
      proofUrl: data.proof_url ?? '',
    };
  } finally {
    clearTimeout(timer);
  }
}`,
  },
  {
    name: "proof.ts",
    language: "typescript",
    code: `import { AnchorError } from './errors';

const DEFAULT_BASE_URL = 'https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1';
const DEFAULT_TIMEOUT = 30_000;

export interface ProofOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface ProofResult {
  originId: string;
  status: 'anchored' | 'pending' | 'not_found';
  data: Uint8Array | null;
  bitcoinBlockHeight: number | null;
  anchoredAt: string | null;
}

export async function proof(
  originId: string,
  options?: ProofOptions,
): Promise<ProofResult> {
  const base = options?.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      \`\${base}/v1-core-proof?origin_id=\${encodeURIComponent(originId)}\`,
      { signal: controller.signal },
    );

    if (res.status === 404) {
      return { originId, status: 'not_found', data: null, bitcoinBlockHeight: null, anchoredAt: null };
    }
    if (res.status === 202) {
      return { originId, status: 'pending', data: null, bitcoinBlockHeight: null, anchoredAt: null };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new AnchorError('UNKNOWN', res.status, body.error ?? res.statusText);
    }

    const buffer = await res.arrayBuffer();
    const blockHeight = res.headers.get('x-bitcoin-block-height');
    const anchoredAt = res.headers.get('x-anchored-at');

    return {
      originId,
      status: 'anchored',
      data: new Uint8Array(buffer),
      bitcoinBlockHeight: blockHeight ? Number(blockHeight) : null,
      anchoredAt: anchoredAt ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}`,
  },
  {
    name: "hash.ts",
    language: "typescript",
    code: `/**
 * Hash a buffer using SHA-256. Always async (Web Crypto API).
 * Works in Node.js 18+, Bun, Deno, and browsers.
 */
export async function hashBuffer(
  buffer: ArrayBuffer | Uint8Array | Buffer,
): Promise<string> {
  const data = buffer instanceof ArrayBuffer
    ? buffer
    : (buffer as Uint8Array).buffer.slice(
        (buffer as Uint8Array).byteOffset,
        (buffer as Uint8Array).byteOffset + (buffer as Uint8Array).byteLength,
      );

  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return \`sha256:\${hex}\`;
}`,
  },
  {
    name: "errors.ts",
    language: "typescript",
    code: `export type AnchorErrorCode =
  | 'DUPLICATE_HASH'
  | 'INVALID_HASH'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export class AnchorError extends Error {
  readonly code: AnchorErrorCode;
  readonly statusCode: number;
  readonly retryAfter?: number;

  constructor(
    code: AnchorErrorCode,
    statusCode: number,
    message: string,
    retryAfter?: number,
  ) {
    super(message);
    this.name = 'AnchorError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}`,
  },
  {
    name: "package.json",
    language: "json",
    code: `{
  "name": "@umarise/anchor",
  "version": "1.0.0",
  "description": "Minimal SDK for the Umarise Core v1 Anchoring API",
  "license": "Unlicense",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc && node build-cjs.mjs",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  },
  "keywords": ["umarise", "anchoring", "origin", "proof", "opentimestamps", "sha256"],
  "repository": {
    "type": "git",
    "url": "https://github.com/umarise/anchor"
  },
  "homepage": "https://umarise.com/sdk-spec"
}`,
  },
  {
    name: "README.md",
    language: "markdown",
    code: `# @umarise/anchor

Minimal SDK for the Umarise Core v1 Anchoring API.
Zero dependencies. <4 KB gzipped.

## Install

\\\`\\\`\\\`
npm install @umarise/anchor
\\\`\\\`\\\`

## Usage

\\\`\\\`\\\`typescript
import { anchor, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = await hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });
console.log(\\\`Origin: \\\${result.originId}\\\`);
\\\`\\\`\\\`

## API

- **anchor(hash, options)** — Register a hash. Returns originId.
- **verify(hash)** — Check if a hash exists. No API key needed.
- **proof(originId)** — Download .ots proof. No API key needed.
- **hashBuffer(buffer)** — SHA-256 hash a buffer (async, Web Crypto).

## License

Unlicense (Public Domain)`,
  },
  {
    name: "LICENSE",
    language: "text",
    code: `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

For more information, please refer to <https://unlicense.org>`,
  },
];

const SdkSource = () => {
  const [activeFile, setActiveFile] = useState(0);

  useEffect(() => {
    document.title = "@umarise/anchor — Source";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight font-mono mb-2">
            @umarise/anchor
          </h1>
          <p className="text-sm text-muted-foreground">
            SDK broncode — 6 bestanden, 0 dependencies, &lt;4 KB gzipped
          </p>
          <div className="mt-3">
            <a href="/sdk-spec" className="text-sm text-primary hover:underline">
              ← SDK Specification
            </a>
          </div>
        </header>

        {/* File tabs */}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-border pb-2">
          {files.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActiveFile(i)}
              className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors ${
                i === activeFile
                  ? "bg-muted text-foreground border border-border border-b-0"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Code display */}
        <pre className="bg-muted/60 border border-border rounded-lg px-5 py-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre">
          <code>{files[activeFile].code}</code>
        </pre>

        <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">← Terug naar home</a>
        </footer>
      </div>
    </div>
  );
};

export default SdkSource;
