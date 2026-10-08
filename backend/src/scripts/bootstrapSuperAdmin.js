import readline from 'readline';
import { Writable } from 'stream';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { SuperAdmin } from '../models/SuperAdmin.js';
import { AuditLog } from '../models/AuditLog.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { hashPassword } from '../utils/crypto.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';

/**
 * Prompt terminal user with standard visible output
 */
function askQuestion(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

/**
 * Prompt terminal user with hidden input (no echo to terminal)
 */
function askHiddenQuestion(query) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // In non-interactive or piped environments, fall back to standard readline
      return askQuestion(query).then(resolve);
    }

    let muted = false;
    const mutableStdout = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    rl.question(query, (answer) => {
      rl.close();
      console.log(); // print newline after user hits enter
      resolve(answer.trim());
    });
    muted = true;
  });
}

/**
 * Validate bootstrap inputs
 */
export function validateBootstrapInputs({ fullName, email, password }) {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    throw new Error('Full name is required and must be at least 2 characters.');
  }

  if (fullName.trim().length > 120) {
    throw new Error('Full name cannot exceed 120 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    throw new Error('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    throw new Error('Password must contain at least one letter and one number.');
  }

  return true;
}

/**
 * Core bootstrap execution logic
 */
export async function runBootstrap(options = {}) {
  const isInteractive = options.interactive ?? (!process.env.CI && !process.env.BOOTSTRAP_SKIP_PROMPT && process.stdin.isTTY);

  // 1. Check whether Super Admin already exists
  const existingCount = await SuperAdmin.countDocuments();
  if (existingCount > 0) {
    return {
      success: false,
      alreadyExists: true,
      message: `Super Admin already exists (${existingCount} found). Bootstrap is a one-time operation and cannot create duplicate root accounts.`,
    };
  }

  let fullName = options.fullName || process.env.BOOTSTRAP_SUPERADMIN_NAME;
  let email = options.email || process.env.BOOTSTRAP_SUPERADMIN_EMAIL;
  let password = options.password || process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;
  let totpSecret = options.totpSecret || process.env.BOOTSTRAP_SUPERADMIN_TOTP_SECRET;

  if (isInteractive) {
    console.log('\n======================================================');
    console.log('    JONOSHOR (জনস্বর) — SUPER ADMIN INITIAL BOOTSTRAP   ');
    console.log('======================================================\n');
    console.log('This secure utility creates the first root Super Admin account.');
    console.log('This operation can only be executed ONCE.\n');

    if (!fullName) {
      fullName = await askQuestion('Enter Super Admin Full Name (e.g. Chief Executive): ');
    }

    if (!email) {
      email = await askQuestion('Enter Super Admin Email: ');
    }

    if (!password) {
      password = await askHiddenQuestion('Enter Super Admin Password (min 8 chars, 1 letter, 1 number): ');
      const confirmPassword = await askHiddenQuestion('Confirm Password: ');
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match. Aborting bootstrap.');
      }
    }
  }

  // 2. Validate inputs
  validateBootstrapInputs({ fullName, email, password });
  const normalizedEmail = email.trim().toLowerCase();

  // 3. Configure 2FA (Mandatory for Super Admin)
  if (!totpSecret) {
    totpSecret = authenticator.generateSecret();
  }

  const otpauthUri = authenticator.keyuri(normalizedEmail, 'JonoShor', totpSecret);

  if (isInteractive && !options.skipTotpPrompt) {
    console.log('\n------------------------------------------------------');
    console.log('  MANDATORY TWO-FACTOR AUTHENTICATION (2FA) SETUP     ');
    console.log('------------------------------------------------------');
    console.log('Scan the QR code below using your Authenticator app');
    console.log('(Google Authenticator, Microsoft Authenticator, Aegis, Authy):\n');

    try {
      const qrAscii = await qrcode.toString(otpauthUri, { type: 'terminal', small: true });
      console.log(qrAscii);
    } catch {
      console.log(`Authenticator URI: ${otpauthUri}`);
    }

    console.log(`Or manually enter secret key: ${totpSecret}\n`);

    let verified = false;
    let attempts = 0;
    while (!verified && attempts < 3) {
      attempts++;
      const code = await askQuestion('Enter the 6-digit TOTP code shown in your app to verify: ');
      if (authenticator.check(code, totpSecret)) {
        verified = true;
        console.log('✓ 2FA verification successful!\n');
      } else {
        console.log(`✗ Invalid TOTP code (attempt ${attempts} of 3). Please try again.`);
      }
    }

    if (!verified) {
      throw new Error('Failed to verify 2FA TOTP code within 3 attempts. Bootstrap aborted.');
    }
  }

  // 4. Secure Password Hashing via Argon2id (Existing project crypto)
  const passwordHash = await hashPassword(password);

  // 5. Create Root Super Admin Record
  const superAdmin = await SuperAdmin.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    permissions: ['*'],
    twoFactorEnabled: true,
    twoFactorSecret: totpSecret,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
  });

  // 6. Record Audit and Security Logs
  try {
    await AuditLog.create({
      actorId: superAdmin._id,
      actorType: 'superAdmin',
      action: 'SUPER_ADMIN_BOOTSTRAP',
      resourceType: 'SuperAdmin',
      resourceId: superAdmin._id,
      metadata: {
        email: superAdmin.email,
        reason: 'Initial system root bootstrap executed via secure CLI',
      },
    });

    await SecurityLog.create({
      eventType: 'PRIVILEGED_ACCOUNT_BOOTSTRAPPED',
      accountId: superAdmin._id,
      riskSignal: 'BOOTSTRAP_EXECUTION',
      actionTaken: 'SUPER_ADMIN_CREATED',
      metadata: {
        superAdminId: superAdmin._id,
        email: superAdmin.email,
      },
    });
  } catch (err) {
    console.error('Warning: could not write bootstrap audit log:', err.message);
  }

  return {
    success: true,
    alreadyExists: false,
    superAdmin: {
      id: superAdmin._id.toString(),
      fullName: superAdmin.fullName,
      email: superAdmin.email,
      permissions: superAdmin.permissions,
      twoFactorEnabled: superAdmin.twoFactorEnabled,
    },
    totpSecret, // returned for verification in programmatic/test runs
    message: 'Super Admin account successfully bootstrapped.',
  };
}

/**
 * Direct CLI invocation wrapper
 */
async function main() {
  let connected = false;
  try {
    await connectDatabase();
    connected = true;

    const result = await runBootstrap();

    if (result.alreadyExists) {
      console.log(`\n[SECURITY NOTICE] ${result.message}`);
      process.exit(0);
    }

    console.log('======================================================');
    console.log('      ✓ SUPER ADMIN BOOTSTRAP COMPLETED SUCCESSFULLY   ');
    console.log('======================================================');
    console.log(`Full Name:      ${result.superAdmin.fullName}`);
    console.log(`Email:          ${result.superAdmin.email}`);
    console.log(`Role:           Super Admin (Root Executive)`);
    console.log(`Permissions:    [*]`);
    console.log(`2FA Status:     Mandatory TOTP Enabled`);
    console.log('------------------------------------------------------');
    console.log('How to login:');
    console.log('1. Open your browser: http://localhost:5173/#/login');
    console.log(`2. Enter email: ${result.superAdmin.email}`);
    console.log('3. Enter your chosen password');
    console.log('4. Enter 6-digit TOTP code from your authenticator app');
    console.log('5. You will be automatically routed to: #/super-admin/dashboard');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error(`\n[BOOTSTRAP ERROR] ${err.message}\n`);
    process.exit(1);
  } finally {
    if (connected) {
      await disconnectDatabase().catch(() => {});
    }
  }
}

// Execute when run directly from command line
if (process.argv[1] && process.argv[1].endsWith('bootstrapSuperAdmin.js')) {
  main();
}
