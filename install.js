let child_process= require('child_process')
// let params = require(__dirname+'/package.json')
let list = child_process.execSync(`pip freeze`).toString().split('\n').filter(v=>{
    let parseLine = v.split('=')
    return parseLine[0]==='jupnode'||parseLine[parseLine.length-1]==='jupnode'
})
console.log(require('fs').readdirSync('./dist/'))
let result = child_process.execSync(`pip install install ./dist/jupnode-0.0.0.tar.gz`)

//for debug
// console.log(list);
console.log(result.toString())


// console.log(child_process.execSync(`pip install git+https://github.com/graphnull/jupnode`).toString())