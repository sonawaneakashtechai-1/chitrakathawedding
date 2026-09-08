import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localVideoUploadPlugin(): Plugin {
  return {
    name: 'local-video-upload-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 1. POST upload endpoint
        if (req.method === 'POST' && req.url && req.url.startsWith('/api/local-video-upload')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const rawFileName = urlObj.searchParams.get('filename') || `video-${Date.now()}.mp4`;
            const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const uploadDir = path.resolve(__dirname, 'local_uploads/films');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            const targetPath = path.join(uploadDir, cleanFileName);
            const writeStream = fs.createWriteStream(targetPath);
            req.pipe(writeStream);
            writeStream.on('finish', () => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, url: `/uploads/films/${cleanFileName}` }));
            });
            writeStream.on('error', (err) => {
              console.error('Error writing video file:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            });
          } catch (e: any) {
            console.error('Upload middleware error:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e?.message }));
          }
          return;
        }

        // 2. GET video streaming endpoint with HTTP 206 Range support
        if (req.method === 'GET' && req.url && req.url.startsWith('/uploads/films/')) {
          try {
            const fileName = path.basename(req.url.split('?')[0]);
            let filePath = path.resolve(__dirname, 'local_uploads/films', fileName);
            if (!fs.existsSync(filePath)) {
              filePath = path.resolve(__dirname, 'public/uploads/films', fileName);
            }

            if (fs.existsSync(filePath)) {
              const stat = fs.statSync(filePath);
              const fileSize = stat.size;
              const range = req.headers.range;

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = end - start + 1;
                const file = fs.createReadStream(filePath, { start, end });
                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': chunksize,
                  'Content-Type': 'video/mp4',
                });
                file.pipe(res);
              } else {
                res.writeHead(200, {
                  'Content-Length': fileSize,
                  'Content-Type': 'video/mp4',
                  'Accept-Ranges': 'bytes',
                });
                fs.createReadStream(filePath).pipe(res);
              }
              return;
            }
          } catch (streamErr) {
            console.error('Video streaming error:', streamErr);
          }
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.vite_cache',
  plugins: [react(), localVideoUploadPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
