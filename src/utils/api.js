export const RENDER_BACKEND_URL = 'https://ai-grievance-backend-fro0.onrender.com';
export const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000';

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If running in browser on Vercel or any deployed domain, always use Render HTTPS backend
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return RENDER_BACKEND_URL;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || LOCAL_BACKEND_URL;
}

export default getApiBase;
