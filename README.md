# edge-api

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible API router for Cloudflare Workers with built-in authentication and database middleware, based on itty-router.

## Features

- 🚀 Built on itty-router for lightweight, fast routing
- 🔒 Built-in Auth.js (next-auth@beta) integration
- 📦 Database middleware using @mdxdb/fetch
- 🌐 Cloudflare Workers optimized
- 📝 Full TypeScript support
- ⚡️ Middleware-first architecture

## Installation

```bash
pnpm add edge-api
```

## Usage

### Basic Example

```typescript
import { API, error } from 'edge-api'

const api = API()

api
  .get('/', () => ({ hello: 'api' }))
  .get('/users', () => ({ users: ['user1', 'user2'] }))
  .all('*', () => error(404))

export default api
```

### Authentication and Database Example

```typescript
import { API, error, withUser, withDB } from 'edge-api'

const api = API()

api
  .all('*', withUser, withDB({ ns: 'https://db.example.com' }))
  .get('/', () => ({ hello: 'api' }))
  .get('/:resource', ({ resource }) => ({ resource }))
  .get('/:resource/:id+', ({ resource, id }) => ({ resource, id }))
  .all('*', () => error(404))

export default api
```

## API Reference

### `API()`

Creates a new API router instance with pre-configured middleware:
- `withParams`: Automatically parses URL parameters
- Error handling with proper status codes
- JSON response formatting

### Middleware

#### `withUser`

Authentication middleware using Auth.js:

```typescript
import { withUser } from 'edge-api'

// Add authentication to all routes
api.all('*', withUser)

// The middleware adds the user object to the request
api.get('/profile', ({ user }) => {
  if (!user) return error(401)
  return { user }
})
```

The middleware:
- Uses Auth.js for authentication
- Expects AUTH_SECRET in the env object
- Returns 401 if authentication fails
- Adds typed user object to request

#### `withDB({ ns: string })`

Database middleware using @mdxdb/fetch:

```typescript
import { withDB } from 'edge-api'

// Initialize database with namespace
api.all('*', withDB({ ns: 'https://db.example.com' }))

// Use database in route handlers
api.get('/data/:id', async ({ db, params }) => {
  const data = await db.get(params.id)
  return data
})
```

The middleware:
- Initializes database provider with namespace
- Adds typed db instance to request
- Supports chaining with other middleware

### TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import { API, RequestHandler } from 'edge-api'

// Define custom request type
interface CustomRequest extends Request {
  user?: {
    id: string
    email: string
  }
  db?: {
    get: (id: string) => Promise<any>
    search: (query: string) => Promise<any[]>
  }
}

// Type-safe route handler
const handler: RequestHandler<CustomRequest> = async ({ user, db, params }) => {
  if (!user) return error(401)
  const data = await db?.get(params.id)
  return { user, data }
}

api.get('/protected/:id', handler)
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build package
pnpm build

# Lint code
pnpm lint
```

## License

MIT © [AI Primitives](https://mdx.org.ai)
