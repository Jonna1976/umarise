import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-support-chat`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group my-2">
      <pre className="bg-[hsl(220,10%,8%)] rounded p-3 text-xs font-mono text-[hsl(var(--landing-cream)/0.9)] overflow-x-auto whitespace-pre">
        {code}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[hsl(var(--landing-cream)/0.6)]" />}
      </button>
    </div>
  );
}

function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    // Code block
    if (lines[i]?.startsWith('```')) {
      const lang = lines[i].slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]?.startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      parts.push(<CodeBlock key={parts.length} code={codeLines.join('\n')} lang={lang} />);
      continue;
    }

    // Inline code and bold
    let line = lines[i];
    const rendered = line.split(/(`[^`]+`)/).map((segment, idx) => {
      if (segment.startsWith('`') && segment.endsWith('`')) {
        return (
          <code key={idx} className="bg-[hsl(var(--landing-cream)/0.06)] px-1 py-0.5 rounded text-[hsl(var(--landing-copper))] text-xs font-mono">
            {segment.slice(1, -1)}
          </code>
        );
      }
      // Bold
      return segment.split(/(\*\*[^*]+\*\*)/).map((seg, idx2) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={`${idx}-${idx2}`} className="font-semibold text-[hsl(var(--landing-cream)/0.95)]">{seg.slice(2, -2)}</strong>;
        }
        return seg;
      });
    });

    parts.push(
      <p key={parts.length} className="text-[hsl(var(--landing-cream)/0.85)] text-sm leading-relaxed mb-1">
        {rendered}
      </p>
    );
    i++;
  }

  return parts;
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Connection error';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Connection error: ${errorMsg}. Contact partners@umarise.com for help.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[hsl(var(--landing-copper))] text-[hsl(var(--landing-deep))] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Open API support chat"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[520px] rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-deep))] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--landing-cream)/0.08)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-mono text-[hsl(var(--landing-cream)/0.9)]">API Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[hsl(var(--landing-cream)/0.45)] hover:text-[hsl(var(--landing-cream))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: '380px' }}>
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm">Ask a question about the Umarise Core API.</p>
                  <div className="space-y-1.5">
                    {[
                      'How do I create an attestation?',
                      'What hash format does the API accept?',
                      'How long until a proof is anchored?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="block w-full text-left px-3 py-1.5 rounded text-xs text-[hsl(var(--landing-cream)/0.6)] hover:text-[hsl(var(--landing-cream)/0.85)] hover:bg-[hsl(var(--landing-cream)/0.03)] transition-colors font-mono"
                      >
                        → {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-cream)/0.95)]'
                        : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.85)]'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="text-sm">{renderMarkdown(msg.content)}</div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-[hsl(var(--landing-cream)/0.04)] rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--landing-cream)/0.3)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--landing-cream)/0.3)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--landing-cream)/0.3)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[hsl(var(--landing-cream)/0.08)]">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2 px-3 py-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the API..."
                  className="flex-1 bg-transparent text-sm text-[hsl(var(--landing-cream))] placeholder:text-[hsl(var(--landing-cream)/0.35)] outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 rounded text-[hsl(var(--landing-cream)/0.6)] hover:text-[hsl(var(--landing-copper))] disabled:opacity-30 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="px-3 pb-2 space-y-1">
                <p className="text-[9px] text-[hsl(var(--landing-cream)/0.4)] italic">
                  AI-generated - may contain errors. Always verify against the documentation above.
                </p>
                <a
                  href="mailto:partners@umarise.com"
                  className="text-[10px] font-mono text-[hsl(var(--landing-cream)/0.35)] hover:text-[hsl(var(--landing-cream)/0.6)] transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> partners@umarise.com
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
