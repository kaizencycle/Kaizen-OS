#!/usr/bin/env node
/**
 * scripts/generate_openapi_from_oaa.js
 * Minimal placeholder: converts /oaa/<id>.oaa (YAML/JSON) into /apis/<id>/openapi.yaml
 * Real codegen should be done by your agent (parse.bot). This keeps CI simple.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }

function toOpenAPI(id, capsule){
  const title = (capsule.title || `${id} API`).trim();
  return `openapi: 3.0.3
info:
  title: ${title}
  version: "1.0.0"
servers:
  - url: https://api.example.com/${id}
paths:
  /echo:
    post:
      summary: Echo text
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
      responses:
        '200':
          description: Ok
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }
components:
  securitySchemes:
    HmacAuth:
      type: http
      scheme: bearer
      bearerFormat: HMAC-SHA256
`;
}

function main(){
  const root = process.cwd();
  const oaaDir = path.join(root, 'oaa');
  const apisDir = path.join(root, 'apis');

  const files = fs.readdirSync(oaaDir).filter(f => f.endsWith('.oaa'));
  files.forEach(file => {
    const id = path.basename(file, '.oaa');
    const raw = fs.readFileSync(path.join(oaaDir, file), 'utf8');
    let capsule;
    try { capsule = yaml.load(raw); } catch { try { capsule = JSON.parse(raw); } catch(e) { capsule = { id }; } }
    const spec = toOpenAPI(id, capsule || {});
    const outDir = path.join(apisDir, id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'openapi.yaml'), spec, 'utf8');
    console.log(`[gen] wrote apis/${id}/openapi.yaml`);
  });
}

if (require.main === module) main();

