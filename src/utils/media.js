export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cleanApiBase = apiBase.replace(/\/$/, '');

  // If it's a relative path like /uploads/... or /api/...
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) {
    return `${cleanApiBase}${url}`;
  }

  // If it's hardcoded to localhost or 127.0.0.1
  if (url.includes('localhost:8000/uploads/') || url.includes('127.0.0.1:8000/uploads/')) {
    const filename = url.split('/uploads/').pop();
    return `${cleanApiBase}/uploads/${filename}`;
  }

  // If frontend is HTTPS and backend URL is HTTP (upgrade to HTTPS to prevent Mixed Content)
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url.replace('http://', 'https://');
  }

  return url;
}
