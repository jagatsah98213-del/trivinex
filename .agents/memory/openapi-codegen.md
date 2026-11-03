---
name: OpenAPI generation compatibility
description: Runtime and output-version constraints for regenerating this workspace's OpenAPI clients.
---

The project runs on Node 20, while the available Orval release uses `Map.groupBy`, which Node 20 does not provide. Code generation needs a `Map.groupBy` polyfill unless the project runtime is deliberately upgraded. Keep generated Zod schemas on Zod 3 and React Query hooks on React Query 5 to match the workspace dependencies.

**Why:** The latest available generator failed under Node 20 without the polyfill and emitted Zod 4-only helpers when it could not infer the target version.

**How to apply:** Load a temporary `Map.groupBy` polyfill for code generation and retain explicit Zod 3 and React Query 5 output settings.
