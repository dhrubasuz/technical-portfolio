// Author and maintainer: Dhruba Poudel
import {readdir, readFile, stat} from 'node:fs/promises';
import {resolve, dirname, join, extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path));else out.push(path);}return out;}
const files=await walk(root), html=files.filter(p=>extname(p)==='.html');
let links=0, images=0;
for(const file of html){
  const source=await readFile(file,'utf8');
  assert.match(source,/<!doctype html>/i,file);
  assert.match(source,/<html\s+lang="en(?:-AU)?"/i,file);
  assert.equal((source.match(/<h1(?:\s|>)/gi)||[]).length,1,`${file}: one H1`);
  for(const name of ['author','creator','last-modified-by'])assert.match(source,new RegExp(`<meta name="${name}" content="Dhruba Poudel">`),`${file}: ${name}`);
  const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${file}: unique IDs`);
  for(const m of source.matchAll(/<img\b[^>]*>/gi)){images++;assert.match(m[0],/\balt="[^"]+"/,`${file}: descriptive image alt`);}
  for(const m of source.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const raw=m[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:|tel:|data:)/i.test(raw))continue;
    assert.ok(!/^javascript:/i.test(raw),`${file}: script URL`);
    const url=new URL(raw,`https://portfolio.invalid/${file.slice(root.length+1).replaceAll('\\','/')}`);
    let target=join(root,decodeURIComponent(url.pathname));
    assert.ok(target.startsWith(root),`${file}: local path boundary`);
    const info=await stat(target).catch(()=>null);
    assert.ok(info,`${file}: missing local target ${raw}`);
    if(info.isDirectory())target=join(target,'index.html');
    assert.ok(await stat(target).catch(()=>null),`${file}: missing directory index ${raw}`);
    if(url.hash&&extname(target)==='.html'){
      const targetSource=target===file?source:await readFile(target,'utf8');
      assert.ok(targetSource.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${file}: missing fragment ${raw}`);
    }
    links++;
  }
}
for(const file of files.filter(p=>['.js','.mjs'].includes(extname(p)))){
  const source=await readFile(file,'utf8');
  for(const m of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g))assert.ok(await stat(resolve(dirname(file),m[1])).catch(()=>null),`${file}: missing module ${m[1]}`);
}
console.log(`Passed static publication checks: ${html.length} HTML pages, ${links} local references, ${images} images.`);
