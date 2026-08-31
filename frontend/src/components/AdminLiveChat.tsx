import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Headset, MessageSquareText, Send, User, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatChatDateTime, formatChatTime } from '@/lib/format';
import type { ChatInboxEntry, ChatMessage } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  QUEUED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  WITH_ADMIN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
};
const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Menunggu',
  WITH_ADMIN: 'Sedang Dilayani',
};

function ThreadModal({ email, entry, onClose }: { email: string; entry: ChatInboxEntry; onClose: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-chat-thread', entry.id],
    queryFn: () => api.getChatSessionAdmin(email, entry.id),
    refetchInterval: 3500,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText('');
    setBusy(true);
    try {
      await api.replyChatSession(email, entry.id, value);
      qc.invalidateQueries({ queryKey: ['admin-chat-thread', entry.id] });
      qc.invalidateQueries({ queryKey: ['admin-chat-inbox', email] });
    } finally {
      setBusy(false);
    }
  };

  const closeChat = async () => {
    if (!window.confirm('Tutup percakapan ini?')) return;
    await api.closeChatSession(email, entry.id);
    qc.invalidateQueries({ queryKey: ['admin-chat-inbox', email] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[32rem] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-brand to-amber-500 px-4 py-3 text-white">
          <div>
            <p className="text-sm font-bold">{entry.name || `Pengunjung #${entry.id}`}</p>
            {entry.queueNumber != null && <p className="text-[10px] opacity-80">Antrian #{entry.queueNumber}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/20" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 custom-scrollbar dark:bg-slate-900">
          {messages.map((m: ChatMessage) => {
            const isVisitor = m.sender === 'USER';
            return (
              <div key={m.id} className={`flex ${isVisitor ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs shadow-sm ${
                    isVisitor
                      ? 'bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                      : m.sender === 'ADMIN'
                        ? 'bg-brand text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200'
                  }`}
                >
                  <p className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase opacity-70">
                    {m.sender === 'USER' ? <User size={9} /> : m.sender === 'ADMIN' ? <Headset size={9} /> : <Bot size={9} />}
                    {m.sender === 'USER' ? 'Pengunjung' : m.sender === 'ADMIN' ? 'Kamu (Admin)' : 'Asisten'}
                  </p>
                  <p className="whitespace-pre-line">{m.text}</p>
                  <p title={formatChatDateTime(m.createdAt)} className="mt-0.5 text-right text-[9px] opacity-60">
                    {formatChatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="flex shrink-0 items-center gap-1.5 border-t border-slate-100 p-2 dark:border-slate-700">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Balas sebagai admin..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
          <button
            type="button"
            onClick={closeChat}
            className="press shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
          >
            Tutup
          </button>
        </form>
      </div>
    </div>
  );
}

/** Admin's live-chat queue panel: badge count, inbox list, and a reply modal per session. */
export default function AdminLiveChat({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ChatInboxEntry | null>(null);

  const { data: inbox = [] } = useQuery({
    queryKey: ['admin-chat-inbox', email],
    queryFn: () => api.getChatInbox(email),
    enabled: !!email,
    refetchInterval: 5000,
  });

  const queued = inbox.filter((s) => s.status === 'QUEUED').length;

  return (
    <>
      <div className="mb-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-bold"
        >
          <span className="flex items-center gap-2">
            <MessageSquareText size={15} className="text-brand" /> Live Chat
            {queued > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {queued} menunggu
              </span>
            )}
          </span>
          <span className="text-xs text-slate-400">{open ? 'Sembunyikan' : 'Lihat'}</span>
        </button>
        {open && (
          <div className="max-h-72 overflow-y-auto border-t border-slate-100 p-2 custom-scrollbar dark:border-slate-700">
            {inbox.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400">
                Belum ada percakapan yang butuh admin saat ini.
              </p>
            ) : (
              <div className="space-y-1.5">
                {inbox.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s)}
                    className="w-full rounded-lg border border-slate-100 p-2 text-left text-xs hover:border-brand dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{s.name || `Pengunjung #${s.id}`}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        {s.unreadFromUser > 0 && (
                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {s.unreadFromUser} baru
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[s.status]}`}>
                          {s.status === 'QUEUED' ? `#${s.position ?? s.queueNumber}` : STATUS_LABEL[s.status]}
                        </span>
                      </div>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {s.lastMessage ?? '(belum ada pesan)'}
                    </p>
                    <p title={formatChatDateTime(s.lastMessageAt)} className="mt-0.5 text-[9px] text-slate-400">
                      {formatChatDateTime(s.lastMessageAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {active && <ThreadModal email={email} entry={active} onClose={() => setActive(null)} />}
    </>
  );
}
