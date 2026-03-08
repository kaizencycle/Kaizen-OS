# Testing Strategy & Coverage

**Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**Status:** Implementation in Progress

---

## Executive Summary

Mobius Systems implements a comprehensive testing strategy covering unit, integration, end-to-end, and property-based testing. The goal is to achieve **>80% code coverage** with emphasis on critical paths (consensus, integrity verification, cryptographic operations).

**Current Status:**
- ✅ Test infrastructure: Configured
- ✅ Unit tests: Partial coverage
- ⚠️ Integration tests: In progress
- ⚠️ E2E tests: Planned
- ⚠️ Coverage reporting: Needs implementation

---

## 1. Testing Philosophy

### 1.1 Testing Principles

1. **Test-Driven Development (TDD):** Write tests before implementation for critical features
2. **High Coverage:** Aim for >80% code coverage, 100% for critical paths
3. **Fast Feedback:** Unit tests must run in <5 seconds
4. **Deterministic:** All tests must be deterministic and reproducible
5. **Isolation:** Tests must not depend on external services (use mocks)

### 1.2 Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          (10% - Critical user flows)
                 /--------\
                /          \
               / Integration \      (20% - Service interactions)
              /--------------\
             /                \
            /     Unit Tests    \   (70% - Individual functions)
           /--------------------\
```

### 1.3 Integrity Gate Alignment

- Every PR must pass the integrity gate (`npm run integrity:check`); failures block merges.
- Test suites must provide telemetry for MII subscores (particularly `s_test` and `s_sec`).
- New or flaky tests require sentinel sign-off (Zeus + owning sentinel) if they risk lowering MII.
- Integrity regression tests live in `tests/integrity/` and must remain additive.

---

## 2. Testing Frameworks

### 2.1 TypeScript/JavaScript

- **Unit Testing:** Jest or Vitest
- **Integration Testing:** Supertest (for APIs)
- **E2E Testing:** Playwright or Cypress
- **Property-Based Testing:** fast-check (for critical algorithms)
- **Coverage:** Istanbul (nyc) or Vitest coverage

### 2.2 Python

- **Unit Testing:** pytest
- **Integration Testing:** pytest with fixtures
- **Mocking:** unittest.mock or pytest-mock
- **Coverage:** pytest-cov
- **Property-Based Testing:** Hypothesis

### 2.3 Configuration

**Jest/Vitest Config:**
```json
{
  "testMatch": ["**/__tests__/**/*.test.ts", "**/*.spec.ts"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

**pytest Config (pytest.ini):**
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=src --cov-report=html --cov-report=term
```

---

## 3. Test Structure

### 3.1 Directory Organization

```
workspace/
├── src/                    # Source code
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   │   ├── __tests__/      # Jest/Vitest tests
│   │   └── test_*.py       # pytest tests
│   ├── integration/        # Integration tests
│   │   ├── /api/            # API integration tests
│   │   └── services/       # Service integration tests
│   ├── e2e/                # End-to-end tests
│   │   ├── flows/          # User flow tests
│   │   └── scenarios/      # Scenario tests
│   ├── fixtures/           # Test data and fixtures
│   └── mocks/              # Mock implementations
└── coverage/               # Coverage reports
```

### 3.2 Naming Conventions

- **Unit Tests:** `*.test.ts`, `*.test.tsx`, `test_*.py`
- **Integration Tests:** `*.integration.test.ts`, `test_integration_*.py`
- **E2E Tests:** `*.e2e.test.ts`, `test_e2e_*.py`
- **Fixtures:** `fixtures/*.json`, `fixtures/*.yaml`

---

## 4. Unit Testing

### 4.1 Coverage Requirements

- **Critical Paths:** 100% coverage (MII calculation, cryptographic operations, consensus)
- **Business Logic:** >90% coverage
- **Utilities:** >80% coverage
- **Overall:** >80% coverage

### 4.2 Example Unit Tests

**TypeScript Example:**
```typescript
// src/integrity/mii-calculator.test.ts
import { calculateMII } from './mii-calculator';

describe('MII Calculator', () => {
  it('should calculate MII correctly with valid inputs', () => {
    const state = {
      technical: 0.95,
      moral: 0.90,
      civic: 0.92,
      security: 0.88,
      antiGaming: 0.02
    };
    
    const mii = calculateMII(state);
    expect(mii).toBeGreaterThanOrEqual(0.95);
  });

  it('should reject invalid state (MII < 0.95)', () => {
    const state = {
      technical: 0.80,
      moral: 0.75,
      civic: 0.70,
      security: 0.65,
      antiGaming: 0.10
    };
    
    const mii = calculateMII(state);
    expect(mii).toBeLessThan(0.95);
  });
});
```

**Python Example:**
```python
# tests/unit/test_mii_calculator.py
import pytest
from src.integrity.mii_calculator import calculate_mii

def test_mii_calculation_valid():
    """Test MII calculation with valid inputs"""
    state = {
        'technical': 0.95,
        'moral': 0.90,
        'civic': 0.92,
        'security': 0.88,
        'anti_gaming': 0.02
    }
    
    mii = calculate_mii(state)
    assert mii >= 0.95

def test_mii_calculation_invalid():
    """Test MII calculation with invalid inputs"""
    state = {
        'technical': 0.80,
        'moral': 0.75,
        'civic': 0.70,
        'security': 0.65,
        'anti_gaming': 0.10
    }
    
    mii = calculate_mii(state)
    assert mii < 0.95
```

---

## 5. Integration Testing

### 5.1 API Integration Tests

**Example:**
```typescript
// tests/integration/api/ledger-api.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Ledger API Integration', () => {
  it('should create and retrieve attestation', async () => {
    const attestation = {
      ts: new Date().toISOString(),
      nonce: 'test-nonce',
      repo: 'test-repo',
      commit: 'test-commit',
      subscores: { T: 0.95, M: 0.90, C: 0.92, S: 0.88 },
      weights: { alpha: 0.35, beta: 0.25, gamma: 0.25, delta: 0.15 },
      mii_raw: 0.96,
      mii_smooth: 0.96
    };

    // Create attestation
    const createRes = await request(app)
      .post('/api/integrity/attest')
      .send(attestation)
      .expect(201);

    const id = createRes.body.id;

    // Retrieve attestation
    const getRes = await request(app)
      .get(`/api/integrity/attest/${id}`)
      .expect(200);

    expect(getRes.body.mii_smooth).toBe(0.96);
  });
});
```

### 5.2 Service Integration Tests

**Example:**
```python
# tests/integration/test_deliberation_flow.py
import pytest
from labs.lab2_thought_broker import ThoughtBroker
from labs.lab7_oaa_hub import OAAHub

@pytest.fixture
def broker():
    return ThoughtBroker()

@pytest.fixture
def hub():
    return OAAHub()

def test_complete_deliberation_flow(broker, hub):
    """Test complete deliberation flow from intent to consensus"""
    # Parse intent via OAA Hub
    intent = hub.parse_intent("Create a new feature X")
    
    # Create deliberation via Thought Broker
    deliberation = broker.create_deliberation(intent)
    
    # Poll for consensus (max 3 minutes)
    consensus = broker.wait_for_consensus(deliberation.id, timeout=180)
    
    # Verify constitutional validation (GI ≥ 0.95)
    assert consensus.gi_score >= 0.95
    
    # Verify DelibProof sealed to Civic Ledger
    assert consensus.delib_proof is not None
    assert consensus.delib_proof.signature is not None
```

---

## 6. End-to-End Testing

### 6.1 E2E Test Scenarios

1. **Complete Deliberation Flow**
   - User submits intent
   - OAA Hub parses intent
   - Thought Broker creates deliberation
   - Multi-LLM consensus achieved
   - DelibProof generated and sealed
   - Reflection logged to E.O.M.M.

2. **GI Score Calculation**
   - Submit action to Ledger API
   - Calculate GI score with 7-clause breakdown
   - Verify constitutional compliance
   - Check threshold enforcement

3. **Security Validation**
   - Test valid content (should pass)
   - Test malicious content (should block)
   - Verify XSS detection
   - Check security logs

4. **Rate Limiting**
   - Make requests within limit (should succeed)
   - Exceed rate limit (should return 429)
   - Verify rate limit enforcement

### 6.2 Playwright E2E Example

```typescript
// tests/e2e/flows/deliberation-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete deliberation flow', async ({ page }) => {
  // Navigate to OAA Hub
  await page.goto('http://localhost:3004');
  
  // Submit intent
  await page.fill('[data-testid="intent-input"]', 'Create feature X');
  await page.click('[data-testid="submit-intent"]');
  
  // Wait for deliberation to be created
  await page.waitForSelector('[data-testid="deliberation-status"]');
  
  // Wait for consensus (max 3 minutes)
  await page.waitForSelector('[data-testid="consensus-achieved"]', {
    timeout: 180000
  });
  
  // Verify GI score
  const giScore = await page.textContent('[data-testid="gi-score"]');
  expect(parseFloat(giScore)).toBeGreaterThanOrEqual(0.95);
  
  // Verify DelibProof
  const delibProof = await page.textContent('[data-testid="delib-proof"]');
  expect(delibProof).toBeTruthy();
});
```

---

## 7. Property-Based Testing

### 7.1 Critical Algorithms

Use property-based testing for:
- MII calculation (mathematical properties)
- Cryptographic operations (signature verification)
- Consensus algorithm (safety and liveness)
- Integrity verification (invariants)

### 7.2 Example (fast-check)

```typescript
// tests/property/mii-properties.test.ts
import fc from 'fast-check';
import { calculateMII } from '../../src/integrity/mii-calculator';

describe('MII Properties', () => {
  it('should always return value in [0, 1]', () => {
    fc.assert(
      fc.property(
        fc.record({
          technical: fc.float({ min: 0, max: 1 }),
          moral: fc.float({ min: 0, max: 1 }),
          civic: fc.float({ min: 0, max: 1 }),
          security: fc.float({ min: 0, max: 1 }),
          antiGaming: fc.float({ min: 0, max: 0.2 })
        }),
        (state) => {
          const mii = calculateMII(state);
          return mii >= 0 && mii <= 1;
        }
      )
    );
  });
});
```

---

## 8. Performance Testing

### 8.1 Load Testing

**Targets:**
- Throughput: 1,000 concurrent requests (target: 100+ req/s)
- Latency: 100 requests (target: p95 < 500ms)
- Memory: No memory leaks over 1 hour
- CPU: < 80% CPU usage under load

### 8.2 Tools

- **Load Testing:** k6, Apache JMeter
- **Profiling:** Node.js profiler, Python cProfile
- **Memory Analysis:** Chrome DevTools, Python memory_profiler

---

## 9. Security Testing

### 9.1 Security Test Categories

1. **Vulnerability Scanning:** OWASP ZAP, Snyk
2. **Dependency Scanning:** npm audit, pip-audit
3. **Secret Scanning:** GitGuardian, truffleHog
4. **Penetration Testing:** Manual security audits

### 9.2 Security Test Examples

```python
# tests/security/test_xss_protection.py
def test_xss_protection():
    """Test XSS protection in API endpoints"""
    malicious_payload = '<script>alert("XSS")</script>'
    
    response = client.post('/api/reflection', json={
        'content': malicious_payload
    })
    
    # Should sanitize or reject
    assert response.status_code in [400, 422]
    assert 'script' not in response.text.lower()
```

---

## 10. Test Execution

### 10.1 Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/unit/mii-calculator.test.ts

# Run Python tests
pytest tests/
pytest tests/unit/
pytest tests/integration/
pytest --cov=src tests/
```

### 10.2 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: pytest tests/
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 11. Coverage Reporting

### 11.1 Coverage Goals

- **Overall:** >80%
- **Critical Paths:** 100%
- **Business Logic:** >90%
- **Utilities:** >80%

### 11.2 Coverage Reports

- **HTML Reports:** `coverage/index.html`
- **Terminal Output:** Summary in CI logs
- **Badge:** Coverage badge in README

---

## 12. Test Data Management

### 12.1 Fixtures

- Store test data in `tests/fixtures/`
- Use JSON/YAML for structured data
- Keep fixtures versioned and documented

### 12.2 Mocking

- Mock external services (APIs, databases)
- Use dependency injection for testability
- Keep mocks in `tests/mocks/`

---

## 13. Continuous Improvement

### 13.1 Test Metrics

- Test coverage percentage
- Test execution time
- Flaky test rate
- Test failure rate

### 13.2 Regular Reviews

- Monthly test coverage review
- Quarterly test strategy review
- Annual test framework evaluation

---

## 14. References

- [Architecture Documentation](./ARCHITECTURE.md)
- [Performance Benchmarks](../root-docs/PERFORMANCE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [MII Specification](./specs/mii_spec_v1.md)

---

**Document Status:** ✅ Complete  
**Last Reviewed:** 2025-11-10  
**Next Review:** 2026-01-10
