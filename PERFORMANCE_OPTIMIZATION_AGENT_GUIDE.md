# Performance Optimization Agent Guide

> Purpose: This document gives an AI coding agent a practical workflow to inspect, benchmark, monitor, and optimize a real project’s performance.
>
> Target stack for this project: **Next.js frontend + NestJS backend + MongoDB Atlas**.
>
> Main goal: produce reliable **before/after performance numbers** for the project README/CV, not just make subjective claims like “faster” or “optimized”.

---

## 0. Agent Operating Principles

Before making any change, the agent must follow these rules:

1. **Measure before optimizing.**
   - Do not optimize based on guesses.
   - Always capture baseline numbers first.

2. **Use the real project structure.**
   - Inspect actual routes, controllers, services, schemas, database queries, frontend pages, and environment variables.
   - Do not blindly copy example endpoint names from this guide.

3. **Change one bottleneck at a time.**
   - Make one meaningful optimization.
   - Run the same benchmark again.
   - Record the difference.

4. **Keep the benchmark reproducible.**
   - Same dataset.
   - Same environment.
   - Same k6 script.
   - Same load level.
   - Same target endpoint.

5. **Prefer practical tooling over heavy enterprise setup.**
   - Required: k6, Prometheus metrics, Grafana dashboard, MongoDB Atlas profiler/explain.
   - Optional later: Loki, OpenTelemetry, Tempo/Jaeger.

6. **Do not load test production user data.**
   - Use local, staging, or a dedicated test database.
   - Never run destructive tests against production.

7. **Document all results.**
   - Save k6 JSON summaries.
   - Add notes about bottlenecks found.
   - Add before/after tables to `performance/README.md`.

---

## 1. Expected Final Output

At the end of this work, the project should contain:

```txt
performance/
├── k6/
│   ├── products.load.js
│   ├── products.constant-rps.js
│   ├── search.load.js
│   ├── user-journey.load.js
│   └── orders.load.js
├── results/
│   ├── products-before.json
│   ├── products-after.json
│   ├── search-before.json
│   ├── search-after.json
│   └── final-summary.md
├── reports/
│   ├── mongodb-query-analysis.md
│   ├── frontend-lighthouse.md
│   └── optimization-log.md
└── README.md

monitoring/
└── prometheus.yml

docker-compose.monitoring.yml
```

The final README should include a section like:

```md
## Performance Optimization Summary

### Test Environment
- Frontend: Next.js production build
- Backend: NestJS production build
- Database: MongoDB Atlas test cluster
- Load testing: k6
- Metrics: Prometheus + Grafana
- Dataset:
  - Products: 100,000
  - Users: 10,000
  - Orders: 50,000

### Result
| Endpoint | Metric | Before | After | Improvement |
|---|---:|---:|---:|---:|
| GET /products | p95 latency | 1.8s | 280ms | -84.4% |
| GET /products/search | p95 latency | 2.4s | 430ms | -82.1% |
| GET /products | docs examined/query | 50,000 | 20 | -99.9% |
```

Only use real numbers measured from the project.

---

## 2. Phase 1 — Inspect the Current Project

The agent must first inspect the project and identify:

### 2.1 Frontend

Find:

- Next.js version and routing style:
  - App Router: `app/`
  - Pages Router: `pages/`
- Main customer-facing pages:
  - home page
  - product listing
  - product detail
  - search page
  - cart
  - checkout
  - user orders
- Data-fetching style:
  - server components
  - client components
  - React Query/SWR
  - direct `fetch`
  - Axios
- Image usage:
  - `next/image`
  - normal `<img>`
  - remote image domains
- Expensive components:
  - carousels
  - charts
  - rich text editors
  - large tables
  - modals loaded immediately

### 2.2 Backend

Find:

- NestJS entry point.
- Main modules:
  - products
  - categories
  - cart
  - orders
  - users
  - auth
- Controllers and routes.
- Services that call MongoDB.
- Mongoose models/schemas.
- Use of:
  - `.populate()`
  - `.aggregate()`
  - `.find()`
  - `.sort()`
  - `.skip()`
  - `.limit()`
  - `.select()`
  - `.lean()`
- Existing logging.
- Existing interceptors/middleware.
- Existing error handling.
- Existing validation pipes.

### 2.3 Database

Find:

- MongoDB Atlas connection config.
- Database name.
- Collections used.
- Current indexes.
- Query patterns in code.
- Whether test/staging data exists.

If there is no large dataset, create or propose a seed script.

---

## 3. Phase 2 — Select Benchmark Targets

Choose 3–5 realistic benchmark targets.

For an e-commerce app, prioritize:

```txt
1. GET /products?page=1&limit=20
2. GET /products/:id
3. GET /products?keyword=...&category=...&sort=...
4. POST /auth/login
5. POST /orders
6. GET /orders/me
```

The agent must adapt these to the actual project routes.

For each target, record:

```md
| Flow | Endpoint | Reason |
|---|---|---|
| Product listing | GET /actual-route | Critical high-traffic page |
| Product search | GET /actual-route | Likely query/index bottleneck |
| Checkout | POST /actual-route | Critical business flow |
```

---

## 4. Phase 3 — Create k6 Benchmark Scripts

Create this folder:

```bash
mkdir -p performance/k6 performance/results performance/reports
```

### 4.1 General k6 Rules

Each k6 script must:

- Use `BASE_URL` from environment variable.
- Use stable endpoint tags.
- Save summary JSON.
- Define thresholds.
- Avoid testing with random routes that may not exist.
- Keep scripts deterministic enough for before/after comparison.

Example command:

```bash
BASE_URL=http://localhost:3001 k6 run performance/k6/products.load.js
```

### 4.2 Product Listing Load Test Template

Adapt the endpoint to the actual project.

```js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 30 },
    { duration: "3m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{name:GET /products}": ["p(95)<500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/products?page=1&limit=20`, {
    tags: {
      name: "GET /products",
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has body": (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "performance/results/products-before.json": JSON.stringify(data, null, 2),
  };
}
```

### 4.3 Constant RPS Test Template

Use this when the project needs a clear CV-friendly statement such as:

```txt
Tested under 50 requests/second for 5 minutes.
```

```js
import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export const options = {
  scenarios: {
    product_list_50_rps: {
      executor: "constant-arrival-rate",
      rate: 50,
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 80,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{name:GET /products}": ["p(95)<500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/products?page=1&limit=20`, {
    tags: {
      name: "GET /products",
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}

export function handleSummary(data) {
  return {
    "performance/results/products-50rps-before.json": JSON.stringify(
      data,
      null,
      2
    ),
  };
}
```

### 4.4 Search Test Template

```js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

const keywords = ["phone", "laptop", "shirt", "keyboard", "book"];

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 30 },
    { duration: "3m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{name:GET /products/search}": ["p(95)<800"],
  },
};

export default function () {
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  const res = http.get(
    `${BASE_URL}/products?keyword=${keyword}&page=1&limit=20`,
    {
      tags: {
        name: "GET /products/search",
      },
    }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "performance/results/search-before.json": JSON.stringify(data, null, 2),
  };
}
```

### 4.5 User Journey Test Template

Create this after individual endpoint tests work.

```js
import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "2m", target: 30 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{name:GET /products}": ["p(95)<500"],
    "http_req_duration{name:GET /products/:id}": ["p(95)<400"],
    "http_req_duration{name:GET /products/search}": ["p(95)<800"],
  },
};

export default function () {
  group("browse products", function () {
    const listRes = http.get(`${BASE_URL}/products?page=1&limit=20`, {
      tags: { name: "GET /products" },
    });

    check(listRes, {
      "list status is 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("view product detail", function () {
    const productId = Math.floor(Math.random() * 1000) + 1;

    const detailRes = http.get(`${BASE_URL}/products/${productId}`, {
      tags: { name: "GET /products/:id" },
    });

    check(detailRes, {
      "detail status is 200 or 404": (r) =>
        r.status === 200 || r.status === 404,
    });
  });

  sleep(1);

  group("search products", function () {
    const keywords = ["phone", "book", "laptop", "shirt", "keyboard"];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];

    const searchRes = http.get(
      `${BASE_URL}/products?keyword=${keyword}&page=1&limit=20`,
      {
        tags: { name: "GET /products/search" },
      }
    );

    check(searchRes, {
      "search status is 200": (r) => r.status === 200,
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "performance/results/user-journey-before.json": JSON.stringify(
      data,
      null,
      2
    ),
  };
}
```

### 4.6 Authenticated Endpoint Template

Use this if routes require authentication.

```js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export const options = {
  vus: 20,
  duration: "3m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<700"],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: __ENV.TEST_EMAIL || "test@example.com",
      password: __ENV.TEST_PASSWORD || "password123",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: {
        name: "POST /auth/login",
      },
    }
  );

  check(res, {
    "login success": (r) => r.status === 200 || r.status === 201,
  });

  return {
    token: res.json("accessToken") || res.json("token"),
  };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/orders/me?page=1&limit=20`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
    tags: {
      name: "GET /orders/me",
    },
  });

  check(res, {
    "orders status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## 5. Phase 4 — Add NestJS Prometheus Metrics

The agent should add backend metrics if they do not already exist.

### 5.1 Install Dependency

```bash
npm install prom-client
```

### 5.2 Add Metrics Service

```ts
// src/monitoring/metrics.service.ts
import { Injectable } from "@nestjs/common";
import {
  collectDefaultMetrics,
  Registry,
  Histogram,
  Counter,
} from "prom-client";

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  readonly httpDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
    registers: [this.registry],
  });

  readonly httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: "nodejs_",
    });
  }

  async metrics() {
    return this.registry.metrics();
  }

  contentType() {
    return this.registry.contentType;
  }
}
```

### 5.3 Add Metrics Interceptor

```ts
// src/monitoring/metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const durationSeconds =
          Number(process.hrtime.bigint() - start) / 1_000_000_000;

        const method = req.method;
        const route = req.route?.path || req.url;
        const statusCode = String(res.statusCode);

        this.metricsService.httpDuration
          .labels(method, route, statusCode)
          .observe(durationSeconds);

        this.metricsService.httpRequestsTotal
          .labels(method, route, statusCode)
          .inc();
      })
    );
  }
}
```

### 5.4 Add Metrics Controller

```ts
// src/monitoring/metrics.controller.ts
import { Controller, Get, Header } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain")
  async getMetrics() {
    return this.metricsService.metrics();
  }
}
```

### 5.5 Add Monitoring Module

```ts
// src/monitoring/monitoring.module.ts
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { MetricsInterceptor } from "./metrics.interceptor";

@Module({
  controllers: [MetricsController],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class MonitoringModule {}
```

Import `MonitoringModule` into `AppModule`.

After setup, verify:

```txt
http://localhost:3001/metrics
```

---

## 6. Phase 5 — Add Prometheus + Grafana

### 6.1 Create `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "nestjs-backend"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["host.docker.internal:3001"]
```

If backend runs inside the same Docker network, use the backend service name:

```yaml
targets: ["backend:3001"]
```

### 6.2 Create `docker-compose.monitoring.yml`

```yaml
services:
  prometheus:
    image: prom/prometheus
    container_name: ecommerce-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    container_name: ecommerce-grafana
    ports:
      - "3005:3000"
    depends_on:
      - prometheus
```

Run:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Open:

```txt
Prometheus: http://localhost:9090
Grafana:    http://localhost:3005
```

Add Grafana data source:

```txt
http://prometheus:9090
```

### 6.3 Create Grafana Panels

Use these PromQL queries.

#### Request per second

```promql
sum(rate(http_requests_total[1m]))
```

#### Error rate

```promql
sum(rate(http_requests_total{status_code=~"5.."}[1m]))
/
sum(rate(http_requests_total[1m]))
```

#### Average latency

```promql
sum(rate(http_request_duration_seconds_sum[1m]))
/
sum(rate(http_request_duration_seconds_count[1m]))
```

#### p95 latency by route

```promql
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route, method)
)
```

#### Top 5 slowest routes

```promql
topk(
  5,
  histogram_quantile(
    0.95,
    sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
  )
)
```

#### Node.js heap used

```promql
nodejs_heap_size_used_bytes
```

---

## 7. Phase 6 — Add Request Logging

Metrics answer:

```txt
Is the system slow?
```

Logs answer:

```txt
Which request was slow, and what happened?
```

### 7.1 Add Request ID Middleware

```ts
// src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestId = req.headers["x-request-id"] || randomUUID();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    next();
  }
}
```

### 7.2 Add Request Logging Middleware

```ts
// src/common/middleware/request-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: any, res: any, next: () => void) {
    const start = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - start;

      this.logger.log(
        JSON.stringify({
          event: "http_request",
          request_id: req.requestId,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          duration_ms: durationMs,
        })
      );
    });

    next();
  }
}
```

### 7.3 Register Middleware

```ts
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware";

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestLoggingMiddleware)
      .forRoutes("*");
  }
}
```

### 7.4 Optional Log Improvement

If the project already uses `pino`, `winston`, or another logger, integrate `request_id` into the existing logger instead of adding duplicate logging.

---

## 8. Phase 7 — Analyze MongoDB Atlas

When k6 is running, inspect MongoDB Atlas:

```txt
Atlas
→ Cluster
→ Monitoring
→ Query Profiler / Query Insights
```

Look for:

```txt
- slow queries
- high docs examined
- low keys examined
- COLLSCAN
- long aggregation pipeline
- high response time
```

For each slow query, reproduce with `explain("executionStats")`.

Example:

```js
db.products
  .find({ categoryId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .limit(20)
  .explain("executionStats");
```

Record:

```txt
executionTimeMillis
totalDocsExamined
totalKeysExamined
nReturned
winningPlan.stage
```

Bad signs:

```txt
nReturned: 20
totalDocsExamined: 50000
totalKeysExamined: 0
stage: COLLSCAN
```

Good signs:

```txt
nReturned: 20
totalDocsExamined: close to 20
totalKeysExamined: reasonable
stage: IXSCAN or indexed plan
```

---

## 9. Phase 8 — Optimize by Priority

### 9.1 MongoDB Indexes

Add indexes based on actual query patterns.

Common product listing index:

```js
db.products.createIndex({
  categoryId: 1,
  createdAt: -1,
});
```

Filter + sort by price:

```js
db.products.createIndex({
  categoryId: 1,
  price: 1,
  createdAt: -1,
});
```

User orders:

```js
db.orders.createIndex({
  userId: 1,
  createdAt: -1,
});
```

Search:

```js
db.products.createIndex({
  name: "text",
  description: "text",
});
```

Do not add indexes blindly. Every index increases write cost and storage.

### 9.2 Mongoose Query Optimization

Use projection for list APIs:

```ts
return this.productModel
  .find(filter)
  .select("_id name price thumbnailUrl rating soldCount")
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

Avoid returning full product documents for list pages.

Use `lean()` for read-only queries where Mongoose document methods are unnecessary.

Avoid deep populate:

```ts
// Risky for performance
.populate("category")
.populate("reviews")
.populate("seller")
.populate("variants")
```

Prefer specific fields:

```ts
.populate("category", "name slug")
```

Avoid DB calls in loops:

```ts
// Bad
for (const item of cartItems) {
  const product = await this.productModel.findById(item.productId);
}

// Better
const productIds = cartItems.map((item) => item.productId);

const products = await this.productModel.find({
  _id: { $in: productIds },
});
```

### 9.3 Pagination

Ensure every list endpoint has:

```txt
page
limit
sort
maximum limit
```

Example:

```ts
const safeLimit = Math.min(Number(limit) || 20, 100);
```

Avoid unbounded list queries.

### 9.4 Payload Reduction

Product list should return only:

```txt
_id
name
price
thumbnailUrl
rating
soldCount
```

Do not return:

```txt
long description
full reviews
inventory logs
supplier internals
large nested objects
```

### 9.5 NestJS Runtime Optimization

Look for:

```txt
- expensive synchronous operations
- JSON serialization of huge responses
- sequential awaits that can be parallelized
- repeated database calls
- missing cache for stable public data
```

Example parallelization:

```ts
const [products, total] = await Promise.all([
  this.productModel.find(filter).limit(limit).lean(),
  this.productModel.countDocuments(filter),
]);
```

Only use this if both operations are actually independent.

### 9.6 Next.js Optimization

Run production build:

```bash
npm run build
npm run start
```

Use:

```txt
- Chrome DevTools Network
- Lighthouse
- Next.js bundle analyzer
```

Check:

```txt
- LCP
- TTFB
- image size
- bundle size
- number of API calls
- heavy client components
```

Common fixes:

```txt
- use next/image
- lazy-load heavy components
- dynamic import non-critical UI
- reduce "use client" scope
- avoid waterfall API calls
- cache product/category data when appropriate
```

---

## 10. Phase 9 — Benchmark Again

After each optimization:

1. Rebuild frontend/backend in production mode.
2. Use the same database dataset.
3. Run the same k6 script.
4. Save result as `*-after.json`.
5. Compare with `*-before.json`.
6. Update `performance/reports/optimization-log.md`.

Example log:

```md
## Optimization 1 — Product Listing Index

### Problem
`GET /products` had high p95 latency under 50 VUs.

### Evidence
- k6 p95 latency: 1.8s
- MongoDB profiler: high docs examined
- explain:
  - totalDocsExamined: 50,000
  - nReturned: 20
  - stage: COLLSCAN

### Change
Added compound index:

```js
db.products.createIndex({
  categoryId: 1,
  createdAt: -1,
});
```

### Result
- k6 p95 latency: 280ms
- totalDocsExamined: 20
- Improvement: 84.4% lower p95 latency
```

---

## 11. Phase 10 — Create Final Report

Create:

```txt
performance/results/final-summary.md
```

Use this template:

```md
# Performance Optimization Report

## Project
E-commerce web application with Next.js frontend, NestJS backend, and MongoDB Atlas.

## Tools Used
- k6 for load testing
- Prometheus for metrics collection
- Grafana for dashboard visualization
- MongoDB Atlas Query Profiler and explain plans for database analysis
- Lighthouse and Chrome DevTools for frontend analysis

## Benchmark Environment
- Backend URL:
- Frontend URL:
- Database:
- Dataset:
- Machine:
- Test date:

## Benchmarked Endpoints
| Flow | Endpoint | Load |
|---|---|---|
| Product listing | GET /products?page=1&limit=20 | 50 VUs, 5 minutes |
| Product search | GET /products?keyword=... | 50 VUs, 5 minutes |

## Results
| Endpoint | Metric | Before | After | Improvement |
|---|---:|---:|---:|---:|
| GET /products | p95 latency | ... | ... | ... |
| GET /products | avg latency | ... | ... | ... |
| GET /products | error rate | ... | ... | ... |
| GET /products | docs examined/query | ... | ... | ... |

## Bottlenecks Found
1. ...
2. ...
3. ...

## Optimizations Applied
1. ...
2. ...
3. ...

## What I Learned
- ...
- ...
- ...
```

---

## 12. Suggested Timeline

### Day 1 — Inspection and Plan

- Inspect actual routes.
- Select benchmark endpoints.
- Create `performance/` folder.
- Write initial `performance/README.md`.

### Day 2 — k6 Baseline

- Write k6 scripts.
- Run product listing benchmark.
- Run search benchmark.
- Save `*-before.json`.

### Day 3 — Metrics

- Add `/metrics` to NestJS.
- Add Prometheus.
- Add Grafana.
- Create basic dashboard.

### Day 4 — Logging

- Add request ID middleware.
- Add request duration logging.
- Confirm slow requests can be found in logs.

### Day 5 — MongoDB Analysis

- Run k6.
- Inspect Atlas profiler.
- Run `explain("executionStats")`.
- Identify top database bottleneck.

### Day 6–7 — Backend and MongoDB Optimization

- Add indexes based on actual queries.
- Add projection.
- Add `lean()`.
- Fix DB calls in loops.
- Reduce payload size.

### Day 8 — Frontend Optimization

- Run Lighthouse.
- Inspect bundle/network.
- Optimize images.
- Lazy load heavy components.
- Reduce unnecessary API calls.

### Day 9 — Final Benchmark

- Rebuild production.
- Run same k6 scripts.
- Save `*-after.json`.
- Capture Grafana screenshots.

### Day 10 — Report and CV

- Write final summary.
- Update README.
- Prepare CV bullets.

---

## 13. CV Bullet Templates

Only use these after real numbers are available.

```txt
- Built a performance testing workflow for an e-commerce app using k6, Prometheus, Grafana, and MongoDB Atlas Query Profiler.
```

```txt
- Optimized product listing API by adding MongoDB compound indexes, using Mongoose lean queries, projection, and pagination, reducing p95 latency from [before] to [after] under [load].
```

```txt
- Added request_id-based structured logging and Prometheus metrics in NestJS to identify slow routes and trace backend bottlenecks.
```

```txt
- Improved frontend performance by optimizing images, reducing unnecessary client-side JavaScript, and lazy-loading heavy components, improving Lighthouse score from [before] to [after].
```

---

## 14. Agent Completion Criteria

The agent is done only when:

- [ ] Actual project routes have been inspected.
- [ ] At least 2 important endpoints have k6 scripts.
- [ ] Baseline k6 results are saved.
- [ ] NestJS exposes `/metrics`.
- [ ] Prometheus scrapes backend metrics.
- [ ] Grafana dashboard has latency/error/memory panels.
- [ ] Request logs include request ID and duration.
- [ ] MongoDB slow query analysis is documented.
- [ ] At least one real bottleneck is optimized.
- [ ] After-results are saved.
- [ ] A before/after performance report exists.
- [ ] README/CV-ready bullet points are drafted using real numbers.

---

## 15. Important Warnings

Do not:

- Claim improvement without measured before/after numbers.
- Change benchmark script between before and after runs.
- Add indexes without checking actual query patterns.
- Load test production data.
- Optimize frontend before confirming whether backend/database is the bottleneck.
- Treat average latency as enough; always check p95/p99.
- Hide failed benchmarks; document them and explain the cause.

Do:

- Use production builds for serious benchmarking.
- Keep benchmark data reproducible.
- Prefer p95 latency, error rate, and database docs examined as key evidence.
- Keep the setup simple enough for a personal project.
- Turn the work into a README performance case study.
