let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
 
  const now = Date.now();
 
  if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }
 
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    const query = encodeURIComponent('"agentic AI" OR "enterprise AI" OR "AI automation" OR "generative AI" OR "AI tools" OR "Qlik"');
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&token=${apiKey}`;
 
    const response = await fetch(url);
    const data = await response.json();
 
    cache = { data, timestamp: now };
 
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}
 
