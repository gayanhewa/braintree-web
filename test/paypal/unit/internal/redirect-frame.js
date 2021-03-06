'use strict';

var redirectFrame = require('../../../../src/paypal/internal/redirect-frame');
var querystring = require('../../../../src/lib/querystring');
var frameService = require('../../../../src/lib/frame-service/internal');

describe('redirect-frame', function () {
  describe('start', function () {
    beforeEach(function () {
      this.params = {};
      this.sandbox.stub(frameService, 'report');
      this.sandbox.stub(querystring, 'parse').returns(this.params);
    });

    it('reports to frame service the params from the querystring', function () {
      redirectFrame.start();
      expect(frameService.report).to.be.calledWith(null, this.params);
    });
  });
});
