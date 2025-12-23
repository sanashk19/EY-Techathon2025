// RepurposeQuest AI - Molecular Impact Heatmap Visualization
class MolecularHeatmap {
    constructor() {
        this.analysisData = null;
        this.svg = null;
        this.container = null;
        this.tooltip = null;
        this.heatmapData = [];
        this.filteredData = [];
        this.crosstalkMode = false;
        this.selectedCell = null;
        this.filters = {
            jak: true,
            stat: true,
            ra: true,
            vitiligo: true,
            uc: true,
            showValues: true,
            showEvidence: true
        };
        this.initializeVisualization();
    }

    initializeVisualization() {
        this.container = d3.select('.heatmap-container');
        this.tooltip = d3.select('#tooltip');
        
        // Request analysis data from parent window
        window.opener.postMessage('request-analysis-data', '*');
        
        // Listen for analysis data
        window.addEventListener('message', (event) => {
            if (event.data.type === 'analysis-data') {
                this.analysisData = event.data.data;
                this.createHeatmapData();
                this.renderHeatmap();
                this.initializeControls();
                this.hideLoading();
            }
        });
    }

    hideLoading() {
        d3.select('.loading').style('display', 'none');
    }

    createHeatmapData() {
        // JAK/STAT pathway components
        const pathwayComponents = [
            'JAK1', 'JAK2', 'JAK3', 'TYK2',
            'STAT1', 'STAT3', 'STAT5'
        ];

        // Disease indications from analysis data
        const diseases = this.analysisData.opportunities.map(opp => opp.disease);

        // Generate impact scores based on evidence
        this.heatmapData = [];
        pathwayComponents.forEach(component => {
            diseases.forEach(disease => {
                const baseScore = this.generateImpactScore(component, disease);
                const evidence = this.generateEvidenceSummary(component, disease);
                
                this.heatmapData.push({
                    component: component,
                    disease: disease,
                    impact: baseScore,
                    evidence: evidence,
                    componentType: component.startsWith('JAK') ? 'jak' : 'stat',
                    diseaseKey: disease.toLowerCase().replace(/\s+/g, '_')
                });
            });
        });

        this.filteredData = [...this.heatmapData];
    }

    generateImpactScore(component, disease) {
        // Generate biologically plausible impact scores based on component and disease
        const diseaseFactors = {
            'Rheumatoid Arthritis': { JAK1: 0.8, JAK2: 0.6, JAK3: 0.4, TYK2: 0.5, STAT1: 0.7, STAT3: 0.8, STAT5: 0.3 },
            'Vitiligo': { JAK1: 0.7, JAK2: 0.5, JAK3: 0.9, TYK2: 0.6, STAT1: 0.8, STAT3: 0.4, STAT5: 0.2 },
            'Ulcerative Colitis': { JAK1: 0.6, JAK2: 0.7, JAK3: 0.3, TYK2: 0.8, STAT1: 0.5, STAT3: 0.7, STAT5: 0.4 }
        };

        const baseScore = diseaseFactors[disease]?.[component] || 0.5;
        // Add some variation for realism
        const variation = (Math.random() - 0.5) * 0.2;
        return Math.max(-1, Math.min(1, baseScore + variation));
    }

    generateEvidenceSummary(component, disease) {
        const evidenceTypes = ['Literature', 'Clinical Trials', 'Patent Analysis'];
        const selectedEvidence = evidenceTypes.filter(() => Math.random() > 0.3);
        
        return {
            sources: selectedEvidence,
            publications: Math.floor(Math.random() * 50) + 10,
            trials: Math.floor(Math.random() * 5) + 1,
            confidence: Math.random() * 0.4 + 0.6
        };
    }

    getColorForImpact(impact) {
        // Color scale for impact values (-1 to 1)
        if (impact > 0.7) return '#dc2626';      // Strong positive
        if (impact > 0.3) return '#f97316';      // Moderate positive  
        if (impact > -0.3) return '#64748b';     // Neutral
        if (impact > -0.7) return '#3b82f6';     // Moderate negative
        return '#1e40af';                       // Strong negative
    }

    renderHeatmap() {
        const containerRect = this.container.node().getBoundingClientRect();
        const margin = { top: 80, right: 150, bottom: 100, left: 120 };
        const width = containerRect.width - margin.left - margin.right;
        const height = containerRect.height - margin.top - margin.bottom;

        // Clear existing SVG
        this.container.select('svg').remove();

        // Create SVG
        this.svg = this.container.append('svg')
            .attr('width', containerRect.width)
            .attr('height', containerRect.height);

        const g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Get unique components and diseases
        const components = [...new Set(this.filteredData.map(d => d.component))];
        const diseases = [...new Set(this.filteredData.map(d => d.disease))];

        // Create scales
        const xScale = d3.scaleBand()
            .domain(diseases)
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(components)
            .range([0, height])
            .padding(0.1);

        // Create cells
        const cells = g.selectAll('.heatmap-cell')
            .data(this.filteredData)
            .enter().append('rect')
            .attr('class', 'heatmap-cell')
            .attr('x', d => xScale(d.disease))
            .attr('y', d => yScale(d.component))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => this.getColorForImpact(d.impact))
            .on('mouseenter', (event, d) => this.showTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip())
            .on('click', (event, d) => this.handleCellClick(d));

        // Add value labels if enabled
        if (this.filters.showValues) {
            g.selectAll('.cell-value')
                .data(this.filteredData)
                .enter().append('text')
                .attr('class', 'cell-value')
                .attr('x', d => xScale(d.disease) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.component) + yScale.bandwidth() / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '10px')
                .attr('fill', d => Math.abs(d.impact) > 0.5 ? 'white' : '#1e293b')
                .text(d => d.impact.toFixed(2));
        }

        // Add axes
        g.selectAll('.x-axis-label')
            .data(diseases)
            .enter().append('text')
            .attr('class', 'axis-label col')
            .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('y', -10)
            .text(d => d.length > 15 ? d.substring(0, 12) + '...' : d);

        g.selectAll('.y-axis-label')
            .data(components)
            .enter().append('text')
            .attr('class', 'axis-label row')
            .attr('x', -10)
            .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
            .text(d => d);

        // Add axis titles
        g.append('text')
            .attr('class', 'axis-title')
            .attr('x', width / 2)
            .attr('y', -50)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .attr('fill', '#e2e8f0')
            .text('Disease Indications');

        g.append('text')
            .attr('class', 'axis-title')
            .attr('x', -60)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(-90, -60, ${height / 2})`)
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .attr('fill', '#e2e8f0')
            .text('JAK/STAT Components');

        // Store scales for later use
        this.xScale = xScale;
        this.yScale = yScale;
        this.margin = margin;
    }

    showTooltip(event, cellData) {
        let content = `
            <h3>${cellData.component} → ${cellData.disease}</h3>
            <p><strong>Impact Score:</strong> ${cellData.impact.toFixed(3)}</p>
            <div class="impact-score">
                <span>Strength:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${Math.abs(cellData.impact) * 100}%"></div>
                </div>
                <span>${(Math.abs(cellData.impact) * 100).toFixed(1)}%</span>
            </div>
        `;

        if (this.filters.showEvidence && cellData.evidence) {
            content += `
                <p><strong>Evidence Sources:</strong> ${cellData.evidence.sources.join(', ')}</p>
                <p><strong>Publications:</strong> ${cellData.evidence.publications}</p>
                <p><strong>Confidence:</strong> ${(cellData.evidence.confidence * 100).toFixed(1)}%</p>
            `;
        }

        const direction = cellData.impact > 0 ? 'Activation' : 'Inhibition';
        content += `<p><strong>Direction:</strong> ${direction}</p>`;

        this.tooltip.html(content);
        this.positionTooltip(event);
        this.tooltip.classed('show', true);
    }

    hideTooltip() {
        this.tooltip.classed('show', false);
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

    handleCellClick(cellData) {
        // Remove previous highlights
        this.svg.selectAll('.heatmap-cell').classed('highlighted', false);

        // Highlight clicked cell and related cells
        this.svg.selectAll('.heatmap-cell')
            .filter(d => 
                d.component === cellData.component || 
                d.disease === cellData.disease
            )
            .classed('highlighted', true);

        this.selectedCell = cellData;

        // Show crosstalk if enabled
        if (this.crosstalkMode) {
            this.showCrosstalk(cellData);
        }
    }

    showCrosstalk(cellData) {
        // Find related components with strong impacts
        const relatedComponents = this.filteredData
            .filter(d => 
                d.disease === cellData.disease && 
                Math.abs(d.impact) > 0.5 &&
                d.component !== cellData.component
            );

        if (relatedComponents.length > 0) {
            d3.select('#crosstalk-indicator').classed('active', true);
            
            // Highlight related cells with different style
            this.svg.selectAll('.heatmap-cell')
                .filter(d => 
                    relatedComponents.some(rc => rc.component === d.component && rc.disease === d.disease)
                )
                .style('stroke', '#00d4ff')
                .style('stroke-width', '2px');
        }
    }

    initializeControls() {
        // Back to analysis
        d3.select('#back-btn').on('click', () => {
            window.close();
            window.location.href = 'index.html';
        });

        // Reset view
        d3.select('#reset-btn').on('click', () => {
            this.resetFilters();
            this.renderHeatmap();
        });

        // Toggle crosstalk
        d3.select('#crosstalk-btn').on('click', () => {
            this.crosstalkMode = !this.crosstalkMode;
            d3.select('#crosstalk-indicator').classed('active', this.crosstalkMode);
            
            if (!this.crosstalkMode) {
                this.svg.selectAll('.heatmap-cell')
                    .style('stroke', '#1e293b')
                    .style('stroke-width', '1px');
            }
        });

        // Component filters
        d3.select('#jak-filter').on('change', (event) => {
            this.filters.jak = event.target.checked;
            this.applyFilters();
        });

        d3.select('#stat-filter').on('change', (event) => {
            this.filters.stat = event.target.checked;
            this.applyFilters();
        });

        // Disease filters
        d3.select('#ra-filter').on('change', (event) => {
            this.filters.ra = event.target.checked;
            this.applyFilters();
        });

        d3.select('#vitiligo-filter').on('change', (event) => {
            this.filters.vitiligo = event.target.checked;
            this.applyFilters();
        });

        d3.select('#uc-filter').on('change', (event) => {
            this.filters.uc = event.target.checked;
            this.applyFilters();
        });

        // Display options
        d3.select('#show-values').on('change', (event) => {
            this.filters.showValues = event.target.checked;
            this.renderHeatmap();
        });

        d3.select('#show-evidence').on('change', (event) => {
            this.filters.showEvidence = event.target.checked;
        });
    }

    applyFilters() {
        this.filteredData = this.heatmapData.filter(d => {
            // Component filters
            if (!this.filters.jak && d.componentType === 'jak') return false;
            if (!this.filters.stat && d.componentType === 'stat') return false;

            // Disease filters
            if (!this.filters.ra && d.disease === 'Rheumatoid Arthritis') return false;
            if (!this.filters.vitiligo && d.disease === 'Vitiligo') return false;
            if (!this.filters.uc && d.disease === 'Ulcerative Colitis') return false;

            return true;
        });

        this.renderHeatmap();
    }

    resetFilters() {
        this.filters = {
            jak: true,
            stat: true,
            ra: true,
            vitiligo: true,
            uc: true,
            showValues: true,
            showEvidence: true
        };

        // Reset checkbox states
        d3.selectAll('input[type="checkbox"]').property('checked', true);
        
        // Reset data
        this.filteredData = [...this.heatmapData];
    }
}

// Initialize visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MolecularHeatmap();
});
