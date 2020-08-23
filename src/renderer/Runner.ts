export default function Runner(): {
  start: (r: () => void, c: () => void) => void;
  stop: () => Promise<unknown>;
} {
  // Apparently, Chrome calls a requestAnimationFrame() over 50ms a
  // "violation". (sometimes). Fuck 'em.
  const msPerFrameTarget = 75;

  const runner: {
    tasksPerFrame: number;
    timestamp: number;
    stopped: boolean;
    finish: (() => void) | undefined;
    start: (r: () => void, c: () => void) => void;
    stop: () => Promise<unknown>;
    onFrame: (() => void) | undefined;
    tasksCompleted: number;
  } = {
    stopped: true,
    finish: undefined,
    tasksPerFrame: 500,
    timestamp: Date.now(),
    onFrame: undefined,
    tasksCompleted: 0,
    start(task, init) {
      console.debug(`Renderer:Runner.start() [${this.tasksCompleted}]`);
      if (!this.stopped) {
        this.stop().then(() => this.start(task, init));
        return;
      }
      this.stopped = false;
      if (init) init();
      this.timestamp = Date.now();
      this.onFrame = () => {
        if (this.stopped) {
          if (this.finish) this.finish();
        } else {
          for (let i = 0; i < this.tasksPerFrame && task(); i++) {
            this.tasksCompleted++;
          }
          const ms = Date.now();
          this.tasksPerFrame = Math.max(
            (msPerFrameTarget * this.tasksPerFrame) / (ms - this.timestamp),
            10 // It can get stuck too low and become /really/ slow
          );
          this.timestamp = ms;
          window.requestAnimationFrame(() => this.onFrame && this.onFrame());
        }
      };
      window.requestAnimationFrame(() => this.onFrame && this.onFrame());
    },
    stop(): Promise<unknown> {
      console.debug(
        `Renderer:Runner.stop() [${this.tasksCompleted} ${this.stopped}]`
      );
      if (this.stopped) {
        return Promise.resolve();
      }
      const promise = new Promise((f) => {
        this.finish = f;
      });
      this.stopped = true;
      return promise;
    }
  };
  return runner;
}
