# Auth API (Register / OTP / Login)

This document describes the authentication endpoints implemented in the backend and includes quick `curl`/PowerShell examples.

## Environment
Set these variables (e.g. in `.env`):

- MONGODB_URL
- DATABASE_NAME
- EMAIL_USER
- EMAIL_PASS
- JWT_SECRET
- JWT_EXPIRES_IN (optional, default `1d`)

## Endpoints

1) POST /auth/register
- Body: { username?, phone?, email, password }
- Creates a user (unverified), sends an OTP to email.

2) POST /auth/verify-otp
- Body: { email, otp }
- Verifies the user using OTP.

3) POST /auth/resend-otp
- Body: { email }
- Sends a new OTP if user exists and not verified.

4) POST /auth/login
- Body: { idName, password } // idName can be email or phone
- Returns JWT when verified and credentials match.

## Examples (PowerShell / curl)

Register:
```powershell
curl -Method POST -Uri http://localhost:8071/auth/register -ContentType 'application/json' -Body (@{email='me@example.com'; password='secret123'; username='Huong'; phone='0123456789'} | ConvertTo-Json)
```

Verify OTP:
```powershell
curl -Method POST -Uri http://localhost:8071/auth/verify-otp -ContentType 'application/json' -Body (@{email='me@example.com'; otp='123456'} | ConvertTo-Json)
```

Resend OTP:
```powershell
curl -Method POST -Uri http://localhost:8071/auth/resend-otp -ContentType 'application/json' -Body (@{email='me@example.com'} | ConvertTo-Json)
```

Login:
```powershell
curl -Method POST -Uri http://localhost:8071/auth/login -ContentType 'application/json' -Body (@{idName='me@example.com'; password='secret123'} | ConvertTo-Json)
```

## Notes
- OTPs are stored hashed in DB and expire after 3 minutes.
- `resend-otp` and `register` endpoints have a simple in-memory rate limiter applied.
- For production, replace the in-memory rate limiter with a centralized store (Redis) and consider transactional flows for creating users vs sending OTPs.
