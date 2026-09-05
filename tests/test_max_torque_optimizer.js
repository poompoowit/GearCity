// Test Suite: Max Torque & Lightest Engine Optimizer Verification
const fs = require('fs');
const path = require('path');

// Load Data & Engine Modules
const dataPath = path.join(__dirname, '..', 'web', 'data.js');
const enginePath = path.join(__dirname, '..', 'web', 'engine.js');

const dataCode = fs.readFileSync(dataPath, 'utf8');
const engineCode = fs.readFileSync(enginePath, 'utf8');

const loader = new Function('performance', `
  ${dataCode}
  ${engineCode}
  return { GEARCITY_DATA, GearCityEngine };
`);

const { GEARCITY_DATA: DATA, GearCityEngine: E } = loader(performance);

console.log('═══════════════════════════════════════════════════════════════');
console.log('   MAX TORQUE & LIGHTEST ENGINE OPTIMIZER TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

// -------------------------------------------------------------
// TEST 1: Unconstrained late-era engine produces high torque
// -------------------------------------------------------------
console.log('--- TEST 1: Unconstrained Baseline (Year 1980) ---');
const unconstrained1980 = E.optimizeEngine(1980, {
  focus: 'Torque',
  modelName: 'Unconstrained_1980',
});

assert(
  unconstrained1980 && unconstrained1980.performance,
  'Unconstrained 1980 engine optimizes successfully',
  `${unconstrained1980.performance.torqueNm.toFixed(1)} Nm, ${unconstrained1980.performance.weightKg.toFixed(1)} kg`
);
assert(
  unconstrained1980.performance.torqueNm > 1000,
  'Late-era unconstrained engine torque is very high (> 1000 Nm)',
  `Actual: ${unconstrained1980.performance.torqueNm.toFixed(1)} Nm`
);

// -------------------------------------------------------------
// TEST 2: Max Torque Cap Enforced (300 Nm)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Max Torque Constraint (300 Nm @ 1980) ---');
const capped300 = E.optimizeEngine(1980, {
  maxTorque: 300,
  focus: 'Torque',
  modelName: 'Capped_300_1980',
});

assert(
  capped300 && capped300.performance,
  'Optimizer finds configuration under 300 Nm torque cap'
);
assert(
  capped300.performance.torqueNm <= 300.0,
  'Engine torque strictly respects maxTorque cap of 300 Nm',
  `Actual: ${capped300.performance.torqueNm.toFixed(1)} Nm`
);
assert(
  capped300.performance.torqueNm >= 150.0,
  'Engine still reaches good torque output within cap',
  `Actual: ${capped300.performance.torqueNm.toFixed(1)} Nm`
);
assert(
  capped300.performance.weightKg < unconstrained1980.performance.weightKg,
  'Capped engine is significantly lighter than unconstrained monster engine',
  `Capped: ${capped300.performance.weightKg.toFixed(1)} kg vs Unconstrained: ${unconstrained1980.performance.weightKg.toFixed(1)} kg`
);

// -------------------------------------------------------------
// TEST 3: Max Torque with HP Focus (250 Nm)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Max Torque with HP Focus (250 Nm @ 1970) ---');
const cappedHp = E.optimizeEngine(1970, {
  maxTorque: 250,
  focus: 'HP',
  modelName: 'Capped_HP_1970',
});

assert(
  cappedHp && cappedHp.performance,
  'Optimizer finds configuration for HP focus with 250 Nm cap'
);
assert(
  cappedHp.performance.torqueNm <= 250.0,
  'HP focus engine torque strictly stays <= 250 Nm',
  `Actual: ${cappedHp.performance.torqueNm.toFixed(1)} Nm, HP: ${cappedHp.performance.horsepower.toFixed(1)}`
);
assert(
  cappedHp.performance.horsepower > 0,
  'HP focus engine generates positive horsepower within torque limit',
  `${cappedHp.performance.horsepower.toFixed(1)} HP`
);

// -------------------------------------------------------------
// TEST 4: Vehicle Optimizer (Tab 5) with Gearbox Cap
// -------------------------------------------------------------
console.log('\n--- TEST 4: Vehicle Optimizer (Tab 5) with Gearbox Torque Cap ---');
const vResUnconstrained = E.optimizeEngineForVehicle('Supercar', 'Race', 1980, {});
const vResCapped = E.optimizeEngineForVehicle('Supercar', 'Race', 1980, { maxTorque: 200 });

assert(
  vResCapped && vResCapped.success && vResCapped.performance,
  'Vehicle engine optimization succeeds with gearbox torque cap'
);
assert(
  vResCapped.performance.torqueNm <= 200.0,
  'Vehicle engine torque strictly stays <= 200 Nm gearbox limit',
  `Actual: ${vResCapped.performance.torqueNm.toFixed(1)} Nm`
);
assert(
  vResCapped.performance.weightKg < vResUnconstrained.performance.weightKg,
  'Vehicle engine is significantly lighter when torque is capped to gearbox limit',
  `Capped: ${vResCapped.performance.weightKg.toFixed(1)} kg vs Unconstrained: ${vResUnconstrained.performance.weightKg.toFixed(1)} kg`
);

// -------------------------------------------------------------
// TEST 5: Blank / Falsy / Negative maxTorque Treated as Unconstrained
// -------------------------------------------------------------
console.log('\n--- TEST 5: Blank / Falsy maxTorque Backward Compatibility ---');
const blankTest = E.optimizeEngine(1960, { maxTorque: '', focus: 'Torque' });
const nullTest = E.optimizeEngine(1960, { maxTorque: null, focus: 'Torque' });
const zeroTest = E.optimizeEngine(1960, { maxTorque: 0, focus: 'Torque' });
const defaultTest = E.optimizeEngine(1960, { focus: 'Torque' });

assert(
  Math.abs(blankTest.performance.torqueNm - defaultTest.performance.torqueNm) < 0.1,
  'Empty string maxTorque behaves identically to unconstrained default'
);
assert(
  Math.abs(nullTest.performance.torqueNm - defaultTest.performance.torqueNm) < 0.1,
  'Null maxTorque behaves identically to unconstrained default'
);
assert(
  Math.abs(zeroTest.performance.torqueNm - defaultTest.performance.torqueNm) < 0.1,
  'Zero maxTorque behaves identically to unconstrained default'
);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`✅ PASSED: ${passed}`);
console.log(`❌ FAILED: ${failed}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🌟 ALL MAX TORQUE & LIGHTEST ENGINE TESTS PASSED PERFECTLY!\n');
}
