import { beforeEach, expect } from '@jest/globals';
import type { Snap } from '@metamask/snaps-jest';
import { installSnap } from '@metamask/snaps-jest';

import {
  generateErrorMessageComponent,
  generateSuccessMessageComponent,
  generateWatchFormComponent,
  WatchFormNames,
} from './components';
import { TEST_VALUES } from '../test/setup';

let snap: Snap;

describe('Watch-only snap interactive UI', () => {
  beforeEach(async () => {
    snap = await installSnap();
  });

  describe('onHomePage', () => {
    it('returns custom UI with the watch account form', async () => {
      const response = await snap.onHomePage();
      const ui = response.getInterface();

      const watchForm = generateWatchFormComponent();
      expect(ui).toRender(watchForm);
    });

    it('shows an error if input is empty', async () => {
      const response = await snap.onHomePage();
      const ui = response.getInterface();

      await ui.clickElement(WatchFormNames.SubmitButton);

      const expectedErrorMessage = generateErrorMessageComponent(
        'Address or ENS is required',
      );
      const component = response.getInterface();
      expect(component).toRender(expectedErrorMessage);
    });

    it('submits the watch account form with a valid address', async () => {
      const response = await snap.onHomePage();
      const ui = response.getInterface();

      await ui.typeInField(
        WatchFormNames.AddressInput,
        TEST_VALUES.validAddress,
      );
      await ui.clickElement(WatchFormNames.SubmitButton);

      const expectedSuccessMessage = generateSuccessMessageComponent(
        TEST_VALUES.validAddress,
        'Valid address',
        true,
      );
      const component = response.getInterface();
      expect(component).toRender(expectedSuccessMessage);
    });
  });
});
