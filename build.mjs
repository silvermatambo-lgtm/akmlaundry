
import { readdir, readFile, copyFile, mkdir, rm, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const root = process.cwd();
const out = path.join(root,'dist');
const outImg = path.join(out,'images');
await rm(out,{recursive:true,force:true});
await mkdir(outImg,{recursive:true});
const rootFiles = (await readdir(root)).filter(n => /\.(html|css|js|svg|webmanifest|xml|txt)$/.test(n) && !n.startsWith('build.'));
for (const file of rootFiles) await copyFile(path.join(root,file),path.join(out,file));

for(const script of ['app.js','photos.js','sw.js']){
 const p=spawnSync(process.execPath,['--check',path.join(root,script)],{encoding:'utf8'});
 if(p.status!==0) throw new Error('Syntax check failed: '+script+'\n'+p.stderr);
}
const chunks=[];
for(let i=0;i<8;i++) chunks.push((await readFile(path.join(root,'raw-images','carpet.part'+i+'.b64'),'utf8')).trim());
const carpetBuffer=Buffer.from(chunks.join(''),'base64');
if(carpetBuffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Carpet image is not a valid PNG');
const originals=[
['hero',path.join(root,'raw-images','hero.png')],
['laundry',path.join(root,'raw-images','laundry.png')],
['carpet',carpetBuffer],
['products',path.join(root,'raw-images','products.png')],
['equipment',path.join(root,'raw-images','equipment.png')],
['room',path.join(root,'raw-images','room.png')]
];
for(const [name,input] of originals){
 const target=path.join(outImg,name+'.webp');
 await sharp(input).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:88,effort:5}).toFile(target);
 const bytes=(await stat(target)).size;
 if(bytes<8000)throw Error('Unexpectedly tiny optimized media: '+name);
 console.log('Media ready:',name,Math.round(bytes/1024)+' KB');
}
console.log('AKM UltraMax HD site built at dist');
