---
name: frontend-design-guideline
description: Apply frontend design principles for readability, predictability, cohesion, and coupling when writing or refactoring React/TypeScript UI code. Use when the user works on frontend, React, TypeScript, components, hooks, or form logic.
---

# Frontend Design Guideline

Follow these principles when writing or refactoring frontend code. For full patterns and examples, see [reference.md](reference.md).

## Readability

### Naming Magic Numbers

Replace magic numbers with named constants so values have clear meaning and are easier to maintain.

```typescript
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS);
  await refetchPostLike();
}
```

### Abstracting Implementation Details

Move complex logic or interactions into dedicated components or HOCs. Reduces cognitive load and improves testability.

- **Auth / guards**: Use wrapper components (e.g. `AuthGuard`) that handle check/redirect; keep page components focused on UI.
- **Dialogs / confirmations**: Put the flow inside a dedicated component (e.g. `InviteButton` that opens a confirm dialog and then acts).

### Separating Conditional UI

When conditional branches render very different UI or logic, use separate components instead of one component full of conditionals. Each component has a single, clear responsibility.

```tsx
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}
```

### Simplifying Complex Ternaries

Avoid nested or complex ternaries. Prefer `if`/`else` or an IIFE for readability.

```typescript
const status = (() => {
  if (ACondition && BCondition) return "BOTH";
  if (ACondition) return "A";
  if (BCondition) return "B";
  return "NONE";
})();
```

### Colocating Simple Logic

Keep simple, localized logic inline (e.g. inline `switch` or a small policy object) so the reader can follow top-to-bottom without jumping to other files. Use this when the logic is short and used in one place.

```tsx
const policy = {
  admin: { canInvite: true, canView: true },
  viewer: { canInvite: false, canView: true },
}[user.role];
if (!policy) return null;
```

### Naming Complex Conditions

Assign complex boolean expressions to named variables so the intent is obvious. Use for conditions that are complex, reused, or worth unit testing; skip for trivial one-off checks.

```typescript
const isSameCategory = product.categories.some((c) => c.id === targetCategory.id);
const isPriceInRange = product.prices.some((p) => p >= minPrice && p <= maxPrice);
return isSameCategory && isPriceInRange;
```

---

## Predictability

### Standardizing Return Types

Use the same return shape for similar functions/hooks so callers can rely on a consistent contract.

- **API/query hooks**: Return the query object (e.g. `UseQueryResult<T, Error>`) instead of destructuring into ad-hoc shapes.
- **Validation**: Use a single result type, e.g. discriminated union `{ ok: true } | { ok: false; reason: string }`, so success vs failure is always handled the same way.

```typescript
type ValidationResult = { ok: true } | { ok: false; reason: string };

function checkIsNameValid(name: string): ValidationResult {
  if (name.length === 0) return { ok: false, reason: "Name cannot be empty." };
  return { ok: true };
}
```

### Single Responsibility (No Hidden Side Effects)

Functions should do only what their name and signature imply. Do not hide side effects (e.g. logging, navigation) inside functions that appear to only fetch or compute. Let the caller perform extra actions explicitly.

```typescript
async function fetchBalance(): Promise<number> {
  return await http.get<number>("...");
}

async function handleUpdateClick() {
  const balance = await fetchBalance();
  logging.log("balance_fetched");
  await syncBalance(balance);
}
```

### Unique, Descriptive Names

Use distinct, descriptive names for wrappers and helpers so behavior is clear from the name (e.g. `httpService.getWithAuth` instead of overloading a generic `get`). Avoid names that could be confused with standard or library APIs.

---

## Cohesion

### Form Cohesion

Choose field-level vs form-level cohesion based on needs:

- **Field-level**: Each field has its own validation (e.g. per-field `validate` in react-hook-form). Use for independent fields, async checks, or reusable field logic.
- **Form-level**: One schema or validator for the whole form (e.g. Zod + `zodResolver`). Use when fields are related, for wizards, or when validation depends on multiple fields.

### Organizing by Feature/Domain

Structure directories by feature/domain, not only by type. Keep components, hooks, and types for a feature together (e.g. `domains/user/`, `domains/product/`) so the codebase is easier to understand and change.

```
src/
├── components/
├── hooks/
├── utils/
├── domains/
│   ├── user/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── product/
│   └── order/
```

### Relating Constants to Logic

Define constants near the logic that uses them, or give them names that clearly tie them to that logic (e.g. `ANIMATION_DELAY_MS` next to animation timing). Reduces the risk of changing logic without updating the constant.

---

## Coupling

### Avoiding Premature Abstraction

Do not abstract duplicate code too early if the use cases might diverge. Keeping a bit of duplication can avoid coupling multiple call sites to one abstraction that later needs special cases. Prefer lower coupling when the future is uncertain.

### Scoping State (Focused Hooks)

Split broad state into smaller, focused hooks or contexts. Components should depend only on the state they need. This reduces coupling and avoids unnecessary re-renders.

```typescript
export function useCardIdQueryParam() {
  const [cardIdParam, setCardIdParam] = useQueryParam("cardId", NumberParam);
  const setCardId = useCallback(
    (newCardId: number | undefined) => setCardIdParam(newCardId, "replaceIn"),
    [setCardIdParam]
  );
  return [cardIdParam ?? undefined, setCardId] as const;
}
```

### Composition Over Props Drilling

Prefer composition: render children where they are needed and pass props directly, instead of threading many props through intermediate components. This keeps the tree flatter and data flow obvious, and makes refactors easier.

```tsx
<Modal open={open} onClose={onClose}>
  <Input value={keyword} onChange={...} />
  <ItemEditList keyword={keyword} items={items} onConfirm={onConfirm} />
</Modal>
```

---

## Summary

| Area | Focus |
|------|--------|
| **Readability** | Named constants, abstracted complexity, separated conditionals, simple ternaries, colocated simple logic, named complex conditions |
| **Predictability** | Consistent return types, no hidden side effects, clear naming |
| **Cohesion** | Form cohesion (field vs form), feature/domain structure, constants tied to logic |
| **Coupling** | Avoid premature abstraction, focused hooks, composition over props drilling |

For full patterns and examples, see [reference.md](reference.md).
