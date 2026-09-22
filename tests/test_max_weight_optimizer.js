// Test Suite: Max Weight Ceiling & Weight Budget Utilization Verification
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
console.log('   MAX WEIGHT BUDGET & CEILING OPTIMIZER TEST SUITE');
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
// TEST 1: High weight ceiling (6,000 kg @ 1910) utilizes budget for Max HP
// -------------------------------------------------------------
console.log('--- TEST 1: High Weight Ceiling (6,000 kg @ 1910) ---');
const heavy1910 = E.optimizeEngine(1910, {
  maxCost: 1500,
  maxWeight: 6000,
  focus: 'HP',
  allowedFuels: ['E85'],
  designSkill: 70,
  modelName: 'Ship1',
});

assert(heavy1910 && heavy1910.performance, 'Engine optimizes successfully with 6,000 kg limit');
assert(
  heavy1910.performance.weightKg <= 6000,
  'Engine weight strictly obeys 6,000 kg ceiling',
  `Actual: ${heavy1910.performance.weightKg.toFixed(1)} kg <= 6000 kg`
);
assert(
  heavy1910.performance.weightKg > 4000,
  'Engine utilizes weight budget (>4,000 kg) rather than prematurely stopping at ~800 kg',
  `Actual: ${heavy1910.performance.weightKg.toFixed(1)} kg`
);
assert(
  heavy1910.performance.horsepower > 500,
  'Engine generates high horsepower (>500 HP) using available displacement',
  `Actual: ${heavy1910.performance.horsepower.toFixed(1)} HP`
);
assert(
  heavy1910.performance.unitCost <= 1500,
  'Engine respects max cost constraint ($1,500)',
  `Actual: $${heavy1910.performance.unitCost.toFixed(2)}`
);

// -------------------------------------------------------------
// TEST 2: Tight weight limit (180 kg @ 1960) strictly enforced
// -------------------------------------------------------------
console.log('\n--- TEST 2: Tight Weight Constraint (180 kg @ 1960) ---');
const tight1960 = E.optimizeEngine(1960, {
  maxWeight: 180,
  focus: 'HP',
  modelName: 'Tight_1960',
});

assert(tight1960 && tight1960.performance, 'Tight 1960 engine optimizes successfully');
assert(
  tight1960.performance.weightKg <= 180,
  'Engine weight strictly obeys 180 kg ceiling',
  `Actual: ${tight1960.performance.weightKg.toFixed(1)} kg <= 180 kg`
);
assert(
  tight1960.performance.horsepower > 300,
  'Engine achieves strong HP within tight 180 kg limit',
  `Actual: ${tight1960.performance.horsepower.toFixed(1)} HP`
);

// -------------------------------------------------------------
// TEST 3: Vintage tight weight limit (150 kg @ 1935) strictly enforced
// -------------------------------------------------------------
console.log('\n--- TEST 3: Vintage Tight Weight Constraint (150 kg @ 1935) ---');
const tight1935 = E.optimizeEngine(1935, {
  maxWeight: 150,
  focus: 'HP',
  modelName: 'Tight_1935',
});

assert(tight1935 && tight1935.performance, 'Vintage 1935 engine optimizes successfully');
assert(
  tight1935.performance.weightKg <= 150,
  'Vintage engine weight strictly obeys 150 kg ceiling',
  `Actual: ${tight1935.performance.weightKg.toFixed(1)} kg <= 150 kg`
);

// -------------------------------------------------------------
// TEST 4: Engine Bay Limits from 400 mm to 20,000 mm strictly enforced
// -------------------------------------------------------------
console.log('\n--- TEST 4: Engine Bay Limits from 400 mm to 20,000 mm ---');
const baySizesToTest = [
  { size: 400, desc: '400 mm (Micro)' },
  { size: 500, desc: '500 mm (Cyclecar)' },
  { size: 750, desc: '750 mm (Compact)' },
  { size: 900, desc: '900 mm (Sedan)' },
  { size: 1200, desc: '1200 mm (Touring)' },
  { size: 1600, desc: '1600 mm (Luxury / Truck)' },
  { size: 8000, desc: '8000 mm (Giant Train / Ship)' },
  { size: 20000, desc: '20000 mm (Unconstrained Max)' },
];

for (const b of baySizesToTest) {
  const opt = E.optimizeEngine(1910, {
    maxCost: 1500,
    maxLength: b.size / 10.0,
    maxWidth: b.size / 10.0,
    focus: 'HP',
    designSkill: 100,
    modelName: 'Bay_' + b.size,
  });

  const fits = (opt.performance.lengthCm * 10 <= b.size + 0.1) && (opt.performance.widthCm * 10 <= b.size + 0.1);
  assert(
    fits,
    `Bay limit ${b.desc} strictly fits engine dimensions`,
    `${(opt.performance.lengthCm * 10).toFixed(0)} x ${(opt.performance.widthCm * 10).toFixed(0)} mm <= ${b.size} mm (${opt.config.components.layout} ${opt.config.components.cylinders}-cyl, ${opt.performance.horsepower.toFixed(1)} HP)`
  );
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`✅ PASSED: ${passed}`);
console.log(`❌ FAILED: ${failed}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🌟 ALL MAX WEIGHT & BAY OPTIMIZER TESTS PASSED PERFECTLY!\n');
}

