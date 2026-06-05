import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: api.getRegions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegionSuppliers(regionKey: string | undefined, radiusKm: number) {
  return useQuery({
    queryKey: ['suppliers', regionKey, radiusKm],
    queryFn: () => api.getRegionSuppliers(regionKey!, radiusKm),
    enabled: Boolean(regionKey),
  });
}

export function useAllSuppliers() {
  return useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: api.getAllSuppliers,
  });
}

export function useSetStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, inStock, adminEmail }: { id: number; inStock: boolean; adminEmail: string }) =>
      api.setSupplierStock(id, inStock, adminEmail),
    onSuccess: () => {
      // Refresh both the admin inventory and any open map views.
      void qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
