// Automated Unit & Integration Tests for Vehicle Assembly & Synergy Evaluation Suite
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
console.log('    VEHICLE ASSEMBLY & SYNERGY EVALUATION TEST SUITE');
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

// -------------------------------------------------------------
// Test 1: Direct assembleVehicleRatings with Mock Components
// -------------------------------------------------------------
console.log('--- TEST 1: Direct assembleVehicleRatings Math Verification ---');
const mockComponents = {
  chassis: { performance: 65, comfort: 25, strength: 45, durability: 55, weightKg: 200, overall: 47.5 },
  engine: { powerRating: 70, torqueRating: 60, smoothness: 50, fuelEconomy: 80, dependability: 75, overall: 67.0 },
  gearbox: { performance: 80, comfort: 15, reliability: 50, power: 55, fuelEconomy: 50, overall: 50.0 },
};

const ratings = E.assembleVehicleRatings(mockComponents);
console.log('Assembled Ratings output:', ratings);

assert(ratings.performance > 0 && ratings.performance <= 100, 'Performance Rating In Range (0-100)', `${ratings.performance}`);
assert(ratings.drivability > 0 && ratings.drivability <= 100, 'Drivability Rating In Range (0-100)', `${ratings.drivability}`);
assert(ratings.luxury > 0 && ratings.luxury <= 100, 'Luxury Rating In Range (0-100)', `${ratings.luxury}`);
assert(ratings.safety > 0 && ratings.safety <= 100, 'Safety Rating In Range (0-100)', `${ratings.safety}`);
assert(ratings.fuel > 0 && ratings.fuel <= 100, 'Fuel Economy In Range (0-100)', `${ratings.fuel}`);
assert(ratings.power > 0 && ratings.power <= 100, 'Power Rating In Range (0-100)', `${ratings.power}`);
assert(ratings.cargo > 0 && ratings.cargo <= 100, 'Cargo Rating In Range (0-100)', `${ratings.cargo}`);
assert(ratings.dependability > 0 && ratings.dependability <= 100, 'Dependability Rating In Range (0-100)', `${ratings.dependability}`);
assert(ratings.overall > 0 && ratings.overall <= 100, 'Overall Rating In Range (0-100)', `${ratings.overall}`);

// -------------------------------------------------------------
// Test 2: calculateVehicleTypeFit for Different Vehicle Classes
// -------------------------------------------------------------
console.log('\n--- TEST 2: calculateVehicleTypeFit for Multiple Archetypes ---');
const carTypesToTest = ['Sedan', 'Coupe', 'Microcar', 'Pickup Truck', 'Supercar', 'Van'];

for (const ct of carTypesToTest) {
  const fit = E.calculateVehicleTypeFit(ratings, ct);
  assert(fit.fitPercent >= 40 && fit.fitPercent <= 100, `Buyer Demand Fit for ${ct}`, `Fit: ${fit.fitPercent}%`);
}

// -------------------------------------------------------------
// Test 3: evaluateCompleteVehicle for All 30 Vehicle Classes @ 1960
// -------------------------------------------------------------
console.log('\n--- TEST 3: evaluateCompleteVehicle Across All 30 Vehicle Classes @ 1960 ---');
for (const vc of DATA.vehicleClasses) {
  const carType = vc.carType;
  const evalResult = E.evaluateCompleteVehicle(carType, 1960);

  assert(
    evalResult.fit && evalResult.fit.fitPercent > 0 && evalResult.ratings.overall > 0,
    `Complete Build: ${carType} @ 1960`,
    `Fit: ${evalResult.fit.fitPercent}% (Chassis: ${evalResult.chassisConcept}, Engine: ${evalResult.engineConcept}, Gearbox: ${evalResult.gearboxConcept}) -> Overall: ${evalResult.ratings.overall}`
  );
}

// -------------------------------------------------------------
// Test 4: Concept Overrides Integration in evaluateCompleteVehicle
// -------------------------------------------------------------
console.log('\n--- TEST 4: Concept Overrides in evaluateCompleteVehicle ---');
const baseSedan = E.evaluateCompleteVehicle('Sedan', 1960);
const sportSedan = E.evaluateCompleteVehicle('Sedan', 1960, {
  chassisConcept: 'Sport',
  engineConcept: 'Sport',
  gearboxConcept: 'Sport',
});

assert(
  sportSedan.ratings.performance > baseSedan.ratings.performance,
  'Sport Concept Override Increases Performance',
  `Base Sedan Perf: ${baseSedan.ratings.performance} vs Sport Sedan Perf: ${sportSedan.ratings.performance}`
);

// -------------------------------------------------------------
// Test 5: Decade Progression of Complete Vehicle Fit
// -------------------------------------------------------------
console.log('\n--- TEST 5: Complete Vehicle Decade Progression (1900 to 2020) ---');
for (const yr of [1900, 1920, 1940, 1960, 1980, 2000, 2020]) {
  const r = E.evaluateCompleteVehicle('Coupe', yr);
  assert(
    r.fit.fitPercent >= 50,
    `Coupe Assembly Fit @ Year ${yr}`,
    `Fit: ${r.fit.fitPercent}%, Perf: ${r.ratings.performance}, Overall: ${r.ratings.overall}`
  );
}

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`TOTAL ASSEMBLY TESTS: ${totalTests}`);
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failedTests > 0) {
  process.exit(1);
}
