# Lab3: API Fabric Proof - Service Mesh

**Version:** 1.0.0
**Status:** SPECIFICATION
**Authors:** ATLAS(Alpha) Sentinel
**Date:** October 28, 2025

---

## 📋 EXECUTIVE SUMMARY

Lab3 implements the **API Fabric** - a unified service mesh that provides a single entry point to all Kaizen-OS services while handling routing, load balancing, circuit breaking, authentication, and observability.

**Core Innovation:** Instead of each lab implementing its own API layer, authentication, and monitoring, Lab3 provides a **centralized, intelligent gateway** that handles all cross-cutting concerns while maintaining lab autonomy.

**Key Features:**
- Unified REST + GraphQL + gRPC gateway
- Automatic service discovery and health checking
- Circuit breakers and graceful degradation
- API versioning without breaking changes
- Real-time WebSocket connections
- Constitutional validation at the API layer
- Distributed tracing and observability

---

## 🎯 SYSTEM ARCHITECTURE

### High-Level Components

```
┌──────────────────────────────────────────────────────────┐
│                   LAB3: API FABRIC PROOF                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ API Gateway                                     │    │
│  │ • REST API (OpenAPI)                            │    │
│  │ • GraphQL API (Schema-first)                    │    │
│  │ • gRPC API (Protocol Buffers)                   │    │
│  │ • WebSocket API (Real-time)                     │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Request Router                                  │    │
│  │ • Path-based routing                            │    │
│  │ • Header-based routing                          │    │
│  │ • Load balancing (round-robin, least-conn)      │    │
│  │ • API versioning (v1, v2, v3)                   │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Service Mesh                                    │    │
│  │ • Service registry (Consul/etcd)                │    │
│  │ • Health checking                               │    │
│  │ • Circuit breakers (Hystrix pattern)            │    │
│  │ • Retry logic with exponential backoff          │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Security Layer                                  │    │
│  │ • Authentication (JWT, OAuth2)                  │    │
│  │ • Authorization (RBAC, ABAC)                    │    │
│  │ • Rate limiting (token bucket)                  │    │
│  │ • DDoS protection                               │    │
│  └─────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Observability                                   │    │
│  │ • Distributed tracing (Jaeger)                  │    │
│  │ • Metrics (Prometheus)                          │    │
│  │ • Logging (structured JSON)                     │    │
│  │ • Health dashboard                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔬 COMPONENT SPECIFICATIONS

### 1. API Gateway

**Purpose:** Unified entry point supporting multiple API protocols.

**REST API Configuration:**
```yaml
rest_api:
  base_path: "/api/v1"
  formats: ["json", "xml"]
  max_request_size: "10MB"
  timeout: 30s

  endpoints:
    # Lab1 - Substrate
    - path: "/gi/score/{agent_id}"
      method: GET
      service: lab1
      port: 5001

    - path: "/ledger/blocks/{block_number}"
      method: GET
      service: lab1
      port: 5001

    # Lab2 - Thought Broker
    - path: "/deliberation/create"
      method: POST
      service: lab2
      port: 5002

    - path: "/consensus/{delib_id}"
      method: GET
      service: lab2
      port: 5002

    # Lab4 - E.O.M.M.
    - path: "/reflections"
      method: POST
      service: lab4
      port: 5004

    # Lab6 - Citizen Shield
    - path: "/security/validate"
      method: POST
      service: lab6
      port: 5006

    # Lab7 - OAA Hub
    - path: "/oaa/parse"
      method: POST
      service: lab7
      port: 5007
```

**GraphQL API Schema:**
```graphql
type Query {
  # Lab1 - Substrate
  giScore(agentId: ID!): GIScore!
  block(number: Int!): Block!
  transaction(txId: ID!): Transaction!

  # Lab2 - Thought Broker
  deliberation(id: ID!): Deliberation!
  consensus(id: ID!): Consensus!

  # Lab4 - E.O.M.M.
  reflections(agentId: ID!, limit: Int): [Reflection!]!

  # Lab6 - Citizen Shield
  securityStatus: SecurityStatus!

  # Lab7 - OAA Hub
  systemStatus: SystemStatus!
}

type Mutation {
  # Lab2 - Thought Broker
  createDeliberation(input: DeliberationInput!): Deliberation!

  # Lab4 - E.O.M.M.
  submitReflection(input: ReflectionInput!): Reflection!

  # Lab7 - OAA Hub
  parseIntent(intent: String!): ParsedIntent!
}

type Subscription {
  # Lab2 - Real-time deliberation updates
  deliberationUpdates(id: ID!): DeliberationUpdate!

  # Lab1 - New blocks
  newBlocks: Block!

  # Lab6 - Security alerts
  securityAlerts: SecurityAlert!
}

# Types
type GIScore {
  score: Float!
  breakdown: GIBreakdown!
  trend: Trend!
  thresholdMet: Boolean!
}

type Block {
  number: Int!
  timestamp: DateTime!
  transactions: [Transaction!]!
  merkleRoot: String!
  validator: String!
}

type Deliberation {
  id: ID!
  question: String!
  models: [String!]!
  status: DeliberationStatus!
  consensus: Consensus
  transcript: [Round!]!
}

enum DeliberationStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  TIMEOUT
  FAILED
}
```

**gRPC Service Definition:**
```protobuf
// lab3/api/kaizen.proto
syntax = "proto3";

package kaizen.api.v1;

// API Fabric Service
service APIFabric {
  // Lab1 - Substrate
  rpc GetGIScore(GetGIScoreRequest) returns (GIScore);
  rpc GetBlock(GetBlockRequest) returns (Block);
  rpc SubmitTransaction(Transaction) returns (TransactionReceipt);

  // Lab2 - Thought Broker
  rpc CreateDeliberation(CreateDeliberationRequest) returns (Deliberation);
  rpc StreamDeliberation(StreamDeliberationRequest) returns (stream DeliberationUpdate);

  // Lab4 - E.O.M.M.
  rpc SubmitReflection(Reflection) returns (ReflectionReceipt);
  rpc GetReflections(GetReflectionsRequest) returns (stream Reflection);

  // Lab7 - OAA Hub
  rpc ParseIntent(ParseIntentRequest) returns (ParsedIntent);
}

message GetGIScoreRequest {
  string agent_id = 1;
}

message GIScore {
  double score = 1;
  map<string, double> breakdown = 2;
  string trend = 3;
  bool threshold_met = 4;
}
```

---

### 2. Request Router

**Purpose:** Intelligent routing with load balancing and API versioning.

**Routing Logic:**
```python
class RequestRouter:
    def __init__(self, service_registry):
        self.registry = service_registry
        self.load_balancers = {}

    async def route(self, request):
        """
        Route request to appropriate service
        """
        # Extract routing metadata
        path = request.path
        version = self.extract_version(request)
        headers = request.headers

        # Determine target service
        service = self.match_service(path, version)
        if not service:
            raise ServiceNotFoundError(f"No service for path: {path}")

        # Get healthy instances
        instances = await self.registry.get_healthy_instances(service)
        if not instances:
            raise ServiceUnavailableError(f"No healthy instances: {service}")

        # Load balance across instances
        instance = self.select_instance(service, instances)

        # Apply circuit breaker
        circuit = self.get_circuit_breaker(instance)
        if circuit.is_open():
            return self.fallback_response(request)

        # Forward request with timeout
        try:
            response = await self.forward_with_timeout(
                instance=instance,
                request=request,
                timeout=30
            )
            circuit.record_success()
            return response
        except Exception as e:
            circuit.record_failure()
            if circuit.should_open():
                circuit.open()
            raise

    def select_instance(self, service, instances):
        """
        Load balancing strategies
        """
        strategy = self.get_strategy(service)

        if strategy == "round_robin":
            return self.round_robin(service, instances)
        elif strategy == "least_connections":
            return self.least_connections(instances)
        elif strategy == "weighted":
            return self.weighted_random(instances)
        else:
            return random.choice(instances)
```

**API Versioning:**
```yaml
versioning:
  strategy: "path"  # or "header", "query"

  versions:
    v1:
      deprecated: false
      sunset_date: null
      routes:
        - /api/v1/gi/score
        - /api/v1/ledger/blocks

    v2:
      deprecated: false
      sunset_date: null
      routes:
        - /api/v2/gi/score  # Enhanced with more fields
        - /api/v2/ledger/blocks

    v3:
      deprecated: false
      sunset_date: null
      routes:
        - /api/v3/gi/score  # Breaking change: different schema
```

---

### 3. Service Mesh

**Purpose:** Service discovery, health checking, and resilience patterns.

**Service Registry:**
```python
class ServiceRegistry:
    def __init__(self, backend="consul"):
        self.backend = backend  # consul, etcd, or in-memory
        self.services = {}
        self.health_checkers = {}

    async def register(self, service):
        """
        Register a service instance
        """
        service_id = f"{service.name}:{service.instance_id}"

        # Store service metadata
        self.services[service_id] = {
            "name": service.name,
            "instance_id": service.instance_id,
            "host": service.host,
            "port": service.port,
            "version": service.version,
            "health_check": service.health_check,
            "metadata": service.metadata,
            "registered_at": datetime.utcnow()
        }

        # Start health checking
        await self.start_health_check(service_id)

        # Publish registration event
        await self.publish_event("service.registered", service_id)

    async def deregister(self, service_id):
        """
        Deregister a service instance
        """
        if service_id in self.services:
            # Stop health checking
            await self.stop_health_check(service_id)

            # Remove from registry
            del self.services[service_id]

            # Publish deregistration event
            await self.publish_event("service.deregistered", service_id)

    async def get_healthy_instances(self, service_name):
        """
        Get all healthy instances of a service
        """
        instances = [
            svc for svc in self.services.values()
            if svc["name"] == service_name
            and self.is_healthy(svc["instance_id"])
        ]
        return instances
```

**Health Checking:**
```python
class HealthChecker:
    def __init__(self, service, interval=5):
        self.service = service
        self.interval = interval  # seconds
        self.consecutive_failures = 0
        self.max_failures = 3

    async def run(self):
        """
        Continuously check service health
        """
        while True:
            try:
                healthy = await self.check_health()

                if healthy:
                    self.consecutive_failures = 0
                    await self.mark_healthy()
                else:
                    self.consecutive_failures += 1
                    if self.consecutive_failures >= self.max_failures:
                        await self.mark_unhealthy()

            except Exception as e:
                self.consecutive_failures += 1
                if self.consecutive_failures >= self.max_failures:
                    await self.mark_unhealthy()

            await asyncio.sleep(self.interval)

    async def check_health(self):
        """
        Perform health check
        """
        endpoint = self.service.health_check.get("endpoint", "/health")
        timeout = self.service.health_check.get("timeout", 5)

        try:
            response = await self.http_get(
                f"http://{self.service.host}:{self.service.port}{endpoint}",
                timeout=timeout
            )
            return response.status == 200
        except:
            return False
```

**Circuit Breaker:**
```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout  # seconds until retry
        self.failures = 0
        self.last_failure = None
        self.state = "closed"  # closed, open, half_open

    def is_open(self):
        """
        Check if circuit is open (blocking requests)
        """
        if self.state == "open":
            # Check if timeout has elapsed
            if time.time() - self.last_failure > self.timeout:
                self.state = "half_open"
                return False
            return True
        return False

    def record_success(self):
        """
        Record successful request
        """
        if self.state == "half_open":
            # Success after timeout - close circuit
            self.state = "closed"
            self.failures = 0

    def record_failure(self):
        """
        Record failed request
        """
        self.failures += 1
        self.last_failure = time.time()

        if self.state == "half_open":
            # Failed after timeout - reopen circuit
            self.state = "open"

    def should_open(self):
        """
        Check if circuit should open
        """
        return self.failures >= self.failure_threshold

    def open(self):
        """
        Open circuit (block requests)
        """
        self.state = "open"
```

---

### 4. Security Layer

**Purpose:** Authentication, authorization, and rate limiting.

**JWT Authentication:**
```python
class JWTAuthenticator:
    def __init__(self, secret_key):
        self.secret_key = secret_key

    def generate_token(self, user):
        """
        Generate JWT token for authenticated user
        """
        payload = {
            "sub": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "gi_score": user.gi_score,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24)
        }

        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        return token

    def verify_token(self, token):
        """
        Verify JWT token and extract user info
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
```

**RBAC Authorization:**
```python
class RBACAuthorizer:
    def __init__(self):
        self.roles = {
            "admin": {
                "permissions": ["*"]  # All permissions
            },
            "citizen": {
                "permissions": [
                    "read:gi_score",
                    "read:ledger",
                    "create:reflection",
                    "create:deliberation"
                ]
            },
            "agent": {
                "permissions": [
                    "read:*",
                    "write:ledger",
                    "write:deliberation"
                ]
            },
            "guest": {
                "permissions": [
                    "read:public"
                ]
            }
        }

    def authorize(self, user, resource, action):
        """
        Check if user is authorized for action on resource
        """
        role = user.get("role", "guest")
        permissions = self.roles.get(role, {}).get("permissions", [])

        # Check for wildcard permission
        if "*" in permissions:
            return True

        # Check for specific permission
        required_permission = f"{action}:{resource}"
        if required_permission in permissions:
            return True

        # Check for wildcard action
        wildcard_permission = f"{action}:*"
        if wildcard_permission in permissions:
            return True

        return False
```

**Rate Limiting:**
```python
class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def check_rate_limit(self, user_id, endpoint):
        """
        Token bucket rate limiting
        """
        key = f"rate_limit:{user_id}:{endpoint}"

        # Get rate limit config for endpoint
        config = self.get_rate_limit_config(endpoint)
        max_requests = config["max_requests"]
        window_seconds = config["window_seconds"]

        # Get current count
        count = await self.redis.get(key)

        if count is None:
            # First request in window
            await self.redis.setex(key, window_seconds, 1)
            return True

        if int(count) >= max_requests:
            # Rate limit exceeded
            ttl = await self.redis.ttl(key)
            raise RateLimitError(f"Rate limit exceeded. Retry in {ttl}s")

        # Increment count
        await self.redis.incr(key)
        return True

    def get_rate_limit_config(self, endpoint):
        """
        Get rate limit configuration for endpoint
        """
        configs = {
            "/api/v1/gi/score": {
                "max_requests": 100,
                "window_seconds": 60
            },
            "/api/v1/deliberation/create": {
                "max_requests": 10,
                "window_seconds": 60
            },
            "default": {
                "max_requests": 60,
                "window_seconds": 60
            }
        }

        return configs.get(endpoint, configs["default"])
```

---

### 5. Observability

**Purpose:** Distributed tracing, metrics, and logging.

**Distributed Tracing:**
```python
class TracingMiddleware:
    def __init__(self, tracer):
        self.tracer = tracer

    async def __call__(self, request, handler):
        """
        Add tracing to request
        """
        # Extract parent span context from headers
        parent_ctx = self.tracer.extract(
            format=Format.HTTP_HEADERS,
            carrier=request.headers
        )

        # Start new span
        with self.tracer.start_active_span(
            operation_name=f"{request.method} {request.path}",
            child_of=parent_ctx
        ) as scope:
            # Add tags
            scope.span.set_tag("http.method", request.method)
            scope.span.set_tag("http.url", request.url)
            scope.span.set_tag("user.id", request.user.id if request.user else None)

            # Process request
            try:
                response = await handler(request)

                # Tag response
                scope.span.set_tag("http.status_code", response.status)

                return response

            except Exception as e:
                # Tag error
                scope.span.set_tag("error", True)
                scope.span.log_kv({"event": "error", "message": str(e)})
                raise
```

**Prometheus Metrics:**
```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
request_count = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["method", "endpoint"]
)

active_requests = Gauge(
    "http_requests_active",
    "Active HTTP requests"
)

class MetricsMiddleware:
    async def __call__(self, request, handler):
        """
        Collect metrics for request
        """
        active_requests.inc()

        start = time.time()
        try:
            response = await handler(request)

            # Record metrics
            duration = time.time() - start
            request_count.labels(
                method=request.method,
                endpoint=request.path,
                status=response.status
            ).inc()

            request_duration.labels(
                method=request.method,
                endpoint=request.path
            ).observe(duration)

            return response

        finally:
            active_requests.dec()
```

---

## 🔌 API SPECIFICATIONS

### Complete OpenAPI Spec

```yaml
openapi: 3.0.0
info:
  title: Kaizen-OS API Fabric
  version: 1.0.0
  description: Unified API gateway for all Kaizen-OS services

servers:
  - url: https://api.kaizen.os/v1
    description: Production
  - url: http://localhost:5003/v1
    description: Local development

security:
  - bearerAuth: []

paths:
  # Lab1 - Substrate
  /gi/score/{agentId}:
    get:
      summary: Get GI score for agent
      parameters:
        - name: agentId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: GI score retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GIScore'

  /ledger/blocks/{blockNumber}:
    get:
      summary: Get block by number
      parameters:
        - name: blockNumber
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Block retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Block'

  # Lab2 - Thought Broker
  /deliberation:
    post:
      summary: Create deliberation session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDeliberationRequest'
      responses:
        '201':
          description: Deliberation created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Deliberation'

  /deliberation/{id}:
    get:
      summary: Get deliberation by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Deliberation retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Deliberation'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    GIScore:
      type: object
      properties:
        score:
          type: number
          format: double
        breakdown:
          type: object
        trend:
          type: string
          enum: [improving, stable, declining]
        thresholdMet:
          type: boolean

    Block:
      type: object
      properties:
        number:
          type: integer
        timestamp:
          type: string
          format: date-time
        transactions:
          type: array
          items:
            $ref: '#/components/schemas/Transaction'
```

---

## 📊 PERFORMANCE SPECIFICATIONS

### Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Gateway Latency | <10ms | <50ms |
| Request Throughput | 10,000 RPS | 1,000 RPS |
| Circuit Breaker Response | <1ms | <5ms |
| Service Discovery | <100ms | <500ms |
| Health Check Frequency | 5s | 30s |
| WebSocket Connections | 10,000+ | 1,000+ |

---

## 🔒 SECURITY SPECIFICATIONS

### TLS/SSL Configuration

```yaml
tls:
  enabled: true
  cert_file: /etc/ssl/certs/kaizen.crt
  key_file: /etc/ssl/private/kaizen.key
  min_version: "TLSv1.2"
  cipher_suites:
    - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
```

---

## 🧪 TESTING STRATEGY

### Integration Tests

```python
async def test_full_request_flow():
    """Test complete request flow through API Fabric"""
    # 1. Authenticate
    token = await authenticate(username="test_user")

    # 2. Create deliberation via API Fabric
    response = await http_post(
        "http://localhost:5003/v1/deliberation",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "question": "Should we deploy feature X?",
            "models": ["claude", "gpt4"]
        }
    )

    assert response.status == 201
    delib_id = response.json()["id"]

    # 3. Poll for completion
    for _ in range(30):
        status = await http_get(
            f"http://localhost:5003/v1/deliberation/{delib_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        if status.json()["status"] == "completed":
            break

        await asyncio.sleep(1)

    # 4. Verify deliberation sealed to ledger
    ledger_tx = status.json()["ledger_tx_id"]
    assert ledger_tx is not None
```

---

## 📈 DEPLOYMENT STRATEGY

### Phase 1: Local Development (Week 1)
- Implement API gateway with REST support
- Add service registry (in-memory)
- Basic routing and health checks

### Phase 2: Enhanced Features (Week 2)
- Add GraphQL and WebSocket support
- Implement circuit breakers
- Add authentication/authorization
- Distributed tracing

### Phase 3: Production Readiness (Week 3)
- Deploy to Kubernetes
- Configure Consul for service discovery
- Set up Prometheus + Grafana
- Load testing

---

## 🔗 INTEGRATION POINTS

### Upstream Dependencies
- **All Labs:** Lab3 routes to all other labs

### Downstream Consumers
- **External Clients:** Mobile apps, web apps, CLI tools
- **HOMEROOM/AUREA:** Cross-office API access

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Unified gateway serves all 6 labs via REST/GraphQL
- [ ] Service discovery automatically detects new instances
- [ ] Circuit breakers prevent cascading failures
- [ ] Rate limiting enforces quotas
- [ ] Authentication via JWT working
- [ ] Distributed tracing shows full request path
- [ ] API response time <100ms (p95)
- [ ] 100+ concurrent requests supported
- [ ] WebSocket connections stable for deliberations
- [ ] 80%+ code coverage

---

**Status:** READY FOR IMPLEMENTATION
**Estimated Effort:** 2 weeks (1 engineer)
**Priority:** MEDIUM (Integration layer)

**改善 (Kaizen) - One gateway, infinite possibilities.**
