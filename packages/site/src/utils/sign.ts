export const getCurrentAccount = async () => {
  const accounts = (await window.ethereum.request({
    method: 'eth_accounts',
  })) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts available');
  }
  return accounts[0];
};

export const personalSign = async (message: string) => {
  const from = await getCurrentAccount();
  const encoder = new TextEncoder();
  const messageAsUint8Array = encoder.encode(message);
  const msgHex = `0x${Array.from(messageAsUint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`;

  return await window.ethereum.request({
    method: 'personal_sign',
    params: [msgHex, from, 'Example password'],
  });
};

export const signTypedDataV4 = async (contents: string) => {
  const from = await getCurrentAccount();
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const msgParams = {
    domain: {
      chainId: chainId ? chainId.toString() : '5',
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents,
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Group: [
        { name: 'name', type: 'string' },
        { name: 'members', type: 'Person[]' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    },
  };
  return await window.ethereum.request({
    method: 'eth_signTypedData_v4',
    params: [from, JSON.stringify(msgParams)],
  });
};
