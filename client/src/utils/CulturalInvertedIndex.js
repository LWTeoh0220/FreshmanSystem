export class CulturalInvertedIndex {
  constructor() {
    this.map = new Map(); // key: cultural term, value: Set of processIds
  }

  addMapping(term, processId) {
    const key = term.toLowerCase();
    if (!this.map.has(key)) {
      this.map.set(key, new Set());
    }
    this.map.get(key).add(processId);
  }

  search(term) {
    return Array.from(this.map.get(term.toLowerCase()) || []);
  }
}
