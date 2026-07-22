import axios from 'axios';

export function getFullUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const match = path.match(/^\/(DHAKA-FLIX-\d+)/);
  if (!match) return path;

  const server = match[1];
  let ip = process.env.NEXT_PUBLIC_SERVER_7 || '172.16.50.7';
  if (server === 'DHAKA-FLIX-8') ip = process.env.NEXT_PUBLIC_SERVER_8 || '172.16.50.8';
  if (server === 'DHAKA-FLIX-9') ip = process.env.NEXT_PUBLIC_SERVER_9 || '172.16.50.9';
  if (server === 'DHAKA-FLIX-12') ip = process.env.NEXT_PUBLIC_SERVER_12 || '172.16.50.12';
  if (server === 'DHAKA-FLIX-14') ip = process.env.NEXT_PUBLIC_SERVER_14 || '172.16.50.14';

  return `http://${ip}${path}`;
}

export function parseH5aiHTML(html, basePath = '') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = [];

  const links = doc.querySelectorAll('a');
  links.forEach(link => {
    let href = link.getAttribute('href');
    if (!href || href === '../' || href === '.' || href.startsWith('http') || href.startsWith('?') || href.startsWith('#')) return;

    // Normalize href to be absolute path using basePath
    if (!href.startsWith('/')) {
      const cleanBase = basePath ? (basePath.endsWith('/') ? basePath : basePath + '/') : '/';
      href = cleanBase + href;
    }

    const isFolder = href.endsWith('/');
    let rawName = href.replace(/\/$/, '');
    try {
      rawName = decodeURIComponent(rawName);
    } catch { }

    const parts = rawName.split('/');
    const name = parts[parts.length - 1];

    if (!name || name === '.' || name === '..') return;

    items.push({
      title: name,
      href,
      isFolder,
      time: ''
    });
  });

  return items;
}

export async function fetchDirectory(path = '/DHAKA-FLIX-7/English Movies/') {
  const url = getFullUrl(path);
  try {
    const { data } = await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`);
    return parseH5aiHTML(data, path);
  } catch {
    try {
      const { data } = await axios.get(url);
      return parseH5aiHTML(data, path);
    } catch (error) {
      console.error('Error fetching directory:', error);
      throw error;
    }
  }
}

export async function fetchStatus() {
  try {
    const { data } = await axios.get('/api/status');
    return data;
  } catch (error) {
    console.error('Error fetching status:', error);
    return { status: 'offline', message: 'Backend unreachable' };
  }
}

