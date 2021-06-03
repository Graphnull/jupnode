const { parse } = require("@babel/parser");
const generate = require('@babel/generator').default;

module.exports = (code) => {


    const ast = parse(code, { errorRecovery: false, allowAwaitOutsideFunction: true, allowReturnOutsideFunction:true});


    let body = ast.program.body
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
    let generated = generate(ast, {});
    return '(async()=>{\n' + generated.code + '\n})();';
}



