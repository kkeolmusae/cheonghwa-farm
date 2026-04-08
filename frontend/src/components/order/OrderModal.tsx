import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, X, MapPin } from "lucide-react";
import DaumPostcodeEmbed, { type Address } from "react-daum-postcode";
import type { Product, ProductOption } from "@/types/product";
import type { DeliveryType, OrderCreate, OrderResponse } from "@/types/order";
import { createOrder } from "@/api/orders";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedOption: ProductOption;
  quantity: number;
}

interface FormValues {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_address_detail: string;
  delivery_type: DeliveryType;
  delivery_note: string;
}

interface FormErrors {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
}

const JEJU_KEYWORDS = ["제주특별자치도", "제주도", "제주시", "서귀포시", "서귀포"];
const REMOTE_KEYWORDS = ["울릉군", "울릉도", "독도", "옹진군"];

function getExtraDeliveryFee(address: string): number {
  if (JEJU_KEYWORDS.some((k) => address.includes(k))) return 3000;
  if (REMOTE_KEYWORDS.some((k) => address.includes(k))) return 5000;
  return 0;
}

function calcDeliveryFee(deliveryType: DeliveryType, subtotal: number, extraFee: number): number {
  if (deliveryType === "직거래") return 0;
  const base = subtotal >= 30000 ? 0 : 3000;
  return base + extraFee;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function validatePhone(phone: string): boolean {
  return /^010-\d{4}-\d{4}$/.test(phone);
}

export function OrderModal({ isOpen, onClose, product, selectedOption, quantity }: OrderModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormValues>({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_address_detail: "",
    delivery_type: "택배",
    delivery_note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(null);
  const [extraDeliveryFee, setExtraDeliveryFee] = useState(0);
  const [showPostcode, setShowPostcode] = useState(false);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setForm({
          customer_name: "",
          customer_phone: "",
          customer_address: "",
          customer_address_detail: "",
          delivery_type: "택배",
          delivery_note: "",
        });
        setErrors({});
        setCompletedOrder(null);
        setExtraDeliveryFee(0);
        setShowPostcode(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: (data: OrderCreate) => createOrder(data),
    onSuccess: (data) => {
      setCompletedOrder(data);
    },
  });

  const subtotal = selectedOption.price * quantity;
  const deliveryFee = calcDeliveryFee(form.delivery_type, subtotal, extraDeliveryFee);
  const total = subtotal + deliveryFee;

  function handlePostcodeComplete(data: Address) {
    const roadAddress = data.roadAddress || data.autoRoadAddress || data.jibunAddress;
    const extra = getExtraDeliveryFee(roadAddress);
    setExtraDeliveryFee(extra);
    setForm((prev) => ({ ...prev, customer_address: roadAddress, customer_address_detail: "" }));
    setErrors((prev) => ({ ...prev, customer_address: undefined }));
    setShowPostcode(false);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, customer_phone: formatted }));
    if (errors.customer_phone) {
      setErrors((prev) => ({ ...prev, customer_phone: undefined }));
    }
  }

  function handleChange<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.customer_name.trim()) next.customer_name = "이름을 입력해주세요.";
    if (!form.customer_phone.trim()) {
      next.customer_phone = "연락처를 입력해주세요.";
    } else if (!validatePhone(form.customer_phone)) {
      next.customer_phone = "010-0000-0000 형식으로 입력해주세요.";
    }
    if (!form.customer_address.trim()) next.customer_address = "주소를 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const fullAddress = form.customer_address_detail.trim() ? `${form.customer_address.trim()} ${form.customer_address_detail.trim()}` : form.customer_address.trim();

    const payload: OrderCreate = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone,
      customer_address: fullAddress,
      delivery_type: form.delivery_type,
      delivery_note: form.delivery_note.trim() || undefined,
      items: [
        {
          product_id: product.id,
          option_id: selectedOption.id,
          quantity,
        },
      ],
    };
    mutation.mutate(payload);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="주문하기"
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-raised shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-surface-raised px-6 py-4">
          <h2 className="font-headline text-h4 font-bold text-on-bg">{completedOrder ? "주문 완료" : "주문하기"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-on-muted transition-colors hover:bg-surface-muted hover:text-on-surface"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {completedOrder ? (
            <OrderCompleteView order={completedOrder} phone={form.customer_phone} onClose={onClose} />
          ) : (
            <OrderForm
              form={form}
              errors={errors}
              product={product}
              selectedOption={selectedOption}
              quantity={quantity}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              extraDeliveryFee={extraDeliveryFee}
              total={total}
              isLoading={mutation.isPending}
              serverError={mutation.isError ? ((mutation.error as Error)?.message ?? "주문 처리 중 오류가 발생했습니다.") : undefined}
              showPostcode={showPostcode}
              onPhoneChange={handlePhoneChange}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onOpenPostcode={() => setShowPostcode((v) => !v)}
              onPostcodeComplete={handlePostcodeComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   주문 입력 폼 (Step 1)
   ========================================================= */

interface OrderFormProps {
  form: FormValues;
  errors: FormErrors;
  product: Product;
  selectedOption: ProductOption;
  quantity: number;
  subtotal: number;
  deliveryFee: number;
  extraDeliveryFee: number;
  total: number;
  isLoading: boolean;
  serverError?: string;
  showPostcode: boolean;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenPostcode: () => void;
  onPostcodeComplete: (data: Address) => void;
}

function OrderForm({
  form,
  errors,
  product,
  selectedOption,
  quantity,
  subtotal,
  deliveryFee,
  extraDeliveryFee,
  total,
  isLoading,
  serverError,
  showPostcode,
  onPhoneChange,
  onChange,
  onSubmit,
  onOpenPostcode,
  onPostcodeComplete,
}: OrderFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* 이름 */}
      <div>
        <label htmlFor="customer_name" className="label">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="customer_name"
          type="text"
          className={cn("input", errors.customer_name && "border-red-400 focus:border-red-400 focus:ring-red-200")}
          placeholder="김상우"
          value={form.customer_name}
          onChange={(e) => onChange("customer_name", e.target.value)}
          autoComplete="name"
        />
        {errors.customer_name && <p className="mt-1.5 text-[0.8125rem] text-red-500">{errors.customer_name}</p>}
      </div>

      {/* 연락처 */}
      <div>
        <label htmlFor="customer_phone" className="label">
          연락처 <span className="text-red-500">*</span>
        </label>
        <input
          id="customer_phone"
          type="tel"
          inputMode="numeric"
          className={cn("input", errors.customer_phone && "border-red-400 focus:border-red-400 focus:ring-red-200")}
          placeholder="010-0000-0000"
          value={form.customer_phone}
          onChange={onPhoneChange}
          autoComplete="tel"
        />
        {errors.customer_phone && <p className="mt-1.5 text-[0.8125rem] text-red-500">{errors.customer_phone}</p>}
      </div>

      {/* 주소 */}
      <div>
        <label className="label">
          주소 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="customer_address"
            type="text"
            readOnly
            className={cn("input flex-1 cursor-pointer bg-surface-muted", errors.customer_address && "border-red-400 focus:border-red-400 focus:ring-red-200")}
            placeholder="주소 검색을 눌러주세요"
            value={form.customer_address}
            onClick={onOpenPostcode}
          />
          <button
            type="button"
            onClick={onOpenPostcode}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
          >
            <MapPin className="h-4 w-4" />
            주소 검색
          </button>
        </div>
        {showPostcode && (
          <div className="mt-2 overflow-hidden rounded-xl border border-border/60 shadow-md">
            <DaumPostcodeEmbed onComplete={onPostcodeComplete} style={{ height: "400px" }} autoClose={false} />
          </div>
        )}
        {form.customer_address && (
          <input
            id="customer_address_detail"
            type="text"
            className="input mt-2"
            placeholder="상세 주소 (동, 호수 등)"
            value={form.customer_address_detail}
            onChange={(e) => onChange("customer_address_detail", e.target.value)}
            autoComplete="address-line2"
          />
        )}
        {errors.customer_address && <p className="mt-1.5 text-[0.8125rem] text-red-500">{errors.customer_address}</p>}
      </div>

      {/* 배송 방식 */}
      <div>
        <p className="label">
          배송 방식 <span className="text-red-500">*</span>
        </p>
        <div className="mt-2 flex gap-3">
          {(["택배", "직거래"] as DeliveryType[]).map((type) => (
            <label
              key={type}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 font-headline text-sm font-semibold transition-all",
                form.delivery_type === type
                  ? "border-primary bg-primary-surface text-forest-700 shadow-sm"
                  : "border-border/40 bg-surface text-on-muted hover:border-primary/40 hover:bg-primary-surface/40",
              )}
            >
              <input type="radio" name="delivery_type" value={type} checked={form.delivery_type === type} onChange={() => onChange("delivery_type", type)} className="sr-only" />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* 배송 요청사항 */}
      <div>
        <label htmlFor="delivery_note" className="label">
          배송 요청사항 <span className="text-on-subtle font-normal">(선택)</span>
        </label>
        <textarea
          id="delivery_note"
          className="textarea"
          rows={3}
          placeholder="문 앞에 놔주세요. 부재 시 연락 부탁드립니다."
          value={form.delivery_note}
          onChange={(e) => onChange("delivery_note", e.target.value)}
        />
      </div>

      {/* 주문 요약 */}
      <Card className="bg-stone-50">
        <CardBody className="space-y-3">
          <p className="font-headline text-sm font-bold text-on-bg">주문 요약</p>
          <div className="space-y-2 text-sm text-on-muted">
            <div className="flex justify-between">
              <span className="text-on-surface">{product.name}</span>
              <span>{selectedOption.name}</span>
            </div>
            <div className="flex justify-between">
              <span>수량</span>
              <span>{quantity}개</span>
            </div>
          </div>
          <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm">
            <div className="flex justify-between text-on-muted">
              <span>상품 금액</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-on-muted">
              <span>배송비</span>
              <span>{deliveryFee === 0 ? (form.delivery_type === "직거래" ? "직거래 (무료)" : "무료") : formatPrice(deliveryFee - extraDeliveryFee)}</span>
            </div>
            {extraDeliveryFee > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>{JEJU_KEYWORDS.some((k) => form.customer_address.includes(k)) ? "제주" : "도서산간"} 추가 배송비</span>
                <span>+{formatPrice(extraDeliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 font-headline text-base font-bold text-on-bg">
              <span>합계</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 서버 에러 */}
      {serverError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        주문 요청하기
      </Button>
    </form>
  );
}

/* =========================================================
   주문 완료 화면 (Step 2)
   ========================================================= */

interface OrderCompleteViewProps {
  order: OrderResponse;
  phone: string;
  onClose: () => void;
}

function formatExpiresAt(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  return `${month}월 ${day}일 ${hour}시까지`;
}

function OrderCompleteView({ order, phone, onClose }: OrderCompleteViewProps) {
  const statusUrl = `/order/status?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(phone)}`;
  const showBankInfo = order.delivery_type === "택배" && !!order.bank_account;
  const totalPayment = order.total_amount + order.delivery_fee;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-forest-50">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>

      <h3 className="mt-5 font-headline text-xl font-bold text-on-bg">주문이 접수되었습니다</h3>
      <p className="mt-2 text-sm text-on-muted">잠시 후 SMS로 주문 내역을 안내드립니다.</p>

      <div className="mt-6 w-full rounded-2xl bg-forest-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">주문번호</p>
        <p className="mt-1.5 font-display text-2xl font-black tracking-widest text-on-bg">{order.order_number}</p>
      </div>

      <div className="mt-4 w-full rounded-2xl bg-stone-50 px-6 py-4 text-left text-sm">
        <div className="flex justify-between py-1.5 text-on-muted">
          <span>결제 금액</span>
          <span className="font-semibold text-on-surface">{formatPrice(order.total_amount)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-on-muted">
          <span>배송 방식</span>
          <span className="font-semibold text-on-surface">{order.delivery_type}</span>
        </div>
      </div>

      {/* 무통장 입금 안내 */}
      {showBankInfo && (
        <div className="mt-4 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left">
          <p className="mb-3 font-headline text-sm font-bold text-amber-800">무통장 입금 안내</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">입금 계좌</span>
              <span className="font-semibold text-amber-900">{order.bank_account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">예금주</span>
              <span className="font-semibold text-amber-900">{order.bank_holder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">입금 금액</span>
              <span className="font-semibold text-amber-900">{formatPrice(totalPayment)}</span>
            </div>
            {order.expires_at && (
              <div className="flex justify-between">
                <span className="text-amber-700">입금 기한</span>
                <span className="font-semibold text-amber-900">{formatExpiresAt(order.expires_at)}</span>
              </div>
            )}
          </div>
          <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-700">기한 내 미입금 시 주문이 자동으로 취소됩니다</p>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-3">
        <a
          href={statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border-2 border-primary font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-surface"
        >
          주문 조회하기
        </a>
        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
