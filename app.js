const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to Satellite Scraper App');
});

app.get('/scrape', async (req, res) => {
  try {
    // Require run.js lazily so the scraper only runs when this route is called
    const run = require('./run');
    const data = await run.runScrape();
    res.json({ success: true, items: Array.isArray(data) ? data.length : null, data });
  } catch (err) {
    console.error('Error during scrape:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Satellite Scraper App listening on port ${PORT}`);
  });
}

module.exports = app;
