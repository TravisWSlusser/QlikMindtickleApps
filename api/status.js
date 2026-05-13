const PROVIDERS = [
  { name: 'Claude', url: 'https://status.anthropic.com/api/v2/status.json' },
  { name: 'ChatGPT', url: 'https://status.openai.com/api/v2/status.json' },
  { name: 'Gemini', url: 'https://status.google.com/api/v2/status.json' },
  { name: 'Copilot', url: 'https://status.azure.com/api/v2/status.json' }
];

let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const now = Date.now();

  if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    const results = await Promise.allSettled(
      PROVIDERS.map(async (provider) => {
        const response = await fetch(provider.url, { signal: AbortSignal.timeout(5000) });
        const data = await response.json();
        return {
          name: provider.name,
          status: data.status?.indicator || 'unknown',
          description: data.status?.description || 'Unknown'
        };
      })
    );

    const statuses = results.map((result, i) => {
      if (result.status === 'fulfilled') return result.value;
      return { name: PROVIDERS[i].name, status: 'unknown', description: 'Unable to reach' };
    });

    cache = { data: statuses, timestamp: now };
    return res.status(200).json(statuses);

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch statuses' });
  }
}
