import { beforeEach, expect } from '@jest/globals';
import type {
  Snap,
  SnapHandlerInterface,
  SnapResponseWithInterface,
} from '@metamask/snaps-jest';
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
      const startScreen = response.getInterface();

      const watchForm = generateWatchFormComponent();
      expect(startScreen).toRender(watchForm);
    });

    describe('onUserInput', () => {
      let response: SnapResponseWithInterface;
      let formScreen: SnapHandlerInterface;

      beforeEach(async () => {
        response = await snap.onHomePage();
        formScreen = response.getInterface();
      });

      it('shows an error submitting form if input is empty', async () => {
        await formScreen.clickElement(WatchFormNames.SubmitButton);

        const expectedErrorMessage = generateErrorMessageComponent(
          'Address or ENS is required',
        );
        const resultScreen = response.getInterface();
        expect(resultScreen).toRender(expectedErrorMessage);
      });

      it('submits form with a valid address', async () => {
        await formScreen.typeInField(
          WatchFormNames.AddressInput,
          TEST_VALUES.validAddress,
        );
        await formScreen.clickElement(WatchFormNames.SubmitButton);

        const expectedSuccessMessage = generateSuccessMessageComponent(
          TEST_VALUES.validAddress,
          'Valid address',
          true,
        );
        const resultScreen = response.getInterface();

        console.log(JSON.stringify(resultScreen.content, null, 2));

        expect(resultScreen).toRender(expectedSuccessMessage);
      });
    });
  });
});
