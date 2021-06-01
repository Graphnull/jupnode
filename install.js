let child_process= require('child_process')
let list = child_process.execSync(`pip freeze`).toString().split('\n').filter(v=>{
    let parseLine = v.split('=')
    return parseLine[0]==='jupnode'||parseLine[parseLine.length-1]==='jupnode'
})

let result = child_process.execSync(`pip install --upgrade --force-reinstall -e `+__dirname)

//for debug
// console.log(list);
// console.log(result.toString())