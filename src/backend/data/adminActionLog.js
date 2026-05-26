const actionLog = [];

const logAdminAction = (userId, action, details = {}) => {
  actionLog.push({ userId, action, details, timestamp: new Date().toISOString() });
};

module.exports = { actionLog, logAdminAction };
