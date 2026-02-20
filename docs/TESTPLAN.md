# COBOL Student Account System Test Plan

This test plan validates the current COBOL implementation and business logic so it can be reused during the Node.js migration for unit and integration test design.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Application starts and displays main menu options | `accountsystem` is compiled and runnable | 1. Run `./accountsystem` 2. Observe first screen | Menu displays exactly: 1) View Balance 2) Credit Account 3) Debit Account 4) Exit | TBD | TBD | Validates UI/menu entry point (`main.cob`) |
| TC-002 | Exit option closes application cleanly | App is running at menu | 1. Enter `4` 2. Press Enter | Program prints goodbye message and terminates without error | TBD | TBD | Verifies loop exit behavior |
| TC-003 | Invalid menu option is rejected | App is running at menu | 1. Enter `9` 2. Press Enter | Program shows invalid-choice message and returns to menu loop | TBD | TBD | Covers `WHEN OTHER` in menu evaluation |
| TC-004 | View Balance returns initial default balance at session start | Fresh app session started (no prior credit/debit in same run) | 1. Enter `1` 2. Press Enter | Displayed balance is `1000.00` | TBD | TBD | Confirms default business rule |
| TC-005 | Credit operation increases balance correctly | Fresh app session started | 1. Enter `2` 2. Input credit amount `200.00` 3. Enter `1` to view balance | New balance is `1200.00` and persists within current run | TBD | TBD | Covers read + add + write flow |
| TC-006 | Debit operation decreases balance when sufficient funds exist | Fresh app session started | 1. Enter `3` 2. Input debit amount `250.00` 3. Enter `1` to view balance | New balance is `750.00` and persists within current run | TBD | TBD | Covers read + conditional subtract + write |
| TC-007 | Debit operation blocks transaction when funds are insufficient | Fresh app session started | 1. Enter `3` 2. Input debit amount `1500.00` 3. Enter `1` to view balance | Insufficient-funds message shown; balance remains `1000.00` | TBD | TBD | Confirms no write occurs on failed debit |
| TC-008 | Balance persistence across multiple operations in same session | Fresh app session started | 1. Credit `300.00` 2. Debit `100.00` 3. View balance | Final balance is `1200.00` (`1000 + 300 - 100`) | TBD | TBD | Verifies sequential consistency |
| TC-009 | Multiple balance checks do not alter balance | Fresh app session started | 1. View balance 2. View balance again 3. Compare values | Both values are identical (`1000.00` if no mutation occurred) | TBD | TBD | Validates read-only behavior of view action |
| TC-010 | Session reset behavior on restart (in-memory storage) | App executable available | 1. Run app 2. Credit `200.00` 3. Exit 4. Run app again 5. View balance | Balance resets to initial `1000.00` in new process/session | TBD | TBD | Confirms storage is in-memory, not persisted to file/DB |
| TC-011 | Credit with zero amount leaves balance unchanged | Fresh app session started | 1. Enter `2` 2. Input `0.00` 3. Enter `1` to view balance | Operation completes; balance remains `1000.00` | TBD | TBD | Edge case for mutation boundary |
| TC-012 | Debit exact balance amount sets balance to zero | Fresh app session started | 1. Enter `3` 2. Input `1000.00` 3. Enter `1` to view balance | Debit succeeds; balance becomes `0.00` | TBD | TBD | Boundary condition for `balance >= amount` |
| TC-013 | Menu loop continues after non-exit operations | Fresh app session started | 1. Perform View Balance (`1`) 2. Observe menu appears again 3. Perform Credit (`2`) 4. Observe menu appears again | App remains in loop until user enters `4` | TBD | TBD | Verifies control flow in `main.cob` |
| TC-014 | Business operation routing from UI choice is correct | Fresh app session started | 1. Choose `1`, then `2`, then `3` in separate runs 2. Observe prompts/messages for each | `1` triggers balance display, `2` prompts credit amount, `3` prompts debit amount | TBD | TBD | Stakeholder-level validation of action mapping |

## Notes for Node.js Migration

- Use these cases as acceptance criteria first, then split into:
  - Unit tests (pure operation rules: credit/debit/insufficient funds/boundaries)
  - Integration tests (UI choice -> operation handler -> storage read/write interactions)
- Keep expected outputs aligned with current COBOL behavior before introducing enhancements.
