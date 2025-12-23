// RepurposeQuest AI - Frontend JavaScript
class RepurposeQuestAI {
    constructor() {
        this.initializeEventListeners();
        this.currentAnalysis = null;
    }

    initializeEventListeners() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const exportBtn = document.getElementById('export-btn');
        const graphBtn = document.getElementById('graph-btn');
        const xaiBtn = document.getElementById('xai-btn');
        const heatmapBtn = document.getElementById('heatmap-btn');
        const newAnalysisBtn = document.getElementById('new-analysis-btn');

        analyzeBtn.addEventListener('click', () => this.performAnalysis());
        exportBtn.addEventListener('click', () => this.exportReport());
        graphBtn.addEventListener('click', () => this.openGraph());
        xaiBtn.addEventListener('click', () => this.openXAI());
        heatmapBtn.addEventListener('click', () => this.openHeatmap());
        newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());

        // Add enter key support for inputs
        document.getElementById('molecule').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performAnalysis();
        });

        document.getElementById('target').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performAnalysis();
        });
    }

    async performAnalysis() {
        const molecule = document.getElementById('molecule').value.trim();
        const target = document.getElementById('target').value.trim();

        if (!molecule || !target) {
            this.showNotification('Please enter both molecule name and target pathway', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call with mock data
            const analysisData = await this.generateMockAnalysis(molecule, target);
            this.displayResults(analysisData);
            this.currentAnalysis = analysisData;
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showNotification('Analysis failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateMockAnalysis(molecule, target) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate realistic mock data based on inputs
        const paperCount = Math.floor(Math.random() * 200) + 150;
        const trialCount = Math.floor(Math.random() * 15) + 8;

        const opportunities = [
            {
                disease: 'Rheumatoid Arthritis',
                confidence: 0.85,
                description: 'Strong JAK/STAT pathway involvement in RA pathogenesis. Existing safety data supports rapid clinical development.',
                tags: ['High Priority', 'Fast Track Potential', 'Large Market']
            },
            {
                disease: 'Inflammatory Bowel Disease',
                confidence: 0.78,
                description: 'JAK/STAT signaling critical in intestinal inflammation. Preclinical models demonstrate efficacy in colitis.',
                tags: ['Medium Priority', 'Orphan Drug Potential', 'Unmet Need']
            },
            {
                disease: 'Multiple Sclerosis',
                confidence: 0.72,
                description: 'Emerging evidence of JAK/STAT role in neuroinflammation and demyelination. Novel mechanism for MS treatment.',
                tags: ['Innovative', 'High Risk/Reward', 'Patent Opportunity']
            }
        ];

        // Adjust confidence scores based on target pathway
        if (target.toLowerCase().includes('jak/stat')) {
            opportunities.forEach(opp => {
                opp.confidence = Math.min(0.95, opp.confidence + 0.1);
            });
        }

        return {
            molecule,
            target,
            timestamp: new Date().toISOString(),
            literature: {
                paperCount,
                highlights: [
                    'Strong mechanistic evidence for JAK/STAT modulation',
                    'Preclinical data shows efficacy in inflammatory models',
                    'Favorable safety profile in existing indications'
                ]
            },
            clinicalTrials: {
                total: trialCount,
                phases: {
                    phase1: Math.floor(trialCount * 0.25),
                    phase2: Math.floor(trialCount * 0.58),
                    phase3: Math.floor(trialCount * 0.17)
                }
            },
            patents: {
                expired: Math.floor(Math.random() * 10) + 5,
                overlapping: Math.floor(Math.random() * 20) + 10,
                whitespace: Math.floor(Math.random() * 5) + 2
            },
            opportunities
        };
    }

    displayResults(data) {
        // Update timestamp
        const timestamp = new Date(data.timestamp).toLocaleString();
        document.getElementById('timestamp').textContent = `Generated: ${timestamp}`;

        // Update literature review
        document.getElementById('paper-count').textContent = data.literature.paperCount;

        // Update clinical trials
        document.getElementById('trial-count').textContent = data.clinicalTrials.total;

        // Update opportunities with dynamic data
        const opportunityList = document.querySelector('.opportunity-list');
        opportunityList.innerHTML = '';

        data.opportunities.forEach((opp, index) => {
            const opportunityHTML = `
                <div class="opportunity-item" style="animation-delay: ${index * 0.1}s">
                    <div class="opportunity-header">
                        <h4>${opp.disease}</h4>
                        <div class="confidence-score">
                            <span class="score-label">Confidence:</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${opp.confidence * 100}%"></div>
                            </div>
                            <span class="score-value">${opp.confidence.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="opportunity-details">
                        <p>${opp.description}</p>
                        <div class="opportunity-tags">
                            ${opp.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            opportunityList.innerHTML += opportunityHTML;
        });

        // Show results section
        document.getElementById('results').style.display = 'block';
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    exportReport() {
        if (!this.currentAnalysis) {
            this.showNotification('No analysis data to export', 'error');
            return;
        }

        // Generate PDF report using text export as fallback
        const report = this.generateReportText();
        this.downloadPDFReport(report);
    }

    generateReportText() {
        const data = this.currentAnalysis;
        const timestamp = new Date(data.timestamp).toLocaleString();
        
        return `
REPURPOSEQUEST AI - DRUG REPURPOSING ANALYSIS REPORT
=====================================================

Analysis Generated: ${timestamp}
Molecule: ${data.molecule}
Target Pathway: ${data.target}

TASK COMPLETION CHECKLIST
=========================
✓ Literature review completed
✓ Clinical trials analysis  
✓ Patent landscape assessment
✓ Opportunity identification

LITERATURE REVIEW
=================
Papers Analyzed: ${data.literature.paperCount} peer-reviewed papers

Key Findings:
${data.literature.highlights.map(h => `• ${h}`).join('\n')}

ACTIVE CLINICAL TRIALS
======================
Total Active Trials: ${data.clinicalTrials.total}

Phase Distribution:
• Phase I: ${data.clinicalTrials.phases.phase1} trials
• Phase II: ${data.clinicalTrials.phases.phase2} trials  
• Phase III: ${data.clinicalTrials.phases.phase3} trials

PATENT LANDSCAPE ANALYSIS
==========================
• Expired Patents: ${data.patents.expired}
• Overlapping Patents: ${data.patents.overlapping}
• White Space Opportunities: ${data.patents.whitespace}

POTENTIAL OPPORTUNITIES
======================

${data.opportunities.map((opp, index) => `
${index + 1}. ${opp.disease}
   Confidence Score: ${opp.confidence.toFixed(2)}
   Description: ${opp.description}
   Tags: ${opp.tags.join(', ')}
`).join('\n')}

=====================================================
Report generated by RepurposeQuest AI
Advanced Drug Repurposing Research Assistant
        `.trim();
    }

    downloadPDFReport(content) {
        try {
            // Use jsPDF to create PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add blue header with logo
            doc.setFillColor(74, 144, 226);
            doc.rect(0, 0, 210, 40, 'F');
            
            // Add white logo text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('RepurposeQuest AI', 15, 25);
            
            // Add subtitle
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Advanced Drug Repurposing Research Assistant', 15, 32);
            
            // Reset text color for content
            doc.setTextColor(0, 0, 0);
            
            // Add analysis info section
            let y = 55;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Analysis Details', 15, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const data = this.currentAnalysis;
            const timestamp = new Date(data.timestamp).toLocaleString();
            
            doc.text(`Molecule: ${data.molecule}`, 15, y);
            y += 8;
            doc.text(`Target Pathway: ${data.target}`, 15, y);
            y += 8;
            doc.text(`Generated: ${timestamp}`, 15, y);
            
            // Add blue divider
            y += 10;
            doc.setDrawColor(74, 144, 226);
            doc.setLineWidth(0.5);
            doc.line(15, y, 195, y);
            
            // Add literature review section
            y += 15;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Literature Review', 15, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Papers Analyzed: ${data.literature.paperCount}`, 15, y);
            
            y += 8;
            doc.setFont('helvetica', 'bold');
            doc.text('Key Findings:', 15, y);
            y += 6;
            
            doc.setFont('helvetica', 'normal');
            data.literature.highlights.forEach(highlight => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                const lines = doc.splitTextToSize(`• ${highlight}`, 170);
                lines.forEach(line => {
                    doc.text(line, 15, y);
                    y += 6;
                });
            });
            
            // Add blue divider
            y += 5;
            doc.setDrawColor(74, 144, 226);
            doc.line(15, y, 195, y);
            
            // Add clinical trials section
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Active Clinical Trials', 15, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Active Trials: ${data.clinicalTrials.total}`, 15, y);
            y += 8;
            doc.text(`Phase I: ${data.clinicalTrials.phases.phase1} | Phase II: ${data.clinicalTrials.phases.phase2} | Phase III: ${data.clinicalTrials.phases.phase3}`, 15, y);
            
            // Add blue divider
            y += 10;
            doc.setDrawColor(74, 144, 226);
            doc.line(15, y, 195, y);
            
            // Add patent analysis section
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Patent Landscape Analysis', 15, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Expired Patents: ${data.patents.expired}`, 15, y);
            y += 6;
            doc.text(`Overlapping Patents: ${data.patents.overlapping}`, 15, y);
            y += 6;
            doc.text(`White Space Opportunities: ${data.patents.whitespace}`, 15, y);
            
            // Add blue divider
            y += 10;
            doc.setDrawColor(74, 144, 226);
            doc.line(15, y, 195, y);
            
            // Add opportunities section
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Potential Opportunities', 15, y);
            
            y += 10;
            data.opportunities.forEach((opp, index) => {
                if (y > 220) {
                    doc.addPage();
                    y = 20;
                }
                
                // Opportunity title with confidence
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text(`${index + 1}. ${opp.disease}`, 15, y);
                
                // Confidence score bar
                doc.setFontSize(10);
                doc.text(`Confidence: ${opp.confidence.toFixed(2)}`, 120, y);
                
                y += 8;
                doc.setFillColor(74, 144, 226);
                doc.rect(15, y, opp.confidence * 60, 3, 'F');
                y += 8;
                
                // Description
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                const lines = doc.splitTextToSize(opp.description, 170);
                lines.forEach(line => {
                    doc.text(line, 15, y);
                    y += 5;
                });
                
                // Tags
                y += 5;
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.setTextColor(74, 144, 226);
                doc.text(opp.tags.join(' | '), 15, y);
                doc.setTextColor(0, 0, 0);
                y += 10;
            });
            
            // Add footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFillColor(74, 144, 226);
            doc.rect(0, pageHeight - 20, 210, 20, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Report generated by RepurposeQuest AI', 15, pageHeight - 10);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, 180, pageHeight - 10);
            
            // Save PDF
            doc.save(`repurposing-analysis-${Date.now()}.pdf`);
            
            this.showNotification('PDF report exported successfully', 'success');
        } catch (error) {
            console.error('PDF generation failed:', error);
            // Fallback to text download
            this.downloadReport(content);
        }
    }

    downloadReport(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `repurposing-analysis-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully', 'success');
    }

    resetAnalysis() {
        document.getElementById('results').style.display = 'none';
        document.getElementById('molecule').value = '';
        document.getElementById('target').value = '';
        this.currentAnalysis = null;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.showNotification('Ready for new analysis', 'info');
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading');
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;

        // Set background color based on type
        const colors = {
            success: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            info: 'linear-gradient(135deg, #3498db, #2980b9)'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    openGraph() {
        if (!this.currentAnalysis) {
            this.showNotification('Please run an analysis first to view the graph', 'error');
            return;
        }
        // Open graph.html in a new window with analysis data
        const graphWindow = window.open('graph.html', '_blank', 'width=1200,height=800');
        // Pass analysis data to the graph window
        window.addEventListener('message', (event) => {
            if (event.data === 'request-analysis-data') {
                graphWindow.postMessage({
                    type: 'analysis-data',
                    data: this.currentAnalysis
                }, '*');
            }
        });
    }

    openXAI() {
        if (!this.currentAnalysis) {
            this.showNotification('Please run an analysis first to view the XAI interface', 'error');
            return;
        }
        // Open ai.html in a new window with analysis data
        const xaiWindow = window.open('ai.html', '_blank', 'width=1400,height=900');
        // Pass analysis data to the XAI window
        window.addEventListener('message', (event) => {
            if (event.data === 'request-analysis-data') {
                xaiWindow.postMessage({
                    type: 'analysis-data',
                    data: this.currentAnalysis
                }, '*');
            }
        });
    }

    openHeatmap() {
        if (!this.currentAnalysis) {
            this.showNotification('Please run an analysis first to view the heatmap', 'error');
            return;
        }
        // Open map.html in a new window with analysis data
        const heatmapWindow = window.open('map.html', '_blank', 'width=1400,height=900');
        // Pass analysis data to the heatmap window
        window.addEventListener('message', (event) => {
            if (event.data === 'request-analysis-data') {
                heatmapWindow.postMessage({
                    type: 'analysis-data',
                    data: this.currentAnalysis
                }, '*');
            }
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Add notification animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new RepurposeQuestAI();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to opportunity items
    const observer = new MutationObserver(() => {
        const opportunityItems = document.querySelectorAll('.opportunity-item');
        opportunityItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
