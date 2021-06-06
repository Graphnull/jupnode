const inspector = require('inspector');
const fs = require('fs');

let session = new inspector.Session();
session.connect();


let profilerEnabled = false;
let profileFileName = null;
module.exports.profiler = (fileName)=>new Promise((resolve, reject)=>{
    profileFileName = fileName;
    profilerEnabled = true;
    session.post('Profiler.enable', () => {
        session.post('Profiler.start', resolve)
    })
})

module.exports.stopProfiler = ()=>new Promise((resolve, reject)=>{
    if(profilerEnabled){
        session.post('Profiler.stop', (err, { profile }) => {
            if (err) {
                reject(err)
            }else{
                let fileName = profileFileName||('./profile.'+(new Date().toISOString())+'.cpuprofile')
              
                fs.promises.writeFile(fileName, JSON.stringify(profile))
              .then(()=>{
                profilerEnabled=false;
                profileFileName=null;
                resolve(fileName);
            })
              .catch(reject);
            }
            
          });
    }else{
        resolve();
    }
})



