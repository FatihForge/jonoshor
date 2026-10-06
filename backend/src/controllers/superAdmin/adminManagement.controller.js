import { Admin } from '../../models/Admin.js';
import { SecurityLog } from '../../models/SecurityLog.js';
import { AuditLog } from '../../models/AuditLog.js';
import { SystemSetting } from '../../models/SystemSetting.js';
import { hashPassword } from '../../utils/crypto.js';
import { auditService } from '../../services/audit/audit.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { PERMISSIONS } from '../../constants/permissions.js';

export const superAdminController = {
  async getDashboard(_req, res, next) {
    try {
      const [
        totalAdmins,
        activeAdmins,
        suspendedAdmins,
        blockedAdmins,
        totalSecurityLogs,
        totalAuditLogs,
      ] = await Promise.all([
        Admin.countDocuments({}),
        Admin.countDocuments({ accountStatus: 'active' }),
        Admin.countDocuments({ accountStatus: 'suspended' }),
        Admin.countDocuments({ accountStatus: 'blocked' }),
        SecurityLog.countDocuments({}),
        AuditLog.countDocuments({}),
      ]);

      sendSuccess(res, 200, {
        status: 'SuperAdmin dashboard operational',
        counts: {
          totalAdmins,
          activeAdmins,
          suspendedAdmins,
          blockedAdmins,
          totalSecurityLogs,
          totalAuditLogs,
        },
      }, 'SuperAdmin dashboard retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getAvailablePermissions(_req, res) {
    sendSuccess(res, 200, Object.values(PERMISSIONS), 'Available permissions retrieved');
  },

  async createAdmin(req, res, next) {
    try {
      const { fullName, email, password, mobile, permissions } = req.body;
      const existing = await Admin.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new ConflictError('Admin with this email already exists');
      }

      const passwordHash = await hashPassword(password);
      const admin = await Admin.create({
        fullName,
        email: email.toLowerCase(),
        mobile,
        passwordHash,
        permissions: permissions || [],
        createdBy: req.user._id,
      });

      await auditService.log({
        actorId: req.user._id,
        actorType: 'superAdmin',
        action: 'ADMIN_CREATED',
        entity: 'Admin',
        entityId: admin._id,
        metadata: { email: admin.email, permissions: admin.permissions },
      });

      const sanitized = admin.toObject();
      delete sanitized.passwordHash;

      sendSuccess(res, 201, sanitized, 'Admin account created');
    } catch (err) {
      next(err);
    }
  },

  async listAdmins(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const [admins, total] = await Promise.all([
        Admin.find({})
          .select('-passwordHash')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Admin.countDocuments({}),
      ]);

      sendSuccess(res, 200, admins, 'Admins retrieved', { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  async getAdminById(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await Admin.findById(id).select('-passwordHash').lean();
      if (!admin) {
        throw new NotFoundError('Admin not found');
      }
      sendSuccess(res, 200, admin);
    } catch (err) {
      next(err);
    }
  },

  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, mobile, accountStatus } = req.body;
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new NotFoundError('Admin not found');
      }

      if (fullName) admin.fullName = fullName;
      if (mobile !== undefined) admin.mobile = mobile;
      if (accountStatus) admin.accountStatus = accountStatus;

      await admin.save();

      await auditService.log({
        actorId: req.user._id,
        actorType: 'superAdmin',
        action: 'ADMIN_UPDATED',
        entity: 'Admin',
        entityId: admin._id,
        metadata: { accountStatus },
      });

      const sanitized = admin.toObject();
      delete sanitized.passwordHash;

      sendSuccess(res, 200, sanitized, 'Admin updated');
    } catch (err) {
      next(err);
    }
  },

  async updatePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        throw new ValidationError('Permissions must be an array of strings');
      }

      const admin = await Admin.findById(id);
      if (!admin) {
        throw new NotFoundError('Admin not found');
      }

      admin.permissions = permissions;
      await admin.save();

      await auditService.log({
        actorId: req.user._id,
        actorType: 'superAdmin',
        action: 'ADMIN_PERMISSIONS_UPDATED',
        entity: 'Admin',
        entityId: admin._id,
        metadata: { permissions },
      });

      sendSuccess(res, 200, { permissions: admin.permissions }, 'Permissions updated');
    } catch (err) {
      next(err);
    }
  },

  async getSecurityLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        SecurityLog.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        SecurityLog.countDocuments({}),
      ]);

      sendSuccess(res, 200, logs, 'Security logs retrieved', { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        AuditLog.countDocuments({}),
      ]);

      sendSuccess(res, 200, logs, 'All audit logs retrieved', { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  async getSystemSettings(_req, res, next) {
    try {
      const defaultSystemSettings = [
        { key: 'platform_name', value: 'জনস্বর (JonoShor)', category: 'general' },
        { key: 'organization_legal_name', value: 'জনস্বর সিটিজেনস ইনিশিয়েটিভ', category: 'general' },
        { key: 'support_email', value: 'support@jonoshor.org', category: 'general' },
        { key: 'allow_user_registration', value: true, category: 'general' },
        { key: 'maintenance_mode', value: false, category: 'general' },
        { key: 'enforce_2fa_for_admins', value: true, category: 'security' },
        { key: 'session_inactivity_timeout_minutes', value: 30, category: 'security' },
        { key: 'max_failed_login_attempts', value: 5, category: 'security' },
        { key: 'rate_limiting_enabled', value: true, category: 'security' },
        { key: 'anonymous_submission_allowed', value: true, category: 'complaint' },
        { key: 'max_evidence_files_per_complaint', value: 10, category: 'complaint' },
        { key: 'max_file_size_mb', value: 25, category: 'complaint' },
        { key: 'require_admin_verification_before_publish', value: true, category: 'complaint' },
      ];

      for (const def of defaultSystemSettings) {
        await SystemSetting.updateOne({ key: def.key }, { $setOnInsert: def }, { upsert: true });
      }

      const settings = await SystemSetting.find({ category: { $ne: 'financial' } })
        .sort({ category: 1, key: 1 })
        .lean();
      sendSuccess(res, 200, settings, 'System settings retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updateSystemSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value, category } = req.body;

      if (value === undefined) {
        throw new ValidationError('Setting value is required');
      }

      const validCategories = ['general', 'security', 'complaint'];
      const targetCategory = category && validCategories.includes(category) ? category : 'general';

      const setting = await SystemSetting.findOneAndUpdate(
        { key },
        { value, category: targetCategory, updatedBy: req.user._id, $inc: { version: 1 } },
        { new: true, upsert: true }
      );

      await auditService.log({
        actorId: req.user._id,
        actorType: 'superAdmin',
        action: 'SYSTEM_SETTING_UPDATED',
        entity: 'SystemSetting',
        metadata: { key, version: setting.version },
      });

      sendSuccess(res, 200, setting, 'System setting updated');
    } catch (err) {
      next(err);
    }
  },

  async getFinancialSettings(_req, res, next) {
    try {
      // Sensitive financial destination settings (Super Admin only, Section 72)
      const defaultFinancialSettings = [
        { key: 'bank_name', value: 'Dhaka Bank Limited', category: 'financial' },
        { key: 'bank_account_title', value: 'JonoShor Legal Defense Trust', category: 'financial' },
        { key: 'bank_account_number', value: '215.100.009876', category: 'financial' },
        { key: 'bank_routing_number', value: '085261728', category: 'financial' },
        { key: 'bkash_merchant_number', value: '01700000000', category: 'financial' },
        { key: 'nagad_merchant_number', value: '01800000000', category: 'financial' },
        { key: 'donation_enabled', value: true, category: 'financial' },
        { key: 'min_donation_bdt', value: 50, category: 'financial' },
      ];

      for (const def of defaultFinancialSettings) {
        await SystemSetting.updateOne({ key: def.key }, { $setOnInsert: def }, { upsert: true });
      }

      const settings = await SystemSetting.find({ category: 'financial' }).sort({ key: 1 }).lean();

      // Mask any potential sensitive secret values or API tokens
      const safeSettings = settings.map((s) => {
        const isSecretKey = /secret|token|api_key|private|password/i.test(s.key);
        if (isSecretKey && typeof s.value === 'string' && s.value.length > 0) {
          return {
            ...s,
            value: s.value.length > 8 ? `${s.value.slice(0, 4)}••••${s.value.slice(-4)}` : '••••••••',
            isMasked: true,
          };
        }
        return s;
      });

      sendSuccess(res, 200, safeSettings, 'Financial settings retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updateFinancialSettings(req, res, next) {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        throw new ValidationError('Settings must be an array of key-value objects');
      }

      for (const item of settings) {
        if (!item.key || item.value === undefined) continue;

        // Skip overwriting if a masked placeholder was submitted unmodified
        if (typeof item.value === 'string' && item.value.includes('••••')) {
          continue;
        }

        await SystemSetting.findOneAndUpdate(
          { key: item.key },
          { value: item.value, category: 'financial', updatedBy: req.user._id, $inc: { version: 1 } },
          { new: true, upsert: true }
        );
      }

      await auditService.log({
        actorId: req.user._id,
        actorType: 'superAdmin',
        action: 'FINANCIAL_SETTINGS_UPDATED',
        entity: 'SystemSetting',
        metadata: { keys: settings.map((s) => s.key) },
      });

      sendSuccess(res, 200, { success: true }, 'Financial settings updated');
    } catch (err) {
      next(err);
    }
  },
};
