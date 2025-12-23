const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Drug repurposing analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { molecule, target } = req.body;
        
        if (!molecule || !target) {
            return res.status(400).json({
                error: 'Missing required parameters: molecule and target'
            });
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate analysis data
        const analysisData = generateAnalysisData(molecule, target);
        
        res.json({
            success: true,
            data: analysisData
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Internal server error during analysis'
        });
    }
});

// Literature search endpoint
app.get('/api/literature/:molecule', (req, res) => {
    const { molecule } = req.params;
    const literatureData = generateLiteratureData(molecule);
    res.json(literatureData);
});

// Clinical trials endpoint
app.get('/api/trials/:molecule', (req, res) => {
    const { molecule } = req.params;
    const trialsData = generateTrialsData(molecule);
    res.json(trialsData);
});

// Patent analysis endpoint
app.get('/api/patents/:molecule', (req, res) => {
    const { molecule } = req.params;
    const patentData = generatePatentData(molecule);
    res.json(patentData);
});

// Helper functions for data generation
function generateAnalysisData(molecule, target) {
    const baseConfidence = target.toLowerCase().includes('jak/stat') ? 0.8 : 0.6;
    
    return {
        molecule,
        target,
        timestamp: new Date().toISOString(),
        literature: {
            paperCount: Math.floor(Math.random() * 200) + 150,
            highlights: [
                'Strong mechanistic evidence for pathway modulation',
                'Preclinical data shows efficacy in disease models',
                'Favorable safety profile in existing indications'
            ]
        },
        clinicalTrials: {
            total: Math.floor(Math.random() * 15) + 8,
            phases: {
                phase1: Math.floor(Math.random() * 5) + 2,
                phase2: Math.floor(Math.random() * 8) + 4,
                phase3: Math.floor(Math.random() * 3) + 1
            }
        },
        patents: {
            expired: Math.floor(Math.random() * 10) + 5,
            overlapping: Math.floor(Math.random() * 20) + 10,
            whitespace: Math.floor(Math.random() * 5) + 2
        },
        opportunities: [
            {
                disease: 'Rheumatoid Arthritis',
                confidence: Math.min(0.95, baseConfidence + 0.15),
                description: 'Strong pathway involvement in disease pathogenesis. Existing safety data supports rapid clinical development.',
                tags: ['High Priority', 'Fast Track Potential', 'Large Market']
            },
            {
                disease: 'Inflammatory Bowel Disease',
                confidence: Math.min(0.95, baseConfidence + 0.08),
                description: 'Critical signaling pathway in intestinal inflammation. Preclinical models demonstrate efficacy.',
                tags: ['Medium Priority', 'Orphan Drug Potential', 'Unmet Need']
            },
            {
                disease: 'Multiple Sclerosis',
                confidence: Math.min(0.95, baseConfidence + 0.02),
                description: 'Emerging evidence of pathway role in neuroinflammation. Novel mechanism for treatment.',
                tags: ['Innovative', 'High Risk/Reward', 'Patent Opportunity']
            }
        ]
    };
}

function generateLiteratureData(molecule) {
    return {
        molecule,
        totalPapers: Math.floor(Math.random() * 300) + 100,
        recentPapers: Math.floor(Math.random() * 50) + 20,
        keyFindings: [
            'Mechanistic studies confirm pathway modulation',
            'Preclinical efficacy demonstrated in multiple disease models',
            'Safety profile well-characterized in existing indications'
        ],
        topJournals: [
            { name: 'Nature Medicine', papers: Math.floor(Math.random() * 10) + 5 },
            { name: 'Science Translational Medicine', papers: Math.floor(Math.random() * 8) + 3 },
            { name: 'Journal of Clinical Investigation', papers: Math.floor(Math.random() * 12) + 6 }
        ]
    };
}

function generateTrialsData(molecule) {
    const totalTrials = Math.floor(Math.random() * 20) + 10;
    
    return {
        molecule,
        totalTrials,
        activeTrials: Math.floor(totalTrials * 0.6),
        completedTrials: Math.floor(totalTrials * 0.4),
        phases: {
            phase1: Math.floor(totalTrials * 0.25),
            phase2: Math.floor(totalTrials * 0.55),
            phase3: Math.floor(totalTrials * 0.20)
        },
        conditions: [
            { name: 'Rheumatoid Arthritis', trials: Math.floor(Math.random() * 5) + 2 },
            { name: 'Inflammatory Bowel Disease', trials: Math.floor(Math.random() * 4) + 1 },
            { name: 'Multiple Sclerosis', trials: Math.floor(Math.random() * 3) + 1 }
        ]
    };
}

function generatePatentData(molecule) {
    return {
        molecule,
        totalPatents: Math.floor(Math.random() * 30) + 15,
        expired: Math.floor(Math.random() * 10) + 5,
        active: Math.floor(Math.random() * 20) + 10,
        pending: Math.floor(Math.random() * 8) + 3,
        whiteSpace: Math.floor(Math.random() * 5) + 2,
        keyJurisdictions: [
            { country: 'United States', patents: Math.floor(Math.random() * 15) + 8 },
            { country: 'Europe', patents: Math.floor(Math.random() * 12) + 6 },
            { country: 'Japan', patents: Math.floor(Math.random() * 8) + 4 }
        ]
    };
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`RepurposeQuest AI server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to access the application`);
});

module.exports = app;
