let child_process= require('child_process')

child_process.execSync(`npm run test`)
child_process.execSync(`rm -rf jupnode.egg-info`)
let packages = []
let pkg = require('./package.json');
Object.entries(pkg.dependencies||{}).forEach(v=>{
    packages.push(v[0]+'@'+v[1])
})
Object.entries(pkg.devDependencies||{}).forEach(v=>{
    packages.push(v[0]+'@'+v[1])
})

console.log(`npm i ${packages.join(' ')}`);
child_process.execSync(`npm i ${packages.join(' ')}`)
child_process.execSync(`npm run webpack`)
child_process.execSync(`python3 setup.py sdist --dist-dir ./`)