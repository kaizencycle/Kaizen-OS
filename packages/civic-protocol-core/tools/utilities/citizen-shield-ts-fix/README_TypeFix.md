# Citizen Shield TypeScript Fix Pack

Drop these files into your `frontend/citizen-shield-app/` root.

## Files
- `tsconfig.json` — enables JSX + includes `vite/client` types.
- `src/vite-env.d.ts` — declares `import.meta.env` (VITE_* vars).

## Steps

1) Copy files:
```
cp tsconfig.json <repo>/lab6-proof/frontend/citizen-shield-app/tsconfig.json
cp src/vite-env.d.ts <repo>/lab6-proof/frontend/citizen-shield-app/src/vite-env.d.ts
```

2) Ensure deps are present (from `frontend/citizen-shield-app`):
```
npm install react react-dom
npm install -D typescript @types/react @types/react-dom @types/node vite-tsconfig-paths
```

3) Build locally:
```
npm run build
```

4) Commit & push, then redeploy on Render.
