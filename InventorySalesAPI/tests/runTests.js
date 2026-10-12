const assert = require('assert');

// Test tree structure
class Suite {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.beforeEachFns = [];
    this.afterEachFns = [];
    this.tests = [];
    this.children = [];
  }

  getBeforeEachChain() {
    const chain = this.parent ? this.parent.getBeforeEachChain() : [];
    return chain.concat(this.beforeEachFns);
  }

  getAfterEachChain() {
    const chain = this.afterEachFns.slice();
    if (this.parent) {
      return chain.concat(this.parent.getAfterEachChain());
    }
    return chain;
  }

  getFullName() {
    if (!this.parent || !this.parent.name) return this.name;
    return `${this.parent.getFullName()} > ${this.name}`;
  }
}

const rootSuite = new Suite('');
let currentSuite = rootSuite;

function describe(name, fn) {
  const suite = new Suite(name, currentSuite);
  currentSuite.children.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

function beforeEach(fn) {
  currentSuite.beforeEachFns.push(fn);
}

function afterEach(fn) {
  currentSuite.afterEachFns.push(fn);
}

function it(name, fn) {
  currentSuite.tests.push({ name, fn });
}

const test = it;

function expect(actual) {
  return {
    toEqual: (expected) => {
      assert.deepStrictEqual(actual, expected);
    },
    toBe: (expected) => {
      assert.strictEqual(actual, expected);
    },
    not: {
      toBe: (expected) => {
        assert.notStrictEqual(actual, expected);
      },
      toEqual: (expected) => {
        assert.notDeepStrictEqual(actual, expected);
      },
      toHaveBeenCalled: () => {
        assert.strictEqual(actual.mock.calls.length, 0, 'Expected function not to have been called');
      }
    },
    toBeNull: () => {
      assert.strictEqual(actual, null);
    },
    toBeUndefined: () => {
      assert.strictEqual(actual, undefined);
    },
    toBeDefined: () => {
      assert.notStrictEqual(actual, undefined);
    },
    toBeTruthy: () => {
      assert.ok(actual);
    },
    toBeFalsy: () => {
      assert.ok(!actual);
    },
    toContain: (item) => {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        assert.ok(actual.includes(item), `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
      } else {
        assert.fail('toContain requires string or array');
      }
    },
    toBeGreaterThan: (expected) => {
      assert.ok(actual > expected, `Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual: (expected) => {
      assert.ok(actual >= expected, `Expected ${actual} >= ${expected}`);
    },
    toBeLessThan: (expected) => {
      assert.ok(actual < expected, `Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual: (expected) => {
      assert.ok(actual <= expected, `Expected ${actual} <= ${expected}`);
    },
    toHaveLength: (len) => {
      assert.strictEqual(actual.length, len);
    },
    toHaveBeenCalled: () => {
      assert.ok(actual.mock.calls.length > 0, `Expected function to have been called`);
    },
    toHaveBeenCalledTimes: (count) => {
      assert.strictEqual(actual.mock.calls.length, count, `Expected function called ${count} times, got ${actual.mock.calls.length}`);
    },
    toHaveBeenCalledWith: (...args) => {
      const match = actual.mock.calls.some(call => {
        try {
          assert.deepStrictEqual(call, args);
          return true;
        } catch {
          return false;
        }
      });
      assert.ok(match, `Expected call with ${JSON.stringify(args)}, but got ${JSON.stringify(actual.mock.calls)}`);
    },
    rejects: {
      toMatchObject: async (expected) => {
        let rejected = false;
        let caughtErr = null;
        try {
          await actual;
        } catch (err) {
          rejected = true;
          caughtErr = err;
        }
        assert.ok(rejected, 'Expected promise to reject, but it resolved successfully');
        for (const key of Object.keys(expected)) {
          assert.strictEqual(
            caughtErr[key],
            expected[key],
            `Expected error property "${key}" to match "${expected[key]}", but got "${caughtErr ? caughtErr[key] : undefined}"`
          );
        }
      }
    },
    resolves: {
      toBeUndefined: async () => {
        const res = await actual;
        assert.strictEqual(res, undefined);
      }
    }
  };
}

const activeSpies = [];

const jestMock = {
  fn: (impl) => {
    let currentImpl = impl || (() => {});
    const fn = function(...args) {
      fn.mock.calls.push(args);
      return currentImpl.apply(this, args);
    };
    fn.mock = { calls: [] };
    fn.mockReturnValue = (val) => {
      currentImpl = () => val;
      return fn;
    };
    fn.mockResolvedValue = (val) => {
      currentImpl = () => Promise.resolve(val);
      return fn;
    };
    fn.mockRejectedValue = (err) => {
      currentImpl = () => Promise.reject(err);
      return fn;
    };
    fn.mockImplementation = (newImpl) => {
      currentImpl = newImpl;
      return fn;
    };
    fn.mockReturnThis = () => {
      currentImpl = function() { return this; };
      return fn;
    };
    fn.mockClear = () => {
      fn.mock.calls = [];
    };
    return fn;
  },
  spyOn: (obj, method) => {
    const original = obj[method];
    const mockFn = jestMock.fn(original);
    mockFn.mockRestore = () => {
      obj[method] = original;
    };
    obj[method] = mockFn;
    activeSpies.push(mockFn);
    return mockFn;
  },
  restoreAllMocks: () => {
    while (activeSpies.length > 0) {
      const spy = activeSpies.pop();
      if (spy && typeof spy.mockRestore === 'function') {
        spy.mockRestore();
      }
    }
  }
};

global.describe = describe;
global.it = it;
global.test = test;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.expect = expect;
global.jest = jestMock;

async function executeSuite(suite) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const beforeEachChain = suite.getBeforeEachChain();
  const afterEachChain = suite.getAfterEachChain();

  for (const t of suite.tests) {
    const testFullName = `${suite.getFullName()} > ${t.name}`;
    try {
      for (const beforeFn of beforeEachChain) {
        await beforeFn();
      }
      await t.fn();
      passed++;
      console.log(`  ✓ ${testFullName}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${testFullName}`);
      console.error(`    ${err.message}`);
      failures.push({ name: testFullName, error: err });
    } finally {
      for (const afterFn of afterEachChain) {
        try {
          await afterFn();
        } catch (afterErr) {
          console.warn(`[afterEach Error] ${afterErr.message}`);
        }
      }
      jestMock.restoreAllMocks();
    }
  }

  for (const child of suite.children) {
    const childResult = await executeSuite(child);
    passed += childResult.passed;
    failed += childResult.failed;
    failures.push(...childResult.failures);
  }

  return { passed, failed, failures };
}

async function run() {
  console.log('====================================================');
  console.log('Running Express Backend Unit Tests (Jest Spec)');
  console.log('====================================================\n');

  require('./category.test.js');
  require('./product.test.js');
  require('./sales.test.js');
  require('./report.test.js');
  require('./sqsService.test.js');
  require('./controllers.test.js');
  require('./authService.test.js');
  require('./authController.test.js');
  require('./authRoutes.test.js');
  require('./initDb.test.js');

  const { passed, failed, failures } = await executeSuite(rootSuite);

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    console.error(`\nFailed tests:`);
    for (const f of failures) {
      console.error(` - ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log('All tests passed successfully!');
  }
}

run();
