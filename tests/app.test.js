const request = require('supertest');
const run = require('../run');

// Mock the runScrape implementation to avoid real network calls during tests
beforeAll(() => {
  if (run && typeof run.runScrape === 'function') {
    run.runScrape = jest.fn().mockResolvedValue([{ id: 'mock1' }, { id: 'mock2' }]);
  }
});

describe('Express app routes', () => {
  let app;
  beforeAll(() => {
    // require the app after mocking run.runScrape so the module cache contains the mocked function
    app = require('../app');
  });

  test('GET / should return 200 and welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Welcome to Satellite Scraper App/);
  });

  test('GET /scrape should return JSON without error', async () => {
    const res = await request(app).get('/scrape');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
