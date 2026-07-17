// WhatsApp support/report deep-links. The number lives in VITE_WA_REPORT
// (kept in the gitignored .env, never committed). Format: 62xxxx (no + or leading 0).
const WA_NUMBER = import.meta.env.VITE_WA_REPORT as string | undefined;

export const waConfigured = Boolean(WA_NUMBER);

/**
 * Builds a wa.me link with a labelled report so different issues are
 * distinguishable, e.g. waReportUrl('LUPA SANDI', { 'Nama Toko': ... }).
 * Returns null when no number is configured.
 */
export function waReportUrl(kind: string, fields: Record<string, string>): string | null {
  if (!WA_NUMBER) return null;
  const body =
    `[${kind}]\n` +
    Object.entries(fields)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(body)}`;
}
