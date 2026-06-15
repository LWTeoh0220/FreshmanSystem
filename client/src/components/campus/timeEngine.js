export class EventMinHeap {
  constructor() {
    this.heap = [];
  }

  push(event) {
    this.heap.push(event);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return top;
  }

  build(array) {
    this.heap = [...array];
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.sinkDown(i);
    }
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  getEventTime(event) {
    return new Date(event.timestamp).getTime();
  }

  bubbleUp(index) {
    const element = this.heap[index];
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.heap[parentIndex];
      if (this.getEventTime(element) >= this.getEventTime(parent)) break;
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  sinkDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (this.getEventTime(leftChild) < this.getEventTime(element)) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && this.getEventTime(rightChild) < this.getEventTime(element)) ||
          (swap !== null && this.getEventTime(rightChild) < this.getEventTime(leftChild))
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

// 時間區段: 2025-08-01 到 2026-07-31，每 30 分鐘一個槽位
const BASE_TIME = new Date("2025-08-01T00:00:00").getTime();
const INTERVAL_MS = 30 * 60 * 1000;
const MAX_INTERVALS = 365 * 48; // 17520 slots

export class DensitySegmentTree {
  constructor() {
    this.tree = new Int32Array(MAX_INTERVALS * 4);
    this.lazy = new Int32Array(MAX_INTERVALS * 4);
  }

  timeToIndex(timestampMs) {
    const idx = Math.floor((timestampMs - BASE_TIME) / INTERVAL_MS);
    return Math.max(0, Math.min(idx, MAX_INTERVALS - 1));
  }

  // 區間更新 (Range Update)
  updateRange(node, start, end, l, r, val) {
    if (this.lazy[node] !== 0) {
      this.tree[node] += this.lazy[node];
      if (start !== end) {
        this.lazy[node * 2] += this.lazy[node];
        this.lazy[node * 2 + 1] += this.lazy[node];
      }
      this.lazy[node] = 0;
    }

    if (start > end || start > r || end < l) return;

    if (start >= l && end <= r) {
      this.tree[node] += val;
      if (start !== end) {
        this.lazy[node * 2] += val;
        this.lazy[node * 2 + 1] += val;
      }
      return;
    }

    const mid = Math.floor((start + end) / 2);
    this.updateRange(node * 2, start, mid, l, r, val);
    this.updateRange(node * 2 + 1, mid + 1, end, l, r, val);
    this.tree[node] = Math.max(this.tree[node * 2], this.tree[node * 2 + 1]);
  }

  // 單點查詢 (Point Query)
  queryPoint(node, start, end, idx) {
    if (this.lazy[node] !== 0) {
      this.tree[node] += this.lazy[node];
      if (start !== end) {
        this.lazy[node * 2] += this.lazy[node];
        this.lazy[node * 2 + 1] += this.lazy[node];
      }
      this.lazy[node] = 0;
    }

    if (start === end) {
      return this.tree[node];
    }

    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) {
      return this.queryPoint(node * 2, start, mid, idx);
    } else {
      return this.queryPoint(node * 2 + 1, mid + 1, end, idx);
    }
  }

  // 封裝介面
  addDensity(startTimeMs, endTimeMs, score) {
    const l = this.timeToIndex(startTimeMs);
    const r = this.timeToIndex(endTimeMs);
    this.updateRange(1, 0, MAX_INTERVALS - 1, l, r, score);
  }

  getDensityAtTime(timeMs) {
    const idx = this.timeToIndex(timeMs);
    return this.queryPoint(1, 0, MAX_INTERVALS - 1, idx);
  }
}
