require('dotenv').config(); // Load environment variables from .env file
const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const destroyer = require('server-destroy');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

async function authenticate() {
  return new Promise(async (resolve, reject) => {
    try {
      const { default: open } = await import('open');
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });

      const server = http.createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            res.end('Authentication successful! Please return to the console.');
            server.destroy();

            const { tokens } = await oauth2Client.getToken(qs.get('code'));
            oauth2Client.setCredentials(tokens);
            resolve(tokens);
          }
        } catch (error) {
          reject(error);
        }
      }).listen(3000, () => {
        open(authorizeUrl, { wait: false }).then(cp => cp.unref());
      });

      destroyer(server);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { authenticate, oauth2Client };
