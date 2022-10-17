const cluster = require("cluster");
// const os = require('os')
// const axios = require('axios')e every second');

if (cluster.isMaster) {
  // job.start()
  // const cpusCount = os.cpus().length

  for (let i = 0; i < 5; i++) {
    const worker = cluster.fork();
    worker.on("exit", () => {
      cluster.fork();
    });
  }
}
if (cluster.isWorker) {
  require("./server");
}
