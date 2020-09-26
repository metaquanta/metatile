export default function run(f: () => boolean): Promise<void> {
  if (queue === undefined) {
    queue = start(f);
  } else {
    queue = queue.then(() => start(f));
  }
  return queue;
}

// Apparently, Chrome calls a requestAnimationFrame() over 50ms a
// "violation". (sometimes). Fuck 'em.
const msPerFrameTarget = 75;
let tasksPerFrame = 500;
let totalFrameMs = 0;
let queue: Promise<void> | undefined;

function start(task: () => boolean): Promise<void> {
  console.log(`runner:start`);
  return new Promise<void>((finish) => {
    const startRunMs = Date.now();
    let tasksCompletedRun = 0;
    const onFrame = () => {
      const startFrameMs = Date.now();
      for (let i = 0; i < tasksPerFrame; i++) {
        tasksCompletedRun++;
        if (!task()) {
          totalFrameMs += Date.now() - startFrameMs;
          console.log(
            `runner... ${tasksCompletedRun} tasks in ${totalFrameMs} ms [${(
              totalFrameMs /
              (Date.now() - startRunMs)
            ).toFixed(3)}%]`
          );
          finish();
          return;
        }
      }
      const frameMs = Date.now() - startFrameMs;
      console.log(
        `runner... [${tasksPerFrame} tasks @ ${(
          frameMs / tasksPerFrame
        ).toFixed(3)} ms/task]`
      );
      tasksPerFrame = Math.round(
        Math.max(
          (msPerFrameTarget * tasksPerFrame) / frameMs,
          100 // It can get stuck too low and become /really/ slow
        )
      );
      totalFrameMs += frameMs;
      window.requestAnimationFrame(() => onFrame());
    };
    window.requestAnimationFrame(() => onFrame());
  });
}
