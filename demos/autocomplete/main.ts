import './style.css'
import { TrieBuilder } from './trie-builder';
import { TrieVisualizer } from './trie-visualizer';

const input: HTMLInputElement | null = document.querySelector('#autocomplete-input');
const list: HTMLElement | null = document.querySelector('#suggestions-list');

let trieBuilder: TrieBuilder;
let visualizer: TrieVisualizer;

(async () => {
  const t = new TrieBuilder();
  await t.init();
  t.initAutoDict();
  trieBuilder = t;
  
  visualizer = new TrieVisualizer('#trie-svg', '#trie-viz');
  visualizer.render(null);
})();

input?.addEventListener('input', () => {
  if (!list || !trieBuilder.movieTitles) {
    return;
  }

  const value = input.value.toLowerCase();
  
  if (!value) {
    list.style.display = 'none';
    visualizer.render(null);
    return;
  }

  const suggestions = trieBuilder.getSuggestions(value) || [];
  const top10 = suggestions.slice(0, 10);

  if (!top10.length) {
    list.style.display = 'none';
    visualizer.render(null);
    return;
  }

  // Find the actual matched prefix by comparing input with first suggestion
  const firstSuggestion = top10[0];
  let matchedPrefixLength = 0;
  for (let i = 0; i < Math.min(value.length, firstSuggestion.length); i++) {
    if (value[i] === firstSuggestion[i]) {
      matchedPrefixLength = i + 1;
    } else {
      break;
    }
  }

  // If no match at all, show empty trie
  if (matchedPrefixLength === 0) {
    visualizer.render(null);
    list.style.display = 'none';
    return;
  }

  // Build and render trie from top 10 suggestions
  const lastMatchedChar = firstSuggestion[matchedPrefixLength - 1];
  const suffixes = top10.map(s => s.slice(matchedPrefixLength));
  const trieData = visualizer.buildFromSuggestions(lastMatchedChar, suffixes);
  visualizer.render(trieData);

  // Update suggestions list
  list.style.display = 'block';

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  for (const s of top10) {
    const node = document.createElement('li');
    node.innerText = s;
    list.appendChild(node);
  }
});
