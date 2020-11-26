const { CronJob } = require('cron');

const noop = () => {};

class CronScheduler {
  constructor(context) {
    this.context = context;
    this.jobs = {};
  }

  addJob(name, time, fn, options = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Can not add job without a name');
    }

    if (this.jobs[name]) {
      throw new Error('Can not add existing job');
    }

    if (!fn || typeof fn !== 'function') {
      throw new Error('Can not add job without a onTick function');
    }
    if (!time) {
      throw new Error('Can not add job without a cron time');
    }

    const getOnTickFn = (jobName) => async (...args) => {
      try {
        console.info('job started', { name: jobName });
        if (fn[Symbol.toStringTag] !== 'AsyncFunction') {
          fn(...args);
          return;
        }

        await fn(...args);
        console.info('job finished', { name: jobName });
      } catch (error) {
        console.error('job failed', { name: jobName, error });
      }
    };

    const {
      onComplete = noop,
      start = true,
      timezone,
      context = this.context,
      runOnInit = true,
      utcOffset,
      unrefTimeout,
    } = options;

    const job = new CronJob(
      time,
      getOnTickFn(name),
      onComplete,
      start,
      timezone,
      context,
      runOnInit,
      utcOffset,
      unrefTimeout
    );
    this.jobs[name] = job;

    return job;
  }

  startJob(name) {
    if (!this.jobs[name]) {
      throw new Error(`Can not find job with name ${name}`);
    }

    this.jobs[name].start();
  }

  stopJob(name) {
    if (!this.jobs[name]) {
      throw new Error(`Can not find job with name ${name}`);
    }

    this.jobs[name].stop();
  }

  removeJob(name) {
    this.stopJob(name);
    delete this.jobs[name];
  }
}

module.exports = CronScheduler;
