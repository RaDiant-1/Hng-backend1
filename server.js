const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// In-memory storage
const stringsStore = new Map();

// Helper function to compute SHA-256 hash
function computeHash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Helper function to check if string is palindrome
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

// Helper function to count unique characters
function countUniqueCharacters(str) {
  return new Set(str).size;
}

// Helper function to count words
function countWords(str) {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Helper function to create character frequency map
function createFrequencyMap(str) {
  const map = {};
  for (const char of str) {
    map[char] = (map[char] || 0) + 1;
  }
  return map;
}

// Helper function to analyze string
function analyzeString(value) {
  const hash = computeHash(value);
  return {
    id: hash,
    value: value,
    properties: {
      length: value.length,
      is_palindrome: isPalindrome(value),
      unique_characters: countUniqueCharacters(value),
      word_count: countWords(value),
      sha256_hash: hash,
      character_frequency_map: createFrequencyMap(value)
    },
    created_at: new Date().toISOString()
  };
}

// Helper function to parse natural language query
function parseNaturalLanguage(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Parse word count
  if (lowerQuery.includes('single word')) {
    filters.word_count = 1;
  } else if (lowerQuery.includes('two word') || lowerQuery.includes('2 word')) {
    filters.word_count = 2;
  }

  // Parse palindrome
  if (lowerQuery.includes('palindrom')) {
    filters.is_palindrome = true;
  }

  // Parse length
  const longerMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerMatch) {
    filters.min_length = parseInt(longerMatch[1]) + 1;
  }

  const shorterMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterMatch) {
    filters.max_length = parseInt(shorterMatch[1]) - 1;
  }

  // Parse contains character
  const containsMatch = lowerQuery.match(/contain(?:s|ing)? (?:the letter |the character )?([a-z])/);
  if (containsMatch) {
    filters.contains_character = containsMatch[1];
  }

  // Parse first vowel
  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  }

  return filters;
}

// 1. POST /strings - Create/Analyze String
app.post('/strings', (req, res) => {
  const { value } = req.body;

  // Validation
  if (value === undefined || value === null) {
    return res.status(400).json({ error: 'Missing "value" field in request body' });
  }

  if (typeof value !== 'string') {
    return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
  }

  const hash = computeHash(value);

  // Check if string already exists
  if (stringsStore.has(hash)) {
    return res.status(409).json({ error: 'String already exists in the system' });
  }

  // Analyze and store string
  const analyzedString = analyzeString(value);
  stringsStore.set(hash, analyzedString);

  return res.status(201).json(analyzedString);
});

// 2. GET /strings/:string_value - Get Specific String
app.get('/strings/:string_value', (req, res) => {
  const stringValue = req.params.string_value;
  const hash = computeHash(stringValue);

  const storedString = stringsStore.get(hash);

  if (!storedString) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  return res.status(200).json(storedString);
});

// 3. GET /strings - Get All Strings with Filtering
app.get('/strings', (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character
  } = req.query;

  // Validate query parameters
  if (is_palindrome && is_palindrome !== 'true' && is_palindrome !== 'false') {
    return res.status(400).json({ error: 'Invalid value for is_palindrome (must be true or false)' });
  }

  if (min_length && isNaN(parseInt(min_length))) {
    return res.status(400).json({ error: 'Invalid value for min_length (must be integer)' });
  }

  if (max_length && isNaN(parseInt(max_length))) {
    return res.status(400).json({ error: 'Invalid value for max_length (must be integer)' });
  }

  if (word_count && isNaN(parseInt(word_count))) {
    return res.status(400).json({ error: 'Invalid value for word_count (must be integer)' });
  }

  if (contains_character && contains_character.length !== 1) {
    return res.status(400).json({ error: 'Invalid value for contains_character (must be single character)' });
  }

  // Filter strings
  let filteredStrings = Array.from(stringsStore.values());

  if (is_palindrome !== undefined) {
    const isPalindromeFilter = is_palindrome === 'true';
    filteredStrings = filteredStrings.filter(
      str => str.properties.is_palindrome === isPalindromeFilter
    );
  }

  if (min_length !== undefined) {
    const minLen = parseInt(min_length);
    filteredStrings = filteredStrings.filter(
      str => str.properties.length >= minLen
    );
  }

  if (max_length !== undefined) {
    const maxLen = parseInt(max_length);
    filteredStrings = filteredStrings.filter(
      str => str.properties.length <= maxLen
    );
  }

  if (word_count !== undefined) {
    const wordCnt = parseInt(word_count);
    filteredStrings = filteredStrings.filter(
      str => str.properties.word_count === wordCnt
    );
  }

  if (contains_character !== undefined) {
    filteredStrings = filteredStrings.filter(
      str => str.value.includes(contains_character)
    );
  }

  const filtersApplied = {};
  if (is_palindrome !== undefined) filtersApplied.is_palindrome = is_palindrome === 'true';
  if (min_length !== undefined) filtersApplied.min_length = parseInt(min_length);
  if (max_length !== undefined) filtersApplied.max_length = parseInt(max_length);
  if (word_count !== undefined) filtersApplied.word_count = parseInt(word_count);
  if (contains_character !== undefined) filtersApplied.contains_character = contains_character;

  return res.status(200).json({
    data: filteredStrings,
    count: filteredStrings.length,
    filters_applied: filtersApplied
  });
});

// 4. GET /strings/filter-by-natural-language - Natural Language Filtering
app.get('/strings/filter-by-natural-language', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const parsedFilters = parseNaturalLanguage(query);

    // Check for conflicting filters
    if (parsedFilters.min_length && parsedFilters.max_length) {
      if (parsedFilters.min_length > parsedFilters.max_length) {
        return res.status(422).json({ 
          error: 'Query parsed but resulted in conflicting filters',
          details: 'min_length cannot be greater than max_length'
        });
      }
    }

    // Filter strings based on parsed filters
    let filteredStrings = Array.from(stringsStore.values());

    if (parsedFilters.is_palindrome !== undefined) {
      filteredStrings = filteredStrings.filter(
        str => str.properties.is_palindrome === parsedFilters.is_palindrome
      );
    }

    if (parsedFilters.min_length !== undefined) {
      filteredStrings = filteredStrings.filter(
        str => str.properties.length >= parsedFilters.min_length
      );
    }

    if (parsedFilters.max_length !== undefined) {
      filteredStrings = filteredStrings.filter(
        str => str.properties.length <= parsedFilters.max_length
      );
    }

    if (parsedFilters.word_count !== undefined) {
      filteredStrings = filteredStrings.filter(
        str => str.properties.word_count === parsedFilters.word_count
      );
    }

    if (parsedFilters.contains_character !== undefined) {
      filteredStrings = filteredStrings.filter(
        str => str.value.includes(parsedFilters.contains_character)
      );
    }

    return res.status(200).json({
      data: filteredStrings,
      count: filteredStrings.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters
      }
    });
  } catch (error) {
    return res.status(400).json({ error: 'Unable to parse natural language query' });
  }
});

// 5. DELETE /strings/:string_value - Delete String
app.delete('/strings/:string_value', (req, res) => {
  const stringValue = req.params.string_value;
  const hash = computeHash(stringValue);

  if (!stringsStore.has(hash)) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  stringsStore.delete(hash);
  return res.status(204).send();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'String Analyzer API is running',
    endpoints: [
      'POST /strings',
      'GET /strings/:string_value',
      'GET /strings',
      'GET /strings/filter-by-natural-language',
      'DELETE /strings/:string_value'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`String Analyzer API running on port ${PORT}`);
});
