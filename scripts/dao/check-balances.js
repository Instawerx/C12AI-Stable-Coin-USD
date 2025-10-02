require('dotenv').config();
const ethers = require('ethers');

async function checkBalances() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
  const C12DAO = '0x26F3d3c2C759acE462882864aa692FBa4512e38B';
  const ADMIN = '0x7903c63CB9f42284d03BC2a124474760f9C1390b';
  const TREASURY = '0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83';

  const abi = [
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)'
  ];

  const contract = new ethers.Contract(C12DAO, abi, provider);

  console.log('🔍 C12DAO Token Status\n');
  console.log('Contract:', C12DAO);
  console.log('Network: Polygon Mainnet (137)\n');

  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const adminBalance = await contract.balanceOf(ADMIN);
    const treasuryBalance = await contract.balanceOf(TREASURY);

    console.log('Token Info:');
    console.log('  Name:', name);
    console.log('  Symbol:', symbol);
    console.log('  Total Supply:', ethers.utils.formatEther(totalSupply), symbol);
    console.log();

    console.log('Balances:');
    console.log('  Admin (' + ADMIN + ')');
    console.log('    Balance:', ethers.utils.formatEther(adminBalance), symbol);
    if (totalSupply.gt(0)) {
      console.log('    Percentage:', adminBalance.mul(10000).div(totalSupply).toNumber() / 100, '%');
    }
    console.log();

    console.log('  Treasury (' + TREASURY + ')');
    console.log('    Balance:', ethers.utils.formatEther(treasuryBalance), symbol);
    if (totalSupply.gt(0)) {
      console.log('    Percentage:', treasuryBalance.mul(10000).div(totalSupply).toNumber() / 100, '%');
    }
    console.log();

    const minted = adminBalance.add(treasuryBalance);
    const remaining = ethers.utils.parseEther('1000000000').sub(totalSupply);

    console.log('Supply Info:');
    console.log('  Minted:', ethers.utils.formatEther(minted), symbol, '(' + minted.mul(100).div(ethers.utils.parseEther('1000000000')).toString() + '%)');
    console.log('  Remaining:', ethers.utils.formatEther(remaining), symbol, '(' + remaining.mul(100).div(ethers.utils.parseEther('1000000000')).toString() + '%)');

    if (adminBalance.gte(ethers.utils.parseEther('100000000')) && treasuryBalance.gte(ethers.utils.parseEther('200000000'))) {
      console.log('\n✅ Minting complete!');
    } else if (totalSupply.eq(0)) {
      console.log('\n⏳ No tokens minted yet - transactions may still be pending');
    } else {
      console.log('\n⚠️  Partial minting - some transactions may still be pending');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBalances();
