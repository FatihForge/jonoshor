export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'জনস্বর (JonoShor) — API Documentation',
    version: '1.0.0',
    description: `
**JonoShor (জনস্বর)** is a structured human rights documentation and verified public reporting platform for Bangladesh.
It provides safe citizen grievance submission, tamper-proof audit trails, multi-stage evidence verification (quarantine → malware scan → review → publication), and executive governance.

### Core Architecture Principles
* **Complaint ≠ Proven Crime (অভিযোগ ≠ প্রমাণিত অপরাধ)**
* **Verified Report ≠ Legal Outcome (যাচাইকৃত রিপোর্ট ≠ আইনি রায়)**
* **Identity Private by Default:** Reporter IDs and victim identities are protected from unauthorized disclosure.
* **Immutable Audit Trail:** All administrative decisions and messages are permanent and append-only.

### Authentication & Authorization
* **Bearer Token:** Pass \`Authorization: Bearer <access_token>\` header.
* **HttpOnly Cookies:** Web SPA passes \`access_token\` and \`refresh_token\` cookies.
* **CSRF Protection:** State-changing requests (POST, PUT, PATCH, DELETE) require the \`X-CSRF-Token\` header.
* **Re-Authentication:** Sensitive Super Admin actions require a short-lived token via \`X-Reauth-Token\` header.
    `,
    contact: {
      name: 'JonoShor Security & Engineering Team',
      email: 'support@jonoshor.org',
      url: 'https://jonoshor.org',
    },
    license: {
      name: 'Proprietary / Human Rights Citizen Initiative',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.jonoshor.org',
      description: 'Production Environment',
    },
  ],
  tags: [
    { name: 'System & Health', description: 'Platform health checks and CSRF token retrieval' },
    { name: 'Authentication', description: 'User registration, login, email verification, 2FA, and session management' },
    { name: 'Public Directory', description: 'Publicly disclosed reports, statistics, geographical data, and CMS content' },
    { name: 'Public Submissions', description: 'Anonymous/visitor complaint submissions, Join Us applications, and contact inquiries' },
    { name: 'User Management & Profile', description: 'Registered user profile management, password updates, and notifications' },
    { name: 'User Complaints', description: 'User complaints tracking, draft management, withdrawal requests, and corrections' },
    { name: 'User Evidence', description: 'Multi-stage evidence upload sessions, external links, and secure downloads' },
    { name: 'User Messaging', description: 'Immutable two-way messaging between citizens and assigned caseworkers' },
    { name: 'Admin Complaints Review', description: 'Complaints queue, reviewer assignment, conflict of interest, and verification pipeline' },
    { name: 'Admin Evidence Management', description: 'Evidence review, redaction, malware verification, and public disclosure' },
    { name: 'Admin Join-Us Applications', description: 'Reviewing volunteer, legal, and contributor applications' },
    { name: 'Admin User Management', description: 'Admin management of user accounts and status controls' },
    { name: 'Admin Contact & Communications', description: 'Contact inquiries and direct user communications' },
    { name: 'Super Admin Governance', description: 'Executive console, RBAC permissions, admin onboarding, audit logs, and settings' },
    { name: 'Super Admin Storage', description: 'Google Drive storage account OAuth authorization and folder configuration' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Standard JSON Web Token. Example: Bearer eyJhbGciOi...',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'HttpOnly cookie containing the access token.',
      },
      CsrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'Anti-CSRF token retrieved from /api/v1/csrf-token.',
      },
      ReAuthToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Reauth-Token',
        description: 'Short-lived re-authentication token required for high-privilege governance mutations.',
      },
    },
    schemas: {
      StandardSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Input validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Must be a valid email address' },
                  },
                },
              },
            },
          },
        },
      },
      LocationCoordinate: {
        type: 'object',
        properties: {
          divisionId: { type: 'string', example: 'dhaka' },
          districtId: { type: 'string', example: 'dhaka_district' },
          upazilaId: { type: 'string', example: 'dhanmondi' },
          freeTextLocation: { type: 'string', example: 'Dhanmondi Road 27, near Star Kabab' },
        },
      },
      AccusedPerson: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'মো. রফিকুল ইসলাম' },
          alias: { type: 'string', example: 'রফিক' },
          role: { type: 'string', example: 'তদন্তকারী কর্মকর্তা' },
          organization: { type: 'string', example: 'স্থানীয় থানা' },
          visibility: { type: 'string', enum: ['private', 'public_approved', 'redacted'], example: 'private' },
        },
      },
      VictimPerson: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'আব্দুল করিম' },
          ageCategory: { type: 'string', enum: ['minor', 'adult', 'senior', 'unknown'], example: 'adult' },
          gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'], example: 'male' },
          minor: { type: 'boolean', example: false },
          identityVisibility: { type: 'string', enum: ['private', 'redacted', 'public_approved'], example: 'private' },
        },
      },
    },
  },
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Liveness Health Check',
        description: 'Returns basic API availability status for load balancers and orchestrators.',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/health/ready': {
      get: {
        tags: ['System & Health'],
        summary: 'Readiness Health Check (Database status)',
        description: 'Actively verifies live connection to MongoDB Atlas database before routing traffic.',
        responses: {
          200: {
            description: 'Service and database are fully operational',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true }, database: { type: 'string', example: 'connected' } },
                },
              },
            },
          },
          503: {
            description: 'Database connection offline',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },
    '/api/v1/csrf-token': {
      get: {
        tags: ['System & Health'],
        summary: 'Retrieve Anti-CSRF Token',
        description: 'Generates a signed anti-CSRF token cookie and returns the corresponding client token header value.',
        responses: {
          200: {
            description: 'CSRF token issued successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    csrfToken: { type: 'string', example: 'c8f7a932d1e084...' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // AUTHENTICATION
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register New Citizen User',
        description: 'Creates a local citizen account. Enforces disposable email block and sends a 6-digit email verification code.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'মুহাম্মদ তারেক' },
                  email: { type: 'string', format: 'email', example: 'citizen@example.com' },
                  password: { type: 'string', minLength: 8, example: 'SuperSecurePassword123!' },
                  mobile: { type: 'string', example: '01711000000' },
                  languagePreference: { type: 'string', enum: ['bn', 'en', 'auto'], default: 'bn' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful, verification email dispatched', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          400: { description: 'Invalid input or disposable email', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
          409: { description: 'Email address already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify Email with 6-digit Code',
        description: 'Validates the email verification code sent during registration.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'citizen@example.com' },
                  code: { type: 'string', example: '492815' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email successfully verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          400: { description: 'Invalid or expired code', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/resend-verification': {
      post: {
        tags: ['Authentication'],
        summary: 'Resend Email Verification Code',
        description: 'Dispatches a new verification code if the previous one expired.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'citizen@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'New verification code sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Citizen User Login',
        description: 'Authenticates a verified citizen user. Sets HttpOnly access_token and refresh_token cookies and returns user details.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'citizen@example.com' },
                  password: { type: 'string', example: 'SuperSecurePassword123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, session tokens issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          401: { description: 'Invalid credentials or unverified email', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
          403: { description: 'Account suspended or blocked', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Access Token',
        description: 'Rotates refresh tokens and issues a new access token for User, Admin, or SuperAdmin.',
        responses: {
          200: { description: 'New access token issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          401: { description: 'Expired or reused refresh token (initiates security lockout)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User & Staff Logout',
        description: 'Revokes the active session and clears authentication cookies.',
        responses: {
          200: { description: 'Successfully logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request Password Reset Email',
        description: 'Sends a cryptographically secure, time-limited password reset link to the email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email', example: 'citizen@example.com' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset link sent if account exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset Password with Reset Token',
        description: 'Resets user password and revokes all previous active sessions across all devices.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', example: 'crypto_random_reset_token' },
                  password: { type: 'string', minLength: 8, example: 'NewStrongPassword2026!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated and sessions revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          400: { description: 'Invalid or expired token', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },

    // PRIVILEGED AUTH (ADMIN & SUPER ADMIN 2FA)
    '/api/v1/auth/admin/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Admin Initial Login Step (Generates Temp 2FA Token)',
        description: 'Step 1 of admin authentication: validates credentials and returns a 5-minute temporary 2FA token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@jonoshor.org' },
                  password: { type: 'string', example: 'AdminPassphrase2026!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Credentials valid. Requires TOTP 2FA verification.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        temp2FAToken: { type: 'string', example: 'eyJhbGciOi...' },
                        requires2FA: { type: 'boolean', example: true },
                        twoFactorEnabled: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid admin credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/admin/2fa/setup': {
      post: {
        tags: ['Authentication'],
        summary: 'Setup 2FA for Admin (Initial activation only)',
        description: 'Generates TOTP secret and otpauth URI. Re-setup is strictly blocked if 2FA is already enabled.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['temp2FAToken'],
                properties: { temp2FAToken: { type: 'string', example: 'eyJhbGciOi...' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'TOTP secret generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          403: { description: '2FA is already configured on this account', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/admin/2fa/verify': {
      post: {
        tags: ['Authentication'],
        summary: 'Complete Admin 2FA Login',
        description: 'Step 2 of admin authentication: verifies 6-digit TOTP code and establishes the staff session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['temp2FAToken', 'totpCode'],
                properties: {
                  temp2FAToken: { type: 'string', example: 'eyJhbGciOi...' },
                  totpCode: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '2FA verified, admin session established', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          401: { description: 'Invalid 2FA code or expired session', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/auth/super-admin/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Super Admin Initial Login Step',
        description: 'Step 1 of Super Admin authentication: validates root credentials and returns temp 2FA token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'superadmin@jonoshor.org' },
                  password: { type: 'string', example: 'SuperAdminMasterPass2026!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Requires Super Admin TOTP verification', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/auth/re-authenticate': {
      post: {
        tags: ['Authentication'],
        summary: 'Critical-Action Re-Authentication (Password + TOTP)',
        description: 'Generates a 5-minute single-use reAuthToken with unique jti required for sensitive governance mutations.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password', 'totpCode'],
                properties: {
                  password: { type: 'string', example: 'SuperAdminMasterPass2026!' },
                  totpCode: { type: 'string', example: '654321' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Re-authentication successful, reAuthToken issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { reAuthToken: { type: 'string', example: 'eyJhbGciOi...' } },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid password or 2FA code', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },

    // PUBLIC DIRECTORY & SUBMISSIONS
    '/api/v1/public/reports': {
      get: {
        tags: ['Public Directory'],
        summary: 'List Verified Public Reports',
        description: 'Retrieves verified and approved human rights incident reports with multi-criteria filtering and bilingual support.',
        parameters: [
          { in: 'query', name: 'category', schema: { type: 'string' }, description: 'Primary incident category' },
          { in: 'query', name: 'divisionId', schema: { type: 'string' }, description: 'Division ID filter' },
          { in: 'query', name: 'districtId', schema: { type: 'string' }, description: 'District ID filter' },
          { in: 'query', name: 'upazilaId', schema: { type: 'string' }, description: 'Upazila ID filter' },
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Text search in title and summary' },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
        ],
        responses: {
          200: { description: 'List of sanitized public reports', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/public/reports/{id}': {
      get: {
        tags: ['Public Directory'],
        summary: 'Get Detailed Public Report',
        description: 'Returns full verified report details including anonymized victims, neutral accused listings, and official outcomes.',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Public Report ID or Complaint ID' },
        ],
        responses: {
          200: { description: 'Detailed report view', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          404: { description: 'Report not found or not published', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/public/statistics': {
      get: {
        tags: ['Public Directory'],
        summary: 'Get Live Aggregated Platform Statistics',
        description: 'Returns MongoDB aggregated counters for verified cases, resolved cases, district distributions, and category breakdowns.',
        responses: {
          200: { description: 'Platform statistics object', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/public/districts': {
      get: {
        tags: ['Public Directory'],
        summary: 'List Bangladesh Geographic Districts',
        description: 'Returns geographic divisions and districts metadata for cascaded dropdown forms.',
        responses: {
          200: { description: 'List of districts and divisions', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/public/complaints': {
      post: {
        tags: ['Public Submissions'],
        summary: 'Submit Citizen Complaint (Visitor or Registered)',
        description: 'Allows anonymous or registered citizen grievance submission. Non-users can submit up to 5 complaints before account creation is required.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'incident', 'location'],
                properties: {
                  category: {
                    type: 'object',
                    properties: { primary: { type: 'string', example: 'torture_and_custodial_abuse' }, secondary: { type: 'array', items: { type: 'string' } } },
                  },
                  incident: {
                    type: 'object',
                    properties: {
                      startDate: { type: 'string', format: 'date', example: '2026-05-15' },
                      description: { type: 'string', example: 'ঘটনাস্থলে ভুক্তভোগীকে অন্যায়ভাবে আটক করে শারীরিক নির্যাতন চালানো হয়...' },
                      datePrecision: { type: 'string', enum: ['exact', 'approximate', 'range', 'ongoing'], default: 'exact' },
                    },
                  },
                  location: { $ref: '#/components/schemas/LocationCoordinate' },
                  accused: { type: 'array', items: { $ref: '#/components/schemas/AccusedPerson' } },
                  victims: { type: 'array', items: { $ref: '#/components/schemas/VictimPerson' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Complaint successfully registered in submitted queue', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          429: { description: 'Submission rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/public/join-us': {
      post: {
        tags: ['Public Submissions'],
        summary: 'Volunteer & Professional Contributor Application',
        description: 'Multi-part form submission accepting CV, recommendation letters, professional links, and contribution role.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'primaryProfession', 'primaryContributionRole', 'contributionDetails'],
                properties: {
                  fullName: { type: 'string', example: 'ব্যারিস্টার তানভীর আহমেদ' },
                  email: { type: 'string', format: 'email', example: 'lawyer@example.com' },
                  primaryProfession: { type: 'string', example: 'আইনজীবী (সুপ্রিম কোর্ট)' },
                  primaryContributionRole: { type: 'string', example: 'আইনি সহায়তা ও মামলা পরিচালনা' },
                  contributionDetails: { type: 'string', example: 'ভুক্তভোগীদের বিনামূল্যে আইনি পরামর্শ ও জামিন শুনানিতে প্রতিনিধিত্ব করতে ইচ্ছুক।' },
                  linkedin: { type: 'string', example: 'https://linkedin.com/in/lawyer-tanveer' },
                  documents: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Max 5 files (CV, Bar council cert, etc.)' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Application submitted and quarantined for scanning', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          409: { description: 'Pending application already exists for this email', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/public/contact': {
      post: {
        tags: ['Public Submissions'],
        summary: 'Submit Public Contact Form Message',
        description: 'Sends secure feedback, whistleblower inquiries, or general support queries.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'message'],
                properties: {
                  name: { type: 'string', example: 'রহিম শেখ' },
                  email: { type: 'string', format: 'email', example: 'citizen@example.com' },
                  subject: { type: 'string', example: 'প্রমাণের নিরাপত্তা বিষয়ক তথ্য জানতে চাই' },
                  message: { type: 'string', example: 'আমার কাছে ভিডিও ফুটেজ আছে, কীভাবে নিরাপদে আপলোড করব?' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Contact inquiry recorded', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },

    // USER PORTAL
    '/api/v1/user/profile': {
      get: {
        tags: ['User Management & Profile'],
        summary: 'Get Authenticated User Profile',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'User profile object', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
      patch: {
        tags: ['User Management & Profile'],
        summary: 'Update Profile Details',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'মুহাম্মদ তারেক চৌধুরী' },
                  mobile: { type: 'string', example: '01711223344' },
                  languagePreference: { type: 'string', enum: ['bn', 'en', 'auto'], example: 'bn' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/user/security': {
      get: {
        tags: ['User Management & Profile'],
        summary: 'Get Account Security Settings',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Security status flags (2FA status, last password change)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
      patch: {
        tags: ['User Management & Profile'],
        summary: 'Change Password (Invalidates other sessions)',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'OldPassword123!' },
                  newPassword: { type: 'string', minLength: 8, example: 'BrandNewSecurePass2026!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated and sessions revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          400: { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/user/complaints': {
      get: {
        tags: ['User Complaints'],
        summary: 'List User Own Complaints',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'List of user complaints and live status', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
      post: {
        tags: ['User Complaints'],
        summary: 'Create or Submit Complaint as Authenticated User',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/paths/~1api~1v1~1public~1complaints/post/requestBody/content/application~1json/schema' } } },
        },
        responses: {
          201: { description: 'Complaint created and linked to user account', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/user/complaints/{id}/withdraw': {
      post: {
        tags: ['User Complaints'],
        summary: 'Request Complaint Withdrawal',
        description: 'Initiates formal withdrawal review. Does not immediately delete to preserve evidence preservation integrity.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reason'],
                properties: { reason: { type: 'string', example: 'উভয় পক্ষ আদালতে আপোষ মীমাংসায় উপনীত হয়েছে।' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Withdrawal review requested', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/user/complaints/{id}/evidence/upload-session': {
      post: {
        tags: ['User Evidence'],
        summary: 'Initiate Evidence Upload Session',
        description: 'Prepares Google Drive quarantine storage file slot and generates an upload ticket.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['filename', 'mimeType', 'size'],
                properties: {
                  filename: { type: 'string', example: 'incident_cctv.mp4' },
                  mimeType: { type: 'string', example: 'video/mp4' },
                  size: { type: 'integer', example: 14500000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Upload session initialized with session ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/user/messages': {
      get: {
        tags: ['User Messaging'],
        summary: 'List User Conversations',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Threaded conversations list', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/user/messages/{conversationId}': {
      get: {
        tags: ['User Messaging'],
        summary: 'Get Conversation Thread Messages',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [{ in: 'path', name: 'conversationId', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of messages in conversation', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          403: { description: 'Forbidden: Not a participant in this conversation', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
      post: {
        tags: ['User Messaging'],
        summary: 'Reply in Conversation',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'conversationId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['body'],
                properties: { body: { type: 'string', example: 'নতুন মেডিকেল সার্টিফিকেট আপলোড করা হয়েছে, অনুগ্রহ করে দেখুন।' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Message sent (immutable)', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },

    // ADMIN CONSOLE
    '/api/v1/admin/dashboard': {
      get: {
        tags: ['Admin Complaints Review'],
        summary: 'Admin Dashboard Overview Metrics',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Queue metrics and review status statistics', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/admin/complaints': {
      get: {
        tags: ['Admin Complaints Review'],
        summary: 'List Complaints Queue with Filters',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string' } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'districtId', schema: { type: 'string' } },
          { in: 'query', name: 'priority', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Filtered complaints list', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/admin/complaints/{id}/review': {
      post: {
        tags: ['Admin Complaints Review'],
        summary: 'Submit Verification Decision for Complaint',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['decision', 'reason'],
                properties: {
                  decision: { type: 'string', enum: ['verified', 'rejected', 'more_info_needed'], example: 'verified' },
                  reason: { type: 'string', example: 'সংযুক্ত সিসিটিভি ফুটেজ ও হাসপাতাল রিপোর্টের ভিত্তিতে সত্যতা নিশ্চিত হয়েছে।' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Decision recorded in immutable audit log', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          409: { description: 'Conflict of interest declared on this complaint', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/admin/complaints/{id}/public-report': {
      post: {
        tags: ['Admin Complaints Review'],
        summary: 'Create & Publish Sanitized Public Report',
        description: 'Transforms verified complaint into a sanitized, non-defamatory public report.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bn', 'en'],
                properties: {
                  bn: {
                    type: 'object',
                    required: ['title', 'summary', 'incidentStory'],
                    properties: {
                      title: { type: 'string', example: 'ধানমন্ডিতে বেআইনি আটকের ঘটনায় সত্যতা যাচাইকৃত প্রতিবেদন' },
                      summary: { type: 'string', example: 'তদন্তে বেআইনি আটকের সত্যতা প্রমাণিত হয়েছে...' },
                      incidentStory: { type: 'string', example: 'গত ১৫ মে ২০২৬ তারিখের ঘটনার প্রেক্ষিতে...' },
                    },
                  },
                  en: {
                    type: 'object',
                    required: ['title', 'summary', 'incidentStory'],
                    properties: {
                      title: { type: 'string', example: 'Verified Report on Unlawful Detention in Dhanmondi' },
                      summary: { type: 'string', example: 'Investigation confirmed unlawful detention...' },
                      incidentStory: { type: 'string', example: 'Following investigative procedures on May 15, 2026...' },
                    },
                  },
                  caseStatus: { type: 'string', example: 'under_investigation' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Public report generated and published', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },

    // SUPER ADMIN GOVERNANCE
    '/api/v1/super-admin/dashboard': {
      get: {
        tags: ['Super Admin Governance'],
        summary: 'Super Admin Executive Console Overview',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Platform-wide security counts, admin counts, and system status', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/super-admin/admins': {
      get: {
        tags: ['Super Admin Governance'],
        summary: 'List Operational Admins',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Admins list with assigned permissions', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
      post: {
        tags: ['Super Admin Governance'],
        summary: 'Create New Admin Account',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'অ্যাডমিন ইউজার' },
                  email: { type: 'string', format: 'email', example: 'investigator@jonoshor.org' },
                  password: { type: 'string', minLength: 8, example: 'AdminStrongPassword2026!' },
                  permissions: { type: 'array', items: { type: 'string' }, example: ['complaint.read', 'complaint.verify'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Admin account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/super-admin/admins/{id}': {
      patch: {
        tags: ['Super Admin Governance'],
        summary: 'Update Admin Status (Suspend / Block / Activate)',
        description: 'Changing status to suspended or blocked immediately revokes all active sessions and refresh tokens.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  accountStatus: { type: 'string', enum: ['active', 'suspended', 'blocked'], example: 'suspended' },
                  fullName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Admin updated and sessions revoked if suspended', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/super-admin/admins/{id}/permissions': {
      patch: {
        tags: ['Super Admin Governance'],
        summary: 'Update Admin Permissions (Requires Re-Authentication)',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }, { CsrfToken: [] }, { ReAuthToken: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissions'],
                properties: {
                  permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['complaint.read', 'complaint.verify', 'evidence.read', 'evidence.review'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Permissions updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
          401: { description: 'Critical action requires valid single-use reAuthToken', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } } },
        },
      },
    },
    '/api/v1/super-admin/audit-logs': {
      get: {
        tags: ['Super Admin Governance'],
        summary: 'Query Master Immutable Audit Logs',
        description: 'Returns chronological, tamper-evident audit records sorted by timestamp descending.',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'Audit log records', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
    '/api/v1/super-admin/storage/google-drive/status': {
      get: {
        tags: ['Super Admin Storage'],
        summary: 'Inspect Dedicated Google Drive Storage Status',
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: 'Google Drive quarantine, clean, and public folder health', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardSuccess' } } } },
        },
      },
    },
  },
};
