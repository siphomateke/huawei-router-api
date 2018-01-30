import path from 'path';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';

function resolve(dir) {
  return path.join(__dirname, dir);
}

const formats = ['cjs', 'es'];

const builds = {
  'web': {
    outputFile: 'browser',
    plugins: [
      babel({
        babelrc: false,
        presets: [
          ['env', {
            targets: {
              browsers: ['last 2 versions', 'safari >= 7'],
            },
            modules: false,
          }],
        ],
        plugins: [
          'external-helpers',
          ['transform-runtime', {
            'polyfill': false,
            'regenerator': true,
          }],
        ],
        runtimeHelpers: true,
      }),
    ],
  },
  'node': {
    outputFile: 'index',
    plugins: [
      babel({
        babelrc: false,
        presets: [
          ['env', {
            targets: {node: '6.0.0'},
            modules: false,
          }],
        ],
        plugins: [
          'external-helpers',
        ],
      }),
    ],
  },
};

function getConfig() {
  const config = {
    input: 'src/index.js',
    plugins: [],
    external: [
      'es6-error',
      'jxon',
      'moment',
      'node-rsa',
      'sha.js',
    ],
  };

  const option = builds[process.env.TARGET];

  const isBrowser = process.env.TARGET.includes('web');
  config.plugins.push(replace({'process.browser': isBrowser}));
  config.plugins = config.plugins.concat(option.plugins);

  config.output = [];
  for (let format of formats) {
    const output = {};
    output.file = resolve(`dist/${option.outputFile}.${format}.js`);
    output.format = format;
    config.output.push(output);
  }
  return config;
}

export default getConfig();
