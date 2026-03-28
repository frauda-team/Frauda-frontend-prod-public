# Frauda — Manual Test Cases

## Scope

These tests validate the current frontend-only product behavior (SPA-first):
- onboarding and theme persistence,
- mock authentication,
- schema-based validation,
- report history behavior,
- user test submissions (`scenarios_test`),
- dashboard deterministic rendering from CSV datasets.

---

## TC-01 — First-time onboarding flow

**Precondition:** Remove `frauda_onboarded` from localStorage.

**Steps:**
1. Open `/` (served `index.html`).
2. Confirm onboarding modal appears.
3. Click **Get started**.
4. Refresh page.

**Expected:**
- Modal appears only before first completion.
- After click, modal closes and does not reappear after refresh.

---

## TC-02 — Dark mode persistence

**Steps:**
1. On `/`, click theme toggle.
2. Refresh `/`.
3. Navigate to `#/dashboard`.

**Expected:**
- Theme switches immediately.
- Same theme is preserved after refresh and across pages.
- Text remains readable (no low-contrast sections).

---

## TC-03 — Mock auth success

**Steps:**
1. Trigger login (from report history gate or first submission attempt).
2. Enter `test` / `test`.
3. Submit.

**Expected:**
- Login succeeds.
- User label in navbar changes from `guest` to `test`.
- Logout button becomes visible.

---

## TC-04 — Mock auth failure

**Steps:**
1. Open login modal.
2. Enter invalid credentials.
3. Submit.

**Expected:**
- Auth error message shown.
- Modal remains open.
- User stays unauthenticated.

---

## TC-05 — Logout behavior

**Steps:**
1. Ensure user is logged in.
2. Click **Logout**.

**Expected:**
- Auth state resets to unauthenticated.
- Navbar user returns to `guest`.
- Protected report history shows auth gate again.

---

## TC-06 — Request schema validation blocks analysis

**Steps:**
1. Leave request fields empty.
2. Click **Add text message**.

**Expected:**
- Inline field errors are displayed.
- Action-level warning is shown.
- Analysis flow does not start.

---

## TC-07 — Request schema validation passes

**Steps:**
1. Fill form with valid data:
   - Full name (>=3 chars)
   - Valid email
   - Valid phone
   - Age 18–100
   - Channel selected
   - Context >=12 chars
2. Click **Add text message**.

**Expected:**
- No validation errors.
- If not authenticated, login is required first.
- After auth, analysis begins and completes normally.

---

## TC-08 — Report creation and status transition

**Precondition:** Valid request form and authenticated user.

**Steps:**
1. Submit analysis (text or voice).
2. Open report history section.
3. Wait ~2–3 seconds.

**Expected:**
- New report appears instantly with status `in work`.
- Status transitions to `success` or `fail`.
- Report includes timestamp and generated ID.

---

## TC-09 — Report history filter

**Steps:**
1. In report history, change filter to each status (`all`, `in work`, `success`, `fail`).

**Expected:**
- List updates correctly for selected status.
- Empty-state card appears when no records match.

---

## TC-10 — User text submission to `scenarios_test`

**Precondition:** Authenticated user.

**Steps:**
1. In **User scam submission (testing)** section, choose **Text message**.
2. Enter text >= 6 chars.
3. Save.

**Expected:**
- Success message shown with generated ID.
- New row appears in submissions list.
- Entry is stored in `localStorage['scenarios_test']` with:
  - `type = "text"`
  - `text_message` filled
  - `status = "in work"`

---

## TC-11 — User voice submission (`.mp4` filename) to `scenarios_test`

**Precondition:** Authenticated user.

**Steps:**
1. Switch submission type to **Voice message (mp4)**.
2. Enter invalid filename (e.g. `audio.wav`) and save.
3. Enter valid filename (e.g. `call_001.mp4`) and save.

**Expected:**
- Invalid case shows inline validation error.
- Valid case saves successfully.
- Stored entry contains `voice_file_name` only (no speech-to-text processing).

---

## TC-12 — Dashboard deterministic data behavior

**Steps:**
1. Open `#/dashboard`.
2. Note KPI values.
3. Click **Refresh** repeatedly without changing filters.

**Expected:**
- KPI/chart values remain deterministic for same filters.
- No random value drift between refreshes.

---

## TC-13 — Dashboard total with default filters

**Steps:**
1. Open `#/dashboard` with all filters set to default.

**Expected:**
- Total suspicious reflects full dataset count, not latest date only.
- Current expected value from dataset: `25`.

---

## TC-14 — Offline i18n behavior

**Steps:**
1. Toggle language between LV/EN/RU.
2. Observe static UI labels and dynamic labels (alerts, statuses, metadata text).

**Expected:**
- UI labels switch LV/EN offline (no Google Translate dependency).
- Current RU dictionary mirrors EN copy and should still re-render correctly.
- Message transcript/source content remains unaltered.

---

## TC-15 — Local server startup recovery

**Steps:**
1. Start one server on `8080`.
2. Attempt to start another on same port.

**Expected:**
- Second process fails with `Address already in use` (expected).
- Recovery path works:
  - find PID (`ss -ltnp | grep :8080`)
  - kill PID
  - restart server successfully.
