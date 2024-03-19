import { beforeEach, expect } from '@jest/globals';
import type { Snap } from '@metamask/snaps-jest';
import { installSnap } from '@metamask/snaps-jest';

import { generateWatchFormComponent } from './components';

let snap: Snap;

describe('Watch-only snap interactive UI', () => {
  beforeEach(async () => {
    snap = await installSnap();
  });

  describe('onRpcRequest', () => {
    it('throws an error if the requested method does not exist', async () => {
      const unsupportedMethod = 'foo';
      const response = await snap.request({
        method: unsupportedMethod,
      });

      expect(response).toRespondWithError({
        code: -32603,
        message: `Origin 'https://metamask.io' is not allowed to call '${unsupportedMethod}'`,
        stack: expect.any(String),
      });
    });
  });

  describe('onHomePage', () => {
    it('returns custom UI with the watch account form', async () => {
      const ui = await snap.onHomePage();
      const watchForm = generateWatchFormComponent();

      expect(ui).toRender(watchForm);
    });
  });
});
