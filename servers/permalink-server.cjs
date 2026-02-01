#!/usr/bin/env node
/**
 * Permalink Server for ArrayBox
 * Stores and retrieves short permalinks (4-char codes)
 * Serves OG meta tags for social media previews
 * 
 * Usage: node permalink-server.cjs [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateAndSaveOGImage, generateVerticalImage, getLangDisplayName } = require('./og-generator.cjs');

const PORT = parseInt(process.argv[2]) || 8084;
const STORAGE_FILE = path.join(__dirname, '..', 'storage', 'permalinks.json');
const OG_DIR = path.join(__dirname, '..', 'storage', 'og');
const INDEX_FILE = path.join(__dirname, '..', 'index.html');
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Base URL for generating absolute URLs (override with BASE_URL env var)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Load permalinks from file
function loadPermalinks() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading permalinks:', e.message);
    }
    return {};
}

// Save permalinks to file
function savePermalinks(permalinks) {
    try {
        const dir = path.dirname(STORAGE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(permalinks, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving permalinks:', e.message);
        return false;
    }
}

// Generate random 4-char code
function generateCode() {
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
}

// Increment code for collision handling
function incrementCode(code) {
    const chars = code.split('');
    for (let i = chars.length - 1; i >= 0; i--) {
        const idx = CHARS.indexOf(chars[i]);
        if (idx < CHARS.length - 1) {
            chars[i] = CHARS[idx + 1];
            return chars.join('');
        }
        chars[i] = CHARS[0];
    }
    return CHARS[0] + chars.join('');
}

// In-memory cache
let permalinks = loadPermalinks();

// Generate HTML page with OG meta tags for a permalink
function generateOGHtml(shortCode, data) {
    const langName = getLangDisplayName(data.lang);
    const title = `ArrayBox · ${langName}`;
    const description = data.code.length > 100 
        ? data.code.slice(0, 97) + '...' 
        : data.code;
    const imageUrl = `${BASE_URL}/og/${shortCode}.png`;
    const pageUrl = `${BASE_URL}/p/${shortCode}`;
    
    // Read the base index.html and inject OG tags
    let html;
    try {
        html = fs.readFileSync(INDEX_FILE, 'utf8');
    } catch (e) {
        // Fallback minimal HTML if index.html not found
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArrayBox</title>
</head>
<body>
    <script>window.location.href = '/#${shortCode}';</script>
</body>
</html>`;
    }
    
    // OG meta tags to inject
    const ogTags = `
    <!-- Open Graph / Social Media Preview -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${imageUrl}">
`;
    
    // Inject OG tags after <head>
    html = html.replace('<head>', '<head>' + ogTags);
    
    // Add script to load the permalink data
    const loadScript = `
    <script>
        // Auto-load permalink on page load
        window.PERMALINK_CODE = '${shortCode}';
    </script>
</head>`;
    html = html.replace('</head>', loadScript);
    
    return html;
}

// Escape HTML special characters
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // GET /og/:code.png - Serve OG image
    if (req.method === 'GET' && req.url.startsWith('/og/') && req.url.endsWith('.png')) {
        const code = req.url.slice(4, -4); // Remove '/og/' and '.png'
        const imagePath = path.join(OG_DIR, `${code}.png`);
        
        if (fs.existsSync(imagePath)) {
            const imageData = fs.readFileSync(imagePath);
            res.writeHead(200, { 
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000',
            });
            res.end(imageData);
        } else {
            // Try to generate on-demand if permalink exists
            const data = permalinks[code];
            if (data) {
                generateAndSaveOGImage(code, data.code, data.lang)
                    .then(savedPath => {
                        const imageData = fs.readFileSync(savedPath);
                        res.writeHead(200, { 
                            'Content-Type': 'image/png',
                            'Cache-Control': 'public, max-age=31536000',
                        });
                        res.end(imageData);
                    })
                    .catch(e => {
                        console.error('Error generating OG image:', e);
                        res.writeHead(500);
                        res.end('Error generating image');
                    });
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        }
        return;
    }

    // GET /p/:code - Serve HTML page with OG tags (for social media crawlers)
    if (req.method === 'GET' && req.url.startsWith('/p/') && !req.url.includes('.')) {
        const code = req.url.slice(3);
        const data = permalinks[code];
        
        // Check if this is an API request (wants JSON)
        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('application/json')) {
            if (data) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, ...data }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Not found' }));
            }
            return;
        }
        
        // Serve HTML page with OG tags
        if (data) {
            const html = generateOGHtml(code, data);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<html><body><h1>Not found</h1></body></html>');
        }
        return;
    }

    // GET /p/:code (JSON API) - Retrieve permalink data
    if (req.method === 'GET' && req.url.startsWith('/p/')) {
        const code = req.url.slice(3);
        const data = permalinks[code];
        
        if (data) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, ...data }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Not found' }));
        }
        return;
    }

    // POST /image/vertical - Generate vertical image and return as PNG
    if (req.method === 'POST' && req.url === '/image/vertical') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { lang, code, result, resultHtml } = JSON.parse(body);
                
                if (!lang || !code) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing lang or code' }));
                    return;
                }
                
                const pngBuffer = await generateVerticalImage(code, lang, result || null, resultHtml || null);
                res.writeHead(200, { 
                    'Content-Type': 'image/png',
                    'Cache-Control': 'no-cache',
                });
                res.end(pngBuffer);
            } catch (e) {
                console.error('Error generating vertical image:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // POST /p - Create permalink
    if (req.method === 'POST' && req.url === '/p') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { lang, code, result, resultHtml } = JSON.parse(body);
                
                if (!lang || !code) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing lang or code' }));
                    return;
                }

                // Build content object (only include result/resultHtml if provided)
                const content = { lang, code };
                if (result) content.result = result;
                if (resultHtml) content.resultHtml = resultHtml;
                const contentStr = JSON.stringify(content);

                // Check for existing identical content
                for (const [key, value] of Object.entries(permalinks)) {
                    if (JSON.stringify(value) === contentStr) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, id: key }));
                        return;
                    }
                }

                // Generate new code
                let newCode = generateCode();
                while (permalinks[newCode]) {
                    newCode = incrementCode(newCode);
                }

                // Store and save
                permalinks[newCode] = content;
                if (savePermalinks(permalinks)) {
                    // Generate OG image in background (don't wait)
                    generateAndSaveOGImage(newCode, code, lang, result || null, resultHtml || null)
                        .then(() => console.log(`Generated OG image for ${newCode}`))
                        .catch(e => console.error(`Failed to generate OG image for ${newCode}:`, e.message));
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, id: newCode }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to save' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', count: Object.keys(permalinks).length }));
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`Permalink server running on http://localhost:${PORT}`);
    console.log(`Storage: ${STORAGE_FILE}`);
    console.log(`Loaded ${Object.keys(permalinks).length} permalinks`);
});
