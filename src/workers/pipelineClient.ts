import * as Comlink from 'comlink';
import PipelineWorker from './pipeline.worker?worker';
import type { PipelineAPI } from './pipeline.worker';

let worker: Worker | null = null;
let proxy: Comlink.Remote<PipelineAPI> | null = null;

export function getPipeline(): Comlink.Remote<PipelineAPI> {
  if (!proxy) {
    worker = new PipelineWorker();
    proxy = Comlink.wrap<PipelineAPI>(worker);
  }
  return proxy;
}

export function terminatePipeline(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    proxy = null;
  }
}
