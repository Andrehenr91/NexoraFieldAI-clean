---
name: Registration Flow Architecture
description: How the dual (Empresa/Técnico) registration flow is structured and wired.
---

## Rule
SelfServiceRegister renders a type-selector screen first (accountType === null). Company flow has 6 steps (Empresa → Usuário → Verificação → Plano → Pagamento → Pronto). Technician flow has 6 steps (Dados Pessoais → Especialidades → Dados Bancários → Verificação → Termos → Pronto).

**Why:** Previously only company registration existed; technicians had no self-registration path.

## How to apply
- `onSuccess` callback receives `{ type: 'company' | 'tech', user, company?, plan }`.
- In `App.tsx`: if `type === 'tech'`, call `handleAddTechnician(newTech as any)`, `setRole('tech')`, `setAppView('app')` — skip OnboardingWizard entirely.
- If `type === 'company'`, store in `onboardingData` and go to OnboardingWizard as before.
- LandingPage hero and final CTA both have dual buttons (Empresa / Técnico) leading to the same `/register` route (type selector handles routing inside).
