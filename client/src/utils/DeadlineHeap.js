export class DeadlineHeap {
  constructor() {
    this.heap = [];
  }

  // item schema: { id, title, endDate, ...otherProps }
  insert(item) {
    this.heap.push(item);
    this._siftUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._siftDown(0);
    return min;
  }
  
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }
  
  // Gets all items sorted by endDate (without modifying the heap)
  // This is useful for UI rendering of the timeline.
  getAllSorted() {
    return [...this.heap].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }

  _siftUp(index) {
    let parent = Math.floor((index - 1) / 2);
    while (index > 0 && new Date(this.heap[index].endDate) < new Date(this.heap[parent].endDate)) {
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
      parent = Math.floor((index - 1) / 2);
    }
  }

  _siftDown(index) {
    let smallest = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (left < this.heap.length && new Date(this.heap[left].endDate) < new Date(this.heap[smallest].endDate)) {
      smallest = left;
    }
    if (right < this.heap.length && new Date(this.heap[right].endDate) < new Date(this.heap[smallest].endDate)) {
      smallest = right;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this._siftDown(smallest);
    }
  }
}
