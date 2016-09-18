module.exports = Configurator;

function Configurator(globalConfig, userConfig) {
  this.configure = configure;

  function configure() {
    return Promise.resolve();
  }
}
