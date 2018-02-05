const router = require('huawei-router-api');

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
