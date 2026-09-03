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
// Test 6: Vehicle Designer Sliders & XML Generation
// -------------------------------------------------------------
console.log('\n--- TEST 6: Vehicle Designer Sliders & XML Generation ---');

// 1. Sedan Baseline
const sedanSliders = E.calculateVehicleSliders('Sedan', 1960);
assert(
  sedanSliders && sedanSliders.designFocus && sedanSliders.interior && sedanSliders.materials && sedanSliders.testing,
  'calculateVehicleSliders returns complete 4-category slider breakdown for Sedan',
  `Demographics: ${sedanSliders.demographics.gender}, Wealth: ${sedanSliders.demographics.wealthLabel}`
);

// 2. Luxury Sedan vs Pickup Truck Goal-Weighted Contrast
const luxSliders = E.calculateVehicleSliders('Luxury Sedan', 1960);
const truckSliders = E.calculateVehicleSliders('Pickup Truck', 1960);
const microSliders = E.calculateVehicleSliders('Microcar', 1960);

assert(
  luxSliders.designFocus.luxury >= 90.0 &&
  luxSliders.interior.luxury >= 92.0 &&
  luxSliders.materials.interiorQuality >= 90.0 &&
  luxSliders.materials.paintQuality >= 90.0,
  'Luxury Sedan Design Focus, Interior Luxury, and Materials are premium grade (>= 90%)',
  `Focus Lux: ${luxSliders.designFocus.luxury}%, Int Lux: ${luxSliders.interior.luxury}%, Int Qual: ${luxSliders.materials.interiorQuality}%, Paint: ${luxSliders.materials.paintQuality}%`
);

assert(
  luxSliders.predictedRatings &&
  luxSliders.predictedRatings.luxury >= 95.0 &&
  luxSliders.predictedRatings.quality >= 90.0 &&
  luxSliders.predictedRatings.safety >= 85.0 &&
  luxSliders.predictedRatings.hyperIndex === 'Premium Prestige',
  'Luxury Sedan predicted in-game ratings achieve elite tier (Lux >= 95%, Qual >= 90%, Safe >= 85%)',
  `Predicted Lux: ${luxSliders.predictedRatings.luxury}%, Qual: ${luxSliders.predictedRatings.quality}%, Safe: ${luxSliders.predictedRatings.safety}%, Tier: ${luxSliders.predictedRatings.hyperIndex}`
);

assert(
  truckSliders.designFocus.cargo >= 80.0 &&
  truckSliders.testing.utility >= 85.0 &&
  truckSliders.designFocus.luxury <= 35.0 &&
  truckSliders.predictedRatings.hyperIndex === 'Cost Optimized',
  'Pickup Truck Prioritizes Cargo & Utility Over Luxury with Cost-Optimized hyperIndex',
  `Cargo Focus: ${truckSliders.designFocus.cargo}%, Utility Test: ${truckSliders.testing.utility}%, Tier: ${truckSliders.predictedRatings.hyperIndex}`
);

assert(
  microSliders.testing.fuelEconomy >= 75.0 &&
  microSliders.testing.performance <= 30.0 &&
  microSliders.predictedRatings.hyperIndex === 'Cost Optimized',
  'Microcar Prioritizes Fuel Economy Testing with Cost-Optimized hyperIndex',
  `Fuel Test: ${microSliders.testing.fuelEconomy}%, Perf Test: ${microSliders.testing.performance}%, Tier: ${microSliders.predictedRatings.hyperIndex}`
);

// 3. XML Blueprint Export
const sedanXml = E.generateVehicleXml(sedanSliders);
assert(
  sedanXml &&
  sedanXml.includes('<Car>') &&
  sedanXml.includes('</Car>') &&
  sedanXml.includes('<Scroll_InteriorStyle>') &&
  sedanXml.includes('<Scroll_MatPaintQual>') &&
  sedanXml.includes('<Scroll_DesignSafety>') &&
  sedanXml.includes('<DemoWealth>') &&
  sedanXml.includes('<Scroll_TestReli>'),
  'generateVehicleXml produces valid GearCity SavedSliders XML blueprint with exact in-game tags',
  `XML length: ${sedanXml.length} chars, Root: <Car>`
);

// 4. Test all 30 vehicle classes for valid slider ranges (0-100%) and valid XML
let allVehiclesValid = true;
const classes = DATA.vehicleClasses.map(v => v.carType);
for (const vClass of classes) {
  const vs = E.calculateVehicleSliders(vClass, 1960);
  const xml = E.generateVehicleXml(vs);
  if (!xml.includes('<Car>') || !xml.includes('</Car>')) {
    allVehiclesValid = false;
  }
  for (const cat of ['designFocus', 'interior', 'materials', 'testing']) {
    for (const [key, val] of Object.entries(vs[cat])) {
      if (typeof val === 'number' && (val < 0 || val > 100)) {
        allVehiclesValid = false;
      }
    }
  }
}
assert(
  allVehiclesValid,
  'All 30 Vehicle Classes generate valid, bounded (0-100%) sliders and XML blueprints with <Car>',
  `Checked ${classes.length} classes`
);

// -------------------------------------------------------------
// TEST 7: Canonical Demographic Profiling & Wealth Synchronization
// -------------------------------------------------------------
console.log('\n--- TEST 7: Canonical Demographic Profiling & Wealth Synchronization ---');

const luxDemo = E.evaluateDemographics('Luxury Sedan');
assert(
  luxDemo &&
  luxDemo.bestAge === 'Greater Than 55' &&
  luxDemo.wealthTier === 5 &&
  luxDemo.bonuses.some(b => b.stat === 'Luxury') &&
  luxDemo.bonuses.some(b => b.stat === 'Quality') &&
  luxDemo.recommendedTesting >= 90.0,
  'Luxury Sedan Demographic targets Greater Than 55 and Wealth 5 with active Luxury & Quality bonuses',
  `Age: ${luxDemo.bestAge}, Wealth: ${luxDemo.wealthLabel} (Tier ${luxDemo.wealthTier}), Rec Test: ${luxDemo.recommendedTesting}%`
);

const superDemo = E.evaluateDemographics('Supercar');
assert(
  superDemo &&
  superDemo.bestAge === '35-55' &&
  superDemo.bestGender === 'Male' &&
  superDemo.bonuses.some(b => b.stat === 'Performance') &&
  superDemo.bonuses.some(b => b.stat === 'Power'),
  'Supercar Demographic targets Male 35-55 with active Performance & Power bonuses',
  `Gender: ${superDemo.bestGender}, Age: ${superDemo.bestAge}, Wealth: ${superDemo.wealthLabel}`
);

const luxXml = E.generateVehicleXml(luxSliders);
assert(
  luxXml.includes('<DemoAge>3</DemoAge>') &&
  luxXml.includes('<DemoWealth>5</DemoWealth>') &&
  luxXml.includes('<Scroll_TestDemo>93.3</Scroll_TestDemo>'),
  'Luxury Sedan XML blueprint contains canonical DemoAge 3 (Greater Than 55), DemoWealth 5, and 93.3% testing slider',
  'XML demographic tags match canonical in-game targeting enums'
);

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
