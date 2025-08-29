// api/bfhl.js
const express = require('express');
const serverless = require('@vendia/serverless-express');

const app = express();
app.use(express.json());

// helpers
const isPureNumber = t => /^-?\d+$/.test(t);
const isPureAlpha = t => /^[A-Za-z]+$/.test(t);

app.post('/bfhl', (req, res) => {
  const { data } = req.body || {};
  if (!Array.isArray(data)) {
    return res.status(400).json({ is_success: false, error: '"data" must be an array' });
  }

  let even_numbers = [], odd_numbers = [], alphabets = [], special_characters = [], sum = 0;
  const lettersForConcat = [];

  data.forEach(item => {
    const token = String(item);
    for (const ch of token) if (/[A-Za-z]/.test(ch)) lettersForConcat.push(ch);
    if (isPureNumber(token)) {
      parseInt(token) % 2 === 0 ? even_numbers.push(token) : odd_numbers.push(token);
      sum += parseInt(token);
    } else if (isPureAlpha(token)) {
      alphabets.push(token.toUpperCase());
    } else {
      special_characters.push(token);
    }
  });

  const concat_string = lettersForConcat
    .reverse()
    .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');

  const full_name = (process.env.FULL_NAME || 'john_doe').toLowerCase().replace(/\s+/g, '_');
  const dob = process.env.DOB || '17091999';

  res.json({
    is_success: true,
    user_id: `${full_name}_${dob}`,
    email: process.env.EMAIL || '',
    roll_number: process.env.ROLL_NUMBER || '',
    odd_numbers,
    even_numbers,
    alphabets,
    special_characters,
    sum: String(sum),
    concat_string
  });
});

module.exports = serverless({ app });
