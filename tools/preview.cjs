const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
http.createServer((req,res)=>{
  let file;
  try { file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); }
  catch { res.writeHead(400);res.end();return; }
  if(file===root)file=path.join(root,'index.html');
  if(!file.startsWith(root+path.sep)||!['.html','.jpg','.png','.webp'].includes(path.extname(file))){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[path.extname(file)],'Cache-Control':'no-store'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
