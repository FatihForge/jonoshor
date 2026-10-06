export function sendSuccess(res, arg1 = {}, arg2 = null, arg3 = 200, arg4 = null) {
  let statusCode = 200;
  let data = arg1;
  let meta = arg2;

  // Handle sendSuccess(res, statusCode, data, message, meta)
  if (typeof arg1 === 'number') {
    statusCode = arg1;
    data = arg2 || {};
    if (typeof arg3 === 'object' && arg3 !== null) {
      meta = arg3;
    } else if (typeof arg4 === 'object' && arg4 !== null) {
      meta = arg4;
    } else {
      meta = null;
    }
  } else if (typeof arg3 === 'number') {
    statusCode = arg3;
  }

  const response = {
    success: true,
    data,
  };

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export function sendError(res, error, statusCode = 500, requestId = null, details = null) {
  const code = error?.code || 'INTERNAL_SERVER_ERROR';
  const message = error?.message || 'An unexpected error occurred';
  const status = statusCode || error?.statusCode || 500;

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  } else if (error?.details) {
    response.error.details = error.details;
  }

  if (requestId) {
    response.requestId = requestId;
  }

  return res.status(status).json(response);
}
