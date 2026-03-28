# Database and Data Schema

## Scope

The current application is frontend-only and stores state in browser `localStorage` plus CSV datasets.  
This document records:
- current local storage schema,
- CSV field schema,
- backend-ready SQL schema mapping for future integration.

## Current local storage schema

### `frauda_auth`

Auth session state.

```json
{
  "isAuthenticated": true,
  "username": "test",
  "email": "test@frauda.lv"
}
```

### `frauda_theme`

Theme mode:
- `"light"` or `"dark"`

### `frauda_lang`

UI language:
- `"lv"`, `"en"`, `"ru"`

### `frauda_onboarded`

First-time onboarding completion flag:
- `"1"` when completed

### `frauda_shield_seen`

Shield reveal first-visit animation flag:
- `"1"` when already shown

### `frauda_users`

Mock registered users (frontend only).

```json
[
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "created": "ISO datetime"
  }
]
```

### `frauda_profiles`

Profile records keyed by normalized username/email.

```json
{
  "test@frauda.lv": {
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "age": "string",
    "profile_completed": true,
    "updated_at": "ISO datetime"
  }
}
```

### `frauda_reports`

Local verification report history.

```json
[
  {
    "id": "rep_<...>",
    "created_at": "ISO datetime",
    "user_id": "string",
    "input": {
      "_summary": "string",
      "channel": "text|voice|...",
      "status_risk": "red|yellow|green",
      "message_text": "string",
      "transcription": "string"
    },
    "status": "in work|success|fail",
    "summary": "string"
  }
]
```

### `scenarios_test`

User-submitted testing entries (separate store, backend placeholder).

```json
[
  {
    "id": "test_<...>",
    "created_at": "ISO datetime",
    "user_id": "string",
    "type": "text|voice",
    "text_message": "string",
    "voice_file_name": "string",
    "source": "user",
    "status": "in work"
  }
]
```

## CSV schemas

### `data/scenarios.csv`

Columns:
- `id`
- `timestamp`
- `duration_seconds`
- `type`
- `channel`
- `score`
- `risk`
- `risk_label`
- `caller`
- `caller_origin`
- `lang`
- `age`
- `gender`
- `occupation`
- `fraud_type`
- `institution_impersonated`
- `summary`
- `indicators`
- `transcript_key`
- `transcript_text`

### `data/dashboard_graph.csv`

Columns:
- `id`
- `source_id`
- `timestamp`
- `date`
- `hour`
- `type`
- `channel`
- `score`
- `risk`
- `risk_label`
- `caller_origin`
- `lang`
- `age`
- `age_group`
- `gender`
- `occupation`
- `fraud_type`
- `summary`
- `indicators`
- `indicator_labels`
- `transcript_text`

## Backend table mapping (field names aligned to current frontend payloads)

No SQL schema is implemented in this repository yet.  
For backend integration, table columns should preserve current frontend field names.

### Table: `users`

Derived from `frauda_users` entries:
- `name`
- `email`
- `password`
- `created`

### Table: `user_profiles`

Derived from `frauda_profiles` entries:
- `full_name`
- `email`
- `phone`
- `age`
- `profile_completed`
- `updated_at`

### Table: `reports`

Derived from `frauda_reports` entries:
- `id`
- `created_at`
- `user_id`
- `input`
- `status`
- `summary`

### Table: `scammer_reports`

Derived from verify page submission payload:
- `scammer_identifier`
- `additional_information`
- `incident_datetime`

### Table: `test_submissions`

Derived from `scenarios_test` entries:
- `id`
- `created_at`
- `user_id`
- `type`
- `text_message`
- `voice_file_name`
- `source`
- `status`

## Onboarding data fields (required in current UX)

During first-time registration onboarding, frontend currently collects:
- `full_name`
- `email`
- `phone`
- `age`

These fields map directly to `user_profiles`.

## Scammer report fields (required in current UX)

Current scammer reporting flow sends:
- `scammer_identifier`
- `additional_information`
- `incident_datetime`

These fields map directly to `scammer_reports`.
