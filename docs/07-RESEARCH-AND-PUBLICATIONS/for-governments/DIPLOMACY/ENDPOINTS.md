# Diplomacy Cathedral — API Endpoints

**Version**: C-156  
**Cathedral**: DIPLOMACY  
**Base URL**: `https://terminal.mobius-substrate.com/diplomacy`

---

## Overview

The Diplomacy Cathedral provides access to international relations documentation, treaty frameworks, and diplomatic protocols for government officials, international organizations, and policy makers.

**Full API Specification**: [endpoints.json](./endpoints.json)

---

## Endpoints

### 1. Treaty Framework

**Endpoint**: `GET /treaty-framework.json`

**Description**: Complete treaty framework documentation including international agreements, protocols, and diplomatic standards.

**Format**: JSON

**Authentication**: Not required (public)

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/diplomacy/treaty-framework.json
```

---

### 2. International Standards

**Endpoint**: `GET /standards.json`

**Description**: International integrity standards and compliance frameworks.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/diplomacy/standards.json
```

---

### 3. Diplomatic Protocols

**Endpoint**: `GET /protocols.json`

**Description**: Diplomatic protocols and engagement guidelines.

**Format**: JSON

**Example Request**:
```bash
curl https://terminal.mobius-substrate.com/diplomacy/protocols.json
```

---

## Related Documentation

- [Diplomacy Cathedral Overview](./README.md)
- [MIC Integrity Standard Whitepaper](./MIC_INTEGRITY_STANDARD_WHITEPAPER.md)
- [Complete API Specification](./endpoints.json)

---

**Mobius Systems Foundation** • Cycle C-156 • Diplomacy Cathedral
