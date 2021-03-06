let child_process = require('child_process')
process.env.__DEBUGJUPNODE='true';

let node = child_process.spawn('node', ['../src/index.js'], { cwd: './' })

child_process.execSync('npm i @tensorflow/tfjs --no-save')


let list = [
    { input: 'let t = 23; t;', output: '23' },
    { input: 'var r = 32;', output: '' },
    { input: 'r;', output: '32' },
    { input: '(()=>56)()', output: '56' },
    {
        input: `let fs = require('fs');
    let files = await fs.promises.readdir('./');
    files.length>0
    `, output: 'true'
    },
    {
        input: `var global89=0;
    let changeFunc=()=>{
        global89= 89
    }
    changeFunc();
    `, output: ''
    },
    { input: `global89    `, output: '89' },
    { input: `console.log(global89)`, output: '89' },
    {
        input: `for(var _i1 = 0; _i1 < 5; _i1++) {}
    //Переменная _i1 доступна за пределами цикла
    console.log(_i1);`, output: '5'
    },
    {
        input: `try{for(let _i2 = 0; _i2 < 5; _i2++) {}
    console.log(_i2);}catch(err){
        return err.message
    }`, output: '_i2 is not defined'
    },
    { input: `html('<div>123</div>')`, output: '{"__pyparse":true,"type":"html","data":"<div>123</div>"}' },
    {
        input: `
    tf = require('@tensorflow/tfjs')
    let o = new Float32Array([1,2,3,4])
    let t = tf.tensor(o,[2,2],'float32')
    t.dataSync()[0]
    `, output: '1'
    },

    {
        input: `
 
    let str = 'a_b_c_d';
    let out1 = str.split('_')
        .slice(1)[0];
    out1
    `, output: 'b'
    },
    { input: `let t = 5;function func(){console.log('!!'+5)};func()`, output: '!!5' },
    { input: `func()`, output: '!!5' },
    { input: `let balance=777;class Money{ print(){console.log(balance+"$")}};let money = new Money();money.print()`, output: '777$' },
    { input: `money.print()`, output: '777$' },
    { input: `console.log(Money)`, output: '[class Money]' },

    // test all global variables
    { input: `var a = 1;`, output: '' },
    { input: `console.log(a);`, output: '1' },
    { input: `let a = 1;`, output: '' },
    { input: `console.log(a);`, output: '1' },
    { input: `const a = 1;`, output: '' },
    { input: `console.log(a);`, output: '1' },
    { input: `async function asyncfunc(){console.log(53)}`, output: '' },
    { input: `await asyncfunc()`, output: '53' },
    { input: `await profiler('./profile.log');
    fs.writeFileSync('./test.log',new Buffer(1024*1024*10));
    await stopProfiler();
    fs.unlinkSync('./test.log');
    console.log(fs.existsSync('./profile.log'));
    fs.unlinkSync('profile.log');
    console.log(fs.existsSync('./profile.log'));
    `, output: 'true\nfalse' },


]

let iter = 0;
let acc = '';
let cellNumber = 0;
node.stdout.on('data', (data) => {
    let str = data.toString();

    acc = acc + str
    let filtered = acc.split('\n').filter(v => v)
    if (filtered[filtered.length - 1] === '{"__pyparse":true,"type":"done"}') {
        filtered.pop()
        let result = filtered.join('\n');

        if (list[iter].output !== result) {
            console.error(list[iter].output + '!==' + result + ':' + list[iter].input);
            process.exit(1);
        } else {
            iter++;
            cellNumber = 0;
            acc = '';
            console.log(`test ${iter} cell complete`)
            if (list[iter]) {
                if (Array.isArray(list[iter].output)) {
                    node.stdin.write(list[iter].input[cellNumber])
                } else {
                    node.stdin.write(list[iter].input)
                }
            } else {
                console.log('tests complete!')
                process.exit(0)
            }
        }


    }
})

let errorMessage = ''
node.stderr.on('data', (data) => {
    errorMessage += String(data);
})
node.on('close', (code) => {
    console.log(`child process exited with code ${code}: ${errorMessage}`);
});

node.stdin.write(list[0].input)

setTimeout(() => {
    throw new Error('timeout error!')
}, 1000)