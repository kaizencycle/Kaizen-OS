# C-292 Final Phase — Mirrored Env Sample Hardening

## Scope

This phase removes the mirrored Lab7 runtime-style OAA environment file from Mobius-Substrate and keeps only a safe example.

## Changes

- Removed `labs/lab7-proof/oaa.env`.
- Hardened `labs/lab7-proof/oaa.env.example` so it is clearly an example file.
- Removed credential-shaped Redis placeholder text from the example.
- Kept only replace-with placeholders for local operator setup.

## Operator guidance

Use:

```txt
labs/lab7-proof/oaa.env.example
```

as the template.

Create a local, untracked file:

```txt
.env
```

and place real values there.

## Canon

Example files may teach setup.
Runtime env files must not be committed.
Secrets belong in local env or deployment secret stores.

We heal as we walk.
