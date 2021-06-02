const { parse } = require("@babel/parser");
const generate = require('@babel/generator').default;

module.exports = (code) => {


    const ast = parse(code, { errorRecovery: true, allowAwaitOutsideFunction: true });

    let body = ast.program.body
    //set all var variables in top level as global variables
    body.forEach(expr => {
        if (expr.type === 'VariableDeclaration' && expr.kind === 'var') {
            expr.kind = ''
        }
    })
    // print last variable or expression
    if (
        body[body.length - 1].type === 'ExpressionStatement'
    ) {
        body[body.length - 1] = {
            type: "ReturnStatement",
            start: 0,
            end: 0,
            loc: {
                start: {
                    line: 0,
                    column: 0
                },
                end: {
                    line: 0,
                    column: 0
                }
            },
            "argument": body[body.length - 1]
        }
    }
    let generated = generate(ast, code);
    return '(async()=>{\n' + generated.code + '\n})();';
}



