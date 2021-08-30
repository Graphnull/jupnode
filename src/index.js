if(process.env.__DEBUGJUPNODE === 'true'){
  global.__DEBUGJUPNODE = true
}
const vm = require('vm');
const stream = require('stream');
const transformCode = require('./transform')
let inspect = require('./inspect')


let instream = process.stdin
let outstream = process.stdout

var inReplStream = new stream.Transform();
inReplStream._transform = async function (chunk, encoding, done) {
  try {
    let cell = chunk.toString();
    let transformedCode;
    try {
      transformedCode = transformCode(cell)
      let result = await vm.runInThisContext(transformedCode);
      if (result !== undefined) { console.log(result) }
      await inspect.stopProfiler();
    } catch (e) {
      inspect.stopProfiler();
      switch (e.name) {
        case ('ReferenceError'):
        case ('Error'): {
          // Improve error output
          let stack = e.stack.split('\n').filter(v => v.trim().slice(0, 3) === 'at ');

          newstack = stack.map(v => {
            if (v.indexOf('<anonymous>:') > -1) {

              let pos = v.slice(v.indexOf('<anonymous>:') + '<anonymous>:'.length).split(':').map(v => parseInt(v))
              let searchStr = 'evalmachine.<anonymous>:'
              let index = v.indexOf(searchStr);
              let lines = (transformedCode || cell).split('\n');

              if (lines[pos[0] - 1]&&lines[pos[0] - 1].slice(0, 4) === '})()') {
                return '';
              }
              return v.slice(0, index) + lines[pos[0] - 1] + v.slice(index + searchStr.length + v.slice(index + searchStr.length).indexOf(':'));
            } else {
              return v;
            }
          }).join('\n')
          let message = e.name + ': ' + e.message;

          console.log(message, '\n', newstack)
          break;
        }
        default: {
          console.log(e)
        }
      }
    }

    const obj = { __pyparse: true, type: 'done' };
    outstream.write('\n' + JSON.stringify(obj) + '\n');

    done();
  } catch (err) {

    console.log(err);
    done();
  }
};

instream.pipe(inReplStream);

// display html in Notebook cell
const html = function (data) {
  const obj = { __pyparse: true, type: 'html', data: data };
  outstream.write(JSON.stringify(obj) + '\n');
};

// display image in Notebook cell
const image = function (data) {
  const obj = { __pyparse: true, type: 'image', data: data };
  outstream.write(JSON.stringify(obj) + '\n');
};
// add print/display/execute functions
var resetContext = function () {
  global.require = (path)=>require(require.resolve(path,{paths:[process.cwd()]}));
  global.html = html;
  global.image = image;
  global.sh = (command) => {
    let child_process = require('child_process')
    let args = (Array.isArray(command) ? command[0] : command).split(' ');
    return child_process.spawnSync(args[0], args.slice(1), { stdio: "inherit" })
  }

  global.shAsync = function run_script(command) {
    return new Promise((res, rej) => {
      try {
        let args = (Array.isArray(command) ? command[0] : command).split(' ')
        let child_process = require('child_process')
        var child = child_process.spawn(args[0], args.slice(1), {

        });
        child.on('error', rej);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
          data = data.toString();
          console.log(data);
        });

        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
          console.log(data);
        });

        child.on('close', (code) => {
          //Here you can get the exit code of the script  
          switch (code) {
            case 0:
              res();
              break;
            default: {
              rej(new Error('Exit with status code: ' + code))
            }
          }

        });
      } catch (err) {
        rej(err)
      }

    })
  };
  global.profiler = inspect.profiler;
  global.stopProfiler = inspect.stopProfiler;

  lastGlobal = {};
};

resetContext();


