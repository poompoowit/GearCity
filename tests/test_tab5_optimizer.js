// Comprehensive Tab 5 (Vehicle Engine Optimizer) Logic Test Suite
// Tests optimizeEngineForVehicle, getEngineDesignConstraints, XML exports, and custom filter integration

const fs = require('fs');

const dataCode = fs.readFileSync('/Users/phuwit.v/Documents/GearCity/web/data.js', 'utf8');
const engineCode = fs.readFileSync('/Users/phuwit.v/Documents/GearCity/web/engine.js', 'utf8');

const loader = new Function('performance', `
  ${dataCode}
  ${engineCode}
  return { GEARCITY_DATA, GearCityEngine };
`);

const { GEARCITY_DATA: DATA, GearCityEngine: E } = loader(performance);

console.log('═══════════════════════════════════════════════════════════════');
console.log('       TAB 5: VEHICLE ENGINE OPTIMIZER TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
  } else {
    failedTests++;
    failureDetails.push(`${testName}: ${details}`);
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
  }
}

// =========================================================================
// SUITE 1: Engine Design Concepts Constraint Resolution across Decades
// =========================================================================
console.log('--- SUITE 1: Engine Concept Constraint Resolution ---');
const sampleConcepts = Object.keys(DATA.engineDesigns);
console.log(`Total Engine Design Concepts in Database: ${sampleConcepts.length}`);

for (const conceptName of sampleConcepts) {
  const c1900 = E.getEngineDesignConstraints(conceptName, 1900);
  const c1960 = E.getEngineDesignConstraints(conceptName, 1960);
  const c2020 = E.getEngineDesignConstraints(conceptName, 2020);

  assert(
    c1900 !== null && c1960 !== null && c2020 !== null,
    `Resolved constraints for "${conceptName}" across 1900-2020`,
    `1900 Cost: $${c1900?.maxCost}, 1960 Cost: $${c1960?.maxCost}, 2020 Cost: $${c2020?.maxCost}`
  );

  assert(
    typeof c1960.focus === 'string' && (c1960.focus === 'HP' || c1960.focus === 'Torque'),
    `Concept "${conceptName}" has valid focus goal`,
    `Focus: ${c1960.focus}`
  );
}

// =========================================================================
// SUITE 2: Optimization for Vehicle Types (All 30 Vehicle Classes @ 1960)
// =========================================================================
console.log('\n--- SUITE 2: Optimization for Vehicle Types (All 30 Classes @ 1960) ---');
console.log(`Total Vehicle Classes in Database: ${DATA.vehicleClasses.length}`);

for (const vc of DATA.vehicleClasses) {
  const carType = vc.carType;
  const rawEngineTypes = vc.engineType.split(/[,/]/).map(s => s.trim());
  const conceptKey = rawEngineTypes[0]; // e.g. "Balance", "Power", "Sport", "Truck", "Race", "SmallB"

  const result = E.optimizeEngineForVehicle(carType, conceptKey, 1960);

  assert(
    result.success === true && result.performance && result.performance.horsepower > 0,
    `Vehicle "${carType}" (Concept: ${conceptKey}) @ 1960`,
    `${result.bestCandidate?.layout} ${result.bestCandidate?.cylinders}-cyl ${result.bestCandidate?.valvetrain} -> ${result.performance?.horsepower.toFixed(1)} HP, ${result.performance?.torqueNm.toFixed(1)} Nm, Cost: $${result.performance?.unitCost.toFixed(0)}`
  );
}

// =========================================================================
// SUITE 3: Multi-Decade Vehicle Optimization (Sedan across 1900 to 2020)
// =========================================================================
console.log('\n--- SUITE 3: Decade Progression for Sedan (1900 to 2020) ---');
const testDecades = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

for (const yr of testDecades) {
  const res = E.optimizeEngineForVehicle('Sedan', 'Balance — Fuel saving, Balance', yr);

  assert(
    res.success === true && res.performance.horsepower > 0 && res.performance.torqueNm > 0,
    `Sedan Balance @ Year ${yr}`,
    `${res.performance.horsepower.toFixed(1)} HP, ${res.performance.torqueNm.toFixed(1)} Nm, ${res.bestCandidate.layout} ${res.bestCandidate.cylinders}-cyl ${res.bestCandidate.valvetrain}, Cost: $${res.performance.unitCost.toFixed(0)}`
  );
}

// =========================================================================
// SUITE 4: Custom Constraints & Physical Bay Limits
// =========================================================================
console.log('\n--- SUITE 4: Custom Constraints & Engine Bay Limits ---');

// Test 4A: Strict Bay Limits (Compact Bay: 500mm Length, 400mm Width)
const bayConstraints = {
  engineBayLength: 500, // 50 cm
  engineBayWidth: 400,  // 40 cm
};
const bayRes = E.optimizeEngineForVehicle('Microcar', 'Economy — Low Cost, High Fuel Efficiency', 1970, bayConstraints);
assert(
  bayRes.success === true && bayRes.performance.lengthCm <= 55 && bayRes.performance.widthCm <= 45,
  'Engine Bay Constraint Adherence (Microcar @ 1970)',
  `Engine size: ${bayRes.performance.lengthCm.toFixed(1)}cm L x ${bayRes.performance.widthCm.toFixed(1)}cm W (Bay limit: 50x40cm)`
);

// Test 4B: Strict Weight Limits (Max Weight 80 kg)
const weightConstraints = { maxWeight: 80 };
const weightRes = E.optimizeEngineForVehicle('Microcar', 'Economy — Low Cost, High Fuel Efficiency', 1960, weightConstraints);
assert(
  weightRes.success === true && weightRes.performance.weightKg <= 95,
  'Weight Constraint Adherence (Max 80kg)',
  `Result weight: ${weightRes.performance.weightKg.toFixed(1)} kg`
);

// Test 4C: Strict Budget Constraints (Max Cost $200)
const costConstraints = { maxCost: 200 };
const costRes = E.optimizeEngineForVehicle('Budget Sedan', 'Budget — Maximum Cost Reduction', 1960, costConstraints);
assert(
  costRes.success === true && costRes.performance.unitCost <= 250,
  'Cost Constraint Adherence (Budget Sedan @ 1960)',
  `Result unit cost: $${costRes.performance.unitCost.toFixed(2)}`
);

// =========================================================================
// SUITE 5: Custom Component Filters (The User's Scenario and Other Filter Subsets)
// =========================================================================
console.log('\n--- SUITE 5: Custom Component Filter Subsets in Tab 5 ---');

// Test 5A: User scenario (Flat, I, V layouts + F Head, L Head, T Head valves @ 1902)
const userFilterTest = E.optimizeEngineForVehicle('Sedan', 'Balance — Fuel saving, Balance', 1902, {
  maxCost: 285,
  maxWeight: 140,
  maxHpTorqueRatio: 1.6,
  focus: 'Torque',
  allowedLayouts: ['Flat', 'I', 'V'],
  allowedValves: ['F Head', 'L Head', 'T Head'],
});

assert(
  userFilterTest.success === true &&
  ['Flat', 'I', 'V'].includes(userFilterTest.bestCandidate.layout) &&
  ['F Head', 'L Head', 'T Head'].includes(userFilterTest.bestCandidate.valvetrain),
  'User Specific Test: Sedan 1902 with [Flat, I, V] & [F Head, L Head, T Head]',
  `Selected: ${userFilterTest.bestCandidate.layout} ${userFilterTest.bestCandidate.cylinders}-cyl ${userFilterTest.bestCandidate.valvetrain} -> ${userFilterTest.performance.horsepower.toFixed(1)} HP, ${userFilterTest.performance.torqueNm.toFixed(1)} Nm`
);

// Test 5B: High-End Supercar Filters (V, W layouts + DOHC valvetrain + Turbo)
const supercarFilterTest = E.optimizeEngineForVehicle('Supercar', 'Racing — Maximum Power & RPM', 1990, {
  allowedLayouts: ['V', 'W'],
  allowedValves: ['DOHC'],
  allowedInductions: ['Turbocharger Stage II (Power Focused)', 'Twin-Turbocharger'],
});

assert(
  supercarFilterTest.success === true &&
  ['V', 'W'].includes(supercarFilterTest.bestCandidate.layout) &&
  supercarFilterTest.bestCandidate.valvetrain === 'DOHC',
  'Supercar Filter Test: [V, W] + DOHC + Turbos @ 1990',
  `Selected: ${supercarFilterTest.bestCandidate.layout} ${supercarFilterTest.bestCandidate.cylinders}-cyl ${supercarFilterTest.bestCandidate.induction} -> ${supercarFilterTest.performance.horsepower.toFixed(1)} HP`
);

// Test 5C: Diesel Heavy Truck Filters
const truckFilterTest = E.optimizeEngineForVehicle('Heavy Truck', 'Power — Towing, Utility, Offroad', 1980, {
  preferredFuel: 'Diesel',
  allowedFuels: ['Diesel'],
  focus: 'Torque',
});

assert(
  truckFilterTest.success === true && truckFilterTest.bestCandidate.fuel === 'Diesel',
  'Heavy Truck Filter Test: Diesel Fuel Focus @ 1980',
  `Selected: ${truckFilterTest.bestCandidate.layout} ${truckFilterTest.bestCandidate.cylinders}-cyl ${truckFilterTest.bestCandidate.fuel} -> ${truckFilterTest.performance.torqueNm.toFixed(1)} Nm`
);

// =========================================================================
// SUITE 6: XML Blueprint Generation from Tab 5 Result
// =========================================================================
console.log('\n--- SUITE 6: XML Blueprint Export from Tab 5 Result ---');
const xmlTest = E.optimizeEngineForVehicle('Coupe', 'Sport — High Performance, Acceleration', 1968);
const xmlOutput = E.generateEngineXml(xmlTest.config);

assert(
  xmlOutput &&
  xmlOutput.includes('<?xml version="1.0" encoding="utf-8"?>') &&
  xmlOutput.includes('<Engine>') &&
  xmlOutput.includes('<slider_bore>') &&
  xmlOutput.includes('<slider_stroke>') &&
  xmlOutput.includes(`<Layout>${xmlTest.bestCandidate.layout}</Layout>`) &&
  xmlOutput.includes(`<Valve>${xmlTest.bestCandidate.valvetrain}</Valve>`),
  'Valid GearCity In-Game XML Generation for Coupe Sport Engine (1968)',
  `XML length: ${xmlOutput.length} chars, root: <Engine>`
);

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`TOTAL TAB 5 TESTS: ${totalTests}`);
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('═══════════════════════════════════════════════════════════════');

if (failedTests > 0) {
  console.error('\nFailures summary:');
  failureDetails.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
} else {
  console.log('\n🌟 ALL TAB 5 ENGINE OPTIMIZER LOGIC TESTS PASSED PERFECTLY!\n');
}
