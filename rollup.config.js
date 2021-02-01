import path from 'path';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';
import sourcemaps from 'rollup-plugin-sourcemaps';

function resolve(dir) {
  return path.join(__dirname, dir);
}

const formats = ['cjs', 'es'];

const babelPlugins = [
  'syntax-object-rest-spread',
  'transform-object-rest-spread'
];

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
          ...babelPlugins
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
          ...babelPlugins,
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
  'babel-runtime/helpers/typeof',
]);

function getConfig() {
  const config = {
    input: 'src/index.ts',
    plugins: [sourcemaps()],
    external,
  };

  const option = builds[process.env.TARGET.split('-')[1]];

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
    if (process.env.TARGET.includes('dev')) {
      output.sourcemap = true;
    }
    config.output.push(output);
  }
  return config;
}

export default getConfig();
