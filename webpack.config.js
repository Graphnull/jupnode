const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    target: 'node',
    plugins: [
        new CopyPlugin({
          patterns: [
             {from:'src',filter:(path)=>path.match(/\.py$/)}
          ]
        })
    ],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'jupnode'),
    },
};