const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

function base64URLEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

// Start the Salesforce OAuth login flow.
router.get("/salesforce", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  const codeVerifier = base64URLEncode(
    crypto.randomBytes(32)
  );

  const codeChallenge = base64URLEncode(
    crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest()
  );

  // Store these temporarily so they can be verified after the OAuth callback.
  req.session.oauthState = state;
  req.session.codeVerifier = codeVerifier;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SALESFORCE_CLIENT_ID,
    redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authURL =
    `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize?` +
    params.toString();

  res.redirect(authURL);
});

router.get("/status", (req, res) => {
  if (!req.session.salesforce) {
    return res.status(401).json({
      loggedIn: false,
    });
  }

  res.json({
    loggedIn: true,
    instanceUrl: req.session.salesforce.instanceUrl,
  });
});

// Handle the callback after the user approves access in Salesforce.
router.get("/salesforce/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    // Make sure Salesforce returned an authorization code.
    if (!code) {
      return res.status(400).json({
        error: "Authorization code missing",
      });
    }

    // Make sure the callback belongs to the OAuth request we started.
    if (state !== req.session.oauthState) {
      return res.status(400).json({
        error: "Invalid OAuth state",
      });
    }

    // Exchange the authorization code for Salesforce access tokens.
    const response = await axios.post(
      `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
        code_verifier: req.session.codeVerifier,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Keep the Salesforce tokens on the backend session.
    req.session.salesforce = {
      accessToken: response.data.access_token,
      instanceUrl: response.data.instance_url,
      refreshToken: response.data.refresh_token,
    };

    // These values are no longer needed after OAuth is complete.
    delete req.session.oauthState;
    delete req.session.codeVerifier;

    res.redirect(process.env.FRONTEND_URL);

  } catch (error) {
    console.error(
      "Salesforce OAuth Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Salesforce authentication failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;