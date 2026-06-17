# Node.js Backend Packages Overview

## express

A fast and minimalist web framework for Node.js used to build APIs and web applications.

**Example Use Cases:**

- Creating REST APIs
- Defining routes and endpoints
- Handling HTTP requests and responses

---

## bcryptjs

A JavaScript library used for hashing and comparing passwords securely.

**Example Use Cases:**

- Hashing user passwords before storing them in a database
- Verifying passwords during login

---

## cors

Middleware that enables Cross-Origin Resource Sharing (CORS), allowing frontend applications hosted on different domains or ports to access your backend API.

**Example Use Cases:**

- Connecting an Angular, React, or Vue frontend to a Node.js backend
- Allowing requests from specific domains

---

## dotenv

Loads environment variables from a `.env` file into `process.env`.

**Example Use Cases:**

- Storing database credentials
- Managing API keys and JWT secrets
- Keeping sensitive information out of source code

---

## jsonwebtoken

A library for creating, signing, verifying, and decoding JSON Web Tokens (JWTs).

**Example Use Cases:**

- User authentication
- Role-based authorization
- Secure API access

---

## mongoose

An Object Data Modeling (ODM) library for MongoDB and Node.js.

**Example Use Cases:**

- Defining database schemas and models
- Performing CRUD operations
- Managing relationships between collections

---

## nodemailer

A module for sending emails from Node.js applications.

**Example Use Cases:**

- Email verification
- Password reset emails
- Notifications and alerts

---

## Installation

```bash
npm install express bcryptjs cors dotenv jsonwebtoken mongoose nodemailer
```

---

# Dependencies vs DevDependencies

In a Node.js project, the distinction between **dependencies** and **devDependencies** is based on whether the package is needed when the application runs in production.

## Dependencies

Packages listed under `dependencies` are required for the application to run in production. These packages are installed when the application is deployed and are used directly by the running code.

### Examples

- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- cookie-parser
- dotenv
- nodemailer

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^9.6.3",
    "jsonwebtoken": "^9.0.3"
  }
}
```

Install a dependency:

```bash
npm install express
```

## DevDependencies

Packages listed under `devDependencies` are only required during development, testing, building, or debugging. They are not needed when the application runs in production.

### Examples

- typescript
- ts-node
- nodemon
- @types/node
- jest
- eslint
- prettier

```json
{
  "devDependencies": {
    "typescript": "^6.0.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.1.14"
  }
}
```

Install a development dependency:

```bash
npm install --save-dev typescript
```

or

```bash
npm install -D typescript
```
