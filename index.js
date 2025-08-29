// index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Environment-configurable user info (set these in .env or in Railway env)
const FULL_NAME = (process.env.FULL_NAME || 'john_doe').trim();
const DOB = process.env.DOB || '17091999'; // ddmmyyyy
const EMAIL = process.env.EMAIL || 'john@xyz.com';
const ROLL_NUMBER = process.env.ROLL_NUMBER || 'ABCD123';

function buildUserId() {
  // full_name lowercased, spaces -> underscores
  const name = FULL_NAME.toLowerCase().replace(/\s+/g, '_');
  return `${name}_${DOB}`;
}

function isPureNumber(token) {
  // integer numbers with optional leading minus (e.g. -12). "001" will be treated as number.
  return /^-?\d+$/.test(token);
}

function isPureAlpha(token) {
  return /^[A-Za-z]+$/.test(token);
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body || {};
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: 'Invalid request: "data" must be an array'
      });
    }

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let numericSum = 0;
    const lettersForConcat = []; // collect every alphabetic char across tokens (in order)

    data.forEach(item => {
      const token = String(item); // preserve original formatting (so numbers are returned as strings)
      // collect alphabetic characters for concat_string
      for (const ch of token) {
        if (/[A-Za-z]/.test(ch)) lettersForConcat.push(ch);
      }

      if (isPureNumber(token)) {
        const n = parseInt(token, 10);
        if (n % 2 === 0) even_numbers.push(token);
        else odd_numbers.push(token);
        numericSum += n;
      } else if (isPureAlpha(token)) {
        alphabets.push(token.toUpperCase());
      } else {
        // mixed token or special chars -> treat entire token as special
        special_characters.push(token);
      }
    });

    // Build concat_string: reverse letters, then alternating caps (Upper, lower, Upper, ...)
    const concat_string = lettersForConcat
      .reverse()
      .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
      .join('');

    const response = {
      is_success: true,
      user_id: buildUserId(),
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(numericSum),
      concat_string
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ is_success: false, error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`bfhl API listening on port ${PORT}`));
