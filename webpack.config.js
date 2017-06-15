var path = require('path');

module.exports = {
  entry: {
    "angularjs" : "./build/angularjs/module.js",
    "react" : "./build/react/LineChart.js"
  },
  output: {
    path: __dirname  + "/build/build",
    filename: "LineChart-[name].js",
    chunkFilename: "[name].js",
    library: 'n3',
    libraryTarget: "umd"
  },
  target: 'web',
  resolveLoader: {
    modules: [__dirname + "/node_modules"]
  },
  resolve: {
    extensions: ['.js'],
  },
}
