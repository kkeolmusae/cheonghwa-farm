export const PRODUCT_STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  판매_중: { label: '판매 중', variant: 'success' },
  판매중: { label: '판매 중', variant: 'success' },
  on_sale: { label: '판매 중', variant: 'success' },
  판매_예정: { label: '판매 예정', variant: 'info' },
  판매예정: { label: '판매 예정', variant: 'info' },
  upcoming: { label: '판매 예정', variant: 'info' },
  품절: { label: '품절', variant: 'error' },
  sold_out: { label: '품절', variant: 'error' },
  판매_종료: { label: '판매 종료', variant: 'default' },
  판매종료: { label: '판매 종료', variant: 'default' },
  ended: { label: '판매 종료', variant: 'default' },
};

export function getProductStatus(status: string) {
  return PRODUCT_STATUS_MAP[status] ?? { label: status, variant: 'default' as const };
}
