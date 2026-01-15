import './style.css'
import { TrieBuilder } from './trie-builder';

const input: HTMLInputElement | null = document.querySelector('#autocomplete-input');
const list: HTMLElement | null = document.querySelector('#suggestions-list');

let trieBuilder: TrieBuilder

(async () => {
  const t = new TrieBuilder();
  await t.init();
  t.initAutoDict();
  trieBuilder = t;
})();

input?.addEventListener('input', (e) => {
  if (!list || !trieBuilder.movieTitles) {
    return;
  }

  const value = input.value.toLowerCase();
  const suggestions = trieBuilder.getSuggestions(value) || []

  if (!suggestions.length) {
    list.style.display = 'none';
    return;
  }

  list.style.display = 'block';

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  for (const s of suggestions) {
    const node = document.createElement('li');
    node.innerText = s;
    list.appendChild(node)
  }
});





