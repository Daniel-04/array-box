/**
 * Primitive Translation Module
 * 
 * Translates primitives between array languages based on their MONADIC definitions only.
 * When switching languages, corresponding primitives are automatically converted.
 * 
 * Also handles array literal translation across languages:
 *   APL/Kap:    1 2 3    ¯1 2 ¯3    1.5 ¯2.5 3
 *   BQN:        1‿2‿3   ¯1‿2‿¯3   1.5‿¯2.5‿3
 *   TinyAPL:    1‿2‿3   ¯1‿2‿¯3   1.5‿¯2.5‿3
 *   Uiua:       1_2_3   ¯1_2_¯3   1.5_¯2.5_3
 *   J:          1 2 3   _1 2 _3    1.5 _2.5 3
 */

/**
 * Cross-language primitive mappings based on MONADIC definitions.
 * Each group represents semantically equivalent primitives across languages.
 * 
 * Format: { apl, bqn, uiua, j, kap, tinyapl }
 * null means the language doesn't have a direct equivalent or it differs
 */
export const primitiveGroups = {
    // ========== SYNTAX ==========
    
    // String delimiters
    stringDelimiter: {
        apl: "'",
        bqn: '"',
        uiua: '"',
        j: "'",
        kap: "'",
        tinyapl: '"'
    },
    
    // Comments
    comment: {
        apl: '⍝',
        bqn: '#',
        uiua: '#',
        j: 'NB.',  // Special: word-based comment
        kap: '⍝',
        tinyapl: '⍝'
    },
    
    // Left argument (in dfns/blocks)
    leftArg: {
        apl: '⍺',
        bqn: '𝕨',
        uiua: null,     // Stack-based, no explicit args
        j: null,        // Uses 'x' as normal variable
        kap: '⍺',
        tinyapl: '⍺'
    },
    
    // Right argument (in dfns/blocks)
    rightArg: {
        apl: '⍵',
        bqn: '𝕩',
        uiua: null,     // Stack-based, no explicit args
        j: null,        // Uses 'y' as normal variable
        kap: '⍵',
        tinyapl: '⍵'
    },
    
    // Left operand (in dops/modifiers)
    // TinyAPL uses ⍶⍶ (two underbar-alphas) for left function operand
    // Dyalog uses ⍺⍺ (two alphas) for left operand
    leftOperand: {
        apl: '⍺⍺',      // Two alpha chars
        bqn: '𝔽',
        uiua: null,
        j: null,
        kap: null,
        tinyapl: '⍶⍶'   // Two underbar-alpha chars
    },
    
    // Right operand (in dops/modifiers)  
    // TinyAPL uses ⍹⍹ (two underbar-omegas) for right function operand
    // Dyalog uses ⍵⍵ (two omegas) for right operand
    rightOperand: {
        apl: '⍵⍵',      // Two omega chars
        bqn: '𝔾',
        uiua: null,
        j: null,
        kap: null,
        tinyapl: '⍹⍹'   // Two underbar-omega chars
    },
    
    // Self-reference in recursion
    selfRef: {
        apl: '∇',
        bqn: '𝕊',
        uiua: null,
        j: '$:',
        kap: '∇',
        tinyapl: '∇'
    },
    
    // ========== MONADIC FUNCTIONS ==========
    
    // Iota / Range / Index Generator (monadic: generate indices 0..n-1)
    iota: {
        apl: '⍳',
        bqn: '↕',
        uiua: '⇡',
        j: 'i.',
        kap: '⍳',
        tinyapl: '⍳'
    },
    
    // Tally / Length (monadic: count of major cells)
    tally: {
        apl: '≢',
        bqn: '≠',
        uiua: '⧻',
        j: '#',
        kap: '≢',
        tinyapl: '≢'
    },
    
    // Shape (monadic: dimensions of array)
    shape: {
        apl: '⍴',
        bqn: '≢',
        uiua: '△',
        j: '$',
        kap: '⍴',
        tinyapl: '⍴'
    },
    
    // Reverse (monadic: reverse along last axis)
    reverse: {
        apl: '⌽',
        bqn: '⌽',
        uiua: '⇌',
        j: '|.',
        kap: '⌽',
        tinyapl: '⌽'
    },
    
    // Transpose (monadic: reorder axes)
    transpose: {
        apl: '⍉',
        bqn: '⍉',
        uiua: '⍉',
        j: '|:',
        kap: '⍉',
        tinyapl: '⍉'
    },
    
    // Enclose / Box (monadic: wrap in scalar)
    enclose: {
        apl: '⊂',
        bqn: '<',
        uiua: '□',
        j: '<',
        kap: '⊂',
        tinyapl: '⊂'
    },
    
    // First / Disclose (monadic: get first element or unbox)
    first: {
        apl: '⊃',
        bqn: '⊑',
        uiua: '⊢',
        j: '>',         // Open in J
        kap: '⊃',
        tinyapl: '⊃'
    },
    
    // Unique (monadic: remove duplicates)
    unique: {
        apl: '∪',
        bqn: '⍷',
        uiua: '◴',
        j: '~.',
        kap: '∪',
        tinyapl: '∪'
    },
    
    // Where (monadic: indices of true/nonzero values)
    where: {
        apl: '⍸',
        bqn: '/',       // Indices in BQN
        uiua: '⊚',
        j: 'I.',
        kap: '⍸',
        tinyapl: '⍸'
    },
    
    // Grade Up (monadic: permutation for ascending sort)
    gradeUp: {
        apl: '⍋',
        bqn: '⍋',
        uiua: '⍏',
        j: '/:', 
        kap: '⍋',
        tinyapl: '⍋'
    },
    
    // Grade Down (monadic: permutation for descending sort)
    gradeDown: {
        apl: '⍒',
        bqn: '⍒',
        uiua: '⍖',
        j: '\\:',
        kap: '⍒',
        tinyapl: '⍒'
    },
    
    // Ravel (monadic: flatten to vector)
    ravel: {
        apl: ',',
        bqn: '⥊',
        uiua: '♭',
        j: ',',
        kap: ',',
        tinyapl: ','
    },
    
    // ========== ARITHMETIC ==========
    
    // Multiply / Times
    multiply: {
        apl: '×',
        bqn: '×',
        uiua: '×',
        j: '*',
        kap: '×',
        tinyapl: '×'
    },
    
    // ========== MODIFIERS ==========
    
    // Reduce / Fold (modifier: insert function between elements)
    reduce: {
        apl: '/',
        bqn: '´',
        uiua: '/',
        j: '/',
        kap: '/',
        tinyapl: '/'
    },
    
    // Scan (modifier: running reduce)
    scan: {
        apl: '\\',
        bqn: '`',
        uiua: '\\',
        j: '\\',
        kap: '\\',
        tinyapl: '\\'
    },
    
    // Table / Outer Product (modifier: all combinations)
    table: {
        apl: '∘.',      // Two-char sequence (jot-dot)
        bqn: '⌜',
        uiua: '⊞',
        j: null,        // J uses dyadic / which conflicts with reduce
        kap: '⌻',
        tinyapl: '⊞'
    },
    
    // Commute / Swap (modifier: swap arguments or duplicate)
    commute: {
        apl: '⍨',
        bqn: '˜',
        uiua: '˜',
        j: '~',
        kap: '⍨',
        tinyapl: '⍨'
    }
};

// ========== ARRAY LITERAL TRANSLATION ==========

/**
 * Language-specific configuration for array literals.
 * 
 * separator: what goes between elements in an array literal
 *   - ' ' for space-separated (APL, Kap, J)
 *   - '‿' for ligature (BQN, TinyAPL)
 *   - '_' for underscore (Uiua)
 * 
 * negative: prefix for negative numbers
 *   - '¯' (high minus) for APL, BQN, Uiua, Kap, TinyAPL
 *   - '_' (underscore) for J
 * 
 * numberPattern: regex to match a single number literal in that language
 *   Must NOT have the global flag. Used for per-element matching.
 */
const arrayLiteralConfig = {
    apl: {
        separator: ' ',
        negative: '¯',
        // APL: ¯?digits with optional decimal and exponent
        numberPattern: /^¯?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i
    },
    bqn: {
        separator: '‿',
        negative: '¯',
        // BQN: same as APL but uses ‿ separator
        numberPattern: /^¯?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i
    },
    uiua: {
        separator: '_',
        negative: '¯',
        // Uiua: uses ¯ for negative, _ as separator (NOT in number itself)
        numberPattern: /^¯?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i
    },
    j: {
        separator: ' ',
        negative: '_',
        // J: uses _ for negative prefix, also _. for neg infinity, __ for infinity
        // Supports e/j/r/x suffixes for complex/rational/extended
        numberPattern: /^_?(\d+\.?\d*|\.\d+)([ejrx][+-]?\d+\.?\d*)?/i
    },
    kap: {
        separator: ' ',
        negative: '¯',
        numberPattern: /^¯?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i
    },
    tinyapl: {
        separator: '‿',
        negative: '¯',
        // TinyAPL: uses ⏨ for exponent, ᴊ for complex part
        numberPattern: /^¯?(\d+\.?\d*|\.\d+)(⏨[+-]?\d+)?(ᴊ¯?\d+\.?\d*)?/i
    }
};

/**
 * Parse an array literal from the source language starting at position `start` in `code`.
 * Returns { elements: string[], end: number } or null if not an array literal.
 * 
 * An array literal is 2+ number literals joined by the language's separator.
 * For space-separated languages, we require at least 2 numbers separated by a single space
 * (not inside strings, comments, etc.).
 * 
 * @param {string} code - Full source code
 * @param {number} start - Starting index (must point to the start of a number)
 * @param {string} lang - Source language identifier
 * @returns {{ elements: string[], end: number } | null}
 */
function parseArrayLiteral(code, start, lang) {
    const config = arrayLiteralConfig[lang];
    if (!config) return null;
    
    const elements = [];
    let pos = start;
    
    // Try to match the first number
    const firstMatch = code.substring(pos).match(config.numberPattern);
    if (!firstMatch) return null;
    
    elements.push(firstMatch[0]);
    pos += firstMatch[0].length;
    
    // Now try to match separator + number repeatedly
    while (pos < code.length) {
        const sep = config.separator;
        
        // Check for separator
        if (code.substring(pos, pos + sep.length) !== sep) break;
        
        const afterSep = pos + sep.length;
        if (afterSep >= code.length) break;
        
        // For space-separated languages, a space could just be normal whitespace
        // between non-array things, so we require the next thing to be a number.
        // For ligature/underscore-separated languages, the separator IS the indicator.
        
        // Try to match a number after the separator
        const nextMatch = code.substring(afterSep).match(config.numberPattern);
        if (!nextMatch) {
            // For Uiua: _ could be followed by a negative ¯ then digits
            // But ¯ is already handled by the number pattern. If no match, stop.
            break;
        }
        
        // Verify the match starts at position 0 (right after separator)
        if (nextMatch.index !== 0) break;
        
        elements.push(nextMatch[0]);
        pos = afterSep + nextMatch[0].length;
    }
    
    // Need at least 2 elements to be an array literal
    if (elements.length < 2) return null;
    
    return { elements, end: pos };
}

/**
 * Convert a single number from one language's notation to another.
 * Primarily handles negative prefix conversion (¯ vs _).
 * 
 * @param {string} num - Number literal string in source language
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 * @returns {string} Number in target language notation
 */
function convertNumber(num, fromLang, toLang) {
    const fromConfig = arrayLiteralConfig[fromLang];
    const toConfig = arrayLiteralConfig[toLang];
    
    if (!fromConfig || !toConfig) return num;
    
    // If negative prefixes are the same, no conversion needed
    if (fromConfig.negative === toConfig.negative) return num;
    
    // Replace leading negative prefix
    if (num.startsWith(fromConfig.negative)) {
        return toConfig.negative + num.substring(fromConfig.negative.length);
    }
    
    return num;
}

/**
 * Translate array literals in code from one language to another.
 * 
 * Finds sequences of 2+ numbers joined by the source language's array separator
 * and converts them to the target language's format, including negative prefix changes.
 * 
 * @param {string} code - Source code
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 * @returns {string} Code with array literals translated
 */
export function translateArrayLiterals(code, fromLang, toLang) {
    if (fromLang === toLang) return code;
    
    const fromConfig = arrayLiteralConfig[fromLang];
    const toConfig = arrayLiteralConfig[toLang];
    if (!fromConfig || !toConfig) return code;
    
    // If both separator and negative prefix are the same, nothing to do
    if (fromConfig.separator === toConfig.separator && fromConfig.negative === toConfig.negative) {
        return code;
    }
    
    const result = [];
    let i = 0;
    
    // Track whether we're inside a string or comment to avoid translating those
    const stringDelims = getStringDelimiters(fromLang);
    const commentChars = getCommentStarters(fromLang);
    
    while (i < code.length) {
        // Skip strings
        const strSkip = skipString(code, i, fromLang, stringDelims);
        if (strSkip > i) {
            result.push(code.substring(i, strSkip));
            i = strSkip;
            continue;
        }
        
        // Skip comments (to end of line)
        const commentSkip = skipComment(code, i, fromLang, commentChars);
        if (commentSkip > i) {
            result.push(code.substring(i, commentSkip));
            i = commentSkip;
            continue;
        }
        
        // Check if this position starts a number (potential array literal start)
        const ch = code[i];
        const isNumberStart = (ch >= '0' && ch <= '9') || ch === '.' || ch === fromConfig.negative;
        
        if (isNumberStart) {
            const parsed = parseArrayLiteral(code, i, fromLang);
            if (parsed) {
                // Convert each element and join with target separator
                const converted = parsed.elements
                    .map(el => convertNumber(el, fromLang, toLang))
                    .join(toConfig.separator);
                result.push(converted);
                i = parsed.end;
                continue;
            }
        }
        
        // No array literal here, just copy the character
        result.push(code[i]);
        i++;
    }
    
    return result.join('');
}

/**
 * Get string delimiters for a language
 */
function getStringDelimiters(lang) {
    switch (lang) {
        case 'apl': case 'j': case 'kap': return ["'"];
        case 'bqn': case 'uiua': return ['"'];
        case 'tinyapl': return ["'", '"'];
        default: return [];
    }
}

/**
 * Get comment start characters for a language
 */
function getCommentStarters(lang) {
    switch (lang) {
        case 'apl': case 'kap': case 'tinyapl': return ['⍝'];
        case 'bqn': case 'uiua': return ['#'];
        case 'j': return ['NB.'];
        default: return [];
    }
}

/**
 * Skip past a string literal starting at position i.
 * Returns new position after the string, or i if not a string.
 */
function skipString(code, i, lang, delimiters) {
    const ch = code[i];
    if (!delimiters.includes(ch)) return i;
    
    // For J, don't skip strings (J uses ' in complex ways)
    // The J number pattern handles _ correctly on its own
    
    const delimiter = ch;
    let pos = i + 1;
    
    // APL-family single-quote strings: doubled '' for escape
    const useDoubleEscape = delimiter === "'" && lang !== 'bqn';
    const escapeChar = lang === 'tinyapl' && delimiter === '"' ? '⍘' : '\\';
    
    while (pos < code.length) {
        const c = code[pos];
        if (c === delimiter) {
            if (useDoubleEscape && pos + 1 < code.length && code[pos + 1] === delimiter) {
                pos += 2; // skip doubled escape
                continue;
            }
            pos++; // include closing delimiter
            return pos;
        } else if (!useDoubleEscape && c === escapeChar && pos + 1 < code.length) {
            pos += 2; // skip escape + char
        } else if (c === '\n') {
            return pos; // unclosed string ends at newline
        } else {
            pos++;
        }
    }
    return pos;
}

/**
 * Skip past a comment starting at position i.
 * Returns new position after the comment (end of line), or i if not a comment.
 */
function skipComment(code, i, lang, commentStarters) {
    for (const starter of commentStarters) {
        if (code.substring(i, i + starter.length) === starter) {
            // Comment goes to end of line
            const lineEnd = code.indexOf('\n', i);
            return lineEnd === -1 ? code.length : lineEnd;
        }
    }
    return i;
}

/**
 * Build translation maps from source language to target language
 * Returns { forward: Map<sourceGlyph, targetGlyph>, backward: Map<targetGlyph, sourceGlyph> }
 */
function buildTranslationMap(fromLang, toLang) {
    const forward = new Map();
    const backward = new Map();
    
    for (const [name, group] of Object.entries(primitiveGroups)) {
        const fromGlyph = group[fromLang];
        const toGlyph = group[toLang];
        
        // Skip if either language doesn't have this primitive
        if (fromGlyph === null || toGlyph === null) continue;
        
        // Skip if they're the same glyph (no translation needed)
        if (fromGlyph === toGlyph) continue;
        
        forward.set(fromGlyph, toGlyph);
        backward.set(toGlyph, fromGlyph);
    }
    
    return { forward, backward };
}

// Cache for translation maps
const translationCache = new Map();

/**
 * Clear the translation cache (useful when mappings change)
 */
export function clearTranslationCache() {
    translationCache.clear();
}

/**
 * Get or create translation map between two languages
 */
function getTranslationMap(fromLang, toLang) {
    const key = `${fromLang}->${toLang}`;
    if (!translationCache.has(key)) {
        translationCache.set(key, buildTranslationMap(fromLang, toLang));
    }
    return translationCache.get(key);
}

/**
 * Translate code from one array language to another
 * 
 * @param {string} code - Source code to translate
 * @param {string} fromLang - Source language ('apl', 'bqn', 'uiua', 'j', 'kap', 'tinyapl')
 * @param {string} toLang - Target language
 * @returns {string} - Translated code
 */
export function translatePrimitives(code, fromLang, toLang) {
    if (fromLang === toLang) return code;
    
    const { forward } = getTranslationMap(fromLang, toLang);
    
    if (forward.size === 0) return code;
    
    // Sort by length descending to handle multi-char sequences first (e.g., ∘. before ∘)
    const sortedGlyphs = [...forward.keys()].sort((a, b) => b.length - a.length);
    
    // Build a regex that matches any source glyph (escaped for regex special chars)
    const escapedGlyphs = sortedGlyphs.map(g => g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(escapedGlyphs.join('|'), 'g');
    
    // Single-pass replacement: only looks at the ORIGINAL code, no cascading
    // Each match is looked up in the forward map and replaced once
    const result = code.replace(pattern, (match) => forward.get(match) || match);
    
    return result;
}

/**
 * Check if translation is available between two languages
 */
export function hasTranslation(fromLang, toLang) {
    if (fromLang === toLang) return false;
    const { forward } = getTranslationMap(fromLang, toLang);
    return forward.size > 0;
}

/**
 * Get list of translatable primitives between two languages
 * Returns array of { from, to, name } objects
 */
export function getTranslatablePrimitives(fromLang, toLang) {
    const result = [];
    
    for (const [name, group] of Object.entries(primitiveGroups)) {
        const fromGlyph = group[fromLang];
        const toGlyph = group[toLang];
        
        if (fromGlyph !== null && toGlyph !== null && fromGlyph !== toGlyph) {
            result.push({ from: fromGlyph, to: toGlyph, name });
        }
    }
    
    return result;
}

export default {
    translatePrimitives,
    translateArrayLiterals,
    hasTranslation,
    getTranslatablePrimitives,
    clearTranslationCache,
    primitiveGroups
};
