const { ipcMain } = require('electron');
const { ethers } = require('ethers');
const { format, formatDistance } = require('date-fns');

let stop = false;

ipcMain.handle('start-transaction', async (event, { privateKey, contractAddress, rpcUrl, voteValue, delayMs }) => {
  stop = false;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const abi = ['function vote() external payable'];
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  let tx_count = 1;
  let last_tx_time = new Date();

  async function sendTransaction() {
    if (stop) return;

    try {
      const txResponse = await contract.vote({ value: ethers.parseEther(voteValue) });
      await txResponse.wait();

      const txHash = txResponse.hash;
      const walletAddress = wallet.address;
      const scanLink = `https://taikoscan.io/tx/${txHash}`;

      const current_time = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const elapsed_time = formatDistance(last_tx_time, new Date(), { includeSeconds: true });

      const log = 
      `---------------------------------------
      Transaction Number: ${tx_count}
      Current Time: ${current_time}
      Elapsed Time: ${elapsed_time}
      Wallet Address: ${walletAddress}
      Tx Link: ${scanLink}
      ---------------------------------------`;

      event.sender.send('transaction-log', log);

      tx_count++;
      last_tx_time = new Date();
    } catch (error) {
      event.sender.send('transaction-error', error.message);
      stop = true;
    }
  }

  while (!stop) {
    await sendTransaction();
    if (!stop) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
});

ipcMain.handle('stop-transaction', () => {
  stop = true;
});
