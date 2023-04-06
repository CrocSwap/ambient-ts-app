/* eslint-env node */
module.exports = {
    module: {
        rules: [
            // Place this *before* the `ts-loader`.
            {
                test: /\.worker\.ts$/,
                loader: 'worker-loader',
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
