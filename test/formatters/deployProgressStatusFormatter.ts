/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { expect } from 'chai';
import { Logger } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { MetadataApiDeploy } from '@salesforce/source-deploy-retrieve';
import { getDeployResult } from '../commands/source/deployResponses';
import { DeployProgressStatusFormatter } from '../../src/formatters/deployProgressStatusFormatter';

describe('DeployProgressStatusFormatter', () => {
  const sandbox = sinon.createSandbox();
  const deployResultInProgress = getDeployResult('inProgress');
  const logger = Logger.childFromRoot('deployTestLogger').useMemoryLogging();
  let ux;
  let printStub: sinon.SinonStub;
  let mdApiDeploy: MetadataApiDeploy;

  beforeEach(() => {
    mdApiDeploy = new MetadataApiDeploy({ usernameOrConnection: 'test' });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore  stubbing private method
    printStub = sandbox.stub(DeployProgressStatusFormatter.prototype, 'printDeployStatus');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const fireUpdateEvent = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore eslint-disable-next-line
    mdApiDeploy.event.emit('update', deployResultInProgress.response); // eslint-disable-line
  };

  it('should output with every update when verbose', async () => {
    const formatter = new DeployProgressStatusFormatter(logger, ux as UX, { verbose: true });
    formatter.progress(mdApiDeploy);

    fireUpdateEvent();
    expect(printStub.calledOnce).to.equal(true);

    fireUpdateEvent();
    expect(printStub.calledTwice).to.equal(true);

    fireUpdateEvent();
    expect(printStub.calledThrice).to.equal(true);
  });

  it('should only output on update when results change without verbose', async () => {
    const formatter = new DeployProgressStatusFormatter(logger, ux as UX);
    formatter.progress(mdApiDeploy);

    fireUpdateEvent();
    expect(printStub.calledOnce).to.equal(true);

    fireUpdateEvent();
    expect(printStub.calledOnce).to.equal(true);

    // Now change the deploy results
    deployResultInProgress.response.numberComponentsDeployed++;

    fireUpdateEvent();
    expect(printStub.calledTwice).to.equal(true);
  });
});
