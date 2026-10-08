import { SystemSetting } from '../../models/SystemSetting.js';
import { sendSuccess } from '../../utils/response.js';

export const DEFAULT_SOCIAL_LINKS = [
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/jonoshor', icon: 'facebook', enabled: true, order: 1 },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/jonoshor', icon: 'linkedin', enabled: true, order: 2 },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com/@jonoshor', icon: 'youtube', enabled: true, order: 3 },
  { id: 'x', name: 'X / Twitter', url: 'https://x.com/jonoshor', icon: 'x', enabled: true, order: 4 },
];

export async function getPublicSocialLinks(_req, res, next) {
  try {
    const setting = await SystemSetting.findOne({ key: 'social_links' }).lean();
    let links = setting?.value;

    if (!Array.isArray(links)) {
      links = DEFAULT_SOCIAL_LINKS;
    }

    // Only return enabled links, sorted by order
    const publicLinks = links
      .filter((item) => item && item.enabled === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item) => ({
        id: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: item.name,
        url: item.url,
        icon: item.icon || 'link',
        order: item.order || 0,
      }));

    sendSuccess(res, 200, publicLinks, 'Public social platform links retrieved');
  } catch (err) {
    next(err);
  }
}
