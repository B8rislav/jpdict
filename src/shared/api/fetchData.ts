export async function fetchData<Data>(
  endpoint: string,
  maxRetries: number = 5,
): Promise<Data> {
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
  const data = await fetch(`https://api.renshuu.org/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    },
    signal: AbortSignal.timeout(5000),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(`Response: ${response.status}`);
  });

  return data;
}
