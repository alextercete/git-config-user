/* jshint expr:true */

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Configurator = require('../lib/configurator');
const GitConfig = require('../lib/git-config');

const fs = require('fs-extra');
const path = require('path');

describe.skip('Configuration', () => {
  let configurator, globalConfig, userConfig;

  beforeEach(() => {
    ensureEmptyDirectory('fixtures');

    globalConfig = configFromFile('fixtures/.gitconfig');
    userConfig = configFromFile('fixtures/.gitconfig-user');
    configurator = new Configurator(globalConfig, userConfig);
  });

  it('should remove the user section from the global config', () => {
    return setGlobalUser({
        name: 'Wile E. Coyote',
        email: 'coyote@gmail.com'
      })
      .then(configurator.configure)
      .then(() => globalConfig.getNamesMatching(/user\./))
      .then(lines => {
        expect(lines).to.be.empty;
      });
  });

  it('should include the user config from the global config', () => {
    return setGlobalUser({
        name: 'Wile E. Coyote',
        email: 'coyote@gmail.com'
      })
      .then(configurator.configure)
      .then(() => globalConfig.getValueMatching('include.path', /\.gitconfig-user$/))
      .then(lines => {
        expect(lines).to.have.lengthOf(1);
      });
  });

  it('should add the user section to the user config', () => {
    return setGlobalUser({
        name: 'Wile E. Coyote',
        email: 'coyote@gmail.com'
      })
      .then(configurator.configure)
      .then(() => Promise.all([
        userConfig.get('user.name'),
        userConfig.get('user.email')
      ]))
      .then(([userName, userEmail]) => {
        expect(userName).to.deep.equal(['Wile E. Coyote']);
        expect(userEmail).to.deep.equal(['coyote@gmail.com']);
      });
  });

  function setGlobalUser(config) {
    const promises = [];

    Object.keys(config).forEach(key => {
      promises.push(globalConfig.set('user.' + key, config[key]));
    });

    return Promise.all(promises);
  }

  function configFromFile(file) {
    return GitConfig.fromFile(pathTo(file));
  }

  function ensureEmptyDirectory(directory) {
    fs.emptyDirSync(pathTo(directory));
  }

  function pathTo(file) {
    return path.join(__dirname, file);
  }
});
