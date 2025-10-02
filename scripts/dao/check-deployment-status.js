require('dotenv').config();
const ethers = require('ethers');

async function check() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);

  const contracts = [
    { name: 'C12DAO Token', addr: '0x26F3d3c2C759acE462882864aa692FBa4512e38B', tx: '0x55c62917ec601b0ae09b296c4a3cc567678a323f8a72b94686c1bb2cfc441911' },
    { name: 'Timelock', addr: '0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66', tx: '0x347624fc7b8c326643461d57f3f62c64c63893489b92c32acf313fd4af707d59' },
    { name: 'Governor', addr: '0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a', tx: '0x33f8a40fb1b4e5e7c37ec5750e1387c6c493c8a1f08f742e5e8dcf24d447b601' },
    { name: 'Treasury', addr: '0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83', tx: '0x72d428287738fd8eac11ab3a208861443f10ed51278a935e1daabbdbe97a4e6f' },
    { name: 'Staking', addr: '0x26F5470B289dE63a3B1b726cE3DCe2EaEB3471ee', tx: '0x4e1ed844ebb8db0b86a2a590f484088461827c3c2835133867b106958a4e4f82' }
  ];

  console.log('🔍 Checking DAO Contract Deployments on Polygon Mainnet...\n');
  console.log('='.repeat(70) + '\n');

  for (const c of contracts) {
    try {
      const code = await provider.getCode(c.addr);
      const hasCode = code !== '0x';
      const receipt = await provider.getTransactionReceipt(c.tx);

      let status = '⏳ Pending';
      let confirmations = 0;

      if (receipt) {
        if (receipt.status === 1) {
          const currentBlock = await provider.getBlockNumber();
          confirmations = currentBlock - receipt.blockNumber;
          status = '✅ Confirmed';
        } else {
          status = '❌ Failed';
        }
      }

      console.log(c.name.padEnd(15), status);
      console.log('  Address:', c.addr);
      console.log('  Bytecode:', hasCode ? '✅ Deployed' : '❌ Not deployed');
      if (receipt) {
        console.log('  Block:', receipt.blockNumber, '| Confirmations:', confirmations);
      }
      console.log('  TX:', c.tx.slice(0, 20) + '...');
      console.log();
    } catch (e) {
      console.log(c.name.padEnd(15), '❌ Error:', e.message.slice(0, 50));
      console.log();
    }
  }

  console.log('='.repeat(70));
}

check().catch(console.error);
