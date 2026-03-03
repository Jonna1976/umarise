import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// SDK file contents embedded for download
const FILES: Record<string, string> = {
  'package.json': `{
  "name": "@umarise/anchor",
  "version": "1.0.0",
  "description": "Umarise Core SDK. Hash-in, proof-out. Zero dependencies.",
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
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "keywords": ["anchoring","sha256","bitcoin","opentimestamps","proof-of-existence","timestamp","integrity","verification"],
  "author": "Umarise",
  "license": "Unlicense",
  "repository": { "type": "git", "url": "https://github.com/umarise/anchor-sdk-node" },
  "homepage": "https://umarise.com/technical",
  "engines": { "node": ">=18.0.0" }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}`,

  'LICENSE': `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,

  'README.md': `# @umarise/anchor

Umarise Core SDK. Hash-in, proof-out. Zero dependencies.

## Install

\`\`\`bash
npm install @umarise/anchor
\`\`\`

## Quick Start

\`\`\`typescript
import { UmariseCore, hashBytes } from '@umarise/anchor';
import { readFile } from 'fs/promises';

const core = new UmariseCore({ apiKey: 'um_...' });

const bytes = await readFile('./document.pdf');
const hash = await hashBytes(bytes);
const origin = await core.attest(hash);
console.log('Origin:', origin.origin_id);
\`\`\`

## API

| Method | Auth | Description |
|---|---|---|
| \`health()\` | Public | API health check |
| \`resolve({ originId })\` | Public | Lookup by origin ID |
| \`resolve({ hash })\` | Public | Lookup by hash |
| \`verify(hash)\` | Public | Check if hash has attestation |
| \`proof(originId)\` | Public | Download .ots proof |
| \`attest(hash)\` | API Key | Create attestation |
| \`hashBytes(data)\` | — | SHA-256 hash utility |

## License

Unlicense (Public Domain)
`,

  'src/index.ts': `/**
 * Umarise Core SDK — Node.js / TypeScript
 * 
 * Single-file SDK for Umarise Core v1 API.
 * Zero external dependencies. Uses native fetch (Node 18+) or globalThis.fetch.
 * 
 * @version 1.0.0
 * @license Unlicense
 */

// ─── Types ──────────────────────────────────────────────────────

export interface UmariseCoreConfig {
  /** Partner API key (um_<64 hex chars>). Required for attest(). */
  apiKey?: string;
  /** Base URL for the Core API. Default: https://core.umarise.com */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
}

export interface OriginRecord {
  origin_id: string;
  hash: string;
  hash_algo: 'sha256';
  captured_at: string;
  proof_status?: 'pending' | 'anchored';
  proof_url?: string;
}

export interface VerifyResult extends OriginRecord {
  proof_status: 'pending' | 'anchored';
  proof_url: string;
}

export interface ProofResult {
  proof: Uint8Array | null;
  status: 'pending' | 'anchored' | 'not_found';
  origin_id: string;
  bitcoin_block_height?: number;
  anchored_at?: string;
}

export interface HealthResult {
  status: 'operational';
  version: string;
}

export interface CoreError {
  code: string;
  message: string;
  retry_after_seconds?: number;
  limit?: number;
  window?: string;
}

export class UmariseCoreError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly retryAfterSeconds?: number;

  constructor(code: string, message: string, statusCode: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'UmariseCoreError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ─── SDK ────────────────────────────────────────────────────────

export class UmariseCore {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: UmariseCoreConfig = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://core.umarise.com').replace(/\\/$/, '');
    this.timeout = config.timeout || 30_000;
  }

  async health(): Promise<HealthResult> {
    const res = await this.request('GET', '/v1-core-health');
    return res as HealthResult;
  }

  async resolve(params: { originId: string } | { hash: string }): Promise<OriginRecord | null> {
    const query = 'originId' in params
      ? \`origin_id=\${encodeURIComponent(params.originId)}\`
      : \`hash=\${encodeURIComponent(normalizeHashInput(params.hash))}\`;

    try {
      return await this.request('GET', \`/v1-core-resolve?\${query}\`) as OriginRecord;
    } catch (err) {
      if (err instanceof UmariseCoreError && err.statusCode === 404) return null;
      throw err;
    }
  }

  async verify(hash: string): Promise<VerifyResult | null> {
    try {
      return await this.request('POST', '/v1-core-verify', {
        hash: normalizeHashInput(hash),
      }) as VerifyResult;
    } catch (err) {
      if (err instanceof UmariseCoreError && err.statusCode === 404) return null;
      throw err;
    }
  }

  async proof(originId: string): Promise<ProofResult> {
    const url = \`\${this.baseUrl}/v1-core-proof?origin_id=\${encodeURIComponent(originId)}\`;
    const res = await this.fetchWithTimeout(url, { method: 'GET', headers: {} });

    if (res.status === 404) {
      return { proof: null, status: 'not_found', origin_id: originId };
    }
    if (res.status === 202) {
      return { proof: null, status: 'pending', origin_id: originId };
    }
    if (res.status === 200) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      return {
        proof: bytes,
        status: 'anchored',
        origin_id: originId,
        bitcoin_block_height: parseInt(res.headers.get('x-bitcoin-block-height') || '0') || undefined,
        anchored_at: res.headers.get('x-anchored-at') || undefined,
      };
    }

    await this.handleErrorResponse(res);
    throw new Error('Unreachable');
  }

  async attest(hash: string): Promise<OriginRecord> {
    if (!this.apiKey) {
      throw new UmariseCoreError(
        'UNAUTHORIZED',
        'API key required for attest(). Pass apiKey in UmariseCore config.',
        401
      );
    }
    return await this.request('POST', '/v1-core-origins', {
      hash: normalizeHashInput(hash),
    }, true) as OriginRecord;
  }

  private async request(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    authenticated = false
  ): Promise<unknown> {
    const url = \`\${this.baseUrl}\${path}\`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authenticated && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    const res = await this.fetchWithTimeout(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      return res.json();
    }
    await this.handleErrorResponse(res);
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new UmariseCoreError('TIMEOUT', \`Request timed out after \${this.timeout}ms\`, 0);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private async handleErrorResponse(res: Response): Promise<never> {
    let errorBody: { error?: CoreError } | undefined;
    try {
      errorBody = await res.json();
    } catch { /* not JSON */ }
    const err = errorBody?.error;
    throw new UmariseCoreError(
      err?.code || 'UNKNOWN_ERROR',
      err?.message || \`HTTP \${res.status}\`,
      res.status,
      err?.retry_after_seconds
    );
  }
}

// ─── Utility ────────────────────────────────────────────────────

function normalizeHashInput(hash: string): string {
  const trimmed = hash.trim().toLowerCase();
  if (trimmed.startsWith('sha256:')) return trimmed;
  if (/^[a-f0-9]{64}$/.test(trimmed)) return \`sha256:\${trimmed}\`;
  return trimmed;
}

export async function hashBytes(data: BufferSource): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return \`sha256:\${hex}\`;
}

export default UmariseCore;
`,
};

export default function SdkDownload() {
  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();
    const folder = zip.folder('umarise-anchor-sdk')!;
    for (const [path, content] of Object.entries(FILES)) {
      folder.file(path, content);
    }
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    saveAs(blob, 'umarise-anchor-sdk-1.0.0.zip');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-landing-deep text-landing-cream flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-landing-muted/10 text-landing-copper px-3 py-1 rounded-full text-sm font-medium tracking-wide">
          <span className="w-2 h-2 bg-landing-copper rounded-full animate-pulse" />
          Live on npm
        </div>

        <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-landing-cream/90">
          @umarise/anchor
        </h1>
        <p className="text-landing-muted/65 tracking-wide">
          v1.0.0 — Hash-in, proof-out. Zero dependencies.
        </p>

        <div className="bg-landing-muted/8 border border-landing-muted/15 rounded-lg p-4 text-left space-y-2">
          <p className="text-xs text-landing-muted/50 uppercase tracking-widest">Install</p>
          <code className="block text-sm font-mono text-landing-cream/90">npm install @umarise/anchor</code>
        </div>

        <div className="bg-landing-muted/8 border border-landing-muted/15 rounded-lg p-4 text-left space-y-2">
          <p className="text-xs text-landing-muted/50 uppercase tracking-widest">Quick Start</p>
          <pre className="text-sm font-mono text-landing-cream/80 overflow-x-auto whitespace-pre leading-relaxed">{`import { UmariseCore, hashBytes } from '@umarise/anchor';

const core = new UmariseCore({ apiKey: 'um_...' });
const hash = await hashBytes(fileBuffer);
const origin = await core.attest(hash);`}</pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.npmjs.com/package/@umarise/anchor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-landing-copper text-landing-deep px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View on npm →
          </a>
          <a
            href="https://github.com/Jonna1976/umarise-anchor-sdk-node"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-landing-muted/10 text-landing-cream/80 px-5 py-2.5 rounded-lg font-medium border border-landing-muted/15 hover:bg-landing-muted/15 transition-colors"
          >
            Source on GitHub
          </a>
          <a
            href="/sdk-source"
            className="inline-flex items-center justify-center gap-2 bg-landing-muted/10 text-landing-cream/80 px-5 py-2.5 rounded-lg font-medium border border-landing-muted/15 hover:bg-landing-muted/15 transition-colors"
          >
            View source
          </a>
        </div>

        <a
          href="/api-reference"
          className="inline-flex items-center gap-1 text-sm text-landing-copper hover:underline underline-offset-2 transition-colors tracking-wide"
        >
          Full docs →
        </a>

        <div>
          <button
            onClick={handleDownloadZip}
            className="text-xs text-landing-muted/40 underline underline-offset-2 hover:text-landing-muted/60 transition-colors"
          >
            Download als ZIP (offline)
          </button>
        </div>
      </div>
    </div>
  );
}
