# Cleanup TODO

Data that the app currently *orphans* - i.e. removes the database row but leaves
external state behind. Each item should eventually be swept by a tidy script
(probably a `node-cron` job on the worker, alongside the expired-transfer
cleanup that already runs there).

None of these are blocking. They're documented so we don't quietly accumulate
storage costs or stale state.

## Known orphans

### Transfer files on the node server / R2

When a Transfer document is deleted, we fire `workerTransferDelete` but do
**not** await it - see [`api/transfer/[transferId]/delete/route.js`](next/src/app/api/transfer/[transferId]/delete/route.js)
("we assume the deletion succeeds. We can always delete left over files with a
tidy script later"). Account deletion (`DELETE /api/user`) does the same.

If the node-side call fails (network blip, node down, worker down) we end up
with R2 objects that have no DB row pointing at them. Tidy: list R2 prefixes,
diff against `Transfer._id`s.

### Brand profile icons and backgrounds in R2

`BrandProfile` has `iconUrl` and `backgroundUrl` pointing at uploaded assets
in R2. When a brand profile is deleted (either via the user-facing endpoint
or as part of account deletion in `DELETE /api/user`), the DB row goes but
the R2 objects stay. Tidy: enumerate R2 brand-profile prefix, drop anything
not referenced by a current `BrandProfile.iconUrl`/`backgroundUrl`.

### Stale `Team` documents with `pendingOwner` set

If a user starts the team-checkout flow on Stripe but never completes the
payment, the `Team` document we created with `pendingOwner: user._id` is
never cleaned up. Account deletion does **not** touch these (we'd risk
deleting a team mid-checkout). Tidy: delete `Team` rows with `pendingOwner`
set, no `users`, and `createdAt` older than a few days.

### `SentEmail` log retention

The `SentEmail` collection grows indefinitely. It's useful for debugging
but contains recipient addresses, so it has both a storage cost and a small
privacy cost. Tidy: a TTL index (e.g. 90 days) or a scheduled purge.

### `Error` log retention

Same shape as `SentEmail` - useful for debugging, accumulates forever. May
contain request context that's effectively PII (email addresses surfaced in
error messages, etc.). Same fix: TTL index or scheduled purge.
