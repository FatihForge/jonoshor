/**
 * Email validation utility
 * Detects and blocks disposable / temporary email service domains
 */

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'burnermail.io',
  'crazymailing.com',
  'disposablemail.com',
  'dispostable.com',
  'dropmail.me',
  'emailondeck.com',
  'fakeinbox.com',
  'fakemail.com',
  'fakemail.net',
  'fakemailgenerator.com',
  'generator.email',
  'getairmail.com',
  'getnada.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'harakirimail.com',
  'inboxkitten.com',
  'internxt.com',
  'mailcatch.com',
  'maildrop.cc',
  'mailinator.com',
  'minutemail.com',
  'mohmal.com',
  'mytemp.email',
  'mytempemail.com',
  'nada.ltd',
  'sharklasers.com',
  'tempail.com',
  'temp-mail.io',
  'temp-mail.org',
  'tempmail.com',
  'tempmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
]);

/**
 * Checks if the email domain is from a known temporary/disposable email provider
 * @param {string} email
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1 || atIndex === email.length - 1) return false;
  
  const domain = email.slice(atIndex + 1).toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(domain);
}
