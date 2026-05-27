import { BACKEND_URL } from './backend';

export async function fetchData<Data>(endpoint: string, maxRetries: number = 3): Promise<Data> {
  while (maxRetries > 0) {
    try {
      return await fetchDataInternal(endpoint);
    } catch {
      maxRetries--;
    }
  }

  throw new Error('Max retries exceeded');
}

async function fetchDataInternal<Data>(endpoint: string): Promise<Data> {
  const data = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
    signal: AbortSignal.timeout(8000),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(`Response: ${response.status}`);
  });

  return data;
}
