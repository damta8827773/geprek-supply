import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Check, CheckCheck, Headset, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import { formatChatDateTime, formatChatTime } from '@/lib/format';
import type { ChatMessage } from '@/types';

/** Day-divider label: only the date part, e.g. "Senin, 17 Agustus 2026". */
function dateLabel(iso: string): string {
  return formatChatDateTime(iso).split(' - ')[0];
}

const STATUS_BANNER: Record<string, { cls: string; text: (n: number | null, pos?: number, est?: number) => string }> = {
  QUEUED: {
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900',
    text: (n, pos, est) => `Nomor Antrian #${n ?? '-'} - Posisi ke-${pos ?? '-'} - Estimasi ~${est ?? '-'} menit`,
  },
  WITH_ADMIN: {
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900',
    text: () => 'Admin sedang membantumu',
  },
  CLOSED: {
    cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    text: () => 'Percakapan ditutup',
  },
};

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestEscalate, setSuggestEscalate] = useState(false);
  const { token, setSession } = useChatStore();
  const qc = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['my-chat', token],
    queryFn: () => api.getMyChat(token!),
    enabled: open && !!token,
    refetchInterval: open ? 3500 : false,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [data?.messages.length, open]);

  const ensureSession = async () => {
    if (token) return token;
    const res = await api.startChat();
    setSession(res.sessionId, res.token);
    return res.token;
  };

  const openWidget = async () => {
    setOpen(true);
    if (!token) await ensureSession();
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText('');
    setBusy(true);
    try {
      const t = await ensureSession();
      const res = await api.sendChatMessage(t, value);
      setSuggestEscalate(res.suggestEscalate);
      qc.invalidateQueries({ queryKey: ['my-chat', t] });
    } finally {
      setBusy(false);
    }
  };

  const escalate = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api.escalateChat(token);
      setSuggestEscalate(false);
      qc.invalidateQueries({ queryKey: ['my-chat', token] });
    } finally {
      setBusy(false);
    }
  };

  const startNew = async () => {
    setSuggestEscalate(false);
    const res = await api.startChat();
    setSession(res.sessionId, res.token);
    qc.invalidateQueries({ queryKey: ['my-chat', res.token] });
  };

  const status = data?.status ?? 'BOT';
  const banner = STATUS_BANNER[status];
  const messages = data?.messages ?? [];

  return (
    <div className="fixed bottom-4 right-20 z-40 flex flex-col items-end gap-2 sm:right-24">
      {open && (
        <div className="flex h-[28rem] w-[19rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:w-80">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-brand to-amber-500 px-3 py-2.5 text-white">
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <Sparkles size={15} /> Live Chat
            </span>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/20" aria-label="Tutup chat">
              <X size={16} />
            </button>
          </div>

          {/* Status banner */}
          {banner && status !== 'BOT' && (
            <div className={`shrink-0 border-b px-3 py-1.5 text-[11px] font-bold ${banner.cls}`}>
              {banner.text(data?.queueNumber ?? null, data?.queue?.position, data?.queue?.estimatedMinutes)}
            </div>
          )}

          {/* Messages */}
          <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 custom-scrollbar dark:bg-slate-900">
            {messages.map((m: ChatMessage, i: number) => {
              const prevDate = i > 0 ? dateLabel(messages[i - 1].createdAt) : null;
              const thisDate = dateLabel(m.createdAt);
              const isUser = m.sender === 'USER';
              return (
                <div key={m.id}>
                  {thisDate !== prevDate && (
                    <p className="my-2 text-center text-[10px] font-bold text-slate-400">{thisDate}</p>
                  )}
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs shadow-sm ${
                        isUser
                          ? 'bg-brand text-white'
                          : m.sender === 'ADMIN'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                            : 'bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      {!isUser && (
                        <p className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase opacity-70">
                          {m.sender === 'ADMIN' ? <Headset size={9} /> : <Bot size={9} />}
                          {m.sender === 'ADMIN' ? 'Admin' : 'Asisten'}
                        </p>
                      )}
                      <p className="whitespace-pre-line">{m.text}</p>
                      <div
                        title={formatChatDateTime(m.createdAt)}
                        className={`mt-0.5 flex items-center justify-end gap-0.5 text-[9px] ${isUser ? 'text-white/70' : 'text-slate-400'}`}
                      >
                        {formatChatTime(m.createdAt)}
                        {isUser && (m.readAt ? <CheckCheck size={11} /> : <Check size={11} />)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Escalate suggestion */}
          {status === 'BOT' && (suggestEscalate || messages.length > 2) && (
            <button
              onClick={escalate}
              disabled={busy}
              className="press mx-3 mb-1.5 flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 py-1.5 text-[11px] font-bold text-sky-600 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400"
            >
              <Headset size={12} /> Sambungkan ke Admin
            </button>
          )}

          {status === 'CLOSED' ? (
            <button
              onClick={startNew}
              className="press m-3 mt-0 shrink-0 rounded-lg bg-brand py-2 text-xs font-bold text-white hover:bg-orange-600"
            >
              Mulai Obrolan Baru
            </button>
          ) : (
            <form onSubmit={send} className="flex shrink-0 items-center gap-1.5 border-t border-slate-100 p-2 dark:border-slate-700">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis pesan..."
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white hover:bg-orange-600 disabled:opacity-50"
                aria-label="Kirim"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => (open ? setOpen(false) : openWidget())}
        aria-label="Buka live chat"
        className="press flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber-500 text-white shadow-xl hover:brightness-95"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}
