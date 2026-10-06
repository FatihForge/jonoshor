import { SystemSetting } from '../models/SystemSetting.js';

export const systemSettingsRepository = {
  async get(key) {
    const setting = await SystemSetting.findOne({ key }).exec();
    return setting ? setting.value : null;
  },

  async set(key, value, category = 'general', updatedBy = null) {
    return await SystemSetting.findOneAndUpdate(
      { key },
      {
        $set: { value, category, updatedBy },
        $inc: { version: 1 },
      },
      { upsert: true, new: true }
    ).exec();
  },

  async findByCategory(category) {
    return await SystemSetting.find({ category }).exec();
  },
};
