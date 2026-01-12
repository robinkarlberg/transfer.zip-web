function createLogBuilder(level, error) {
  const data = {
    ...error
  };

  let logged = false;

  const log = () => {
    if (!logged) {
      logged = true;
      if (level === 'error') {
        console.error(data);
      } else {
        console.warn(data);
      }
    }
  };

  // Defer logging so all chained methods run first
  queueMicrotask(log);

  return {
    forUserId(userId) {
      data.userId = userId;
      return this;
    },
    forTransferId(transferId) {
      data.transferId = transferId;
      return this;
    },
    forRoute(route) {
      data.route = route;
      return this;
    }
  };
}

export function logError(err) {
  return createLogBuilder('error', err);
}

export function logWarn(err) {
  return createLogBuilder('warn', err);
}
