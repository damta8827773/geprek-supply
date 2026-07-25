import { useState } from 'react';
import { X } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { waConfigured, waReportUrl } from '@/lib/wa';

// Labelled report types so the admin can triage chats at a glance.
const KINDS = [
  { label: 'Pertanyaan Umum', kind: 'PERTANYAAN UMUM' },
  { label: 'Laporan Masalah / Error', kind: 'LAPORAN MASALAH' },
  { label: 'Bantuan Daftar Toko', kind: 'BANTUAN DAFTAR TOKO' },
];

/**
 * Floating WhatsApp bubble (bottom-right) that opens a small menu of report
 * types, each deep-linking to the admin's WhatsApp with a labelled message.
 * Renders nothing when no WA number is configured.
 */
export default function FloatingWA() {
  const [open, setOpen] = useState(false);
  if (!waConfigured) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <p className="px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Hubungi Admin via WhatsApp
          </p>
          {KINDS.map((k) => {
            const url = waReportUrl(k.kind, { Pesan: '(tulis pesanmu di sini)' });
            if (!url) return null;
            return (
              <a
                key={k.kind}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg px-2 py-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                {k.label}
              </a>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Hubungi admin via WhatsApp"
        className="press flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:brightness-95"
      >
        {open ? <X size={22} /> : <WhatsAppIcon size={24} />}
      </button>
    </div>
  );
}
