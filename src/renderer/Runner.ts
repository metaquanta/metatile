export default function Runner(): {
  start: (r: () => boolean, b: () => void, c: () => void) => void;
  stop: () => Promise<unknown>;
} {
  // Apparently, Chrome calls a requestAnimationFrame() over 50ms a
  // "violation". (sometimes). Fuck 'em.
  const msPerFrameTarget = 75;

  let stopped = true;
  let finish: (() => void) | undefined;
  let tasksPerFrame = 500;
  let timestamp = Date.now();
  let onFrame: (() => void) | undefined;
  let tasksCompleted = 0;

  return {
    start(task, block, init) {
      console.debug(`Renderer:Runner.start() [${tasksCompleted}]`);
      if (!stopped) {
        this.stop().then(() => this.start(task, block, init));
        return;
      }
      stopped = false;
      init();
      timestamp = Date.now();
      onFrame = () => {
        if (stopped) {
          finish?.();
        } else {
          for (let i = 0; i < tasksPerFrame && task(); i++) {
            tasksCompleted++;
          }
          const ms = Date.now();
          console.debug(
            `Runner - executed ${tasksPerFrame} tasks in ${ms - timestamp}ms`
          );
          tasksPerFrame = Math.round(
            Math.max(
              (msPerFrameTarget * tasksPerFrame) / (ms - timestamp),
              100 // It can get stuck too low and become /really/ slow
            )
          );
          block();
          timestamp = Date.now(); //fixme
          window.requestAnimationFrame(() => onFrame?.());
        }
      };
      window.requestAnimationFrame(() => onFrame?.());
    },
    stop(): Promise<unknown> {
      console.debug(`Renderer:Runner.stop() [${tasksCompleted} ${stopped}]`);
      if (stopped) {
        return Promise.resolve();
      }
      const promise = new Promise<void>((resolve) => {
        finish = resolve;
      });
      stopped = true;
      return promise;
    }
  };
}
