---
name: rest-api-design
version: 0.1.0
category: development
description: Technology-agnostic principles for designing REST APIs. Use when
  designing endpoints, reviewing API contracts, establishing API standards, or
  deciding versioning, backward compatibility, errors, security, pagination,
  rate limits, auth or OpenAPI, even with no mention of "REST API".
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write
---

# REST API Design Principles

The authoritative guide for all API design decisions. The principles apply at
the contract level, independent of language, framework or runtime. Read the one
file that matches your task.

## Routing

| Doing                                           | Read                                                                                        | Loads     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| Modeling the resources of an API                | [1. Resource Modeling](references/1-resource-modeling.md)                                   | sometimes |
| Choosing an HTTP method and its semantics       | [2. HTTP Methods](references/2-http-methods.md)                                             | sometimes |
| Writing URL paths and query parameters          | [3. URL Design](references/3-url-design.md)                                                 | sometimes |
| Shaping a request or a response body            | [4. Request & Response Design](references/4-request-response-design.md)                     | sometimes |
| Paginating a list                               | [5. Pagination](references/5-pagination.md)                                                 | sometimes |
| Defining the error shape and the error codes    | [6. Error Handling](references/6-error-handling.md)                                         | sometimes |
| Choosing auth schemes, token scopes, 401 or 403 | [7. Authentication & Authorization](references/7-authentication-authorization.md)           | sometimes |
| Versioning, or making a change backward-safe    | [8. Versioning & Backward Compatibility](references/8-versioning-backward-compatibility.md) | sometimes |
| Designing rate-limit headers and 429 responses  | [9. Rate Limiting](references/9-rate-limiting.md)                                           | sometimes |
| Supporting Idempotency-Key for POST retries     | [10. Idempotency](references/10-idempotency.md)                                             | sometimes |
| Setting cache headers on a response             | [11. Caching](references/11-caching.md)                                                     | sometimes |
| Validating input and hardening an endpoint      | [12. Security](references/12-security.md)                                                   | sometimes |
| Adding trace IDs, logs and metrics to an API    | [13. Observability](references/13-observability.md)                                         | sometimes |
| Documenting endpoints with OpenAPI, changelogs  | [14. API Documentation](references/14-api-documentation.md)                                 | sometimes |
| Running the contract-first workflow, pre-ship   | [15. Design Process](references/15-design-process.md)                                       | sometimes |
| Checking a design against all rules at a glance | [Quick Reference](references/quick-reference.md)                                            | sometimes |
