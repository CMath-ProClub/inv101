const mongoose = require('mongoose');

const ttlDays = parseInt(process.env.SCHEDULER_LOG_TTL_DAYS || '90', 10);
const ttlSeconds = Math.max(ttlDays, 1) * 24 * 60 * 60;

const SchedulerLogSchema = new mongoose.Schema({
  jobName: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'skipped'],
    default: 'running'
  },
  trigger: { type: String },
  cron: { type: String },
  startedAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date },
  durationMs: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  result: { type: mongoose.Schema.Types.Mixed },
  error: {
    message: { type: String },
    stack: { type: String }
  }
}, {
  timestamps: true,
  minimize: false
});

SchedulerLogSchema.index({ jobName: 1, startedAt: -1 });
SchedulerLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds });

module.exports = mongoose.models.SchedulerLog || mongoose.model('SchedulerLog', SchedulerLogSchema);
