import './style.css'
import * as d3 from 'd3';
import { TrieBuilder } from './trie-builder';

const input: HTMLInputElement | null = document.querySelector('#autocomplete-input');
const list: HTMLElement | null = document.querySelector('#suggestions-list');
const svgContainer = document.querySelector('#trie-viz') as HTMLElement;
const svg = d3.select<SVGSVGElement, unknown>('#trie-svg');

// Get container dimensions dynamically
function getContainerSize() {
  const rect = svgContainer.getBoundingClientRect();
  // Account for the h3 header height (~30px) and some padding
  return {
    width: rect.width - 2, // -2 for border
    height: Math.max(rect.height - 40, 300)
  };
}

// Create a group for zoom/pan
const zoomGroup = svg.append('g');

// Setup zoom behavior
const zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.1, 3])
  .on('zoom', (event) => {
    zoomGroup.attr('transform', event.transform);
  });

svg.call(zoom);

let trieBuilder: TrieBuilder
let currentTrieData: D3Node | null = null;

// D3 hierarchy format
interface D3Node {
  name: string;
  children?: D3Node[];
}

// Build a trie from suggestion suffixes
// rootChar: the last character the user typed (becomes root node)
// suffixes: the remaining characters for each suggestion after the user's input
function buildTrieFromSuggestions(rootChar: string, suffixes: string[]): D3Node {
  const root: D3Node = { name: rootChar };
  
  for (const suffix of suffixes) {
    let currentNode = root;
    
    for (const char of suffix) {
      if (!currentNode.children) {
        currentNode.children = [];
      }
      
      let childNode = currentNode.children.find(c => c.name === char);
      if (!childNode) {
        childNode = { name: char };
        currentNode.children.push(childNode);
      }
      currentNode = childNode;
    }
  }
  
  return root;
}

function renderTrie(data: D3Node | null) {
  const { width: containerWidth, height: containerHeight } = getContainerSize();
  
  // Update SVG size to match container
  svg.attr('width', containerWidth).attr('height', containerHeight);
  
  zoomGroup.selectAll('*').remove();
  currentTrieData = data;
  
  if (!data) {
    zoomGroup.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('fill', '#999')
      .text('Type to see the trie...');
    svg.call(zoom.transform, d3.zoomIdentity);
    return;
  }

  const hierarchy = d3.hierarchy(data);
  
  // Use nodeSize for consistent spacing - horizontal tree layout
  const treeLayout = d3.tree<D3Node>()
    .nodeSize([24, 80]);
  
  const root = treeLayout(hierarchy);

  // Calculate bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  root.each(d => {
    if (d.x < minX) minX = d.x;
    if (d.x > maxX) maxX = d.x;
    if (d.y < minY) minY = d.y;
    if (d.y > maxY) maxY = d.y;
  });
  
  const treeWidth = maxY - minY + 60;
  const treeHeight = maxX - minX + 60;
  
  // Create inner group for the tree content
  const g = zoomGroup.append('g');

  // Draw links - horizontal layout (swap x/y)
  g.selectAll('.trie-link')
    .data(root.links())
    .join('path')
    .attr('class', 'trie-link')
    .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<D3Node>, d3.HierarchyPointNode<D3Node>>()
      .x(d => d.y)
      .y(d => d.x)
    );

  // Draw nodes - horizontal layout (swap x/y)
  const nodes = g.selectAll('.trie-node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'trie-node')
    .attr('transform', d => `translate(${d.y}, ${d.x})`);

  nodes.append('circle')
    .attr('r', 10);

  nodes.append('text')
    .text(d => d.data.name);

  // Calculate zoom to fit entire tree
  const padding = 20;
  const scaleX = (containerWidth - padding * 2) / treeWidth;
  const scaleY = (containerHeight - padding * 2) / treeHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in past 1x
  
  // Center the tree
  const translateX = padding - minY * scale + (containerWidth - treeWidth * scale) / 2;
  const translateY = padding - minX * scale + (containerHeight - treeHeight * scale) / 2;
  
  // Apply initial transform to fit and center
  svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
}

// Re-render on window resize
window.addEventListener('resize', () => {
  renderTrie(currentTrieData);
});

(async () => {
  const t = new TrieBuilder();
  await t.init();
  t.initAutoDict();
  trieBuilder = t;
  renderTrie(null);
})();

input?.addEventListener('input', (e) => {
  if (!list || !trieBuilder.movieTitles) {
    return;
  }

  const value = input.value.toLowerCase();
  
  if (!value) {
    list.style.display = 'none';
    renderTrie(null);
    return;
  }

  const suggestions = trieBuilder.getSuggestions(value) || [];
  const top10 = suggestions.slice(0, 10);

  if (!top10.length) {
    list.style.display = 'none';
    renderTrie(null);
    return;
  }

  // Find the actual matched prefix by comparing input with first suggestion
  // The matched prefix is the longest common prefix between input and suggestions
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
    renderTrie(null);
    list.style.display = 'none';
    return;
  }

  // Build trie from top 10 suggestions
  // Root is the last character of the matched prefix, children are the suffixes
  const lastMatchedChar = firstSuggestion[matchedPrefixLength - 1];
  const suffixes = top10.map(s => s.slice(matchedPrefixLength));
  const trieData = buildTrieFromSuggestions(lastMatchedChar, suffixes);
  renderTrie(trieData);

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





