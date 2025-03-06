
// Authentication utilities for Google API
export async function getGoogleAccessToken(credentials: any): Promise<string> {
  try {
    // Create JWT claims
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + 3600; // 1 hour
    
    const claims = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://www.googleapis.com/oauth2/v4/token",
      exp: expTime,
      iat: now
    };
    
    // Create JWT header
    const header = { alg: "RS256", typ: "JWT" };
    
    // Encode header and claims
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaims = btoa(JSON.stringify(claims));
    
    // Create signature base
    const signatureBase = `${encodedHeader}.${encodedClaims}`;
    
    // Import private key for signing
    const privateKey = credentials.private_key;
    const textEncoder = new TextEncoder();
    const signData = textEncoder.encode(signatureBase);
    
    try {
      // Convert PEM format to ArrayBuffer format that crypto API can use
      const pemHeader = "-----BEGIN PRIVATE KEY-----";
      const pemFooter = "-----END PRIVATE KEY-----";
      const pemContents = privateKey.substring(
        privateKey.indexOf(pemHeader) + pemHeader.length,
        privateKey.indexOf(pemFooter)
      ).replace(/\s/g, '');
      
      const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
      
      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      // Create signature
      const signatureArrayBuffer = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        cryptoKey,
        signData
      );
      
      // Convert signature to base64url
      const signature = btoa(String.fromCharCode(
        ...new Uint8Array(signatureArrayBuffer)
      )).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      
      // Create JWT
      const jwt = `${signatureBase}.${signature}`;
      
      // Exchange JWT for access token
      const tokenResponse = await fetch("https://www.googleapis.com/oauth2/v4/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`Failed to get access token: ${errorText}`);
        throw new Error(`Failed to get access token: ${errorText}`);
      }
      
      const tokenData = await tokenResponse.json();
      return tokenData.access_token;
      
    } catch (err) {
      console.error("Error signing JWT:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error in getGoogleAccessToken:", error);
    throw error;
  }
}
