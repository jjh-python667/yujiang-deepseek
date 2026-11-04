const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function makeHeaders(cred) {
  return {
    'user-agent': USER_AGENT,
    referer: 'https://message.bilibili.com/',
    cookie: `SESSDATA=${cred.sessdata}; bili_jct=${cred.bili_jct}; buvid3=${cred.buvid3}`,
  };
}

export async function pullFeed(kind, { headers, signal }) {
  if (!['reply', 'at'].includes(kind)) throw new RangeError('Unknown Bilibili inbox');
  const url = 'https://api.bilibili.com/x/msgfeed/' + kind + '?platform=web&build=0&mobi_app=web';
  const response = await fetch(url, { headers, signal, redirect: 'error' });
  const data = await response.json().catch(() => {
    signal?.throwIfAborted();
    return null;
  });
  if (!response.ok || data?.code !== 0 || !Array.isArray(data.data?.items)) {
    const error = new Error('Bilibili inbox request failed');
    error.biliCode = Number(data?.code || response.status);
    error.httpStatus = response.status;
    throw error;
  }
  const items = data.data.items.map((entry) => ({
    kind,
    t: Number(entry?.reply_time ?? entry?.at_time ?? 0),
    who: String(entry?.user?.nickname ?? ''),
    mid: String(entry?.user?.mid ?? ''),
  }));
  return { items };
}
