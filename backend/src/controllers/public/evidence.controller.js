import { evidenceService } from '../../services/evidence/evidence.service.js';
import { EVIDENCE_PUBLIC_STATUS } from '../../constants/evidenceStatus.js';
import { sendSuccess } from '../../utils/response.js';
import { ForbiddenError } from '../../utils/errors.js';

export const publicEvidenceController = {
  /**
   * Get public evidence metadata without viewer tracking
   */
  async getPublicEvidence(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const result = await evidenceService.getPublicEvidence(evidenceId);
      // Strictly no viewer tracking / no public access log created according to Section 5 & Phase 15.
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Stream public evidence file with ZERO viewer tracking
   * Client connects solely to JonoShor backend; Google Drive receives zero client metadata.
   */
  async streamPublicFile(req, res, next) {
    try {
      const { evidenceId } = req.params;
      const { stream, mimeType, size, filename, evidence } = await evidenceService.streamEvidenceFile(evidenceId);

      if (evidence.publicStatus !== EVIDENCE_PUBLIC_STATUS.APPROVED_PUBLIC) {
        throw new ForbiddenError('Evidence is not approved for public viewing');
      }

      // Zero-tracking security headers
      res.setHeader('Content-Type', mimeType);
      if (size) res.setHeader('Content-Length', size);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

      // Pipe clean content stream directly to public viewer
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },
};
