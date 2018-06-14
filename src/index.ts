import Main from './Main';

$(document).ready(async () => {
  try {
    await new Main().initializeSdkAsync();
  } catch (err) {
    console.log(err);
  }
});
