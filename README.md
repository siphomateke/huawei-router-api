# Huawei Router API

An API for querying Huawei routers.

Created specifically for the Huawei B315s but should work with most Huawei routers.

## Usage

At the moment, there are two separate build files. One for usage in browsers, which uses XmlHttpRequest, URL etc, and one for Node.js. Dependencies are not bundled so if you want to use this in a browser, you will need to use a bundler such as [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/).

Ideally, this module should detect where it is being used, perhaps using environment variables such as process.browser defined by Webpack and Browserify.

```js
// Import browser version
import router from 'huawei-router-api/dist/browser.es.js';

// Configure router settings
router.config.setUrl('url');
router.config.setUsername('username');
router.config.setPassword('password');
```

## Example

```js
import router from 'huawei-router-api/dist/browser.es.js';

router.config.setUrl('http://192.168.1.1');
router.config.setUsername('username');
router.config.setPassword('password');

async function checkStatistics() {
  // Check if we are logged into the router already
  const loggedIn = await router.admin.isLoggedIn();
  if (!loggedIn) {
    // If we aren't, login
    await router.admin.login();
  }
  const stats = await router.monitoring.getTrafficStatistics();
  console.log(stats);
}

checkStatistics();
```

Example output
```json
{
  "CurrentConnectTime":"33733",
  "CurrentUpload":"45880058",
  "CurrentDownload":"391111647",
  "CurrentDownloadRate":"1382",
  "CurrentUploadRate":"4146",
  "TotalUpload":"42581515096",
  "TotalDownload":"242964654846",
  "TotalConnectTime":"35844890",
  "showtraffic":"1"
}
```

## Documentation

Coming soon...


## Building

```bash
npm run dev
npm run dev:web
npm run dev:node
```

```bash
npm run build
npm run build:web
npm run build:node
```

### Notes
The build files for browsers are `browser.*.js` and those for Node are `index.*.js` in the `dist/` directory.

Built files are in both the CommonJS and ES format and have `.cjs.` and `.es.` in their file names respectively.

