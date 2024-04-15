import { beforeEach, expect } from '@jest/globals';
import type { Snap } from '@metamask/snaps-jest';
import { installSnap } from '@metamask/snaps-jest';

import { generateWatchFormComponent } from './ui/components';

let snap: Snap;

describe('Watch-only snap interactive UI', () => {
  beforeEach(async () => {
    snap = await installSnap();
  });

  describe('onHomePage', () => {
    it('returns custom UI with the watch account form', async () => {
      const ui = await snap.onHomePage();
      const watchForm = generateWatchFormComponent();

      expect(ui).toRender(watchForm);
    });
  });
});
