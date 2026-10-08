import { joinUsAdminService } from '../../services/joinUs/joinUsAdmin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminJoinUsController = {
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { status, profession, isDuplicate, search } = req.query;

      const result = await joinUsAdminService.listSubmissions({
        status,
        profession,
        isDuplicate,
        search,
        page,
        limit,
      });

      sendSuccess(res, 200, result.items, 'Join Us submissions retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await joinUsAdminService.getSubmissionById(id);
      sendSuccess(res, 200, result, 'Join Us submission retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const result = await joinUsAdminService.updateStatus(id, req.user._id, {
        status,
        adminNotes,
      });
      sendSuccess(res, 200, result, 'Join Us submission status updated');
    } catch (err) {
      next(err);
    }
  },

  async addNote(req, res, next) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const result = await joinUsAdminService.addAdminNote(
        id,
        note,
        req.user._id,
        req.user.fullName || 'Admin'
      );
      sendSuccess(res, 200, result, 'Internal note added');
    } catch (err) {
      next(err);
    }
  },

  async updateNote(req, res, next) {
    try {
      const { id, noteId } = req.params;
      const { note } = req.body;
      const result = await joinUsAdminService.updateAdminNote(id, noteId, note, req.user._id);
      sendSuccess(res, 200, result, 'Internal note updated');
    } catch (err) {
      next(err);
    }
  },

  async downloadDocument(req, res, next) {
    try {
      const { id, documentId } = req.params;
      const fileData = await joinUsAdminService.getDocumentStream(id, documentId, req.user);

      res.setHeader('Content-Type', fileData.mimeType);
      const safeFilename = encodeURIComponent(fileData.originalFilename || 'document');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`
      );
      if (fileData.size) {
        res.setHeader('Content-Length', fileData.size);
      }
      fileData.stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  async exportData(req, res, next) {
    try {
      const result = await joinUsAdminService.exportSubmissions(req.user._id);
      sendSuccess(res, 200, result, 'Join Us submissions exported');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await joinUsAdminService.deleteSubmission(id, req.user._id, reason);
      sendSuccess(res, 200, result, 'Join Us submission deleted');
    } catch (err) {
      next(err);
    }
  },
};
