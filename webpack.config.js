const path = require('path');

module.exports = {
    entry: './bundle.js',
    output: {
        filename: 'render-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "child_process": false,
            "tmp": false,
            "tmp-promise": false,
            "util": false
        }
    }
};
