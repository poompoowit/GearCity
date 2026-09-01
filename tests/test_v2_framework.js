// ============================================================================
// TEST SUITE: V2 (4+2 STREAMLINED CONCEPT FRAMEWORK) & VERSION SWITCHING
// ============================================================================

const GEARCITY_DATA = require('../web/data.js');
const GearCityEngine = require('../web/engine.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message, detail = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}${detail ? ' (' + detail + ')' : ''}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message} - ${detail}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('   V2 (4+2 STREAMLINED CONCEPT FRAMEWORK) TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

// --- SUITE 1: Data Integrity ---
console.log('--- SUITE 1: Data Integrity of GEARCITY_DATA.v2 ---');
assert(GEARCITY_DATA.v2 != null, 'GEARCITY_DATA.v2 exists');
assert(Array.isArray(GEARCITY_DATA.v2.vehicleClasses) && GEARCITY_DATA.v2.vehicleClasses.length === 30, 'V2 has 30 vehicle classes');
assert(Object.keys(GEARCITY_DATA.v2.chassisDesigns).length === 6, 'V2 has exactly 6 chassis concepts (4 Budget + 2 Premium)');
assert(Object.keys(GEARCITY_DATA.v2.engineDesigns).length === 6, 'V2 has exactly 6 engine concepts (4 Budget + 2 Premium)');
assert(Object.keys(GEARCITY_DATA.v2.gearboxDesigns).length === 6, 'V2 has exactly 6 gearbox concepts (4 Budget + 2 Premium)');

// Check cost tiers in V2 (26 Budget/Mainstream + 4 Ultra-High-End Premium)
const budgetCars = GEARCITY_DATA.v2.vehicleClasses.filter(v => v.tier === 'BUDGET');
const premiumCars = GEARCITY_DATA.v2.vehicleClasses.filter(v => v.tier === 'PREMIUM');
assert(budgetCars.length === 26, '26 Budget/Mainstream vehicle classes in V2', `${budgetCars.length}`);
assert(premiumCars.length === 4, '4 Premium high-end vehicle classes in V2', `${premiumCars.length}`);

// --- SUITE 2: Engine Version State Switching ---
console.log('\n--- SUITE 2: Engine Version Management ---');
GearCityEngine.setVersion('v1');
assert(GearCityEngine.getVersion() === 'v1', 'Switched to V1 version state');
const v1Sedan = GearCityEngine.getVehicleDesignAdvice('Sedan', 1960);
assert(v1Sedan.vehicle.chassis === 'Balance', 'V1 Sedan chassis is Balance');

GearCityEngine.setVersion('v2');
assert(GearCityEngine.getVersion() === 'v2', 'Switched to V2 version state');
const v2Sedan = GearCityEngine.getVehicleDesignAdvice('Sedan', 1960);
assert(v2Sedan.vehicle.chassis === 'Balance', 'V2 Sedan chassis is Balance');
assert(v2Sedan.vehicle.tier === 'BUDGET', 'V2 Sedan tier is BUDGET');

// --- SUITE 3: V1 vs V2 Buyer Fit Comparison ---
console.log('\n--- SUITE 3: Assembly Fit Across All 30 Vehicle Types (V1 vs V2) ---');

let v1FitSum = 0;
let v2FitSum = 0;

for (const vc of GEARCITY_DATA.v2.vehicleClasses) {
  const v1Eval = GearCityEngine.evaluateCompleteVehicle(vc.carType, 1960, {}, 'v1');
  const v2Eval = GearCityEngine.evaluateCompleteVehicle(vc.carType, 1960, {}, 'v2');

  v1FitSum += v1Eval.fit.fitPercent;
  v2FitSum += v2Eval.fit.fitPercent;

  assert(
    v2Eval.fit.fitPercent >= 50.0 && v2Eval.fit.fitPercent <= 100.0,
    `V2 Fit for ${vc.carType} is valid`,
    `V1: ${v1Eval.fit.fitPercent}% → V2: ${v2Eval.fit.fitPercent}% (${vc.tier})`
  );
}

const avgV1Fit = v1FitSum / 30;
const avgV2Fit = v2FitSum / 30;

console.log(`\n  Average V1 Classic Fit : ${avgV1Fit.toFixed(1)}%`);
console.log(`  Average V2 Streamlined Fit: ${avgV2Fit.toFixed(1)}% (Delta: +${(avgV2Fit - avgV1Fit).toFixed(1)}%)`);

assert(avgV2Fit >= 65.0, 'Average V2 Buyer Fit reaches target of >= 65%', `${avgV2Fit.toFixed(1)}%`);
assert(avgV2Fit > avgV1Fit, 'V2 Streamlined Framework improves average fit over V1', `+${(avgV2Fit - avgV1Fit).toFixed(1)}%`);

// --- SUITE 4: Concept Lookup Fallbacks ---
console.log('\n--- SUITE 4: Concept Lookup Robustness ---');
// V1-only concept lookup
const smallBConstraints = GearCityEngine.getEngineDesignConstraints('SmallB', 1960);
assert(smallBConstraints != null && smallBConstraints.focus === 'Torque', 'V1 concept SmallB resolves via fallback');

// V2-only concept lookup
const ecoConstraints = GearCityEngine.getEngineDesignConstraints('Eco', 1960);
assert(ecoConstraints != null && ecoConstraints.performanceFuel === 95, 'V2 concept Eco resolves properly');

// Final summary
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`TOTAL V2 FRAMEWORK TESTS: ${passedTests + failedTests}`);
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🌟 ALL V2 FRAMEWORK & VERSIONING TESTS PASSED PERFECTLY!\n');
}
