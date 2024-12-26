require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const { oauth2Client, authenticate } = require('./authenticate');

const app = express();
const port = 3000;

google.options({ auth: oauth2Client });

app.get('/leads', async (req, res) => {
  try {
    const localservices = google.localservices({ version: 'v1', auth: oauth2Client });
    const accountID = process.env.ACCOUNT_ID;

    const response = await localservices.accountReports.search({
      parent: accountID,
      query: 'startDate=2024-01-01&endDate=2024-01-31',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching lead report:', error);
    res.status(500).send('Failed to fetch lead report');
  }
});

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Authenticating...');
  try {
    const tokens = await authenticate();
    console.log('Access Token:', tokens.access_token);
    if (tokens.refresh_token) {
      console.log('Refresh Token:', tokens.refresh_token);
    }
  } catch (err) {
    console.error('Authentication failed:', err);
  }
});
