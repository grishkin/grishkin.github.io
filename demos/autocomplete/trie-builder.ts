import { captureRejectionSymbol } from 'node:events';


export class TrieNode {
  constructor(value: string) {
    this.value = value
  }

  value: String;
  children: TrieNode[] = [];
}

export class TrieBuilder {
  autoDict: Map<string, TrieNode> = new Map();
  movieTitles?: string[];

  async init() {
    this.movieTitles = (await import('./dict.json')).default;
  }

  initAutoDict() {
    if (!this.movieTitles) {
      return;
    }

    // for each word, traverse the tree to see if something matches - otherwise 
    for (const w of this.movieTitles) {
      const word = w.toLowerCase()
      // go through each letter, the top level dict will be the root node of each trie
      if (!this.autoDict.has(word[0])) {
        this.autoDict.set(word[0], new TrieNode(word[0]))
        // at this point we recursively populate the word
      }

      const rootNode = this.autoDict.get(word[0])

      if (!rootNode) {
        throw new Error();
      }

      this.populateTrie(rootNode, word.slice(1))
    }
  }

  populateTrie(node: TrieNode, word: string) {
    if (word === '') {
      return;
    }

    const letter: string = word[0]
    if (!node.children.find(c => c.value === word[0])) {
      node.children.push(new TrieNode(letter))
    }

    const nextNode = node.children.find(c => c.value === letter);

    if (!nextNode) {
      throw new Error();
    }

    this.populateTrie(nextNode, word.slice(1))
  }


  getSuggestions(input: string) {
    if (input === '') {
      return [];
    }

    const firstNode = this.autoDict.get(input[0])
    if (!firstNode) {
      throw new Error();
    }

    const word: string[] = [...input];
    word.shift();

    let currNode = firstNode;
    while (word.length) {
      const nextLetter = word.shift()
      const nextChild = currNode.children.find(c => c.value === nextLetter)

      if (!nextChild) {
        // no more matching titles
        break;
      }

      currNode = nextChild
    }


    // now we have the last node letter, we want to traverse the tree to form a
    // few real suggestions
    console.log(currNode)
    const results: string[] = [];
    this.formSuggestions(results, currNode, '');
    console.log(results)
    return results
  }

  formSuggestions(results: string[], node: TrieNode, currWord: string) {
    if (!node.children.length) {
      results.push(currWord);
      return;
    }

    for (const c of node.children) {
      this.formSuggestions(results, c, currWord + c.value)
    }
  }

}