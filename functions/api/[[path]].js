// functions/api/[[path]].js

// URL backend VPS Anda yang asli. Ini TIDAK akan terlihat oleh klien.
const ACTUAL_BACKEND_URL = "https://cntbmcasaqkv.ap-southeast-1.clawcloudrun.com";

export async function onRequest(context) {
  const { request, params } = context;
  // 'params.path' adalah array dari segmen URL setelah '/api/'
  // Contoh: jika URL adalah /api/download-reel, params.path akan menjadi ['download-reel']
  const subPath = params.path.join('/');

  // Membuat URL tujuan ke backend asli Anda
  const targetUrl = `${ACTUAL_BACKEND_URL}/${subPath}`;

  // Menyalin query parameters dari permintaan asli ke URL target
  const originalUrl = new URL(request.url);
  const targetUrlWithQuery = new URL(targetUrl);
  originalUrl.searchParams.forEach((value, key) => {
    targetUrlWithQuery.searchParams.append(key, value);
  });
  
  // Membuat permintaan baru ke backend, menyalin method, headers, dan body
  const backendRequest = new Request(targetUrlWithQuery.toString(), {
    method: request.method,
    headers: request.headers, // Salin semua header
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
    redirect: 'follow' // Ikuti redirect dari backend jika ada
  });

  try {
    const response = await fetch(backendRequest);
    // Mengembalikan respons dari backend ke klien
    // Kita membuat Response baru untuk memastikan headers termodifikasi (jika ada) juga diteruskan.
    return new Response(response.body, response);
  } catch (error) {
    console.error(`Error fetching from backend: ${targetUrlWithQuery.toString()}`, error);
    return new Response(`Error proxying to backend: ${error.message}`, { status: 502 }); // Bad Gateway
  }
}
