import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useMerchantStore } from '@/store/merchantStore';
import type { RegisterPayload } from '@/types';

const EMPTY: RegisterPayload = {
  ownerName: '',
  shopName: '',
  email: '',
  password: '',
  kecamatan: '',
  kota: '',
  kabupaten: '',
  kodePos: '',
  phone: '',
  landmark: '',
};

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [form, setForm] = useState<RegisterPayload>(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const upd =
    (k: keyof RegisterPayload) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const merchant = await api.registerMerchant(form);
      setMerchant(merchant);
      navigate('/');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal mendaftar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={submit}
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
              <Store size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">Daftarkan Toko sebagai Supplier</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isi data toko Anda. Nama toko harus unik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              Nama Pemilik*
              <input required className={inputCls} value={form.ownerName} onChange={upd('ownerName')} />
            </label>
            <label className="text-xs font-semibold">
              Nama Toko* (unik)
              <input required className={inputCls} value={form.shopName} onChange={upd('shopName')} />
            </label>
            <label className="text-xs font-semibold">
              Email*
              <input required type="email" className={inputCls} value={form.email} onChange={upd('email')} />
            </label>
            <label className="text-xs font-semibold">
              Kata Sandi* (min 6)
              <input required type="password" minLength={6} className={inputCls} value={form.password} onChange={upd('password')} />
            </label>
            <label className="text-xs font-semibold">
              Kecamatan*
              <input required className={inputCls} value={form.kecamatan} onChange={upd('kecamatan')} />
            </label>
            <label className="text-xs font-semibold">
              Kota
              <input className={inputCls} value={form.kota} onChange={upd('kota')} />
            </label>
            <label className="text-xs font-semibold">
              Kabupaten
              <input className={inputCls} value={form.kabupaten} onChange={upd('kabupaten')} />
            </label>
            <label className="text-xs font-semibold">
              Kode Pos
              <input className={inputCls} value={form.kodePos} onChange={upd('kodePos')} />
            </label>
            <label className="text-xs font-semibold">
              Nomor HP
              <input className={inputCls} value={form.phone} onChange={upd('phone')} />
            </label>
            <label className="text-xs font-semibold">
              Patokan
              <input className={inputCls} value={form.landmark} onChange={upd('landmark')} />
            </label>
          </div>

          {err && (
            <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="press mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {busy ? 'Mendaftar...' : 'Daftar'}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Sudah punya akun?{' '}
            <Link to="/masuk" className="font-bold text-brand hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
