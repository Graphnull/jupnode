let child_process = require('child_process')

let node = child_process.spawn('node', ['./src/index.js'], { cwd: './' })

let list = [
    { input: 'let t = 23; t;', output: 'Jupnode started. Cells will run on node.js. Use %%py for use python in cell.\n23' },
    { input: 'var r = 32;', output: '' },
    { input: 'r;', output: '32' },
    { input: `let fs = require('fs');
    let files = await fs.promises.readdir('./');
    files.length>0
    `, output: 'true' },
    { input: `var global89=0;
    let changeFunc=()=>{
        global89= 89
    }
    changeFunc();
    `, output: '' },
    { input: `global89    `, output: '89' },
    { input: `console.log(global89)`, output: '89' },
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
            console.error(list[iter].output + '!==' + result+':'+list[iter].input);
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

node.stdin.write(list[0].input)