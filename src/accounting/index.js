const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const OPERATION_TOTAL = 'TOTAL ';
const OPERATION_CREDIT = 'CREDIT';
const OPERATION_DEBIT = 'DEBIT ';
const DATA_READ = 'READ';
const DATA_WRITE = 'WRITE';
const DEFAULT_BALANCE = 1000.0;

let storageBalance = DEFAULT_BALANCE;

function formatAmount(amount) {
  return amount.toFixed(2);
}

function dataProgram(operationType, balance = null) {
  if (operationType === DATA_READ) {
    return storageBalance;
  }

  if (operationType === DATA_WRITE && typeof balance === 'number' && Number.isFinite(balance)) {
    storageBalance = balance;
  }

  return storageBalance;
}

function resetStorageBalance() {
  storageBalance = DEFAULT_BALANCE;
}

function getStorageBalance() {
  return storageBalance;
}

function displayMenu(logger = console.log) {
  logger('--------------------------------');
  logger('Account Management System');
  logger('1. View Balance');
  logger('2. Credit Account');
  logger('3. Debit Account');
  logger('4. Exit');
  logger('--------------------------------');
}

async function operations(operationType, rl, logger = console.log) {
  if (operationType === OPERATION_TOTAL) {
    const finalBalance = dataProgram(DATA_READ);
    logger(`Current balance: ${formatAmount(finalBalance)}`);
    return;
  }

  if (operationType === OPERATION_CREDIT) {
    const amountInput = await rl.question('Enter credit amount: ');
    const amount = Number(amountInput);
    const finalBalance = dataProgram(DATA_READ);
    const updatedBalance = finalBalance + amount;
    dataProgram(DATA_WRITE, updatedBalance);
    logger(`Amount credited. New balance: ${formatAmount(updatedBalance)}`);
    return;
  }

  if (operationType === OPERATION_DEBIT) {
    const amountInput = await rl.question('Enter debit amount: ');
    const amount = Number(amountInput);
    const finalBalance = dataProgram(DATA_READ);

    if (finalBalance >= amount) {
      const updatedBalance = finalBalance - amount;
      dataProgram(DATA_WRITE, updatedBalance);
      logger(`Amount debited. New balance: ${formatAmount(updatedBalance)}`);
      return;
    }

    logger('Insufficient funds for this debit.');
  }
}

async function processMenuChoice(userChoice, rl, logger = console.log) {
  switch (userChoice) {
    case 1:
      await operations(OPERATION_TOTAL, rl, logger);
      return 'YES';
    case 2:
      await operations(OPERATION_CREDIT, rl, logger);
      return 'YES';
    case 3:
      await operations(OPERATION_DEBIT, rl, logger);
      return 'YES';
    case 4:
      return 'NO';
    default:
      logger('Invalid choice, please select 1-4.');
      return 'YES';
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  let continueFlag = 'YES';

  while (continueFlag !== 'NO') {
    displayMenu();

    const choiceInput = await rl.question('Enter your choice (1-4): ');
    const userChoice = Number(choiceInput);

    continueFlag = await processMenuChoice(userChoice, rl);
  }

  console.log('Exiting the program. Goodbye!');
  rl.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  OPERATION_TOTAL,
  OPERATION_CREDIT,
  OPERATION_DEBIT,
  DATA_READ,
  DATA_WRITE,
  DEFAULT_BALANCE,
  formatAmount,
  dataProgram,
  resetStorageBalance,
  getStorageBalance,
  displayMenu,
  operations,
  processMenuChoice,
  main,
};
