# Informe de auditoría pre-PR — `chore/cleanup-backlog`

## Agentes recomendados

Para este PR solo hay cambios de documentación (sin código). Recomiendo únicamente:

| Agente | Justificación |
|--------|--------------|
| `review` | Verifica que el backlog nuevo sea coherente y completo. Sin código que auditar con `security-review` ni `simplify`. |

---

## Cambios en el branch

| Archivo | Acción |
|---------|--------|
| `docs/pm-instructions.md` | Eliminado — contenido movido al system prompt del agente PM |
| `docs/backlog.md` | Reescrito — eliminados items ya entregados, agregados bloqueantes y sección "branches en limbo" |

---

## Branches obsoletos borrados

### Borrados local + remoto (PR mergeado en GitHub)
- `feat/newsletter` (PR #15)
- `feat/resend-emails` (PR #14)
- `feat/legal-pages` (PR #13)
- `feat/secure-checkout-badge` (PR #19)
- `feat/email-testing-banner` (PR #21)
- `feat/seo` (PR #17)
- `fix/coderabbit-followup` (PR #20)
- `fix/footer-newsletter-draft-filter` (PR #18)
- `fix/youtube-embed-v2` (PR #10)
- `feature/addons-and-code-review-fixes` (PR #1)

### Borrado solo local (no existía en remoto)
- `feat/rate-limiting` (PR #16) — ya había sido borrado del remoto previamente

### NO borrado — sin PR mergeado
- `fix/youtube-embed` — no tiene PR mergeado en GitHub (fue reemplazado por `fix/youtube-embed-v2`). Queda en limbo. Recomendación: borrar manualmente si el trabajo fue absorbido por `fix/youtube-embed-v2`.

### NO tocados por instrucción del PM
- `feat/admin-improvements`
- `feat/homepage-ambient-image`
- `feat/color-selector`
- `feat/guest-checkout`
- `chore/security-tooling`

> ⚠️ Nota: estos 5 branches tienen PRs mergeados en GitHub (#22, #12, #11, #2 respectivamente, excepto `feat/admin-improvements`). El PM los marcó como "en limbo" asumiendo que no tenían PR — conviene revisarlos en la próxima sesión.

---

## Hallazgos del agente `review`

*Pendiente de ejecución — esperando confirmación del PM.*

---

## Próximo paso

El PM revisa este informe y prepara `docs/prompts/fix-chore-cleanup-backlog.md` con las correcciones a aplicar (si las hay) antes de crear el PR.
