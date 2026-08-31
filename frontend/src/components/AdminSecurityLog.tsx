import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { formatChatDateTime } from '@/lib/format';

const TYPE_LABEL: Record<string, string> = {
  ADMIN_AUTH_FAIL: 'Login admin gagal',
  MERCHANT_LOGIN_FAIL: 'Login toko gagal',
  MERCHANT_TOKEN_INVALID: 'Sesi toko tidak valid',
  MERCHANT_REGISTER_CONFLICT: 'Percobaan daftar duplikat',
  CHAT_SESSION_INVALID: 'Sesi chat tidak valid',
};

const TYPE_COLOR: Record<string, string> = {
  ADMIN_AUTH_FAIL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  MERCHANT_LOGIN_FAIL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  MERCHANT_TOKEN_INVALID: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  MERCHANT_REGISTER_CONFLICT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  CHAT_SESSION_INVALID: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

/**
 * Read-only feed of recorded security events (failed logins, invalid tokens,
 * unauthorized admin attempts) - lets the admin see who is probing the system.
 */
export default function AdminSecurityLog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const { data: events = [] } = useQuery({
    queryKey: ['admin-security-events', email],
    queryFn: () => api.getSecurityEvents(email),
    enabled: !!email && open,
    refetchInterval: open ? 8000 : false,
  });

  const criticalCount = events.filter((e) => e.type === 'ADMIN_AUTH_FAIL').length;

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-bold"
      >
        <span className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-brand" /> Log Keamanan
        </span>
        <span className="text-xs text-slate-400">{open ? 'Sembunyikan' : 'Lihat'}</span>
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto border-t border-slate-100 p-2 custom-scrollbar dark:border-slate-700">
          {events.length === 0 ? (
            <p className="p-3 text-center text-xs text-slate-400">
              Belum ada aktivitas mencurigakan tercatat. Sistem aman.
            </p>
          ) : (
            <div className="space-y-1.5">
              {criticalCount > 0 && (
                <p className="rounded-lg bg-red-50 p-2 text-[11px] font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {criticalCount}x percobaan akses admin tidak sah tercatat - periksa apakah ADMIN_TOKEN
                  bocor jika jumlahnya terus bertambah.
                </p>
              )}
              {events.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-100 p-2 text-xs dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_COLOR[e.type] ?? 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_LABEL[e.type] ?? e.type}
                    </span>
                    <span className="shrink-0 text-[9px] text-slate-400">{formatChatDateTime(e.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400" title={e.detail}>
                    {e.detail}
                  </p>
                  {e.ip && <p className="text-[9px] text-slate-400">IP: {e.ip}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
