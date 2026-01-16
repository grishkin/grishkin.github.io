---
title: Building a Trie for Autocomplete
dateStr: January 2026
layout: post.njk
---

Autocomplete is one of those features we use every day without thinking about it. Whether it's Google search, your IDE, or a messaging app, autocomplete makes typing faster and reduces errors. But how does it actually work?

In this post, I'll walk through building an autocomplete system using a **trie** (also called a prefix tree) — a data structure that's particularly well-suited for this task.

## What is a Trie?

A trie is a tree-like data structure where each node represents a character. The path from the root to any node spells out a prefix of the words stored in the trie. This makes it extremely efficient for prefix-based searches.

> The name "trie" comes from the word "retrieval" — though it's usually pronounced "try" to distinguish it from "tree."

## The Basic Structure

Each node in our trie needs two things:

- A value (the character it represents)
- A list of children (the possible next characters)

Here's a simple TypeScript implementation:

```typescript
class TrieNode {
  value: string;
  children: TrieNode[] = [];

  constructor(value: string) {
    this.value = value;
  }
}
```

## Inserting Words

To insert a word, we traverse the trie character by character. If a node for the next character doesn't exist, we create it. This way, words that share prefixes share the same path in the trie.

```typescript
function insert(root: TrieNode, word: string) {
  let current = root;
  
  for (const char of word) {
    let child = current.children.find(c => c.value === char);
    
    if (!child) {
      child = new TrieNode(char);
      current.children.push(child);
    }
    
    current = child;
  }
}
```

## Finding Suggestions

To find autocomplete suggestions, we first navigate to the node representing the user's input. Then we collect all possible completions by traversing the subtree below that node.

### Performance

The beauty of a trie is its efficiency. Looking up a prefix takes O(m) time, where m is the length of the prefix — regardless of how many words are stored. This makes it perfect for real-time autocomplete where we need instant responses as the user types.

---

Want to see this in action? Check out the [live demo](/demos/autocomplete/index.html) where you can type queries and watch the trie visualization update in real-time.
