import path from 'path';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

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

const external = Object.keys(pkg.dependencies);
external.push(...[
  'url',
  'babel-runtime/regenerator',
  'babel-runtime/helpers/asyncToGenerator',
  'babel-runtime/helpers/classCallCheck',
  'babel-runtime/helpers/createClass',
  'babel-runtime/helpers/possibleConstructorReturn',
  'babel-runtime/helpers/inherits',
]);

function getConfig() {
  const config = {
    input: 'src/index.js',
    plugins: [],
    external,
  };

  const option = builds[process.env.TARGET];

  const isBrowser = process.env.TARGET.includes('web');
  const buildType = isBrowser ? 'browser' : 'node';

  config.plugins = config.plugins.concat(option.plugins);
  config.plugins.push(alias({
    '@': resolve('src'),
    '$env': resolve(`src/${buildType}`),
  }));

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
