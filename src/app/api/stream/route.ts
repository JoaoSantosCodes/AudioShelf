import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('file_id');

  if (!fileId) {
    return new NextResponse('Missing file_id', { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new NextResponse('Bot token not configured', { status: 500 });
  }

  try {
    // 1. Get file path from Telegram
    const getFileUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
    const getFileRes = await fetch(getFileUrl);
    const getFileData = await getFileRes.json();

    if (!getFileData.ok) {
      return new NextResponse('Error fetching file info from Telegram: ' + getFileData.description, { status: 500 });
    }

    const filePath = getFileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // Detectar Content-Type pela extensão
    let contentType = 'audio/mpeg'; // Default
    if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
    else if (filePath.endsWith('.mkv')) contentType = 'video/x-matroska';
    else if (filePath.endsWith('.mov')) contentType = 'video/quicktime';
    else if (filePath.endsWith('.webm')) contentType = 'video/webm';
    else if (filePath.endsWith('.m4a')) contentType = 'audio/mp4';
    else if (filePath.endsWith('.wav')) contentType = 'audio/wav';
    else if (filePath.endsWith('.ogg')) contentType = 'audio/ogg';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.webp')) contentType = 'image/webp';

    // 2. Fetch the file content (forwarding Range headers for seeking support)
    const range = request.headers.get('Range');
    const fetchOptions: RequestInit = {
      method: 'GET',
    };

    if (range) {
      fetchOptions.headers = { 'Range': range };
    }

    const response = await fetch(downloadUrl, fetchOptions);

    // 3. Prepare headers for streaming
    const headers = new Headers();
    
    // Copy relevant headers from Telegram response
    const headersToCopy = [
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control'
    ];

    headersToCopy.forEach(h => {
      const val = response.headers.get(h);
      if (val) headers.set(h, val);
    });

    // Forçar o Content-Type detectado
    headers.set('Content-Type', contentType);
    
    // Ensure CORS is handled
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Stream error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
