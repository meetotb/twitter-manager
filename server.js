const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Parser } = require('json2csv');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add this at the top of your file for better error logging
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Update your MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Application Schema
const applicationSchema = new mongoose.Schema({
    name: String,
    email: String,
    whatsapp: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    twitterExperience: String,
    twitterExperienceDetails: String,
    web3Experience: String,
    web3ExperienceDetails: String,
    submittedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

// Add this middleware before your admin routes
const verifyPassword = async (req, res, next) => {
    const { password } = req.query;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).redirect('/admin-login');
    }
    next();
};

// Routes
app.post('/api/submit-application', async (req, res) => {
    try {
        const application = new Application(req.body);
        await application.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/applications', verifyPassword, async (req, res) => {
    try {
        const applications = await Application.find().sort({ submittedAt: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/applications/:id', verifyPassword, async (req, res) => {
    try {
        const result = await Application.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add login page route
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Update admin route
app.get('/admin', verifyPassword, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this route with your other routes
app.get('/api/applications/download', verifyPassword, async (req, res) => {
    try {
        const applications = await Application.find().sort({ submittedAt: -1 });
        
        if (!applications || applications.length === 0) {
            return res.status(404).json({ success: false, error: 'No applications found' });
        }

        const data = applications.map(app => ({
            Name: app.name || '',
            Email: app.email || '',
            WhatsApp: app.whatsapp || '',
            Instagram: app.instagram || '',
            Twitter: app.twitter || '',
            LinkedIn: app.linkedin || '',
            'Twitter Experience': app.twitterExperience || '',
            'Experience Details': app.twitterExperienceDetails || '',
            'Web3 Experience': app.web3Experience || '',
            'Web3 Details': app.web3ExperienceDetails || '',
            'Submitted Date': app.submittedAt ? new Date(app.submittedAt).toLocaleString('en-US') : ''
        }));

        const fields = Object.keys(data[0]);
        const opts = { fields };

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(data);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
            return res.status(200).send(csv);
        } catch (err) {
            console.error('Error parsing to CSV:', err);
            return res.status(500).json({ success: false, error: 'Error generating CSV' });
        }
    } catch (error) {
        console.error('Error in download route:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 