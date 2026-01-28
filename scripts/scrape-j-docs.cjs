#!/usr/bin/env node
/**
 * J Language Documentation Scraper
 * 
 * Scrapes primitive documentation from the J Wiki NuVoc pages
 * and generates a JS file for use in hover docs.
 * 
 * Usage: node scripts/scrape-j-docs.cjs
 * 
 * Run this periodically to update the docs if upstream changes.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://code.jsoftware.com';
const NUVOC_URL = `${BASE_URL}/wiki/NuVoc`;

// Output path
const JS_OUTPUT_FILE = path.join(__dirname, '..', 'src', 'j-docs.js');

/**
 * Fetch a URL and return the content
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        protocol.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }
            
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            
            res.setEncoding('utf8');
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

/**
 * J primitives mapping - glyph to wiki page and names
 * Based on NuVoc structure
 */
const jPrimitives = {
    // Verbs - Arithmetic
    '=': { page: 'eq', monad: 'Self-Classify', dyad: 'Equal', type: 'verb' },
    '<': { page: 'lt', monad: 'Box', dyad: 'Less Than', type: 'verb' },
    '<.': { page: 'ltdot', monad: 'Floor', dyad: 'Lesser Of (Min)', type: 'verb' },
    '<:': { page: 'ltco', monad: 'Decrement', dyad: 'Less Or Equal', type: 'verb' },
    '>': { page: 'gt', monad: 'Open', dyad: 'Greater Than', type: 'verb' },
    '>.': { page: 'gtdot', monad: 'Ceiling', dyad: 'Greater Of (Max)', type: 'verb' },
    '>:': { page: 'gtco', monad: 'Increment', dyad: 'Greater Or Equal', type: 'verb' },
    '+': { page: 'plus', monad: 'Conjugate', dyad: 'Plus', type: 'verb' },
    '+.': { page: 'plusdot', monad: 'Real/Imag', dyad: 'GCD (Or)', type: 'verb' },
    '+:': { page: 'plusco', monad: 'Double', dyad: 'Not-Or', type: 'verb' },
    '*': { page: 'star', monad: 'Signum', dyad: 'Times', type: 'verb' },
    '*.': { page: 'stardot', monad: 'Length/Angle', dyad: 'LCM (And)', type: 'verb' },
    '*:': { page: 'starco', monad: 'Square', dyad: 'Not-And', type: 'verb' },
    '-': { page: 'minus', monad: 'Negate', dyad: 'Minus', type: 'verb' },
    '-.': { page: 'minusdot', monad: 'Not', dyad: 'Less', type: 'verb' },
    '-:': { page: 'minusco', monad: 'Halve', dyad: 'Match', type: 'verb' },
    '%': { page: 'percent', monad: 'Reciprocal', dyad: 'Divide', type: 'verb' },
    '%.': { page: 'percentdot', monad: 'Matrix Inverse', dyad: 'Matrix Divide', type: 'verb' },
    '%:': { page: 'percentco', monad: 'Square Root', dyad: 'Root', type: 'verb' },
    '^': { page: 'hat', monad: 'Exponential', dyad: 'Power', type: 'verb' },
    '^.': { page: 'hatdot', monad: 'Natural Log', dyad: 'Logarithm', type: 'verb' },
    '$': { page: 'dollar', monad: 'Shape Of', dyad: 'Shape', type: 'verb' },
    '$.': { page: 'dollardot', monad: 'Sparse', dyad: 'Sparse', type: 'verb' },
    '~.': { page: 'tildedot', monad: 'Nub', dyad: null, type: 'verb' },
    '~:': { page: 'tildeco', monad: 'Nub Sieve', dyad: 'Not-Equal', type: 'verb' },
    '|': { page: 'bar', monad: 'Magnitude', dyad: 'Residue', type: 'verb' },
    '|.': { page: 'bardot', monad: 'Reverse', dyad: 'Rotate', type: 'verb' },
    '|:': { page: 'barco', monad: 'Transpose', dyad: 'Rearrange Axes', type: 'verb' },
    ',': { page: 'comma', monad: 'Ravel', dyad: 'Append', type: 'verb' },
    ',.': { page: 'commadot', monad: 'Ravel Items', dyad: 'Stitch', type: 'verb' },
    ',:': { page: 'commaco', monad: 'Itemize', dyad: 'Laminate', type: 'verb' },
    ';': { page: 'semi', monad: 'Raze', dyad: 'Link', type: 'verb' },
    ';:': { page: 'semico', monad: 'Words', dyad: 'Sequential Machine', type: 'verb' },
    '#': { page: 'number', monad: 'Tally', dyad: 'Copy', type: 'verb' },
    '#.': { page: 'numberdot', monad: 'Base 2', dyad: 'Base', type: 'verb' },
    '#:': { page: 'numberco', monad: 'Antibase 2', dyad: 'Antibase', type: 'verb' },
    '!': { page: 'bang', monad: 'Factorial', dyad: 'Out Of (Binomial)', type: 'verb' },
    '[': { page: 'squarelf', monad: 'Same', dyad: 'Left', type: 'verb' },
    ']': { page: 'squarert', monad: 'Same', dyad: 'Right', type: 'verb' },
    '{': { page: 'curlylf', monad: 'Catalogue', dyad: 'From', type: 'verb' },
    '{.': { page: 'curlylfdot', monad: 'Head', dyad: 'Take', type: 'verb' },
    '{:': { page: 'curlylfco', monad: 'Tail', dyad: null, type: 'verb' },
    '{::': { page: 'curlylfcoco', monad: 'Map', dyad: 'Fetch', type: 'verb' },
    '}': { page: 'curlyrt', monad: 'Item Amend', dyad: 'Amend', type: 'verb' },
    '}.': { page: 'curlyrtdot', monad: 'Behead', dyad: 'Drop', type: 'verb' },
    '}:': { page: 'curlyrtco', monad: 'Curtail', dyad: null, type: 'verb' },
    '?': { page: 'query', monad: 'Roll', dyad: 'Deal', type: 'verb' },
    '?.': { page: 'querydot', monad: 'Roll (fixed seed)', dyad: 'Deal (fixed seed)', type: 'verb' },
    'i.': { page: 'idot', monad: 'Integers', dyad: 'Index Of', type: 'verb' },
    'i:': { page: 'ico', monad: 'Steps', dyad: 'Index Of Last', type: 'verb' },
    'I.': { page: 'icapdot', monad: 'Indices', dyad: 'Interval Index', type: 'verb' },
    'j.': { page: 'jdot', monad: 'Imaginary', dyad: 'Complex', type: 'verb' },
    'o.': { page: 'odot', monad: 'Pi Times', dyad: 'Circle Function', type: 'verb' },
    'p.': { page: 'pdot', monad: 'Roots', dyad: 'Polynomial', type: 'verb' },
    'p:': { page: 'pco', monad: 'Primes', dyad: null, type: 'verb' },
    'q:': { page: 'qco', monad: 'Prime Factors', dyad: 'Prime Exponents', type: 'verb' },
    'r.': { page: 'rdot', monad: 'Angle', dyad: 'Polar', type: 'verb' },
    'x:': { page: 'xco', monad: 'Extended Precision', dyad: null, type: 'verb' },
    'A.': { page: 'acapdot', monad: 'Anagram Index', dyad: 'Anagram', type: 'verb' },
    'C.': { page: 'ccapdot', monad: 'Cycle-Direct', dyad: 'Permute', type: 'verb' },
    'e.': { page: 'edot', monad: 'Raze In', dyad: 'Member (In)', type: 'verb' },
    'E.': { page: 'ecapdot', monad: null, dyad: 'Find Matches', type: 'verb' },
    'L.': { page: 'lcapdot', monad: 'Level Of', dyad: null, type: 'verb' },
    's:': { page: 'sco', monad: 'Symbol', dyad: 'Symbol', type: 'verb' },
    'u:': { page: 'uco', monad: 'Unicode', dyad: 'Unicode', type: 'verb' },
    
    // Adverbs
    '~': { page: 'tilde', monad: 'Reflex', dyad: 'Passive', type: 'adverb' },
    '/': { page: 'slash', monad: 'Insert', dyad: 'Table', type: 'adverb' },
    '/.': { page: 'slashdot', monad: 'Oblique', dyad: 'Key', type: 'adverb' },
    '/:': { page: 'slashco', monad: 'Grade Up', dyad: 'Sort Up', type: 'adverb' },
    '\\': { page: 'bslash', monad: 'Prefix', dyad: 'Infix', type: 'adverb' },
    '\\.': { page: 'bslashdot', monad: 'Suffix', dyad: 'Outfix', type: 'adverb' },
    '\\:': { page: 'bslashco', monad: 'Grade Down', dyad: 'Sort Down', type: 'adverb' },
    '}': { page: 'curlyrt', monad: 'Item Amend', dyad: 'Amend', type: 'adverb' },
    'b.': { page: 'bdot', monad: 'Boolean/Bitwise', dyad: null, type: 'adverb' },
    'f.': { page: 'fdot', monad: 'Fix', dyad: null, type: 'adverb' },
    'M.': { page: 'mcapdot', monad: 'Memo', dyad: null, type: 'adverb' },
    't.': { page: 'tdot', monad: 'Taylor Coeff', dyad: null, type: 'adverb' },
    
    // Conjunctions
    '^:': { page: 'hatco', monad: 'Power (of verb)', dyad: null, type: 'conjunction' },
    '.': { page: 'dot', monad: 'Determinant', dyad: 'Dot Product', type: 'conjunction' },
    ':': { page: 'cor', monad: 'Explicit', dyad: 'Explicit', type: 'conjunction' },
    ':.': { page: 'codot', monad: 'Obverse', dyad: null, type: 'conjunction' },
    '::': { page: 'coco', monad: 'Adverse', dyad: null, type: 'conjunction' },
    ';.': { page: 'semidot', monad: 'Cut', dyad: 'Cut', type: 'conjunction' },
    '!.': { page: 'bangdot', monad: 'Fit', dyad: null, type: 'conjunction' },
    '!:': { page: 'bangco', monad: 'Foreign', dyad: null, type: 'conjunction' },
    '"': { page: 'quote', monad: 'Rank', dyad: null, type: 'conjunction' },
    '".': { page: 'quotedot', monad: 'Do', dyad: 'Numbers', type: 'conjunction' },
    '":': { page: 'quoteco', monad: 'Default Format', dyad: 'Format', type: 'conjunction' },
    '`': { page: 'grave', monad: 'Tie (Gerund)', dyad: null, type: 'conjunction' },
    '`:': { page: 'graveco', monad: 'Evoke Gerund', dyad: null, type: 'conjunction' },
    '@': { page: 'at', monad: 'Atop', dyad: 'Atop', type: 'conjunction' },
    '@.': { page: 'atdot', monad: 'Agenda', dyad: null, type: 'conjunction' },
    '@:': { page: 'atco', monad: 'At', dyad: 'At', type: 'conjunction' },
    '&': { page: 'ampm', monad: 'Bond', dyad: 'Compose', type: 'conjunction' },
    '&.': { page: 'ampdot', monad: 'Under (Dual)', dyad: null, type: 'conjunction' },
    '&.:': { page: 'ampdotco', monad: 'Under', dyad: null, type: 'conjunction' },
    '&:': { page: 'ampco', monad: 'Appose', dyad: null, type: 'conjunction' },
    'd.': { page: 'ddot', monad: 'Derivative', dyad: null, type: 'conjunction' },
    'D.': { page: 'dcapdot', monad: 'Derivative', dyad: null, type: 'conjunction' },
    'D:': { page: 'dcapco', monad: 'Secant Slope', dyad: null, type: 'conjunction' },
    'F.': { page: 'fcap', monad: 'Fold', dyad: null, type: 'conjunction' },
    'H.': { page: 'hcapdot', monad: 'Hypergeometric', dyad: null, type: 'conjunction' },
    'L:': { page: 'lcapco', monad: 'Level At', dyad: null, type: 'conjunction' },
    'S:': { page: 'scapco', monad: 'Spread', dyad: null, type: 'conjunction' },
    'T.': { page: 'tcapdot', monad: 'Taylor', dyad: null, type: 'conjunction' },
    
    // Special forms
    '$:': { page: 'dollarco', monad: 'Self-Reference', dyad: 'Self-Reference', type: 'verb' },
    '[.': { page: 'squarelfdot', monad: 'Lev', dyad: null, type: 'other' },
    '[:': { page: 'squarelfco', monad: 'Cap', dyad: null, type: 'other' },
    '].': { page: 'squarertdot', monad: 'Dex', dyad: null, type: 'other' },
    ']:': { page: 'squarertco', monad: 'Ident', dyad: null, type: 'other' },
    
    // Constants/Nouns
    '_': { page: 'under', monad: 'Negative Sign/Infinity', dyad: null, type: 'noun' },
    '_.': { page: 'underdot', monad: 'Indeterminate', dyad: null, type: 'noun' },
    'a.': { page: 'adot', monad: 'Alphabet', dyad: null, type: 'noun' },
    'a:': { page: 'aco', monad: 'Ace (Boxed Empty)', dyad: null, type: 'noun' },
};

/**
 * Fetch description from a wiki page
 */
async function fetchPrimitiveDoc(glyph, info) {
    const url = `${BASE_URL}/wiki/Vocabulary/${info.page}`;
    
    try {
        const html = await fetchUrl(url);
        
        let monadDesc = '';
        let dyadDesc = '';
        
        // The descriptions appear after horizontal rules (<hr>) following the rank info
        // Split by horizontal rules to find description sections
        const sections = html.split(/<hr\s*\/?>/i);
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            
            // Look for the first meaningful paragraph in each section
            const paraMatch = section.match(/<p>([^<]*(?:(?!<\/p>)<[^<]*)*)<\/p>/i);
            if (paraMatch) {
                let text = stripHtml(paraMatch[1]);
                
                // Skip navigation/header text
                if (text.includes('Down to:') || text.includes('Back to:') || 
                    text.includes('Thru to:') || text.includes('>>') ||
                    text.length < 10) {
                    continue;
                }
                
                // Clean up
                text = text.replace(/\s+/g, ' ').trim();
                
                // Truncate if too long
                if (text.length > 200) {
                    text = text.substring(0, 197) + '...';
                }
                
                // Check if this is monad or dyad section by looking at previous content
                const prevSection = i > 0 ? sections[i-1] : '';
                
                if (!monadDesc && (prevSection.includes('Rank 0') || prevSection.includes('Rank _') || prevSection.includes('Rank 1') || prevSection.includes('Rank 2'))) {
                    // Check if it's monad (+ y) or dyad (x + y)
                    if (prevSection.match(/`\s*\S+\s+y\s*`/) || 
                        (prevSection.includes(' y') && !prevSection.match(/x\s+\S+\s+y/))) {
                        monadDesc = text;
                    } else if (prevSection.match(/x\s+\S+\s+y/)) {
                        dyadDesc = text;
                    } else if (!monadDesc) {
                        monadDesc = text;
                    }
                } else if (!dyadDesc && text.length > 10) {
                    dyadDesc = text;
                }
            }
        }
        
        return {
            monadDesc: monadDesc || '',
            dyadDesc: dyadDesc || '',
            docUrl: url
        };
    } catch (err) {
        console.error(`  Warning: Could not fetch ${url}: ${err.message}`);
        return {
            monadDesc: '',
            dyadDesc: '',
            docUrl: url
        };
    }
}

/**
 * Build name from monad/dyad info
 */
function buildName(info) {
    if (info.monad && info.dyad) {
        return `${info.monad} / ${info.dyad}`;
    }
    return info.monad || info.dyad || '';
}

/**
 * Build fallback description from monad/dyad info
 */
function buildFallbackDescription(info) {
    let desc = '';
    
    if (info.monad) {
        desc += `Monad: ${info.monad}`;
    }
    if (info.dyad) {
        if (desc) desc += '. ';
        desc += `Dyad: ${info.dyad}`;
    }
    
    return desc;
}

/**
 * Generate the JavaScript module
 */
function generateJsModule(docs) {
    const jsContent = `/**
 * J Language Primitive Documentation
 * 
 * Auto-generated by scripts/scrape-j-docs.cjs
 * Source: https://code.jsoftware.com/wiki/NuVoc
 * Generated: ${new Date().toISOString()}
 * 
 * Run \`node scripts/scrape-j-docs.cjs\` to update from upstream docs.
 * 
 * LICENSE ATTRIBUTION:
 * The documentation content in this file is derived from the J Wiki (NuVoc).
 * Source: https://code.jsoftware.com/wiki/NuVoc
 * License: Creative Commons Attribution-ShareAlike
 * See THIRD_PARTY_LICENSES.md for full license text.
 */

export const jDocsMeta = {
    "language": "J",
    "source": "https://code.jsoftware.com/wiki/NuVoc",
    "scrapedAt": "${new Date().toISOString()}",
    "version": "1.0.0"
};

export const jGlyphDocs = ${JSON.stringify(docs, null, 4)};

/**
 * Get hover content for a J primitive
 * @param {string} glyph - The glyph to look up
 * @returns {object|null} - The documentation object or null if not found
 */
export function getJHoverContent(glyph) {
    return jGlyphDocs[glyph] || null;
}
`;
    return jsContent;
}

/**
 * Main scraping function
 */
async function scrapeJDocs() {
    console.log('J Language Documentation Scraper');
    console.log('=================================\n');
    
    const glyphs = Object.keys(jPrimitives);
    console.log(`Processing ${glyphs.length} primitives...\n`);
    
    const docs = {};
    let processed = 0;
    
    for (const [glyph, info] of Object.entries(jPrimitives)) {
        const fetched = await fetchPrimitiveDoc(glyph, info);
        
        const doc = {
            glyph: glyph,
            type: info.type,
            docUrl: fetched.docUrl
        };
        
        // Add monadic info if available
        if (info.monad) {
            doc.monad = {
                name: info.monad,
                description: fetched.monadDesc || ''
            };
        }
        
        // Add dyadic info if available
        if (info.dyad) {
            doc.dyad = {
                name: info.dyad,
                description: fetched.dyadDesc || ''
            };
        }
        
        docs[glyph] = doc;
        
        processed++;
        if (processed % 20 === 0) {
            console.log(`  Processed ${processed}/${glyphs.length} primitives`);
        }
        
        // Small delay to be nice to the server
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Write JavaScript module
    const jsContent = generateJsModule(docs);
    fs.writeFileSync(JS_OUTPUT_FILE, jsContent);
    console.log(`\nWrote ${Object.keys(docs).length} primitives to ${JS_OUTPUT_FILE}`);
    
    // Print summary
    console.log('\nSummary:');
    const verbs = Object.values(docs).filter(d => d.type === 'verb');
    const adverbs = Object.values(docs).filter(d => d.type === 'adverb');
    const conjunctions = Object.values(docs).filter(d => d.type === 'conjunction');
    const nouns = Object.values(docs).filter(d => d.type === 'noun');
    const other = Object.values(docs).filter(d => d.type === 'other');
    console.log(`  Verbs: ${verbs.length}`);
    console.log(`  Adverbs: ${adverbs.length}`);
    console.log(`  Conjunctions: ${conjunctions.length}`);
    console.log(`  Nouns: ${nouns.length}`);
    console.log(`  Other: ${other.length}`);
}

// Run the scraper
scrapeJDocs().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
