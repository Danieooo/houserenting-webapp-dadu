# Tenant Contact Flexibility & Zalo Notification Design

## Context

The current tenant flow assumes `phone` is always required and the Zalo notification action depends entirely on that field. Real usage has shown this is too rigid: some tenants do not share their phone number directly with the landlord and only connect through Zalo.

This design updates the contact model so tenant communication can still work when no phone number is stored, while also documenting the practical limitation that a web application cannot reliably prefill and send a Zalo message automatically.

## Goals

- Allow creating and editing a tenant without a phone number.
- Store a separate Zalo-specific contact hint that is independent from the tenant phone number.
- Keep the invoice notification modal useful even when no phone number exists.
- Reduce manual work for the landlord as much as browser and Zalo constraints realistically allow.

## Non-Goals

- No direct Zalo API integration.
- No promise that the app can inject message text into a Zalo chat window and send it automatically.
- No redesign of unrelated tenant/profile flows.

## Recommended Approach

Use two distinct tenant contact fields:

- `phone`: optional phone number for calling, SMS, and Zalo-by-phone deep link.
- `zaloContact`: optional free-form Zalo contact hint such as Zalo number, username, profile link, or a landlord-facing note to identify the correct account.

This keeps the model simple, matches real-world behavior, and avoids forcing landlords to misuse `phone` as a catch-all contact field.

## UX Behavior

### Tenant Create/Edit Form

- `phone` is optional.
- Add a new optional field `zaloContact`.
- Helper text explains that `zaloContact` may contain a Zalo number, username, profile link, or identifying note.

### Tenant Detail / Room Detail

- Display both `phone` and `zaloContact`.
- If one field is missing, the UI should not show empty placeholder noise.

### Invoice Notification Modal

- `Copy message` always remains available.
- `Send via Zalo` behavior:
  - If `phone` exists: copy the prepared message, then open `https://zalo.me/<phone>`.
  - If `phone` is empty but `zaloContact` exists: copy the prepared message and prominently show `zaloContact` so the landlord can locate the correct chat manually.
  - If neither field exists: disable the direct Zalo open action and explain why.
- Rename or clarify the action label if needed so the UI does not imply full automation that Zalo does not support.

## Technical Constraints

- Browser-based Zalo flows do not provide a stable public mechanism for pre-filling message text and sending it automatically in the recipient chat.
- The reliable fallback is:
  - copy message to clipboard,
  - open the Zalo conversation when a phone number exists,
  - otherwise surface the saved `zaloContact` metadata clearly for manual targeting.

## Data Model Changes

Recommended tenant schema direction:

```prisma
model Tenant {
  id          Int      @id @default(autoincrement())
  name        String
  phone       String   @default("")
  zaloContact String   @default("")
  idCard      String?
  roomId      Int
  moveInDate  DateTime
  moveOutDate DateTime?
  deposit     Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

This keeps the migration low-risk and aligns with the current project pattern of using empty strings for optional text settings.

## Validation Rules

- `name`, `roomId`, and `moveInDate` remain required.
- `phone` is optional; if provided, validate format and length.
- `zaloContact` is optional; trim whitespace and cap length to prevent abuse.
- Notification UI must branch on data presence instead of assuming `phone` exists.

## Error Handling

- The system should not block tenant creation when both `phone` and `zaloContact` are empty.
- The Zalo action should show a clear Vietnamese message when it cannot open a chat due to missing `phone`.
- SMS action should be disabled when `phone` is missing.

## Testing Impact

- Update tenant create/edit tests to allow empty `phone`.
- Add tests for:
  - tenant creation with no phone,
  - notification modal with `phone` only,
  - notification modal with `zaloContact` only,
  - notification modal with neither contact field,
  - SMS disabled state when no phone exists.

## Implementation Notes

- Backward compatibility is preserved for existing tenants that already have phone numbers.
- Existing notification copy behavior remains the primary cross-channel fallback.
- UI copy should explicitly say the message has been copied and may need to be pasted into Zalo manually.
