const {
  DEFAULT_BALANCE,
  DATA_READ,
  dataProgram,
  resetStorageBalance,
  getStorageBalance,
  displayMenu,
  operations,
  processMenuChoice,
} = require('./index');

function createMockRl(answers = []) {
  let answerIndex = 0;
  return {
    question: jest.fn(async () => {
      const response = answers[answerIndex];
      answerIndex += 1;
      return response ?? '';
    }),
    close: jest.fn(),
  };
}

describe('Accounting App - COBOL parity test plan', () => {
  let logSpy;

  beforeEach(() => {
    resetStorageBalance();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('TC-001: Application menu displays all options', () => {
    displayMenu();

    expect(logSpy).toHaveBeenCalledWith('--------------------------------');
    expect(logSpy).toHaveBeenCalledWith('Account Management System');
    expect(logSpy).toHaveBeenCalledWith('1. View Balance');
    expect(logSpy).toHaveBeenCalledWith('2. Credit Account');
    expect(logSpy).toHaveBeenCalledWith('3. Debit Account');
    expect(logSpy).toHaveBeenCalledWith('4. Exit');
  });

  test('TC-002: Exit option closes flow', async () => {
    const continueFlag = await processMenuChoice(4, createMockRl());

    expect(continueFlag).toBe('NO');
  });

  test('TC-003: Invalid menu option is rejected', async () => {
    const continueFlag = await processMenuChoice(9, createMockRl());

    expect(continueFlag).toBe('YES');
    expect(logSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
  });

  test('TC-004: View balance shows initial default balance', async () => {
    await operations('TOTAL ', createMockRl());

    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
    expect(getStorageBalance()).toBe(DEFAULT_BALANCE);
  });

  test('TC-005: Credit increases balance correctly', async () => {
    const rl = createMockRl(['200.00']);

    await operations('CREDIT', rl);

    expect(getStorageBalance()).toBe(1200);
    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1200.00');
  });

  test('TC-006: Debit decreases balance when funds are sufficient', async () => {
    const rl = createMockRl(['250.00']);

    await operations('DEBIT ', rl);

    expect(getStorageBalance()).toBe(750);
    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 750.00');
  });

  test('TC-007: Debit blocks transaction when funds are insufficient', async () => {
    const rl = createMockRl(['1500.00']);

    await operations('DEBIT ', rl);

    expect(getStorageBalance()).toBe(1000);
    expect(logSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
  });

  test('TC-008: Balance persists across sequential operations in same session', async () => {
    await operations('CREDIT', createMockRl(['300.00']));
    await operations('DEBIT ', createMockRl(['100.00']));

    expect(dataProgram(DATA_READ)).toBe(1200);
  });

  test('TC-009: Multiple balance checks do not alter balance', async () => {
    await operations('TOTAL ', createMockRl());
    await operations('TOTAL ', createMockRl());

    expect(dataProgram(DATA_READ)).toBe(1000);
  });

  test('TC-010: Balance resets on new session start', async () => {
    await operations('CREDIT', createMockRl(['200.00']));
    expect(getStorageBalance()).toBe(1200);

    resetStorageBalance();

    expect(getStorageBalance()).toBe(1000);
  });

  test('TC-011: Credit zero amount leaves balance unchanged', async () => {
    await operations('CREDIT', createMockRl(['0.00']));

    expect(getStorageBalance()).toBe(1000);
    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
  });

  test('TC-012: Debit exact balance sets balance to zero', async () => {
    await operations('DEBIT ', createMockRl(['1000.00']));

    expect(getStorageBalance()).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  });

  test('TC-013: Menu flow continues after non-exit operations', async () => {
    const continueAfterView = await processMenuChoice(1, createMockRl());
    const continueAfterCredit = await processMenuChoice(2, createMockRl(['50.00']));

    expect(continueAfterView).toBe('YES');
    expect(continueAfterCredit).toBe('YES');
  });

  test('TC-014: Menu routes operations correctly by user choice', async () => {
    const viewRl = createMockRl();
    const creditRl = createMockRl(['200.00']);
    const debitRl = createMockRl(['100.00']);

    await processMenuChoice(1, viewRl);
    await processMenuChoice(2, creditRl);
    await processMenuChoice(3, debitRl);

    expect(viewRl.question).not.toHaveBeenCalled();
    expect(creditRl.question).toHaveBeenCalledWith('Enter credit amount: ');
    expect(debitRl.question).toHaveBeenCalledWith('Enter debit amount: ');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  });
});
