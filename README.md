# API Documentation: ndulo Backend

This document provides a comprehensive overview of the architecture and development details for the ndulo backend, a RESTful API built with Fastify, TypeScript, PostgreSQL, and Drizzle ORM. The backend focuses on user and role management, implementing secure authentication, role-based access control (RBAC), and robust error handling. The documentation is structured to provide a professional, clear, and detailed explanation of the system's components, adhering to the provided codebase and requirements.

---

## Table of Contents
- [API Documentation: ndulo Backend](#api-documentation-ndulo-backend)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
    - [Technology Stack](#technology-stack)
    - [Project Structure](#project-structure)
    - [Database Schema](#database-schema)
      - [`roles` Table](#roles-table)
      - [`usuarios` Table](#usuarios-table)
      - [`sessoes_usuarios` Table](#sessoes_usuarios-table)
      - [Relationships](#relationships)
    - [Environment Configuration](#environment-configuration)
  - [Development Details](#development-details)
    - [Authentication and Authorization](#authentication-and-authorization)
      - [Authentication](#authentication)
      - [Authorization](#authorization)
    - [API Endpoints](#api-endpoints)
      - [Health Check](#health-check)
      - [Authentication](#authentication-1)
      - [Users](#users)
      - [Roles](#roles)
    - [Middleware](#middleware)
    - [Error Handling](#error-handling)
    - [Logging](#logging)
    - [Database Migrations and Seeding](#database-migrations-and-seeding)
    - [Validation](#validation)
  - [Security Considerations](#security-considerations)
  - [Setup and Installation](#setup-and-installation)
  - [Testing](#testing)
  - [Scripts and Automation](#scripts-and-automation)
  - [Future Improvements](#future-improvements)

---

## Overview

ndulo is a backend API designed to manage users and roles with a focus on security, scalability, and maintainability. The system supports user registration, login, role-based access control, and session management, leveraging PostgreSQL for data persistence and Fastify as the web framework. The API is built with TypeScript for type safety, uses Drizzle ORM for database interactions, and employs Zod for input validation.

Key features include:
- User management (CRUD operations for users).
- Role management (CRUD operations for roles with permissions).
- JWT-based authentication with session tracking.
- Role-based access control for restricted endpoints.
- Comprehensive logging and error handling.
- Database migrations and seeding for consistent setup.

---

## Architecture

### Technology Stack

The backend is built using the following technologies:

- **Node.js**: Runtime environment for executing JavaScript server-side.
- **Fastify**: A high-performance web framework for building APIs.
- **TypeScript**: Adds static typing to JavaScript for improved developer experience and code reliability.
- **PostgreSQL**: Relational database for storing users, roles, and sessions.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **Zod**: Schema validation library for request payloads and environment variables.
- **JWT (jsonwebtoken)**: For secure authentication via JSON Web Tokens.
- **bcrypt**: For secure password hashing.
- **Winston**: Logging library with daily rotation for HTTP requests, errors, and database operations.
- **dotenv**: For managing environment variables.
- **Fastify Plugins**:
  - `@fastify/cors`: Enables Cross-Origin Resource Sharing.
  - `@fastify/helmet`: Adds security headers.
  - `@fastify/rate-limit`: Limits request rates to prevent abuse.
- **Drizzle-Kit**: CLI tool for database migrations and schema generation.

### Project Structure

The project follows a modular, domain-driven structure to ensure scalability and maintainability:

```
ndulo/
├── src/
│   ├── config/
│   │   ├── database.ts        # Database connection setup (PostgreSQL Pool)
│   │   └── env.ts            # Environment variable validation with Zod
│   ├── db/
│   │   ├── migrate.ts        # Database migration script
│   │   ├── migrateDown.ts    # Database rollback script
│   │   ├── schema.ts         # Database schema definitions
│   │   └── seed.ts           # Database seeding script
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication middleware
│   │   ├── logging.ts        # HTTP and error logging hooks
│   │   └── rbac.middleware.ts # Role-based access control middleware
│   ├── modules/
│   │   ├── roles/
│   │   │   ├── controllers/  # Role-related request handlers
│   │   │   ├── models/       # Role data model
│   │   │   ├── repositories/ # Role database operations
│   │   │   ├── routes/       # Role API routes
│   │   │   ├── schemas/      # Role validation schemas
│   │   │   ├── services/     # Role business logic
│   │   │   └── types/        # Role TypeScript interfaces
│   │   ├── users/
│   │   │   ├── controllers/  # User-related request handlers
│   │   │   ├── models/       # User data model
│   │   │   ├── repositories/ # User database operations
│   │   │   ├── routes/       # User API routes
│   │   │   ├── schemas/      # User validation schemas
│   │   │   ├── services/     # User business logic
│   │   │   └── types/        # User TypeScript interfaces
│   ├── utils/
│   │   ├── domain.ts         # Custom error classes
│   │   ├── logger.ts         # Logging configuration
│   │   ├── formatZodError.ts # Zod error formatting
│   │   ├── IdMandatory.ts    # ID validation utility
│   │   └── CONSTANTS.ts      # Shared constants
│   ├── drizzle/              # Migration files generated by Drizzle-Kit
│   ├── logs/                 # Log files (HTTP, errors, database)
│   └── index.ts              # Application entry point
├── package.json              # Project metadata and dependencies
├── tsconfig.json             # TypeScript configuration
├── drizzle.config.ts         # Drizzle-Kit configuration
├── create-module.sh          # Script to scaffold new modules
├── add-files.sh              # Script to add files to existing modules
└── .env                      # Environment variables
```

### Database Schema

The database consists of three main tables: `roles`, `usuarios`, and `sessoes_usuarios`. The schema is defined using Drizzle ORM in `src/db/schema.ts`.

#### `roles` Table
Stores role information with associated permissions.

| Column       | Type        | Constraints                         | Description                       |
|--------------|-------------|-------------------------------------|-----------------------------------|
| `id`         | UUID        | Primary Key, Default: `uuid_generate_v7()` | Unique role identifier |
| `nome`       | VARCHAR(100)| Unique, Not Null                    | Role name (e.g., "admin")         |
| `descricao`  | TEXT        | Optional                            | Role description                  |
| `permissions`| JSONB       | Optional                            | Permissions as JSON object         |
| `ativo`      | BOOLEAN     | Default: true                       | Role status                       |
| `created_at` | TIMESTAMP   | Default: `NOW()`                    | Creation timestamp                |
| `updated_at` | TIMESTAMP   | Default: `NOW()`                    | Last update timestamp             |

#### `usuarios` Table
Stores user information.

| Column         | Type        | Constraints                         | Description                       |
|----------------|-------------|-------------------------------------|-----------------------------------|
| `id`           | UUID        | Primary Key, Default: `uuid_generate_v7()` | Unique user identifier |
| `username`     | VARCHAR(100)| Unique, Not Null                    | Unique username                   |
| `nome_completo`| VARCHAR(255)| Not Null                            | Full name                         |
| `email`        | VARCHAR(255)| Unique, Not Null                    | Email address                     |
| `password`     | TEXT        | Not Null                            | Hashed password                   |
| `role_id`      | UUID        | References `roles(id)`, On Delete: Set Null | Associated role ID |
| `ativo`        | BOOLEAN     | Default: true                       | User status                       |
| `ultimo_login` | TIMESTAMP   | Optional                            | Last login timestamp              |
| `created_at`   | TIMESTAMP   | Default: `NOW()`                    | Creation timestamp                |
| `updated_at`   | TIMESTAMP   | Default: `NOW()`                    | Last update timestamp             |

#### `sessoes_usuarios` Table
Tracks user sessions for authentication.

| Column            | Type        | Constraints                         | Description                       |
|-------------------|-------------|-------------------------------------|-----------------------------------|
| `id`              | UUID        | Primary Key, Default: `uuid_generate_v7()` | Unique session identifier |
| `user_id`         | UUID        | Not Null, References `usuarios(id)`, On Delete: Cascade | User ID |
| `token`           | TEXT        | Not Null, Unique                    | JWT token                         |
| `ip_address`      | INET        | Optional                            | Client IP address                 |
| `user_agent`      | TEXT        | Optional                            | Client user agent                 |
| `device_info`     | JSONB       | Optional                            | Device information                |
| `created_at`      | TIMESTAMP   | Default: `NOW()`                    | Creation timestamp                |
| `ultima_atividade_em` | TIMESTAMP | Default: `NOW()`                    | Last activity timestamp           |
| `expires_at`      | TIMESTAMP   | Not Null                            | Session expiration timestamp      |

#### Relationships
- **One-to-Many**: `roles` to `usuarios` (one role can be assigned to many users).
- **One-to-Many**: `usuarios` to `sessoes_usuarios` (one user can have multiple sessions).
- Defined using Drizzle ORM's `relations` API in `schema.ts`.

### Environment Configuration

Environment variables are validated using Zod in `src/config/env.ts`. Required variables include:

| Variable       | Description                              | Example/Value                     |
|----------------|------------------------------------------|-----------------------------------|
| `NODE_ENV`     | Environment mode                         | `development`, `production`, `test` |
| `PORT`         | Server port                              | `3000`                            |
| `HOST`         | Server host                              | `0.0.0.0`                         |
| `LOG_LEVEL`    | Logging level                            | `info`                            |
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | Secret for JWT signing                   | 32+ character string               |
| `CORS_ORIGIN`  | Allowed CORS origins                     | `http://localhost:5173`           |

The `.env` file is loaded using `dotenv`, and validation ensures all required variables are present and correctly formatted.

---

## Development Details

### Authentication and Authorization

#### Authentication
- **Mechanism**: JWT-based authentication.
- **Process**:
  1. Users register or log in via `/api/v1/auth/register` or `/api/v1/auth/login`.
  2. Passwords are hashed using `bcrypt` with a salt of 12 rounds.
  3. Upon successful authentication, a JWT is generated with `jsonwebtoken`, containing `userId`, `email`, and `roleId`, signed with `JWT_SECRET`, and valid for 7 days.
  4. A session is created in the `sessoes_usuarios` table, storing the token, IP address, user agent, and expiration date.
  5. The `authMiddleware` validates tokens for protected routes by checking the `Authorization: Bearer <token>` header and verifying the session's validity.
- **Endpoints**:
  - `POST /api/v1/auth/register`: Creates a new user and returns a JWT.
  - `POST /api/v1/auth/login`: Authenticates a user and returns a JWT.
  - `POST /api/v1/auth/logout`: Invalidates the user's session (requires authentication).
  - `GET /api/v1/auth/me`: Retrieves the authenticated user's profile.

#### Authorization
- **Mechanism**: Role-Based Access Control (RBAC).
- **Implementation**:
  - The `rbacMiddleware` restricts access to certain endpoints based on the user's role.
  - Example: Only users with the `admin` role can access `POST /api/v1/users`, `GET /api/v1/users`, `PUT /api/v1/users/:id`, and `DELETE /api/v1/users/:id`.
  - Roles are stored in the `roles` table, with permissions stored as a JSONB object (e.g., `{ all: true }` for admin).

### API Endpoints

The API is versioned under `/api/v1`. Below are the main endpoints:

#### Health Check
- **GET /api/v1/health**: Checks server and database status.
  - Response: `{ status: "ok" | "error", timestamp: string, uptime: number, database: "connected" | "disconnected" }`
- **GET /api/v1/health/live**: Confirms server is running.
  - Response: `{ status: "alive" }`
- **GET /api/v1/health/ready**: Confirms database connectivity.
  - Response: `{ status: "ready" }` or error if database is unavailable.

#### Authentication
- **POST /api/v1/auth/register**
  - Body: `{ username: string, nomeCompleto: string, email: string, password: string, roleId?: string, ativo?: boolean }`
  - Response: `{ status: "success", message: string, data: { access_token: string, user: UserResponseType } }`
- **POST /api/v1/auth/login**
  - Body: `{ email: string, password: string }`
  - Response: `{ status: "success", message: string, data: { access_token: string, user: UserResponseType } }`
- **POST /api/v1/auth/logout** (requires authentication)
  - Response: `{ status: "success", message: string }`
- **GET /api/v1/auth/me** (requires authentication)
  - Response: `{ status: "success", data: UserResponseType }`

#### Users
All user endpoints except `GET /api/v1/users/:id` require `admin` role and authentication.

- **POST /api/v1/users**
  - Body: `{ username: string, nomeCompleto: string, email: string, password: string, roleId?: string, ativo?: boolean }`
  - Response: `{ status: "success", message: string, data: { id: string } }`
- **GET /api/v1/users**
  - Query: `{ page?: number, limit?: number, search?: string }`
  - Response: `{ status: "success", data: UserResponseType[], pagination: { page: number, limit: number, total: number, totalPages: number } }`
- **GET /api/v1/users/:id**
  - Response: `{ status: "success", data: UserResponseType }`
- **PUT /api/v1/users/:id**
  - Body: Partial user data (excluding `password`)
  - Response: `{ status: "success", message: string, data: UserResponseType }`
- **DELETE /api/v1/users/:id**
  - Response: `{ status: "success", message: string, data: null }`

#### Roles
All role endpoints require authentication.

- **POST /api/v1/roles**
  - Body: `{ nome: string, descricao?: string, permissions: object | string[], ativo?: boolean }`
  - Response: `{ status: "success", message: string, data: { id: string } }`
- **GET /api/v1/roles**
  - Query: `{ page?: number, limit?: number, search?: string }`
  - Response: `{ status: "success", data: RoleType[], pagination: { page: number, limit: number, total: number, totalPages: number } }`
- **GET /api/v1/roles/:id**
  - Response: `{ status: "success", data: RoleType }`
- **PUT /api/v1/roles/:id**
  - Body: Partial role data
  - Response: `{ status: "success", message: string, data: RoleType }`
- **DELETE /api/v1/roles/:id**
  - Response: `{ status: "success", message: string, data: null }`

### Middleware

- **authMiddleware**: Validates JWT tokens and ensures active sessions. Attaches user data (`userId`, `email`, `roleId`) to the request object.
- **rbacMiddleware**: Restricts access based on user roles, used for admin-only endpoints.
- **httpLoggingHook**: Logs HTTP requests (method, URL, IP, user agent, status code, response time).
- **errorLoggingHook**: Handles and logs errors, mapping them to appropriate HTTP status codes (e.g., 400, 401, 403, 404, 422, 500).

### Error Handling

Custom error classes in `src/utils/domain.ts` provide structured error responses:

| Error Class             | Status Code | Description                        |
|-------------------------|-------------|------------------------------------|
| `ValidationException`   | 422         | Input validation errors (Zod)      |
| `NotFoundException`     | 404         | Resource not found                 |
| `UnauthorizedException` | 401         | Invalid or missing credentials     |
| `ForbiddenException`    | 403         | Insufficient permissions           |
| `BadRequestException`   | 400         | Invalid request parameters         |
| `ConflictException`     | 409         | Resource conflicts (e.g., duplicate email) |
| `DatabaseException`     | 500         | Database operation failures        |

Errors are logged with context (method, URL, IP, etc.) and returned in a standardized format:

```json
{
  "error": {
    "message": "Error message",
    "statusCode": 422,
    "code": "VALIDATION_ERROR",
    "component": "ModuleName",
    "timestamp": "2025-09-18T22:31:00Z"
  }
}
```

### Logging

The logging system uses `winston` with daily rotation, storing logs in `logs/`:

- **HTTP Logs**: Stored in `logs/http/http-%DATE%.log`, capturing request details and response times.
- **Error Logs**: Stored in `logs/errors/error-%DATE%.log`, including stack traces and context.
- **Database Logs**: Stored in `logs/database/db-%DATE%.log`, logging queries and errors.
- **General Logs**: Stored in `logs/app/app-%DATE%.log` for application events.

Logs are JSON-formatted in production and colorized in development for readability.

### Database Migrations and Seeding

- **Migrations** (`src/db/migrate.ts`):
  - Uses Drizzle-Kit to generate and apply migrations.
  - Creates extensions (`uuid-ossp`, `pgcrypto`) and a custom `uuid_generate_v7` function.
  - Migrations are stored in `drizzle/` with timestamp prefixes.
  - Command: `npm run db:migrate`.
- **Rollback** (`src/db/migrateDown.ts`):
  - Applies down migrations in reverse order.
  - Command: `npm run migrate:down`.
- **Seeding** (`src/db/seed.ts`):
  - Creates an admin role (`nome: "admin", permissions: { all: true }`) and an admin user (`username: "admin", email: "admin@gmail.ao", password: "admin123"`).
  - Command: `npm run db:seed`.

### Validation

- **Zod**: Used for validating environment variables (`env.ts`), user input (`user.schema.ts`), and role input (`role.schema.ts`).
- **Error Formatting**: `formatZodError` converts Zod errors into readable strings.
- **ID Validation**: `IdMandatory` ensures non-empty IDs for operations.

---

## Security Considerations

- **Password Hashing**: Passwords are hashed with `bcrypt` (12 rounds) to prevent plaintext storage.
- **JWT Security**: Tokens are signed with a strong `JWT_SECRET` and validated for each request. Sessions are stored in the database with expiration dates.
- **Rate Limiting**: Limits requests to 100 per minute per IP to prevent abuse.
- **CORS**: Restricts origins to those specified in `CORS_ORIGIN`.
- **Helmet**: Adds security headers (e.g., XSS protection, content security policy).
- **Input Validation**: Zod ensures all inputs conform to expected schemas.
- **RBAC**: Restricts sensitive operations to admin roles.
- **Session Management**: Tracks active sessions and invalidates them on logout or expiration.

---

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd ndulo
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on the requirements in `src/config/env.ts`.

   Example:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=0.0.0.0
   LOG_LEVEL=info
   DATABASE_URL=postgresql://user:password@localhost:5432/ndulo
   JWT_SECRET=your-32-character-secret-here
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set Up PostgreSQL**:
   Ensure a PostgreSQL instance is running and accessible via `DATABASE_URL`.

5. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

6. **Seed Database** (optional):
   ```bash
   npm run db:seed
   ```

7. **Start the Server**:
   - Development: `npm run dev` (watches for changes).
   - Production: `npm run build && npm run start`.

---

## Testing

- **Framework**: Vitest is used for unit and integration tests.
- **Configuration**: Defined in `vitest.config.ts`.
- **Commands**:
  - Run tests: `npm run test`
  - Watch mode: `npm run test:watch`
  - Coverage report: `npm run test:coverage`
- **Environment**: Tests use a separate `.env.test` file for isolated database connections.

---

## Scripts and Automation

- **Module Scaffolding** (`create-module.sh`):
  Creates a new module directory with standard files (controller, model, repository, routes, schema, service, types).
  ```bash
  ./create-module.sh users
  ```

- **Add Files to Module** (`add-files.sh`):
  Adds specific files to an existing module, with optional custom entity name.
  ```bash
  ./add-files.sh users controller service --entity=user
  ```

- **NPM Scripts**:
  - `npm run lint`: Runs ESLint for code quality.
  - `npm run lint:fix`: Fixes linting issues.
  - `npm run format`: Formats code with Prettier.
  - `npm run db:generate`: Generates migration files.
  - `npm run db:studio`: Opens Drizzle-Kit studio for schema visualization.

---

## Future Improvements

- **Additional Endpoints**: Support for password reset, user profile updates, and permission management.
- **Advanced RBAC**: Implement granular permissions instead of JSONB objects.
- **Rate Limit Customization**: Allow per-route rate limits.
- **API Documentation**: Integrate Swagger/OpenAPI for automatic endpoint documentation.
- **Testing**: Expand test coverage for edge cases and integration tests.
- **Performance**: Add caching (e.g., Redis) for frequently accessed data.
- **Monitoring**: Integrate metrics (e.g., Prometheus) for performance monitoring.

