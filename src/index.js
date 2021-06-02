const vm = require('vm');
const stream = require('stream');
const Buffer = require('buffer').Buffer;
const repl = require('repl');
const crypto = require('crypto');
const transformCode = require('./transform')

const magicNumber = crypto.randomBytes(128).toString('hex');
const magicNumberCommandBytes = Buffer.from(`\n\nconsole.log( '${magicNumber}' );\r\n`, 'utf8');


const startRepl = function (instream, outstream) {

  // custom writer function that outputs nothing
  const writer = function () {
    return '';
  };

  var outReplStream = new stream.Transform();
  outReplStream._transform = function (chunk, encoding, done) {
    this.push(chunk);
    done();
  };

  var inReplStream = new stream.Transform();
  inReplStream._transform = function (chunk, encoding, done) {
    if (typeof recoveryCMD !== 'undefined') {
      recoveryCMD = '';
      inRecovery = false;
    }
    chunk = Buffer.concat([chunk, magicNumberCommandBytes]);
    this.push(chunk);
    done();
  };

  var inRecovery = false;
  var recoveryCMD = '';
  async function replEval(cmd, context, filename, callback) {
    if (cmd.includes(magicNumber.toString('utf-8'))) {
      let transformedCode;
      try {
        transformedCode = transformCode(recoveryCMD)
        let result = await vm.runInThisContext(transformedCode);
        if(result!==undefined){console.log(result)}
      } catch (e) {
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
                let lines = (transformedCode||recoveryCMD).split('\n');

                if (lines[pos[0] - 1].slice(0, 4) === '})()') {
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
      recoveryCMD = '';
      inRecovery = false;

      const obj = { __pyparse: true, type: 'done' };
      outstream.write('\n' + JSON.stringify(obj) + '\n');
      callback(null, undefined);

    } else {
      recoveryCMD += cmd;
      callback(null, undefined);
    };
  };

  const r = repl.start({
    input: inReplStream,
    output: outReplStream,
    prompt: '',
    eval: replEval,
    writer: writer,
    useGlobal:true,
  });

  var outTripStream = new stream.Transform();
  outTripStream._transform = function (chunk, encoding, done) {
    this.push(chunk);
    done();
    return;
  };

  instream.pipe(inReplStream);
  outReplStream.pipe(outTripStream).pipe(outstream);


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

  // add silverlining library and print/display
  var resetContext = function () {
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
    lastGlobal = {};
  };

  // add print/disply/store back in on reset
  r.on('reset', resetContext);

  // reset the context
  resetContext();

  return r;
};

startRepl(process.stdin, process.stdout);
console.log("Jupnode started. Cells will run on node.js. Use %%py for use python in cell.");
