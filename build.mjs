
import { readdir, copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd(),out=path.join(root,'dist'),outImg=path.join(out,'images');
await rm(out,{recursive:true,force:true});
await mkdir(outImg,{recursive:true});
const files=(await readdir(root)).filter(n=>/\.(html|css|js|svg|webmanifest|xml|txt)$/.test(n)&&!n.startsWith('build.'));
for(const file of files)await copyFile(path.join(root,file),path.join(out,file));
for(const script of ['app.js','photos.js','sw.js']){
 const check=spawnSync(process.execPath,['--check',path.join(root,script)],{encoding:'utf8'});
 if(check.status!==0)throw Error(script+' failed syntax check: '+check.stderr);
}
for(const name of ["hero","laundry","carpet","products","equipment","room"]){
 const filename='akm-'+name+'-hd.webp';
 const source=path.join(root,'images',filename);
 const size=(await stat(source)).size;
 if(size<50000)throw Error('Image unexpectedly small: '+filename);
 await copyFile(source,path.join(outImg,filename));
 console.log('HD asset:',filename,Math.round(size/1024)+' KB');
}
console.log('AKM HD website build ready');
