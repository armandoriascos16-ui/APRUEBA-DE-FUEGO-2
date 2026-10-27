# Security Spec - A Prueba de Fuego Firestore Rules

## 1. Data Invariants
- Users can only read public profiles.
- A user can only create or update their own user profile document where document ID == `request.auth.uid`.
- Users cannot escalate their own role to `superadmin` or `admin` unless already an admin.
- Points cannot be arbitrarily self-awarded without verified identity.

## 2. Payloads (Dirty Dozen)
1. Write to someone else's user document (`/users/otherUser`). Expected: PERMISSION_DENIED.
2. Unauthenticated write to `/users/{userId}`. Expected: PERMISSION_DENIED.
3. Setting role to 'superadmin' by a regular user during creation. Expected: PERMISSION_DENIED.
4. Injecting oversized ID or string > 1000 characters. Expected: PERMISSION_DENIED.
