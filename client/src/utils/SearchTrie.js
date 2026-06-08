export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.processId = null; // Associated process if it's an end of word
  }
}

export class SearchTrie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, processId) {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.isEndOfWord = true;
    current.processId = processId;
  }

  // Returns all matching words for a given prefix
  startsWith(prefix) {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char);
    }
    return this._collectAllWords(current, prefix);
  }

  _collectAllWords(node, currentWord) {
    let words = [];
    if (node.isEndOfWord) {
      words.push({ word: currentWord, processId: node.processId });
    }
    for (const [char, childNode] of node.children.entries()) {
      words = words.concat(this._collectAllWords(childNode, currentWord + char));
    }
    return words;
  }
}
