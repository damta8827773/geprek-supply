import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60';

export default function ResetPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.resetPassword(email, token, password);
      setDone(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
              <KeyRound size={20} />
            </span>
            <h2 className="text-lg font-bold">Buat Sandi Baru</h2>
          </div>

          {!email || !token ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Link reset tidak valid. Minta link baru dari halaman Masuk.
            </p>
          ) : done ? (
            <div className="text-sm">
              <p className="text-emerald-600 dark:text-emerald-400">
                Kata sandi berhasil diperbarui.
              </p>
              <Link to="/masuk" className="mt-2 inline-block font-bold text-brand hover:underline">
                Masuk sekarang
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Untuk akun: <span className="font-semibold">{email}</span>
              </p>
              <input
                required
                type="password"
                minLength={6}
                placeholder="Kata sandi baru (min 6)"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {err && (
                <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {err}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="press w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {busy ? 'Menyimpan...' : 'Simpan Sandi Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
