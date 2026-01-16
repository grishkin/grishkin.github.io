import * as d3 from 'd3';

// D3 hierarchy format
export interface D3Node {
  name: string;
  children?: D3Node[];
}

export class TrieVisualizer {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private svgContainer: HTMLElement;
  private zoomGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private currentData: D3Node | null = null;

  constructor(svgSelector: string, containerSelector: string) {
    this.svgContainer = document.querySelector(containerSelector) as HTMLElement;
    this.svg = d3.select<SVGSVGElement, unknown>(svgSelector);
    
    // Create a group for zoom/pan
    this.zoomGroup = this.svg.append('g');

    // Setup zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        this.zoomGroup.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Re-render on window resize
    window.addEventListener('resize', () => {
      this.render(this.currentData);
    });
  }

  private getContainerSize() {
    const rect = this.svgContainer.getBoundingClientRect();
    return {
      width: rect.width - 2,
      height: Math.max(rect.height - 40, 300)
    };
  }

  /**
   * Build a trie structure from suggestion suffixes
   * @param rootChar - The last character of the matched prefix (becomes root node)
   * @param suffixes - The remaining characters for each suggestion after the matched prefix
   */
  buildFromSuggestions(rootChar: string, suffixes: string[]): D3Node {
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

  /**
   * Render the trie visualization
   * @param data - The D3Node tree structure to render, or null to show empty state
   */
  render(data: D3Node | null) {
    const { width: containerWidth, height: containerHeight } = this.getContainerSize();
    
    // Update SVG size to match container
    this.svg.attr('width', containerWidth).attr('height', containerHeight);
    
    this.zoomGroup.selectAll('*').remove();
    this.currentData = data;
    
    if (!data) {
      this.zoomGroup.append('text')
        .attr('x', 20)
        .attr('y', 30)
        .attr('fill', '#999')
        .text('Type to see the trie...');
      this.svg.call(this.zoom.transform, d3.zoomIdentity);
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
    const g = this.zoomGroup.append('g');

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
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Center the tree
    const translateX = padding - minY * scale + (containerWidth - treeWidth * scale) / 2;
    const translateY = padding - minX * scale + (containerHeight - treeHeight * scale) / 2;
    
    // Apply initial transform to fit and center
    this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
  }
}
