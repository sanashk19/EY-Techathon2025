// RepurposeQuest AI - Explainable Evidence Flow Visualization
class ExplainableAI {
    constructor() {
        this.analysisData = null;
        this.simulation = null;
        this.svg = null;
        this.container = null;
        this.tooltip = null;
        this.nodes = [];
        this.edges = [];
        this.flowAnimation = null;
        this.evidenceStates = {
            literature: true,
            trials: true,
            patents: true
        };
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
                this.createEvidenceFlowData();
                this.renderGraph();
                this.initializeControls();
                this.hideLoading();
            }
        });
    }

    hideLoading() {
        d3.select('#loading').style('display', 'none');
    }

    createEvidenceFlowData() {
        // Create evidence source nodes (left layer)
        this.nodes = [
            // Literature clusters
            {
                id: 'literature-mechanistic',
                label: 'Mechanistic Studies',
                type: 'evidence',
                category: 'literature',
                evidence: 0.92,
                publications: 89,
                contribution: 0.35
            },
            {
                id: 'literature-preclinical',
                label: 'Preclinical Models',
                type: 'evidence',
                category: 'literature',
                evidence: 0.78,
                publications: 67,
                contribution: 0.28
            },
            {
                id: 'literature-clinical',
                label: 'Clinical Evidence',
                type: 'evidence',
                category: 'literature',
                evidence: 0.71,
                publications: 45,
                contribution: 0.22
            },
            // Clinical trials
            {
                id: 'trials-phase1',
                label: 'Phase I Trials',
                type: 'evidence',
                category: 'trials',
                evidence: 0.85,
                trials: 3,
                contribution: 0.25
            },
            {
                id: 'trials-phase2',
                label: 'Phase II Trials',
                type: 'evidence',
                category: 'trials',
                evidence: 0.73,
                trials: 7,
                contribution: 0.30
            },
            {
                id: 'trials-phase3',
                label: 'Phase III Trials',
                type: 'evidence',
                category: 'trials',
                evidence: 0.68,
                trials: 2,
                contribution: 0.15
            },
            // Patent signals
            {
                id: 'patents-expired',
                label: 'Expired Patents',
                type: 'evidence',
                category: 'patents',
                evidence: 0.45,
                patents: 8,
                contribution: 0.10
            },
            {
                id: 'patents-overlapping',
                label: 'Overlapping Patents',
                type: 'evidence',
                category: 'patents',
                evidence: 0.62,
                patents: 15,
                contribution: 0.18
            }
        ];

        // Add pathway node (middle layer)
        this.nodes.push({
            id: 'pathway',
            label: 'JAK/STAT Biological Mediation',
            type: 'pathway',
            evidence: 0.88,
            contribution: 0
        });

        // Add disease outcome nodes (right layer)
        this.analysisData.opportunities.forEach((opp, index) => {
            this.nodes.push({
                id: `disease-${index}`,
                label: opp.disease,
                type: 'disease',
                evidence: opp.confidence,
                contribution: 0,
                tags: opp.tags
            });
        });

        // Create edges with contribution weights
        this.edges = [];

        // Evidence to pathway edges
        this.nodes.filter(n => n.type === 'evidence').forEach(evidence => {
            let strength = 'moderate';
            if (evidence.contribution >= 0.3) strength = 'strong';
            else if (evidence.contribution >= 0.15) strength = 'moderate';
            else strength = 'weak';

            this.edges.push({
                source: evidence.id,
                target: 'pathway',
                strength: strength,
                contribution: evidence.contribution,
                category: evidence.category
            });
        });

        // Pathway to disease edges
        this.analysisData.opportunities.forEach((opp, index) => {
            const diseaseId = `disease-${index}`;
            let strength = 'moderate';
            let contribution = opp.confidence * 0.8; // Pathway contribution to disease
            
            if (contribution >= 0.7) strength = 'strong';
            else if (contribution >= 0.4) strength = 'moderate';
            else strength = 'weak';

            this.edges.push({
                source: 'pathway',
                target: diseaseId,
                strength: strength,
                contribution: contribution,
                category: 'pathway'
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

        // Create force simulation with layered layout
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.edges).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('x', this.createLayerForces(width))
            .force('y', d3.forceY(height / 2))
            .force('collision', d3.forceCollide().radius(25));

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
            })
            .on('mouseenter', (event, d) => this.showEdgeTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip());

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
                    case 'evidence': return 12;
                    case 'pathway': return 20;
                    case 'disease': return 15;
                    default: return 12;
                }
            })
            .on('mouseenter', (event, d) => this.showNodeTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip())
            .on('click', (event, d) => this.handleNodeClick(d));

        // Add node labels
        node.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => {
                switch(d.type) {
                    case 'evidence': return 20;
                    case 'pathway': return 28;
                    case 'disease': return 23;
                    default: return 20;
                }
            })
            .text(d => d.label.length > 15 ? d.label.substring(0, 12) + '...' : d.label);

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

    createLayerForces(width) {
        return d3.forceX().x(d => {
            switch(d.type) {
                case 'evidence': return width * 0.15;
                case 'pathway': return width * 0.5;
                case 'disease': return width * 0.85;
                default: return width * 0.5;
            }
        }).strength(0.8);
    }

    showNodeTooltip(event, nodeData) {
        let content = `
            <h3>${nodeData.label}</h3>
            <p><strong>Type:</strong> ${nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1)}</p>
            <p><strong>Evidence Score:</strong> ${nodeData.evidence.toFixed(2)}</p>
        `;

        if (nodeData.type === 'disease') {
            // Enhanced disease tooltip
            const confidence = nodeData.evidence >= 0.8 ? 'High' : nodeData.evidence >= 0.6 ? 'Medium' : 'Low';
            
            // Find top 2 contributing evidence sources
            const contributions = this.edges
                .filter(e => e.target.id === nodeData.id)
                .sort((a, b) => b.contribution - a.contribution)
                .slice(0, 2)
                .map(e => {
                    const source = this.nodes.find(n => n.id === e.source.id);
                    return source.label;
                });

            content += `<p><strong>Score:</strong> ${nodeData.evidence.toFixed(2)}</p>`;
            content += `<p><strong>Key drivers:</strong> ${contributions.join(', ')}</p>`;
            content += `<p><strong>Confidence:</strong> ${confidence}</p>`;
            
            if (nodeData.tags) {
                content += `<p><strong>Tags:</strong> ${nodeData.tags.join(', ')}</p>`;
            }
        } else {
            // Regular evidence/pathway tooltip
            if (nodeData.publications) {
                content += `<p><strong>Publications:</strong> ${nodeData.publications}</p>`;
            }
            if (nodeData.trials) {
                content += `<p><strong>Trials:</strong> ${nodeData.trials}</p>`;
            }
            if (nodeData.patents) {
                content += `<p><strong>Patents:</strong> ${nodeData.patents}</p>`;
            }
            if (nodeData.tags) {
                content += `<p><strong>Tags:</strong> ${nodeData.tags.join(', ')}</p>`;
            }

            if (nodeData.contribution > 0) {
                content += `
                    <div class="contribution">
                        <span>Contribution:</span>
                        <div class="contribution-bar">
                            <div class="contribution-fill" style="width: ${nodeData.contribution * 100}%"></div>
                        </div>
                        <span>${(nodeData.contribution * 100).toFixed(1)}%</span>
                    </div>
                `;
            }
        }

        this.tooltip.html(content);
        this.positionTooltip(event);
        this.tooltip.classed('show', true);
    }

    showEdgeTooltip(event, edgeData) {
        const content = `
            <h3>Contribution Strength</h3>
            <p><strong>Source:</strong> ${this.nodes.find(n => n.id === edgeData.source).label}</p>
            <p><strong>Target:</strong> ${this.nodes.find(n => n.id === edgeData.target).label}</p>
            <div class="contribution">
                <span>Contribution:</span>
                <div class="contribution-bar">
                    <div class="contribution-fill" style="width: ${edgeData.contribution * 100}%"></div>
                </div>
                <span>${(edgeData.contribution * 100).toFixed(1)}%</span>
            </div>
        `;

        this.tooltip.html(content);
        this.positionTooltip(event);
        this.tooltip.classed('show', true);
    }

    positionTooltip(event) {
        const tooltipNode = this.tooltip.node();
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

        this.tooltip
            .style('left', `${left}px`)
            .style('top', `${top}px`);
    }

    hideTooltip() {
        this.tooltip.classed('show', false);
    }

    handleNodeClick(nodeData) {
        if (nodeData.type !== 'evidence') return;

        // Reset all highlights
        this.svg.selectAll('.node').classed('highlighted', false);
        this.svg.selectAll('.edge').classed('highlighted', false);

        // Highlight clicked evidence node
        this.svg.selectAll('.node')
            .filter(d => d.id === nodeData.id)
            .classed('highlighted', true);

        // Highlight pathway and affected disease nodes
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

        // Toggle flow animation
        d3.select('#toggle-flow-btn').on('click', () => {
            this.toggleFlowAnimation();
        });

        // Evidence source toggles
        d3.select('#literature-toggle').on('change', (event) => {
            this.evidenceStates.literature = event.target.checked;
            this.updateEvidenceVisibility();
        });

        d3.select('#trials-toggle').on('change', (event) => {
            this.evidenceStates.trials = event.target.checked;
            this.updateEvidenceVisibility();
        });

        d3.select('#patents-toggle').on('change', (event) => {
            this.evidenceStates.patents = event.target.checked;
            this.updateEvidenceVisibility();
        });
    }

    updateEvidenceVisibility() {
        this.svg.selectAll('.node')
            .style('opacity', d => {
                if (d.type === 'evidence') {
                    return this.evidenceStates[d.category] ? 1 : 0.1;
                }
                return 1;
            });

        this.svg.selectAll('.edge')
            .style('opacity', d => {
                if (d.category === 'literature') return this.evidenceStates.literature ? 0.6 : 0.1;
                if (d.category === 'trials') return this.evidenceStates.trials ? 0.6 : 0.1;
                if (d.category === 'patents') return this.evidenceStates.patents ? 0.6 : 0.1;
                return 0.6;
            });
    }

    toggleFlowAnimation() {
        if (this.flowAnimation) {
            clearInterval(this.flowAnimation);
            this.flowAnimation = null;
            this.svg.selectAll('.flow-particle').remove();
        } else {
            this.startFlowAnimation();
        }
    }

    startFlowAnimation() {
        const animateParticle = () => {
            const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            
            if (!this.evidenceStates[edge.category]) return;

            const particle = this.mainGroup.append('circle')
                .attr('class', 'flow-particle')
                .attr('r', 3)
                .attr('cx', edge.source.x)
                .attr('cy', edge.source.y);

            const duration = 2000 + Math.random() * 1000;
            const startTime = Date.now();

            const moveParticle = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const x = edge.source.x + (edge.target.x - edge.source.x) * progress;
                const y = edge.source.y + (edge.target.y - edge.source.y) * progress;

                particle.attr('cx', x).attr('cy', y);

                if (progress < 1) {
                    requestAnimationFrame(moveParticle);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(moveParticle);
        };

        this.flowAnimation = setInterval(animateParticle, 500);
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
    new ExplainableAI();
});
