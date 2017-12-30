var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    entry: {
        app: [__dirname + '/../index.js']
    },
    devServer: {
        port: 7777,
        historyApiFallback: true,
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    },
    output: {
        path: __dirname + '/../../static/js',
        filename: '[name].js',
        publicPath: 'http://localhost:7777/',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react', 'stage-0'],
                },
                exclude: ['/node_modules'],
            }
            /*,
             {
             test: /\.css$/,
             loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
             }*/
        ],
    },
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled'    // static으로 설정할 경우 빌드가 완료되면 번들링 된 리소스 내용을 분석한 html 파일이 생성됨
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development', // development or production (요즘은 DefinePlugin보다 이렇게 하는 추세임.)
            BUILD_PHASE: 'local',
            LOCALE: 'kr' //process.argv.slice(n) 추후 빌드파라메터로 받아서 언어셋 만큼 빌드해야한다. app-kr.js app-en.js ....
        })
    ],
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.json', '.jsx', '.css'],
    },
};