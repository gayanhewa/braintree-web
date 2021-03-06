'use strict';
/** @module braintree-web/ideal */

var BraintreeError = require('../lib/braintree-error');
var browserDetection = require('@braintree/browser-detection');
var Ideal = require('./external/ideal');
var VERSION = process.env.npm_package_version;
var errors = require('./shared/errors');
var sharedErrors = require('../lib/errors');
var analytics = require('../lib/analytics');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} [callback] The second argument, `data`, is the {@link Ideal} instance. If no callback is passed in, the create function returns a promise that resolves the {@link Ideal} instance.
 * @example
 * braintree.ideal.create({
 *   client: clientInstance
 * }, function (createErr, idealInstance) {
 *   if (createErr) {
 *     if (createErr.code === 'IDEAL_BROWSER_NOT_SUPPORTED') {
 *       console.error('This browser is not supported.');
 *     } else {
 *       console.error('Error!', createErr);
 *     }
 *     return;
 *   }
 * });
 * @returns {Promise|void} Resolves with the iDEAL Payment instance.
 */
function create(options) {
  var idealInstance, clientVersion, configuration;

  if (options.client == null) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.client is required when instantiating iDEAL.'
    }));
  }

  clientVersion = options.client.getVersion();
  if (clientVersion !== VERSION) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INCOMPATIBLE_VERSIONS.type,
      code: sharedErrors.INCOMPATIBLE_VERSIONS.code,
      message: 'Client (version ' + clientVersion + ') and iDEAL (version ' + VERSION + ') components must be from the same SDK version.'
    }));
  }

  if (!browserDetection.supportsPopups()) {
    return Promise.reject(new BraintreeError(errors.IDEAL_BROWSER_NOT_SUPPORTED));
  }

  configuration = options.client.getConfiguration().gatewayConfiguration;
  if (!configuration.braintreeApi) {
    return Promise.reject(new BraintreeError(sharedErrors.BRAINTREE_API_ACCESS_RESTRICTED));
  } else if (!configuration.ideal) {
    return Promise.reject(new BraintreeError(errors.IDEAL_NOT_ENABLED));
  }

  analytics.sendEvent(options.client, 'ideal.initialization');
  idealInstance = new Ideal(options);

  return idealInstance._initialize();
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};
