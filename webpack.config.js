const path = require('path');

// pack babel libs from using in python lib
module.exports = [{
    mode: 'production',
    entry: './node_modules/@babel/parser/lib/index.js',
    target: 'node',
    output: {
        library:{type:'commonjs'},
        filename: '@babel_parser.js',
        path: path.resolve(__dirname, 'src'),
    },
},{
    mode: 'production',
    entry: './node_modules/@babel/generator/lib/index.js',
    target: 'node',
    output: {
        library:{type:'commonjs'},
        filename: '@babel_generator.js',
        path: path.resolve(__dirname, 'src'),
    },
}
];