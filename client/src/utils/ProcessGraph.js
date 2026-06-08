export class ProcessGraph {
  constructor() {
    this.nodes = new Map(); // id -> node data { id, title, description, status, ... }
    this.adjacencyList = new Map(); // id -> array of neighbor ids
    this.inDegrees = new Map(); // id -> count of incoming edges
  }

  addNode(id, data) {
    if (!this.nodes.has(id)) {
      // By default nodes are locked until their dependencies are met
      this.nodes.set(id, { ...data, status: 'locked' });
      this.adjacencyList.set(id, []);
      this.inDegrees.set(id, 0);
    }
  }

  addEdge(fromId, toId) {
    if (this.adjacencyList.has(fromId) && this.inDegrees.has(toId)) {
      this.adjacencyList.get(fromId).push(toId);
      this.inDegrees.set(toId, this.inDegrees.get(toId) + 1);
    }
  }
  
  // Call this after graph construction to find root nodes (in-degree == 0)
  initializeStatuses() {
    for (const [id, degree] of this.inDegrees.entries()) {
      if (degree === 0) {
        const node = this.nodes.get(id);
        if (node.status !== 'completed') {
          node.status = 'available';
        }
      }
    }
  }

  // Complete a node and unlock neighbors using Topological Sort logic
  completeNode(id) {
    const node = this.nodes.get(id);
    if (node && node.status === 'available') {
      node.status = 'completed';
      
      const neighbors = this.adjacencyList.get(id) || [];
      for (const neighborId of neighbors) {
        const newDegree = this.inDegrees.get(neighborId) - 1;
        this.inDegrees.set(neighborId, newDegree);
        if (newDegree === 0) {
          const neighborNode = this.nodes.get(neighborId);
          if (neighborNode.status !== 'completed') {
            neighborNode.status = 'available';
          }
        }
      }
      return true; // Return true to trigger UI re-render
    }
    return false;
  }
  
  // DFS Cascading Rollback: Undo a node and recursively lock its dependents
  undoNode(id) {
    const node = this.nodes.get(id);
    if (node && node.status === 'completed') {
      node.status = 'available';
      
      const neighbors = this.adjacencyList.get(id) || [];
      for (const neighborId of neighbors) {
        const neighborNode = this.nodes.get(neighborId);
        
        // If the dependent node is completed, we must recursively undo it first
        if (neighborNode.status === 'completed') {
          this.undoNode(neighborId);
        }
        
        // Increase inDegree since a prerequisite was unfulfilled
        const currentDegree = this.inDegrees.get(neighborId);
        this.inDegrees.set(neighborId, currentDegree + 1);
        
        // Lock the dependent node
        neighborNode.status = 'locked';
      }
      return true; // Trigger UI re-render
    }
    return false;
  }
  
  // Resets graph to initial state for testing/demoing
  resetGraph() {
    for (const node of this.nodes.values()) {
      node.status = 'locked';
    }
    
    // Recompute in-degrees by scanning all edges
    for (const id of this.nodes.keys()) {
       this.inDegrees.set(id, 0);
    }
    for (const neighbors of this.adjacencyList.values()) {
      for (const toId of neighbors) {
         this.inDegrees.set(toId, this.inDegrees.get(toId) + 1);
      }
    }
    
    this.initializeStatuses();
  }

  getNodes() {
    return Array.from(this.nodes.entries()).map(([id, data]) => ({ id, ...data }));
  }
  
  getEdges() {
    const edges = [];
    for (const [from, neighbors] of this.adjacencyList.entries()) {
      for (const to of neighbors) {
        edges.push({ source: from, target: to });
      }
    }
    return edges;
  }
}
