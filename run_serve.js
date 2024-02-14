'use strict';

const dotenv = require('dotenv');
dotenv.config();

process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const express = require('express');
const http = require('http');
const proxy = require('express-http-proxy');
const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();
const webpackConfig = require('./build/webpack.config.js');
const compiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require("webpack-hot-middleware");

const chalk = require('chalk');
const ora = require('ora');
const log = console.log

let app = express();

log(chalk.cyan('serve 모드로 실행중입니다.\n'));

if (process.env.API_PROXY_PATH == null) {
  log(chalk.red('.env 파일의 작성을 확인해주세요. 아래와 같은 내용이 필요합니다.'));
  log(chalk.gray(`
  # 접속포트
  SERVE_PORT=4201
  # 경로
  PUBLIC_PATH=/renobit
  # API 서버 주소
  API_PROXY_PATH=http://localhost:6277
  # 핫리로딩 사용여부
  USE_HOT_RELOAD=true      
  `));
  process.exit();
}

const webpackInstance = webpackDevMiddleware(compiler, {
  hot: true,
  inline: true,
  historyApiFallback: true,
  stats: 'errors-only',
  publicPath: process.env.PUBLIC_PATH,
  overlay: true
})

app.use('/', webpackInstance);

if (process.env.USE_HOT_RELOAD == 'true') {
  app.use('/', webpackHotMiddleware(compiler));
}

app.use('/', proxy(process.env.API_PROXY_PATH));

const spinner = ora('웹팩이 준비중입니다. 보통 1분내에 완료됩니다..');

let server = http.createServer(app);
server.listen(process.env.SERVE_PORT, function () {
  log(chalk.yellow('서버 기동이 시작되었습니다. 포트는 ' + process.env.SERVE_PORT + '입니다.'));
  spinner.start();
}).on('error', function (err) {
  console.log(err.message);
});

server.on('upgrade', function (req, socket, head) {
  apiProxy.ws(req, socket, head, { target: process.env.API_PROXY_PATH });
});


webpackInstance.waitUntilValid(function () {
  spinner.stop();
  log(chalk.yellow(`
  ______    _______  __    _  _______  _______  ___   _______  _______ 
  |    _ |  |       ||  |  | ||       ||  _    ||   | |       ||       |
  |   | ||  |    ___||   |_| ||   _   || |_|   ||   | |_     _||____   |
  |   |_||_ |   |___ |       ||  | |  ||       ||   |   |   |   ____|  |
  |    __  ||    ___||  _    ||  |_|  ||  _   | |   |   |   |  | ______|
  |   |  | ||   |___ | | |   ||       || |_|   ||   |   |   |  | |_____ 
  |___|  |_||_______||_|  |__||_______||_______||___|   |___|  |_______|    
  `))
  log(chalk.green('개발서버 기동이 완료되었습니다!\n부디 작업이 잘 되셨으면 좋겠네요!'));
  log(chalk.gray('중단하시려면 Ctrl+C를 눌러주세요.'));
});