const { parse } = require("@babel/parser");
const generate = require('@babel/generator').default;

var fs = require('fs');
var log = null;
if (global.__DEBUGJUPNODE) {
    log = fs.createWriteStream('./transform.log')
}

module.exports = (code) => {


    const ast = parse(code, { errorRecovery: false, allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });


    let body = ast.program.body;
    if (global.__DEBUGJUPNODE) {
        log.write(JSON.stringify(body, null, ' '))
    }
    //set all var variables in top level as global variables
    body.forEach(expr => {
        if (expr.type === 'VariableDeclaration') {
            expr.kind = ''
        }
    })
    // print last variable or expression
    if (
        body[body.length - 1].type === 'ExpressionStatement'
    ) {
        let expr = body[body.length - 1].expression;
        body[body.length - 1] = {
            type: "ReturnStatement",
            start: expr.start,
            end: expr.end,
            "argument": expr
        }
    }
    let funcAndClassDeclarations = [];
    let asyncExpressions = []
    body.forEach(astBranch => {
        ast.program.body = [astBranch]
        let generated = generate(ast, {});
        if (
            astBranch.type === 'FunctionDeclaration' ||
            astBranch.type === 'ClassDeclaration'
        ) {
            funcAndClassDeclarations.push(generated.code)
        } else {
            asyncExpressions.push(generated.code)
        }
    })

    let outProgram = ''
    outProgram += funcAndClassDeclarations.join('\n')
    outProgram += '(async()=>{\n' + asyncExpressions.join('\n') + '\n})();'

    if (global.__DEBUGJUPNODE) {
        log.write(outProgram)
    }
    
    return outProgram;
}



