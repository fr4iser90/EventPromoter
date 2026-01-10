# Backend Tests

This directory contains tests for the EventPromoter backend.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components
│   ├── PlatformRegistry.test.js
│   └── SchemaValidator.test.js
├── integration/       # Integration tests for API endpoints
└── README.md          # This file
```

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Test Framework

We use [Vitest](https://vitest.dev/) as our test framework. It provides:

- Fast test execution
- Built-in TypeScript support
- Coverage reporting
- Watch mode for development

## Writing Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { PlatformRegistry } from '../../src/services/platformRegistry.js'

describe('PlatformRegistry', () => {
  it('should register a platform', async () => {
    const registry = new PlatformRegistry()
    const platform = createMockPlatform('test')
    
    await registry.register(platform)
    
    expect(registry.hasPlatform('test')).toBe(true)
  })
})
```

### Integration Test Example

```javascript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/index.js'

describe('Platform API', () => {
  it('should return all platforms', async () => {
    const response = await request(app)
      .get('/api/platforms')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.platforms)).toBe(true)
  })
})
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for services and utilities
- **Integration Tests**: 80%+ coverage for API endpoints
- **Critical Paths**: 100% coverage for platform discovery and registration

## Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mocking**: Mock external dependencies
5. **Cleanup**: Clean up after tests (use `afterEach`/`afterAll`)

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds

