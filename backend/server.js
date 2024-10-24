// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '5mb' }));  // Adjust the limit as necessary


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Cache Schema
const CacheSchema = new mongoose.Schema({
  query: String,
  results: Object,
  timestamp: { type: Date, default: Date.now },
  expiresAt: Date
});

const Cache = mongoose.model('Cache', CacheSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});


async function getStackOverflowResults(query) {
  const response = await axios.get(`https://api.stackexchange.com/2.3/search/advanced`, {
    params: {
      q: query,
      site: 'stackoverflow',
      order: 'desc',
      sort: 'votes',
      filter: 'withbody',
    }
  });
  return response.data.items;
}

// Reddit API helper
async function getRedditResults(query) {
  const response = await axios.get(`https://www.reddit.com/search.json`, {
    params: {
      q: query,
      sort: 'relevance',
      limit: 10
    },
    headers: {
      'User-Agent': 'KnowledgeBaseApp/1.0.0'
    }
  });
  return response.data.data.children;
}

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, language } = req.body;

    // Check cache first
    const cachedResults = await Cache.findOne({
      query,
      expiresAt: { $gt: new Date() }
    });

    if (cachedResults) {
      return res.json(cachedResults.results);
    }

    // Fetch new results
    const [stackOverflowResults, redditResults] = await Promise.all([
      getStackOverflowResults(query),
      getRedditResults(query)
    ]);

    const combinedResults = {
      stackoverflow: stackOverflowResults,
      reddit: redditResults
    };

    // Cache results for 1 hour
    const cacheEntry = new Cache({
      query,
      results: combinedResults,
      expiresAt: new Date(Date.now() + 3600000)
    });
    await cacheEntry.save();

    res.json(combinedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email endpoint
app.post('/api/email-results', async (req, res) => {
  try {
    const { email, results, query } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Knowledge Base Search Results: ${query}`,
      html: generateEmailTemplate(results, query)
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

function generateEmailTemplate(results, query) {
  // Generate HTML email template with only the search result links
  return `
    <h2>Search Results for: ${query}</h2>
    <div>
      <h3>Stack Overflow Links:</h3>
      ${results.stackoverflow.map(item => `
        <div>
          <a href="${item.link}">${item.link}</a>
        </div>
      `).join('')}
      
      <h3>Reddit Links:</h3>
      ${results.reddit.map(item => `
        <div>
          <a href="https://reddit.com${item.data.permalink}">${"https://reddit.com" + item.data.permalink}</a>
        </div>
      `).join('')}
    </div>
  `;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});