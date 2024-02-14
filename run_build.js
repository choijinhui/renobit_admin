'use strict';

process.env.NODE_ENV = 'production';

const webpack = require('webpack');

const path = require('path');
const rm = require('rimraf');
const ora = require('ora');
const chalk = require('chalk');

const spinner = ora('building for production...');
spinner.start();spinner

let admin_path = path.resolve(__dirname, './bundle');
rm(admin_path, err => {
    webpack(require('./build/webpack.config.js'), (err, stats) => {
        if (err) throw err;
        spinner.stop();
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
            chunks: false,
            chunkModules: false
        }) + '\n\n');

        if (stats.hasErrors()) {
            console.log('Build Failed With Errors! \n');
            process.exit(1);
        }

        console.log(chalk.cyan('  Build complete.\n'));
        console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
            '  Opening index.html over file:// won\'t work.\n'
        ));
        process.exit(0);
    });
});
