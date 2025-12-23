// RepurposeQuest AI - Network Graph Visualization
class NetworkVisualization {
    constructor() {
        this.analysisData = null;
        this.simulation = null;
        this.svg = null;
        this.container = null;
        this.tooltip = null;
        this.nodes = [];
        this.edges = [];
        this.initializeVisualization();
    }

    initializeVisualization() {
        this.container = d3.select('#graph-container');
        this.tooltip = d3.select('#tooltip');
        
        // Request analysis data from parent window
        window.opener.postMessage('request-analysis-data', '*');
        
        // Listen for analysis data
        window.addEventListener('message', (event) => {
            if (event.data.type === 'analysis-data') {
                this.analysisData = event.data.data;
                this.createNetworkData();
                this.renderGraph();
                this.hideLoading();
            }
        });

        // Initialize controls
        this.initializeControls();
    }

    hideLoading() {
        d3.select('#loading').style('display', 'none');
    }

    createNetworkData() {
        // Create nodes based on analysis data
        this.nodes = [
            {
                id: 'molecule',
                label: this.analysisData.molecule || 'Molecule X',
                type: 'molecule',
                evidence: 0.95,
                publications: 247,
                trials: 12,
                patents: 8
            },
            {
                id: 'pathway',
                label: this.analysisData.target || 'JAK/STAT Pathway',
                type: 'pathway',
                evidence: 0.88,
                publications: 189,
                trials: 8,
                patents: 15
            }
        ];

        // Add disease nodes from opportunities
        this.analysisData.opportunities.forEach((opp, index) => {
            this.nodes.push({
                id: `disease-${index}`,
                label: opp.disease,
                type: 'disease',
                evidence: opp.confidence,
                publications: Math.floor(Math.random() * 50) + 20,
                trials: Math.floor(Math.random() * 5) + 1,
                patents: Math.floor(Math.random() * 3) + 1,
                tags: opp.tags
            });
        });

        // Create edges with evidence-based strength
        this.edges = [
            {
                source: 'molecule',
                target: 'pathway',
                strength: 'strong',
                evidence: 0.92,
                publications: 156
            }
        ];

        // Add edges from pathway to diseases
        this.analysisData.opportunities.forEach((opp, index) => {
            let strength = 'moderate';
            if (opp.confidence >= 0.8) strength = 'strong';
            else if (opp.confidence >= 0.7) strength = 'moderate';
            else strength = 'weak';

            this.edges.push({
                source: 'pathway',
                target: `disease-${index}`,
                strength: strength,
                evidence: opp.confidence,
                publications: Math.floor(opp.confidence * 40) + 10
            });
        });
    }

    renderGraph() {
        const width = this.container.node().offsetWidth;
        const height = this.container.node().offsetHeight;

        // Clear existing SVG
        this.container.select('svg').remove();

        // Create SVG
        this.svg = this.container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
            });

        this.svg.call(zoom);
        this.zoomBehavior = zoom;

        // Create main group
        this.mainGroup = this.svg.append('g');

        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.edges).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

        // Create edges
        const edge = this.mainGroup.append('g')
            .selectAll('line')
            .data(this.edges)
            .enter().append('line')
            .attr('class', d => `edge ${d.strength}`)
            .attr('stroke-width', d => {
                switch(d.strength) {
                    case 'strong': return 4;
                    case 'moderate': return 2;
                    case 'weak': return 1;
                    default: return 2;
                }
            });

        // Create node groups
        const node = this.mainGroup.append('g')
            .selectAll('g')
            .data(this.nodes)
            .enter().append('g')
            .attr('class', 'node-group')
            .call(d3.drag()
                .on('start', this.dragstarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragended.bind(this)));

        // Add node circles
        node.append('circle')
            .attr('class', d => `node ${d.type}`)
            .attr('r', d => {
                switch(d.type) {
                    case 'molecule': return 25;
                    case 'pathway': return 20;
                    case 'disease': return 15;
                    default: return 15;
                }
            })
            .on('mouseenter', (event, d) => this.showTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip())
            .on('click', (event, d) => this.handleNodeClick(d));

        // Add node labels
        node.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => {
                switch(d.type) {
                    case 'molecule': return 35;
                    case 'pathway': return 30;
                    case 'disease': return 25;
                    default: return 25;
                }
            })
            .text(d => d.label);

        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            edge
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    showTooltip(event, nodeData) {
        const tooltip = this.tooltip;
        
        let content = `
            <h3>${nodeData.label}</h3>
            <p><strong>Type:</strong> ${nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1)}</p>
            <p><strong>Evidence Score:</strong> ${nodeData.evidence.toFixed(2)}</p>
            <div class="evidence-score">
                <span>Strength:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${nodeData.evidence * 100}%"></div>
                </div>
            </div>
        `;

        if (nodeData.publications) {
            content += `<p><strong>Publications:</strong> ${nodeData.publications}</p>`;
        }
        if (nodeData.trials) {
            content += `<p><strong>Clinical Trials:</strong> ${nodeData.trials}</p>`;
        }
        if (nodeData.patents) {
            content += `<p><strong>Patents:</strong> ${nodeData.patents}</p>`;
        }
        if (nodeData.tags) {
            content += `<p><strong>Tags:</strong> ${nodeData.tags.join(', ')}</p>`;
        }

        tooltip.html(content);
        tooltip.classed('show', true);

        // Position tooltip
        const tooltipNode = tooltip.node();
        const tooltipRect = tooltipNode.getBoundingClientRect();
        const containerRect = this.container.node().getBoundingClientRect();

        let left = event.pageX + 10;
        let top = event.pageY + 10;

        // Adjust if tooltip goes outside container
        if (left + tooltipRect.width > containerRect.right) {
            left = event.pageX - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > containerRect.bottom) {
            top = event.pageY - tooltipRect.height - 10;
        }

        tooltip
            .style('left', `${left}px`)
            .style('top', `${top}px`);
    }

    hideTooltip() {
        this.tooltip.classed('show', false);
    }

    handleNodeClick(nodeData) {
        if (nodeData.type !== 'disease') return;

        // Reset all highlights
        this.svg.selectAll('.node').classed('highlighted', false);
        this.svg.selectAll('.edge').classed('highlighted', false);

        // Highlight clicked node
        this.svg.selectAll('.node')
            .filter(d => d.id === nodeData.id)
            .classed('highlighted', true);

        // Highlight connected edges and nodes
        this.svg.selectAll('.edge')
            .filter(d => d.source.id === nodeData.id || d.target.id === nodeData.id)
            .classed('highlighted', true)
            .each(d => {
                // Highlight connected nodes
                this.svg.selectAll('.node')
                    .filter(n => n.id === d.source.id || n.id === d.target.id)
                    .classed('highlighted', true);
            });
    }

    initializeControls() {
        // Back to analysis
        d3.select('#back-btn').on('click', () => {
            window.close();
            // Fallback if window.close() doesn't work
            window.location.href = 'index.html';
        });

        // Reset view
        d3.select('#reset-btn').on('click', () => {
            this.svg.transition()
                .duration(750)
                .call(
                    this.zoomBehavior.transform,
                    d3.zoomIdentity
                );
        });

        // Zoom in
        d3.select('#zoom-in-btn').on('click', () => {
            this.svg.transition()
                .duration(750)
                .call(
                    this.zoomBehavior.scaleBy,
                    1.3
                );
        });

        // Zoom out
        d3.select('#zoom-out-btn').on('click', () => {
            this.svg.transition()
                .duration(750)
                .call(
                    this.zoomBehavior.scaleBy,
                    0.7
                );
        });
    }

    // Drag functions
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Initialize visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NetworkVisualization();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Re-render graph on window resize
    const viz = new NetworkVisualization();
});
