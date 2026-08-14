import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ImagePlus, Package, Pencil, Store, Trash2, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MerchantSettings from '@/components/MerchantSettings';
import { api } from '@/lib/api';
import { fileToDataUrl } from '@/lib/image';
import { formatRupiah } from '@/lib/format';
import { productEmoji } from '@/lib/product';
import { useMerchantStore } from '@/store/merchantStore';
import type { Product, ProductInput } from '@/types';

const EMPTY: ProductInput = { name: '', price: 0, unit: 'pcs', stock: 0, inStock: true, imageUrl: '' };

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60';

export default function MerchantDashboard() {
  const merchant = useMerchantStore((s) => s.merchant);
  const token = useMerchantStore((s) => s.token) ?? '';
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: products = [], refetch } = useQuery({
    queryKey: ['my-products', token],
    queryFn: () => api.getMyProducts(token),
    enabled: !!token,
  });

  if (!merchant) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-4 text-center">
          <div>
            <p className="text-sm text-slate-500">Silakan masuk sebagai toko dulu.</p>
            <Link to="/masuk" className="mt-2 inline-block font-bold text-brand hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const onImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setErr('Gagal memproses gambar.');
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (editingId) await api.updateProduct(token, editingId, form);
      else await api.createProduct(token, form);
      reset();
      await refetch();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal menyimpan.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      inStock: p.inStock,
      imageUrl: p.imageUrl ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStock = async (p: Product) => {
    await api.updateProduct(token, p.id, { inStock: !p.inStock });
    refetch();
  };

  const remove = async (id: number) => {
    if (!window.confirm('Hapus produk ini?')) return;
    await api.deleteProduct(token, id);
    refetch();
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
            <Store size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold">{merchant.shopName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola produk tokomu: nama, harga, stok, dan foto.
            </p>
          </div>
        </div>

        <MerchantSettings />

        {/* Add / edit form */}
        <form
          onSubmit={save}
          className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <p className="mb-2 text-sm font-bold">{editingId ? 'Edit Produk' : 'Tambah Produk'}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              Nama Barang*
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold">
              Harga (Rp)*
              <input
                required
                type="number"
                min={0}
                className={inputCls}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </label>
            <label className="text-xs font-semibold">
              Satuan
              <input
                className={inputCls}
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold">
              Stok (jumlah)
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-2xl dark:bg-slate-700">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{productEmoji(form.name)}</span>
              )}
            </span>
            <label className="press flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
              <ImagePlus size={14} /> Upload Foto
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
              />
              Tersedia (in stock)
            </label>
          </div>

          {err && (
            <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {err}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="press rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="press rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Product list */}
        <div className="flex items-center gap-2">
          <Package size={16} className="text-brand" />
          <h2 className="text-sm font-bold">Produk Toko ({products.length})</h2>
        </div>
        {products.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-600">
            Belum ada produk. Tambahkan di atas.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-2xl dark:bg-slate-700">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{productEmoji(p.name)}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(p.price)} <span className="text-slate-400">/ {p.unit}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Stok: {p.stock}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => toggleStock(p)}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${
                        p.inStock
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {p.inStock ? <Check size={11} /> : <X size={11} />}
                      {p.inStock ? 'Tersedia' : 'Kosong'}
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <Trash2 size={11} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
