let transactionProcess = null;
let transactionCount = 0;

document.getElementById('configForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const privateKey = document.getElementById('privateKey').value;
    const contractAddress = document.getElementById('contractAddress').value;
    const rpcUrl = document.getElementById('rpcUrl').value;
    const voteValue = document.getElementById('voteValue').value;
    const delayMs = parseInt(document.getElementById('delayMs').value, 10);

    document.getElementById('spinner').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    const startButton = document.querySelector('button[type="submit"]');
    startButton.disabled = true;
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('transactionLogs').textContent = '';

    if (transactionProcess) {
        window.api.stopTransaction();
        await transactionProcess;
    }

    transactionProcess = window.api.startTransaction({ privateKey, contractAddress, rpcUrl, voteValue, delayMs });

    try {
        await transactionProcess;
    } catch (error) {
        document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
    } finally {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        startButton.disabled = false;
    }
});

document.getElementById('stopButton').addEventListener('click', () => {
    if (transactionProcess) {
        window.api.stopTransaction();
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        document.querySelector('button[type="submit"]').disabled = false;
        transactionProcess = null;
    }
});

window.api.on('transaction-log', (event, log) => {
    const logContainer = document.getElementById('transactionLogs');
    logContainer.textContent += `${log}\n`;
    transactionCount += 1;
    document.getElementById('totalTransactions').textContent = `Total Transactions: ${transactionCount}`;
});

window.api.on('transaction-error', (event, errorMessage) => {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('errorMessage').textContent = `Error: ${errorMessage}`;
    document.getElementById('errorMessage').style.display = 'block';
    document.querySelector('button[type="submit"]').disabled = false;
});
