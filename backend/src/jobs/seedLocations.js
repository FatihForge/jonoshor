import { District } from '../models/District.js';
import { Upazila } from '../models/Upazila.js';
import { BANGLADESH_DISTRICTS, SAMPLE_UPAZILAS } from '../data/bangladeshGeoData.js';
import { logger } from '../utils/logger.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

export async function seedLocations() {
  try {
    const existingDistrictCount = await District.countDocuments();
    if (existingDistrictCount === 0) {
      logger.info('Seeding Bangladesh districts...');
      await District.insertMany(BANGLADESH_DISTRICTS);
      logger.info(`Successfully seeded ${BANGLADESH_DISTRICTS.length} districts.`);
    } else {
      logger.info(`Districts already seeded (${existingDistrictCount} existing).`);
    }

    const existingUpazilaCount = await Upazila.countDocuments();
    if (existingUpazilaCount === 0) {
      logger.info('Seeding Bangladesh upazilas...');
      await Upazila.insertMany(SAMPLE_UPAZILAS);
      logger.info(`Successfully seeded ${SAMPLE_UPAZILAS.length} upazilas.`);
    } else {
      logger.info(`Upazilas already seeded (${existingUpazilaCount} existing).`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error seeding location data:', error);
    throw error;
  }
}

// Allow direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('seedLocations.js')) {
  (async () => {
    await connectDatabase();
    await seedLocations();
    await disconnectDatabase();
    process.exit(0);
  })();
}
