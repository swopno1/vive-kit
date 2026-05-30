# Palette's UX & Accessibility Journal

## 2026-05-29 - Form Label Association & Collapsible State
**Learning:** Found inputs and textareas in `ConversationInput.tsx` lacking proper `htmlFor` and `id` associations, causing accessibility auditing tools and screen readers to miss context. Collapsible CRM header lacked `aria-expanded` state.
**Action:** Associated all form fields with their respective labels using `id` and `htmlFor`, and added `aria-expanded` to the collapsible CRM button to improve screen reader feedback.
