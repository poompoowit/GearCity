if (typeof GEARCITY_DATA === 'undefined') {
  if (typeof globalThis !== 'undefined' && !globalThis.GEARCITY_DATA && typeof require !== 'undefined') {
    try { globalThis.GEARCITY_DATA = require('./data.js'); } catch (e) {}
  }
}

const GearCityEngine = (() => {
  let activeVersion = 'v2';

  function setVersion(version) {
    activeVersion = (version === 'v1' ? 'v1' : 'v2');
    return activeVersion;
  }

  function getVersion() {
    return activeVersion;
  }

  function getActiveData(ver) {
    const v = ver || activeVersion;
    let dataObj = typeof GEARCITY_DATA !== 'undefined' ? GEARCITY_DATA : null;
    if (!dataObj && typeof global !== 'undefined' && global.GEARCITY_DATA) {
      dataObj = global.GEARCITY_DATA;
    }
    if (!dataObj && typeof window !== 'undefined' && window.GEARCITY_DATA) {
      dataObj = window.GEARCITY_DATA;
    }
    if (!dataObj && typeof require !== 'undefined') {
      try {
        dataObj = require('./data.js');
      } catch (e) {}
    }
    if (dataObj && typeof dataObj.getData === 'function') {
      return dataObj.getData(v);
    }
    return dataObj || {};
  }

  const BASE_YEAR_1899 = 1899;
  const MAX_YEAR_LIMIT = 2050;
  const DEFAULT_ENGINE_SKILL = 100.0;
  const DEFAULT_DESIGN_RANDOM_VAL = 1.0;

  function calculateYearFactors(year) {
    const ay = year - BASE_YEAR_1899;
    const ex_year50 = year > 2020 ? 0.901037361 : Math.pow(0.996, MAX_YEAR_LIMIT - year);
    return {
      year,
      adjustedYear: ay,
      ex_0d996p_year50R: ex_year50,
      ex_1d0024p_year99: Math.pow(1.0024, ay),
      ex_1d0035p_year99: Math.pow(1.0035, ay),
      ex_1d005p_year99: Math.pow(1.005, ay),
      ex_1d006p_year99: Math.pow(1.006, ay),
      ex_1d008p_year99: Math.pow(1.008, ay),
      ex_1d025p_year99: Math.pow(1.025, ay),
      ex_1d033p_year99: Math.pow(1.033, ay),
      ex_1d038p_year99: Math.pow(1.038, ay),
      ex_1d04p_year99: Math.pow(1.04, ay),
      ex_1d0023p_year99: Math.pow(1.0023, ay),
      ex_1d003p_year99: Math.pow(1.003, ay),
      ex_1d004p_year99: Math.pow(1.004, ay),
      ex_1d0051p_year99: Math.pow(1.0051, ay),
      ex_1d007p_year99: Math.pow(1.007, ay),
      ex_1d01p_year99: Math.pow(1.01, ay),
      ex_1d03p_year99: Math.pow(1.03, ay),
      ex_1d035p_year99: Math.pow(1.035, ay),
      ex_1d039p_year99: Math.pow(1.039, ay),
      ex_1d05p_year99: Math.pow(1.05, ay),
      ex_1d0105p_year99: Math.pow(1.0105, ay),
    };
  }

  function getWorldRates(year) {
    const events = GEARCITY_DATA.worldEvents;
    const match = events.find((e) => Number(e.year) === year);
    if (match) {
      return { interestRate: Number(match.interest_rate), carpriceRate: Number(match.carprice_rate) };
    }
    if (year < Number(events[0].year)) {
      return { interestRate: Number(events[0].interest_rate), carpriceRate: Number(events[0].carprice_rate) };
    }
    const latest = events[events.length - 1];
    return { interestRate: Number(latest.interest_rate), carpriceRate: Number(latest.carprice_rate) };
  }

  function getBoreStrokeLimits(layoutName, year) {
    const checkLayout = layoutName === 'Rotary' ? 'Radial' : layoutName;
    const sizes = GEARCITY_DATA.engineSizes;

    if (year % 5 === 0 || year > 2020) {
      const limitYear = year > 2020 ? 2020 : Math.floor(year / 5) * 5;
      const row = sizes.find((s) => s.Name === checkLayout && Number(s.Year) === limitYear);
      if (row) {
        return {
          minBore: Number(row.Min_Bore),
          maxBore: Number(row.Max_Bore),
          minStroke: Number(row.Min_Stroke),
          maxStroke: Number(row.Max_Stroke),
        };
      }
    }

    const limitYearMin = Math.floor(year / 5) * 5;
    const limitYearMax = (Math.floor(year / 5) + 1) * 5;
    const rowMin = sizes.find((s) => s.Name === checkLayout && Number(s.Year) === limitYearMin);
    const rowMax = sizes.find((s) => s.Name === checkLayout && Number(s.Year) === limitYearMax);

    if (!rowMin || !rowMax) {
      return { minBore: 50.0, maxBore: 150.0, minStroke: 50.0, maxStroke: 150.0 };
    }

    const minBoreMin = Number(rowMin.Min_Bore);
    const maxBoreMin = Number(rowMin.Max_Bore);
    const minStrokeMin = Number(rowMin.Min_Stroke);
    const maxStrokeMin = Number(rowMin.Max_Stroke);

    const minBoreMax = Number(rowMax.Min_Bore);
    const maxBoreMax = Number(rowMax.Max_Bore);
    const minStrokeMax = Number(rowMax.Min_Stroke);
    const maxStrokeMax = Number(rowMax.Max_Stroke);

    const factor = (5 - (year % 5)) * 0.2;
    return {
      minBore: minBoreMax + (minBoreMin - minBoreMax) * factor,
      maxBore: maxBoreMax + (maxBoreMin - maxBoreMax) * factor,
      minStroke: minStrokeMax + (minStrokeMin - minStrokeMax) * factor,
      maxStroke: maxStrokeMax + (maxStrokeMin - maxStrokeMax) * factor,
    };
  }

  function getValidValvetrains(layoutRow, year) {
    const valveType = Number(layoutRow.Valve);
    if (valveType === 1) return ['No Valve'];
    if (valveType === 3) return ['Poppet Valve', 'Sleeve Valve'];
    if (valveType === 2) {
      const valves = ['F Head', 'L Head', 'OHV', 'SOHC', 'T Head', 'Two Stroke'];
      if (year >= 1904) valves.push('DOHC');
      return valves;
    }
    return ['OHV'];
  }

  function calculateComponentRatings(config, perf) {
    const sliders = config.sliders;
    const comp = config.components;
    const designSkill = config.designSkill != null ? Number(config.designSkill) : DEFAULT_ENGINE_SKILL;
    const skillFactor = Math.max(0, Math.min(100, designSkill)) / 100.0;

    const cylRow = GEARCITY_DATA.cylinders.find((c) => c.Name === comp.cylinders);
    const cylCount = cylRow ? Number(cylRow['Number of Cylinders']) : 4;
    const indRow = GEARCITY_DATA.induction.find((i) => i.Name === comp.induction);
    const indCost = indRow ? Number(indRow.Cost) : 1.0;

    // 1. Dependability (0 - 100%)
    const baseDep = 30.0 + (skillFactor * 40.0);
    const depFocusBonus = (sliders.designFocusDependability || 0.5) * 25.0;
    const techCompBonus = ((sliders.technologyComponents || 0.5) + (sliders.technologyMaterials || 0.5)) * 10.0;
    const indPenalty = (indCost - 1.0) * 8.0;
    const cylDepPenalty = Math.max(0, cylCount - 6) * 1.5;
    const dependability = Math.max(5.0, Math.min(99.0, baseDep + depFocusBonus + techCompBonus - indPenalty - cylDepPenalty));

    // 2. Power & Acceleration Rating (0 - 100%)
    const specificOutput = perf.displacementCc > 0 ? (perf.horsepower / (perf.displacementCc / 1000.0)) : 0;
    const basePower = (specificOutput / 1.2) * (0.6 + 0.4 * skillFactor);
    const powerFocusBonus = (sliders.designFocusPerformance || 0.5) * 20.0 + (sliders.performanceRevolutions || 0.5) * 15.0;
    const powerRating = Math.max(5.0, Math.min(99.0, basePower + powerFocusBonus));

    // 3. Smoothness / Luxury Rating (0 - 100%)
    let balanceBase = 40.0;
    if ([6, 8, 12, 16].includes(cylCount)) balanceBase = 65.0;
    else if ([4, 5, 10].includes(cylCount)) balanceBase = 50.0;
    else balanceBase = 25.0;
    const smoothSkillBonus = skillFactor * 25.0;
    const smoothFocusBonus = (sliders.designFocusDependability || 0.5) * 10.0 - ((sliders.performanceRevolutions || 0.5) * 10.0);
    const smoothness = Math.max(5.0, Math.min(99.0, balanceBase + smoothSkillBonus + smoothFocusBonus));

    // 4. Fuel Economy Rating (0 - 100%)
    const dispPenalty = Math.min(45.0, (perf.displacementCc / 150.0));
    const ecoBonus = ((sliders.designFocusFuelEconomy || 0.5) + (sliders.performanceFuelEconomy || 0.5)) * 25.0;
    const ecoSkillBonus = skillFactor * 20.0;
    const fuelEconomy = Math.max(5.0, Math.min(99.0, 75.0 - dispPenalty + ecoBonus + ecoSkillBonus));

    // Overall Rating (Composite)
    const overall = (dependability * 0.30) + (powerRating * 0.25) + (smoothness * 0.25) + (fuelEconomy * 0.20);

    return {
      dependability: Math.round(dependability * 10) / 10,
      power: Math.round(powerRating * 10) / 10,
      smoothness: Math.round(smoothness * 10) / 10,
      fuelEconomy: Math.round(fuelEconomy * 10) / 10,
      overall: Math.round(overall * 10) / 10,
    };
  }

  function calculatePerformance(config) {
    const year = config.year;
    const comp = config.components;
    const sliders = config.sliders;
    const yf = calculateYearFactors(year);
    const rates = getWorldRates(year);

    const layoutRow = GEARCITY_DATA.layouts.find((l) => l.Name === comp.layout);
    const cylinderRow = GEARCITY_DATA.cylinders.find((c) => c.Name === comp.cylinders);
    const fuelRow = GEARCITY_DATA.fuel.find((f) => f.Name === comp.fuel);
    const inductionRow = GEARCITY_DATA.induction.find((i) => i.Name === comp.induction);
    const valveRow = GEARCITY_DATA.valvetrain.find((v) => v.Name === comp.valve);

    if (!layoutRow || !cylinderRow || !fuelRow || !inductionRow || !valveRow) {
      throw new Error('Invalid component combination');
    }

    const layoutPower = Number(layoutRow.Power);
    const layoutLength = Number(layoutRow.Length);
    const layoutWidth = Number(layoutRow.Width);
    const layoutCost = Number(layoutRow.Costs);
    const layoutWeight = Number(layoutRow.Weight);
    const cylArrangement = Number(layoutRow['Cylinder Arrangement']);

    const cylinderPower = Number(cylinderRow.Power);
    const cylinderCount = Number(cylinderRow['Number of Cylinders']);
    const cylinderCost = Number(cylinderRow.Cost);
    const cylinderWeight = Number(cylinderRow.Weight);

    const fuelRpm = Number(fuelRow.RPM);
    const fuelPower = Number(fuelRow.Power);
    const fuelCost = Number(fuelRow.Cost);
    const fuelWeight = Number(fuelRow.Weight);

    const inductionPower = Number(inductionRow.Power);
    const inductionCost = Number(inductionRow.Cost);
    const inductionWeight = Number(inductionRow.Weight);

    const valveRpm = Number(valveRow.RPM);
    const valvePower = Number(valveRow.Power);
    const valveCost = Number(valveRow.Costs);
    const valveWeight = Number(valveRow.Weight);
    const valveSize = Number(valveRow.Size);

    // Bore & Stroke
    const limits = getBoreStrokeLimits(comp.layout, year);
    const boreMm = limits.minBore + ((limits.maxBore - limits.minBore) * (sliders.boreSlide / 1000.0));
    const strokeMm = limits.minStroke + ((limits.maxStroke - limits.minStroke) * (sliders.strokeSlide / 1000.0));

    // Displacement
    const displacementCc = 0.7854 * Math.pow(boreMm / 10.0, 2) * (strokeMm / 10.0) * cylinderCount;

    // Torque
    const designSkill = config.designSkill != null ? Number(config.designSkill) : DEFAULT_ENGINE_SKILL;
    let torque = 10.0 + (designSkill / 20.0) + (
      (
        (25.0 * ((sliders.performanceTorque - 0.4) * 1.5) * yf.ex_1d01p_year99)
        + (4.0 * (layoutLength + layoutWidth) * yf.ex_1d005p_year99)
        - (14.0 * (sliders.performanceFuelEconomy + sliders.designFocusFuelEconomy) * yf.ex_1d004p_year99)
        + (
          layoutPower * 5.0
          + cylinderPower * 13.0
          + fuelPower * 24.0
          + 100.0 * inductionPower
          + (5.0 * yf.ex_1d004p_year99 * sliders.designFocusPerformance)
          + 8.0 * (
            sliders.technologyComponents
            + sliders.technologyMaterials
            + sliders.technologyTechnologies
            + sliders.technologyTechniques
          )
        ) * yf.ex_1d0024p_year99
      )
    );

    torque = torque * ((cylinderCount * strokeMm * 0.93 * boreMm * 0.9) * 0.000027) + 5.0;

    if (year < 2050) {
      torque = torque * yf.ex_0d996p_year50R;
    }
    torque = torque * valvePower;

    // RPM
    let tmpAy = yf.adjustedYear;
    if (tmpAy > 80.0) {
      tmpAy = 80.0 + ((yf.adjustedYear - 80.0) / 5.0);
    }

    let rpm = (
      (
        (Math.pow(tmpAy, 4) * 0.00000420875)
        - (19.0 * Math.pow(tmpAy, 3) * 0.00016835)
        + (427.0 * Math.pow(tmpAy, 2) * 0.00126)
        + (1315.0 * tmpAy * 0.01515)
        + 620.0
      )
      + (265.0 * yf.ex_1d01p_year99 * sliders.designFocusPerformance)
      + (465.0 * yf.ex_1d0105p_year99 * (sliders.performanceRevolutions * 5.5))
      - (10.0 * yf.ex_1d01p_year99 * inductionPower)
      + (55.0 * yf.ex_1d005p_year99 * (1.0 - sliders.layoutWeight))
      - (30.0 * yf.ex_1d005p_year99 * (sliders.designFocusFuelEconomy + sliders.performanceFuelEconomy))
      + (25.0 * yf.ex_1d01p_year99 * sliders.technologyComponents)
      + (25.0 * yf.ex_1d01p_year99 * sliders.technologyMaterials)
      + (25.0 * yf.ex_1d01p_year99 * sliders.technologyTechnologies)
    ) * fuelRpm;

    rpm = rpm * valveRpm;
    rpm = rpm - ((rpm / 1.5) * (strokeMm / 221.136364));
    if (rpm < 25.0) rpm = 25.0;

    // HP
    const hp = (torque * rpm) / 5252.0;

    // Dimensions
    let length = 0;
    if (cylArrangement === 1) {
      length = (3.0 + (displacementCc / (47.3 + 277.0))) * layoutLength
        + (cylinderCount * (boreMm / 130.0))
        + (cylinderCount + (5.0 * (boreMm / 130.0)) + 2.0 * valveSize);
      length = length + (0.16 * length * sliders.layoutLength);
    } else if (cylArrangement < 0) {
      const bank = cylArrangement * -1.0;
      length = 3.0 + (0.039 * (boreMm * 2.0)) + 5.0 * sliders.layoutLength;
      length = length * bank;
    } else {
      const banks = cylArrangement === 0 ? 0.5 : (1.0 / cylArrangement);
      length = (4.0 + ((displacementCc * (banks * 2.0)) / (47.3 + 277.0))) * layoutLength
        + ((cylinderCount * banks) * (boreMm / 130.0))
        + ((cylinderCount * (banks * 2.0)) + (5.0 * (boreMm / 130.0)) + 2.0 * valveSize);
      length = length + (0.16 * length * sliders.layoutLength);
    }

    let width = (6.0 + (displacementCc / (57.3 + 302.0))) * layoutWidth
      + ((6.0 * (boreMm / 115.0)) + 5.0 * valveSize);
    width = width + (0.16 * width * sliders.layoutWidth);
    if (cylArrangement < -1) {
      const bank = 1.0 / (cylArrangement * -1.0);
      width = width * bank;
    }

    // Weight
    const avgWeightMult = (valveWeight + layoutWeight + fuelWeight + inductionWeight + cylinderWeight) / 5.0;
    let weight = 30.0
      + (55.0 * avgWeightMult)
      + (100.0 * (strokeMm / 80.0))
      + (
        ((length * 1.95 * width) / 80.0)
        + (
          40.0
          + (42.0 * (((sliders.layoutWidth + sliders.layoutLength) / 2.0) + 0.05))
          + ((15.0 + (15.0 * avgWeightMult)) * (sliders.layoutWeight + 0.1))
          - (15.0 * sliders.technologyMaterials)
          + (5.0 * inductionWeight)
          + (8.0 * (sliders.layoutWidth + sliders.layoutLength))
        ) * ((length * 1.78 * width) / 800.0)
      )
      + ((5.0 + (5.0 * cylinderWeight)) * cylinderCount);

    if (cylArrangement > 2) {
      weight = weight * (cylArrangement / 2.9);
    }

    const lengthCm = length * 2.54;
    const widthCm = width * 2.54;
    const weightKg = weight * 0.45359237;

    // Unit Cost
    const sliderLayoutDisp = (sliders.boreSlide + sliders.strokeSlide) / 1000.0;
    let unitCost = (
      (
        (
          (
            (70.0 * yf.ex_1d01p_year99 * (((1.0 - sliders.layoutLength) + (1.0 - sliders.layoutWidth)) / 2.0))
            + (
              220.0 * yf.ex_1d004p_year99 * (
                ((0.25 + Math.pow(sliders.performanceRevolutions, 2) + Math.pow(sliders.performanceTorque, 2)) / 2.0)
                - (0.5 - Math.pow(sliders.performanceFuelEconomy, 2))
              )
            )
            + (60.0 * yf.ex_1d01p_year99) * (Math.pow(sliders.performanceRevolutions, 2) + Math.pow(sliders.performanceTorque, 2))
            + 220.0 * yf.ex_1d008p_year99 * (
              0.1 + (
                Math.pow(sliders.technologyMaterials, 2)
                + Math.pow(sliders.technologyTechniques, 2)
                + Math.pow(sliders.technologyComponents, 2)
              )
            )
            + 170.0 * yf.ex_1d008p_year99 * Math.pow(sliders.technologyTechnologies, 2)
            + 50.0 * yf.ex_1d0035p_year99 * Math.pow(sliders.designFocusDependability, 2)
            + 180.0 * yf.ex_1d0035p_year99 * Math.pow(sliders.designFocusPerformance, 2)
            + (
              260.0 * yf.ex_1d006p_year99 * (
                2.168 * Math.pow(sliderLayoutDisp, 1.5)
                - 4.44 * Math.pow(sliderLayoutDisp, 3)
                + 2.646 * Math.pow(sliderLayoutDisp, 4.5)
                + 3.126 * Math.pow(sliderLayoutDisp, 6)
              )
              + (
                70.0 * yf.ex_1d005p_year99 * (cylinderCount / 6.0)
                + (0.75 + Math.pow(sliderLayoutDisp, 1.5))
                - Math.pow(sliders.layoutWeight, 2)
              )
              + 10.0 * Math.pow(sliders.designFocusFuelEconomy, 2)
              - 50.0
            ) * yf.ex_1d003p_year99
            + Math.pow(160.0 * cylinderCost, yf.ex_1d003p_year99)
            + Math.pow(120.0 * layoutCost, yf.ex_1d004p_year99)
            + Math.pow(140.0 * valveCost, yf.ex_1d004p_year99)
            + Math.pow(435.0 * inductionCost, yf.ex_1d004p_year99)
            + Math.pow(120.0 * fuelCost, yf.ex_1d004p_year99)
          ) * (0.125 + 0.12 * cylinderCount)
        ) * (rates.interestRate / 2.0)
      ) + 50.0
    ) * rates.carpriceRate * DEFAULT_DESIGN_RANDOM_VAL;

    const hyperSliders = (
      (sliderLayoutDisp * 2.0 + (1.0 - sliders.layoutLength) + (1.0 - sliders.layoutWidth) + (1.0 - sliders.layoutWeight))
      + (sliders.performanceRevolutions + sliders.performanceTorque + sliders.performanceFuelEconomy)
      + (sliders.designFocusPerformance + sliders.designFocusFuelEconomy + sliders.designFocusDependability)
      + (sliders.technologyMaterials + sliders.technologyComponents + sliders.technologyTechniques + sliders.technologyTechnologies)
    ) / 13.0;

    const hyperCosts = 475.0 * yf.ex_1d04p_year99 * Math.pow(hyperSliders, 4);
    unitCost = unitCost + hyperCosts - ((unitCost / 10.0) * (designSkill / 100.0));

    const ratings = calculateComponentRatings(config, {
      displacementCc,
      boreMm,
      strokeMm,
      torqueFtLb: torque,
      torqueNm: torque * 1.3558,
      rpm,
      horsepower: hp,
      lengthCm,
      widthCm,
      weightKg,
      unitCost,
    });

    return {
      displacementCc,
      boreMm,
      strokeMm,
      torqueFtLb: torque,
      torqueNm: torque * 1.3558,
      rpm,
      horsepower: hp,
      lengthCm,
      widthCm,
      weightKg,
      unitCost,
      ratings,
      designSkill,
    };
  }

  /**
   * Ultra-Fast (< 50ms) Guided 2-Pass Optimizer
   */
  function optimizeEngine(yearOrOptions, constraints = {}) {
    let year = yearOrOptions;
    if (typeof yearOrOptions === 'object' && yearOrOptions !== null) {
      constraints = yearOrOptions;
      year = Number(constraints.year) || 1960;
    }
    const startTime = performance.now();
    const maxCost = constraints.maxCost != null && !isNaN(constraints.maxCost) ? Number(constraints.maxCost) : null;
    const maxCc = constraints.maxCc != null && !isNaN(constraints.maxCc) ? Number(constraints.maxCc) : null;
    const maxWeight = constraints.maxWeight != null && !isNaN(constraints.maxWeight) ? Number(constraints.maxWeight) : null;
    const maxLength = constraints.maxLength != null && !isNaN(constraints.maxLength) ? Number(constraints.maxLength) : null;
    const maxWidth = constraints.maxWidth != null && !isNaN(constraints.maxWidth) ? Number(constraints.maxWidth) : null;
    const focus = constraints.focus || 'HP';
    const effectiveMaxRatio = (focus === 'Torque' && constraints.maxHpTorqueRatio != null && !isNaN(constraints.maxHpTorqueRatio)) ? Number(constraints.maxHpTorqueRatio) : null;
    const allowedLayouts = constraints.allowedLayouts && constraints.allowedLayouts.length > 0 ? constraints.allowedLayouts : null;
    const allowedCylinders = constraints.allowedCylinders && constraints.allowedCylinders.length > 0 ? constraints.allowedCylinders : null;
    const allowedFuels = constraints.allowedFuels && constraints.allowedFuels.length > 0 ? constraints.allowedFuels : null;
    const allowedInductions = constraints.allowedInductions && constraints.allowedInductions.length > 0 ? constraints.allowedInductions : null;
    const allowedValves = constraints.allowedValves && constraints.allowedValves.length > 0 ? constraints.allowedValves : null;

    // 1. Gather all valid unlocked components (respecting year and manual overrides)
    const validLayouts = GEARCITY_DATA.layouts.filter((l) => (Number(l.Year) <= year && (!allowedLayouts || allowedLayouts.includes(l.Name))));
    const validCylinders = GEARCITY_DATA.cylinders.filter((c) => (Number(c.Year) <= year && (!allowedCylinders || allowedCylinders.includes(c.Name))));
    const validFuels = GEARCITY_DATA.fuel.filter((f) => (Number(f.Year) <= year && (!allowedFuels || allowedFuels.includes(f.Name))));
    const validInductions = GEARCITY_DATA.induction.filter((i) => (Number(i.Year) <= year && (!allowedInductions || allowedInductions.includes(i.Name))));
    const validValves = GEARCITY_DATA.valvetrain.filter((v) => (Number(v.Year) <= year && (!allowedValves || allowedValves.includes(v.Name))));

    const candidateComponents = [];

    for (const l of validLayouts) {
      const allowedCylNames = typeof l.Cylinders === 'string' ? JSON.parse(l.Cylinders) : l.Cylinders;
      const allowedFuelNames = typeof l['Fuel Types'] === 'string' ? JSON.parse(l['Fuel Types']) : l['Fuel Types'];
      const allowedIndNames = typeof l.Inductions === 'string' ? JSON.parse(l.Inductions) : l.Inductions;
      const validValveNames = getValidValvetrains(l, year);

      const lCyls = validCylinders.filter((c) => allowedCylNames.includes(c.Name));
      const lFuels = validFuels.filter((f) => allowedFuelNames.includes(f.Name));
      const lInds = validInductions.filter((i) => allowedIndNames.includes(i.Name));
      const lValves = validValves.filter((v) => validValveNames.includes(v.Name));

      for (const c of lCyls) {
        for (const f of lFuels) {
          for (const i of lInds) {
            for (const v of lValves) {
              candidateComponents.push({
                layout: l.Name,
                cylinders: c.Name,
                fuel: f.Name,
                induction: i.Name,
                valve: v.Name,
              });
            }
          }
        }
      }
    }

    function evaluatePenalty(res) {
      let penalty = 0.0;
      if (maxCost != null && res.unitCost > maxCost) {
        penalty += Math.pow(res.unitCost - maxCost, 2) * 5;
      }
      if (maxCc != null && res.displacementCc > maxCc) {
        penalty += Math.pow(res.displacementCc - maxCc, 2) * 5;
      }
      if (maxWeight != null && res.weightKg > maxWeight) {
        penalty += Math.pow(res.weightKg - maxWeight, 2) * 10;
      }
      if (maxLength != null && res.lengthCm > maxLength) {
        penalty += Math.pow(res.lengthCm - maxLength, 2) * 15;
      }
      if (maxWidth != null && res.widthCm > maxWidth) {
        penalty += Math.pow(res.widthCm - maxWidth, 2) * 15;
      }
      if (effectiveMaxRatio != null && res.horsepower > 0) {
        const actualRatio = res.torqueNm / res.horsepower;
        const RATIO_TOLERANCE = 0.05;
        if (actualRatio > effectiveMaxRatio + RATIO_TOLERANCE) {
          const hardExcess = actualRatio - (effectiveMaxRatio + RATIO_TOLERANCE);
          penalty += 50000.0 + hardExcess * 10000.0 + Math.pow(hardExcess, 2) * 50000.0;
        } else if (actualRatio > effectiveMaxRatio) {
          const softExcess = actualRatio - effectiveMaxRatio;
          penalty += Math.pow(softExcess, 2) * 500.0;
        }
      }
      return penalty;
    }

    // Pass 1: Quick screening across candidate component combinations
    const screened = [];
    const screenBores = [150, 400, 700];
    const screenStrokes = effectiveMaxRatio != null ? [0, 150, 400, 750] : [200, 500, 750];
    const screenRpms = effectiveMaxRatio != null ? [0.8, 1.0] : [0.8];
    const screenTorques = effectiveMaxRatio != null ? [0.4, 0.7] : [0.7];

    for (const comp of candidateComponents) {
      let bestCompScore = -Infinity;
      for (const sb of screenBores) {
        for (const ss of screenStrokes) {
          for (const sr of screenRpms) {
            for (const st of screenTorques) {
              const testConfig = {
                components: comp,
                sliders: {
                  boreSlide: sb,
                  strokeSlide: ss,
                  performanceTorque: st,
                  performanceRevolutions: sr,
                  performanceFuelEconomy: 0.0,
                  designFocusPerformance: 0.8,
                  designFocusFuelEconomy: 0.0,
                  designFocusDependability: 0.5,
                  layoutLength: 0.25,
                  layoutWidth: 0.25,
                  layoutWeight: 0.5,
                  technologyMaterials: 0.4,
                  technologyComponents: 0.0,
                  technologyTechnologies: 0.0,
                  technologyTechniques: 0.0,
                },
                year,
                name: constraints.modelName || `Engine_${year}`,
              };
              const res = calculatePerformance(testConfig, year);
              const score = (focus === 'Torque' ? res.torqueNm : res.horsepower) - evaluatePenalty(res);
              if (score > bestCompScore) {
                bestCompScore = score;
              }
            }
          }
        }
      }
      screened.push({ comp, initialScore: bestCompScore });
    }

    screened.sort((a, b) => b.initialScore - a.initialScore);
    const topCandidates = screened.slice(0, 25).map((s) => s.comp);

    // Pass 2: Fine-grained slider search across top candidate architectures
    let bestScore = -Infinity;
    let bestConfig = null;
    let bestPerf = null;

    const boreSteps = [50, 200, 350, 500, 650, 800, 950];
    const strokeSteps = [0, 50, 150, 250, 400, 550, 700, 850, 1000];
    const torqueSteps = [0.3, 0.5, 0.7, 0.95];
    const rpmSteps = [0.65, 0.85, 1.0];
    const matSteps = [0.25, 0.5, 0.75];

    const designSkill = constraints.designSkill != null ? Number(constraints.designSkill) : DEFAULT_ENGINE_SKILL;

    for (const comp of topCandidates) {
      for (const b of boreSteps) {
        for (const s of strokeSteps) {
          for (const t of torqueSteps) {
            for (const r of rpmSteps) {
              for (const m of matSteps) {
                const sliders = {
                  boreSlide: b,
                  strokeSlide: s,
                  performanceTorque: t,
                  performanceRevolutions: r,
                  performanceFuelEconomy: constraints.performanceFuel != null ? constraints.performanceFuel / 100.0 : 0.0,
                  designFocusPerformance: 0.85,
                  designFocusFuelEconomy: 0.0,
                  designFocusDependability: constraints.designDependability != null ? constraints.designDependability / 100.0 : 0.5,
                  layoutLength: 0.2,
                  layoutWidth: 0.2,
                  layoutWeight: 0.5,
                  technologyMaterials: m,
                  technologyComponents: constraints.techComponent != null ? constraints.techComponent / 100.0 : 0.0,
                  technologyTechnologies: constraints.techTechnology != null ? constraints.techTechnology / 100.0 : 0.0,
                  technologyTechniques: constraints.techTechnique != null ? constraints.techTechnique / 100.0 : 0.0,
                };

                const testConfig = { components: comp, sliders, year, designSkill, name: constraints.modelName || `Engine_${year}` };
                const res = calculatePerformance(testConfig);
                const score = (focus === 'Torque' ? res.torqueNm : res.horsepower) - evaluatePenalty(res);

                if (score > bestScore) {
                  bestScore = score;
                  bestConfig = testConfig;
                  bestPerf = res;
                }
              }
            }
          }
        }
      }
    }

    // Pass 3: Micro-tuning around best candidate's bore & stroke
    if (bestConfig) {
      const baseBore = bestConfig.sliders.boreSlide;
      const baseStroke = bestConfig.sliders.strokeSlide;
      const fineBores = [Math.max(0, baseBore - 50), baseBore, Math.min(1000, baseBore + 50)];
      const fineStrokes = [
        Math.max(0, baseStroke - 60),
        Math.max(0, baseStroke - 30),
        baseStroke,
        Math.min(1000, baseStroke + 30),
        Math.min(1000, baseStroke + 60),
      ];

      for (const fb of fineBores) {
        for (const fs of fineStrokes) {
          const tunedSliders = { ...bestConfig.sliders, boreSlide: fb, strokeSlide: fs };
          const testConfig = { ...bestConfig, sliders: tunedSliders };
          try {
            const res = calculatePerformance(testConfig, year);
            const score = (focus === 'Torque' ? res.torqueNm : res.horsepower) - evaluatePenalty(res);
            if (score > bestScore) {
              bestScore = score;
              bestConfig = testConfig;
              bestPerf = res;
            }
          } catch (e) {}
        }
      }
    }

    const elapsedMs = performance.now() - startTime;
    const budgetExceeded = maxCost != null && bestPerf != null && bestPerf.unitCost > maxCost;
    const budgetExcess = budgetExceeded ? Math.round(bestPerf.unitCost - maxCost) : 0;

    return {
      config: bestConfig,
      performance: bestPerf,
      score: bestScore,
      elapsedMs: Math.round(elapsedMs * 10) / 10,
      budgetExceeded,
      budgetExcess,
      best: bestConfig ? {
        layout: bestConfig.components.layout,
        cylinders: bestConfig.components.cylinders,
        fuel: bestConfig.components.fuel,
        induction: bestConfig.components.induction,
        valvetrain: bestConfig.components.valve,
        performance: bestPerf,
      } : null,
    };
  }

  function generateEngineXml(config) {
    const comp = config.components;
    const sliders = config.sliders;
    const limits = getBoreStrokeLimits(comp.layout, config.year);
    const boreMm = limits.minBore + ((limits.maxBore - limits.minBore) * (sliders.boreSlide / 1000.0));
    const strokeMm = limits.minStroke + ((limits.maxStroke - limits.minStroke) * (sliders.strokeSlide / 1000.0));

    let cylindersTag = comp.cylinders;
    if (comp.layout === 'Single' || comp.cylinders === 'Cylinder') {
      cylindersTag = 'Single-Cylinder';
    } else if (comp.layout === 'Wankel' || comp.cylinders === 'Wankle') {
      cylindersTag = 'Single-Rotor';
    }

    return `<?xml version="1.0" encoding="utf-8"?>
<Engine>
  <slider_stroke>${strokeMm.toFixed(2)}</slider_stroke>
  <slider_bore>${boreMm.toFixed(2)}</slider_bore>
  <slider_length>${(sliders.layoutLength * 100.0).toFixed(1)}</slider_length>
  <slider_width>${(sliders.layoutWidth * 100.0).toFixed(1)}</slider_width>
  <slider_weight>${(sliders.layoutWeight * 100.0).toFixed(1)}</slider_weight>
  <slider_rpm>${(sliders.performanceRevolutions * 100.0).toFixed(1)}</slider_rpm>
  <slider_torq>${(sliders.performanceTorque * 100.0).toFixed(1)}</slider_torq>
  <slider_eco>${(sliders.performanceFuelEconomy * 100.0).toFixed(1)}</slider_eco>
  <slider_materials>${(sliders.technologyMaterials * 100.0).toFixed(1)}</slider_materials>
  <slider_techniques>${(sliders.technologyTechniques * 100.0).toFixed(1)}</slider_techniques>
  <slider_tech>${(sliders.technologyTechnologies * 100.0).toFixed(1)}</slider_tech>
  <slider_compoenents>${(sliders.technologyComponents * 100.0).toFixed(1)}</slider_compoenents>
  <slider_designperformance>${(sliders.designFocusPerformance * 100.0).toFixed(1)}</slider_designperformance>
  <slider_designfueleco>${(sliders.designFocusFuelEconomy * 100.0).toFixed(1)}</slider_designfueleco>
  <slider_designdependability>${(sliders.designFocusDependability * 100.0).toFixed(1)}</slider_designdependability>
  <DesignPace>50.0</DesignPace>
  <lay_transverse>${config.transverse ? '1' : '0'}</lay_transverse>
  <Cylinders>${cylindersTag}</Cylinders>
  <Layout>${comp.layout}</Layout>
  <Fueltype>${comp.fuel}</Fueltype>
  <Induction>${comp.induction}</Induction>
  <Valve>${comp.valve}</Valve>
</Engine>`;
  }

  function getChassisEraBenchmark(chassisName, year, ver) {
    const data = getActiveData(ver);
    let cd = data.chassisDesigns ? data.chassisDesigns[chassisName] : null;
    if (!cd && typeof GEARCITY_DATA !== 'undefined') {
      if (GEARCITY_DATA.chassisDesigns && GEARCITY_DATA.chassisDesigns[chassisName]) {
        cd = GEARCITY_DATA.chassisDesigns[chassisName];
      } else if (GEARCITY_DATA.v2?.chassisDesigns && GEARCITY_DATA.v2.chassisDesigns[chassisName]) {
        cd = GEARCITY_DATA.v2.chassisDesigns[chassisName];
      }
    }
    if (!cd) return null;

    const cat = cd.category || 'General';
    const yr = Math.max(1900, Math.min(2020, Number(year) || 1960));
    const decadeNum = Math.floor(yr / 10) * 10;
    const decadeKey = `${decadeNum}s`;
    const decadeData = data.decadeChassisBenchmarks[decadeKey] || data.decadeChassisBenchmarks['1960s'];
    const benchmark = decadeData[cat] || decadeData['General'];

    return {
      decade: decadeKey,
      category: cat,
      avgChassisKg: benchmark.avgChassisKg,
      chassisRangeKg: benchmark.chassisRangeKg,
      curbRangeKg: benchmark.curbRangeKg,
      recommendedFrame: benchmark.frame,
      recommendedDrivetrain: benchmark.drivetrain,
      notes: benchmark.notes,
    };
  }

  function generateChassisXml(config) {
    let dim = config.dimensions ? { ...config.dimensions } : { length: 50.0, width: 50.0, height: 50.0, weight: 50.0, engWidth: 50.0, engLength: 50.0 };
    const sus = config.suspensionTuning || { stability: 50.0, comfort: 50.0, performance: 50.0, braking: 50.0, durability: 50.0 };
    const de = config.designFocus || { performance: 50.0, control: 50.0, strength: 50.0, dependability: 50.0 };
    const tech = config.techSliders || { materials: 30.0, components: 30.0, techniques: 30.0, technology: 30.0 };
    const pace = config.designPace || 50.0;
    const frame = config.frameType || 'Ladder Frame';
    const drive = config.drivetrain || 'FR';
    const frSusp = config.frSuspension || 'Swing Axle';
    const rrSusp = config.rrSuspension || config.frSuspension || 'Swing Axle';

    return `<?xml version="1.0" encoding="utf-8"?>
<Chassis>
\t<FD_Length>${dim.length.toFixed(1)}</FD_Length>
\t<FD_Width >${dim.width.toFixed(1)}</FD_Width>
\t<FD_Height>${dim.height.toFixed(1)}</FD_Height>
\t<FD_Weight>${dim.weight.toFixed(1)}</FD_Weight>
\t<FD_ENG_Width>${dim.engWidth.toFixed(1)}</FD_ENG_Width>
\t<FD_ENG_Length>${dim.engLength.toFixed(1)}</FD_ENG_Length>
\t<SUS_Stability>${sus.stability.toFixed(1)}</SUS_Stability>
\t<SUS_Comfort>${sus.comfort.toFixed(1)}</SUS_Comfort>
\t<SUS_Performance>${sus.performance.toFixed(1)}</SUS_Performance>
\t<SUS_Braking>${sus.braking.toFixed(1)}</SUS_Braking>
\t<SUS_Durability>${sus.durability.toFixed(1)}</SUS_Durability>
\t<DE_Performance>${de.performance.toFixed(1)}</DE_Performance>
\t<DE_Control>${de.control.toFixed(1)}</DE_Control>
\t<DE_Str>${de.strength.toFixed(1)}</DE_Str>
\t<DE_Depend>${de.dependability.toFixed(1)}</DE_Depend>
\t<TECH_Materials>${tech.materials.toFixed(1)}</TECH_Materials>
\t<TECH_Compoenents>${(tech.components != null ? tech.components : 30.0).toFixed(1)}</TECH_Compoenents>
\t<TECH_Techniques>${(tech.techniques != null ? tech.techniques : 30.0).toFixed(1)}</TECH_Techniques>
\t<TECH_Tech>${(tech.technology != null ? tech.technology : 30.0).toFixed(1)}</TECH_Tech>
\t<DesignPace>${pace.toFixed(1)}</DesignPace>
\t<Frame_Type>${frame}</Frame_Type>
\t<Drivetrain>${drive}</Drivetrain>
\t<Fr_Suspension>${frSusp}</Fr_Suspension>
\t<Rr_Suspension>${rrSusp}</Rr_Suspension>
</Chassis>`;
  }

  function generateGearboxXml(config) {
    const gr = config.gearing || { loRatio: 50.0, hiRatio: 50.0, torqueInputRatio: 50.0, maxTorqueInput: 200.0 };
    const de = config.designFocus || { performance: 50.0, fuel: 50.0, dependability: 50.0, comfort: 50.0 };
    const tech = config.techSliders || { materials: 30.0, components: 30.0, techniques: 30.0, technology: 30.0 };
    const feat = config.features || { gears: 4, reverse: 1, overdrive: 0, limited: 0, transaxle: 0 };
    const pace = config.designPace || 50.0;
    const gbType = config.gearboxType || 'Manual';

    return `<?xml version="1.0" encoding="utf-8"?>
<Gearbox>
\t<LoRatio>${gr.loRatio.toFixed(1)}</LoRatio>
\t<HiRatio >${gr.hiRatio.toFixed(1)}</HiRatio>
\t<TorqueInputRatio>${gr.torqueInputRatio.toFixed(1)}</TorqueInputRatio>
\t<MaxTorqueInput>${gr.maxTorqueInput.toFixed(1)}</MaxTorqueInput>
\t<Tech_Material>${tech.materials.toFixed(1)}</Tech_Material>
\t<Tech_Parts>${(tech.components != null ? tech.components : 30.0).toFixed(1)}</Tech_Parts>
\t<Tech_Techniques>${(tech.techniques != null ? tech.techniques : 30.0).toFixed(1)}</Tech_Techniques>
\t<Tech_Tech>${(tech.technology != null ? tech.technology : 30.0).toFixed(1)}</Tech_Tech>
\t<de_performance>${de.performance.toFixed(1)}</de_performance>
\t<de_fuel>${de.fuel.toFixed(1)}</de_fuel>
\t<de_depend>${de.dependability.toFixed(1)}</de_depend>
\t<de_comfort>${de.comfort.toFixed(1)}</de_comfort>
\t<DesignPace>${pace.toFixed(1)}</DesignPace>
\t<Gears>${feat.gears || 4}</Gears>
\t<GearboxType>${gbType}</GearboxType>
\t<Reverse>${feat.reverse != null ? feat.reverse : 1}</Reverse>
\t<Overdrive>${feat.overdrive ? 1 : 0}</Overdrive>
\t<Limited>${feat.limited ? 1 : 0}</Limited>
\t<Transaxle>${feat.transaxle ? 1 : 0}</Transaxle>
</Gearbox>`;
  }

  const WEALTH_LEVELS = {
    'Lower': 1,
    'Working': 1,
    'Lower-Middle': 2,
    'Middle': 3,
    'Upper-Middle': 4,
    'Wealthy': 5,
    'Upper Class': 6,
    'Elite': 7,
  };

  /**
   * Simulate canonical GearCity in-game vehicle design ratings according to official wiki formulas
   * (gamemanual:gm_vehicles_design). Returns predicted in-game ratings for Luxury, Quality, Safety,
   * Dependability, Cargo, Performance, Drivability, and Overall Market Match.
   */
  function simulateWikiVehicleRatings(carType, year = 1960, sliders = {}, components = {}) {
    const p = (GEARCITY_DATA.vehicleProfiles && GEARCITY_DATA.vehicleProfiles[carType]) || {
      Performance: 0.5, Driveability: 0.5, Luxury: 0.5, Safety: 0.5, Fuel: 0.5, Power: 0.5, Cargo: 0.5, Dependability: 0.5
    };
    const data = getActiveData();
    const vc = (data.vehicleClasses && data.vehicleClasses.find(v => v.carType === carType)) ||
               (GEARCITY_DATA.vehicleClasses && GEARCITY_DATA.vehicleClasses.find(v => v.carType === carType)) || {};

    const wealthStr = vc.wealth || 'Middle';
    const wealthLevel = WEALTH_LEVELS[wealthStr] || 3;

    const df = sliders.designFocus || {};
    const it = sliders.interior || {};
    const mat = sliders.materials || {};
    const ts = sliders.testing || {};

    const s = (v, def = 50.0) => (v != null ? Number(v) : def) / 100.0;
    const clamp = (val, min = 1.0, max = 100.0) => Math.round(Math.max(min, Math.min(max, val)) * 10) / 10;

    // Component ratings defaults (or from components arg)
    const chassComf = components.chassisComfort != null ? components.chassisComfort / 100.0 : 0.75;
    const chassPerf = components.chassisPerf != null ? components.chassisPerf / 100.0 : 0.75;
    const chassDur = components.chassisDur != null ? components.chassisDur / 100.0 : 0.75;
    const chassStr = components.chassisStr != null ? components.chassisStr / 100.0 : 0.75;
    const gbComf = components.gearboxComf != null ? components.gearboxComf / 100.0 : 0.75;
    const gbPerf = components.gearboxPerf != null ? components.gearboxPerf / 100.0 : 0.75;
    const gbReliab = components.gearboxReliab != null ? components.gearboxReliab / 100.0 : 0.75;
    const engSmooth = components.engineSmooth != null ? components.engineSmooth / 100.0 : 0.75;
    const engReliab = components.engineReliab != null ? components.engineReliab / 100.0 : 0.75;

    // Skills assumed baseline
    const skill = 0.65;

    // 1. Rating_Luxury (Wiki)
    const rawLux = (7 * s(df.luxury)) + (7 * s(df.style)) +
      (4 * s(it.comfort)) + (4 * s(it.innovation)) + (8 * s(it.luxury)) + (4 * s(it.style)) + (3 * s(it.technology)) +
      (5 * s(mat.interiorQuality)) + (5 * s(ts.comfort)) + (3 * s(ts.utility)) +
      (15 * chassComf) + (8 * gbComf) + (10 * engSmooth) + (5 * 0.6) + (5 * gbComf) + (7 * skill) +
      (75 * p.Luxury * s(ts.demographics));
    const rLux = clamp(rawLux, 1.0, 100.0);

    // 2. Rating_Quality (Wiki)
    const rawQual = (10 * s(df.dependability)) + (5 * s(df.luxury)) + (5 * s(df.style)) +
      (5 * s(mat.techniques)) + (15 * s(mat.interiorQuality)) + (10 * s(mat.paintQuality)) +
      (10 * s(ts.reliability)) + (5 * s(ts.utility)) +
      (5 * gbReliab) + (5 * chassDur) + (5 * engReliab) + (20 * skill) +
      (75 * (wealthLevel / 15.0) * s(ts.demographics));
    const rQual = clamp(rawQual, 1.0, 100.0);

    // 3. Rating_Safety (Wiki)
    const rawSafe = (10 * s(df.safety)) + (10 * s(it.safety)) + (15 * chassStr) +
      (2 * s(it.technology)) + (2 * s(mat.techniques)) + (2 * s(mat.interiorQuality)) +
      (2 * s(mat.materialQuality)) + (2 * s(ts.reliability)) +
      (20 * 0.45) + (15 * skill) + (5 * 0.8) + (15 * chassStr) +
      (75 * p.Safety * s(ts.demographics));
    const rSafe = clamp(rawSafe, 1.0, 100.0);

    // 4. Rating_Dependability (Wiki)
    const rawDep = (20 * s(df.dependability)) + (5 * s(mat.materialQuality)) +
      (15 * s(ts.reliability)) + (5 * s(ts.utility)) +
      (15 * chassDur) + (5 * chassStr) + (10 * gbReliab) + (20 * engReliab) + (5 * engSmooth) +
      (75 * p.Dependability * s(ts.demographics));
    const rDep = clamp(rawDep, 1.0, 100.0);

    // 5. Rating_Cargo (Wiki)
    const rawCargo = (85 * Math.min(1.0, p.Cargo)) + (10 * s(df.cargo)) + (5 * s(ts.utility)) +
      (30 * p.Cargo * s(ts.demographics));
    const rCargo = clamp(rawCargo, 1.0, 100.0);

    // 6. Rating_Performance (Wiki)
    const rawPerf = (10 * chassPerf) + (45 * Math.min(1.0, p.Performance * 1.1)) +
      (15 * s(ts.performance)) + 5.0 + 5.0 + (5 * gbPerf) + 5.0 + 7.0 +
      (75 * p.Performance * s(ts.demographics));
    const rPerf = clamp(rawPerf, 1.0, 100.0);

    // 7. Rating_Drivability (Wiki)
    const rawDrive = (27 * chassPerf) + 6.0 + 6.0 - (5 * gbComf) + 30.0 + 12.0 +
      (12 * s(ts.performance)) - (2 * s(ts.comfort)) +
      (75 * p.Driveability * s(ts.demographics));
    const rDrive = clamp(rawDrive, 1.0, 100.0);

    // 8. Rating_Fuel_Economy
    const rFuel = clamp(15.0 + (p.Fuel * 60.0) + (s(ts.fuelEconomy) * 25.0), 1.0, 100.0);

    // 9. Overall Rating (Wiki: average of ratings and skills)
    const rOverall = clamp((rPerf + rDrive + rLux + rSafe + rFuel + (p.Power * 100.0) + rCargo + rQual + rDep + 75.0 + 75.0 + 75.0 + (skill * 100.0)) / 13.0, 1.0, 100.0);

    // 10. Rating_CarType (Wiki: Weighted importance match)
    const impWeights = [
      { r: rCargo, w: p.Cargo || 0.5 },
      { r: rDep, w: p.Dependability || 0.5 },
      { r: rDrive, w: p.Driveability || 0.5 },
      { r: rFuel, w: p.Fuel || 0.5 },
      { r: rLux, w: p.Luxury || 0.5 },
      { r: rPerf, w: p.Performance || 0.5 },
      { r: (p.Power * 100.0), w: p.Power || 0.5 },
      { r: rSafe, w: p.Safety || 0.5 },
    ];
    let num = 0, den = 0;
    for (const item of impWeights) {
      num += item.r * item.w * 3.0;
      den += 100.0 * item.w * 3.0;
    }
    const rCarType = den > 0 ? clamp((num / den) * 100.0, 1.0, 100.0) : 75.0;

    // Hyper-Cost Calculation
    const allVals = [
      df.style, df.luxury, df.safety, df.cargo, df.dependability,
      it.style, it.innovation, it.luxury, it.comfort, it.safety, it.technology,
      mat.materialQuality, mat.interiorQuality, mat.paintQuality, mat.techniques,
      ts.demographics, ts.performance, ts.fuelEconomy, ts.comfort, ts.utility, ts.reliability
    ].map(v => Number(v) || 50.0);
    const avgSlider = allVals.reduce((a, b) => a + b, 0) / allVals.length;
    const hyperIndex = avgSlider >= 72.0 ? 'Premium Prestige' : (avgSlider >= 55.0 ? 'Balanced' : 'Cost Optimized');

    return {
      luxury: rLux,
      quality: rQual,
      safety: rSafe,
      dependability: rDep,
      cargo: rCargo,
      performance: rPerf,
      drivability: rDrive,
      fuelEconomy: rFuel,
      overall: rOverall,
      carTypeMatch: rCarType,
      avgSlider: Math.round(avgSlider * 10) / 10,
      hyperIndex,
    };
  }

  /**
   * Automatically calculate optimal in-game Vehicle Designer sliders for a given vehicle class.
   * Uses canonical GearCity Wiki formula optimization (Simulated Wiki Rating Maximizer) to
   * maximize vehicle market rating while balancing hyperCosts against target wealth sensitivity.
   */
  function calculateVehicleSliders(carType, year = 1960, overrides = {}) {
    const data = getActiveData();
    const yr = Math.max(1900, Math.min(2020, Number(year) || 1960));
    const p = (GEARCITY_DATA.vehicleProfiles && GEARCITY_DATA.vehicleProfiles[carType]) || {
      Performance: 0.5, Driveability: 0.5, Luxury: 0.5, Safety: 0.5, Fuel: 0.5, Power: 0.5, Cargo: 0.5, Dependability: 0.5
    };
    const vc = (data.vehicleClasses && data.vehicleClasses.find(v => v.carType === carType)) ||
               (GEARCITY_DATA.vehicleClasses && GEARCITY_DATA.vehicleClasses.find(v => v.carType === carType)) || {};

    const demo = evaluateDemographics(carType) || { bestGender: 'Neutral', bestAge: '25-35' };
    const wealthStr = vc.wealth || 'Middle';
    const wealthLevel = WEALTH_LEVELS[wealthStr] || 3;
    const wFactor = (wealthLevel - 1) / 6.0; // 0.0 to 1.0
    const isPremium = (wealthLevel >= 5 || (p.Luxury && p.Luxury >= 0.65));

    const clamp = (val, min = 15.0, max = 98.0) => Math.round(Math.max(min, Math.min(max, val)) * 10) / 10;

    // 1. Design Focus Sliders (0 - 100%)
    const designFocus = {
      style: clamp(overrides.designStyle ?? (isPremium ? (70.0 + (p.Performance * 20.0) + (wFactor * 8.0)) : (25.0 + (p.Performance * 40.0) + (wFactor * 25.0)))),
      luxury: clamp(overrides.designLuxury ?? (isPremium ? (86.0 + (p.Luxury * 10.0)) : (15.0 + (p.Luxury * 65.0)))),
      safety: clamp(overrides.designSafety ?? (isPremium ? (78.0 + (p.Safety * 18.0)) : (20.0 + (p.Safety * 55.0) + (wFactor * 15.0)))),
      cargo: clamp(overrides.designCargo ?? (10.0 + (p.Cargo * 85.0))),
      dependability: clamp(overrides.designDependability ?? (isPremium ? (75.0 + (p.Dependability * 18.0)) : (25.0 + (p.Dependability * 55.0) + (wFactor * 15.0)))),
      designPace: clamp(overrides.designPace ?? 50.0, 20.0, 100.0),
    };

    // 2. Interior Sliders (0 - 100%)
    const interior = {
      style: clamp(overrides.interiorStyle ?? (isPremium ? (72.0 + (p.Performance * 18.0) + (wFactor * 8.0)) : (25.0 + (p.Performance * 35.0) + (wFactor * 25.0)))),
      innovation: clamp(overrides.interiorInnovation ?? (isPremium ? (82.0 + (wFactor * 12.0)) : (20.0 + (wFactor * 40.0) + (Math.max(0, yr - 1930) / 90.0 * 20.0)))),
      luxury: clamp(overrides.interiorLuxury ?? (isPremium ? (88.0 + (p.Luxury * 9.0)) : (15.0 + (p.Luxury * 55.0) + (wFactor * 25.0)))),
      comfort: clamp(overrides.interiorComfort ?? (isPremium ? (84.0 + (p.Driveability * 12.0)) : (20.0 + (p.Driveability * 40.0) + (p.Luxury * 25.0)))),
      safety: clamp(overrides.interiorSafety ?? (isPremium ? (78.0 + (p.Safety * 18.0)) : (20.0 + (p.Safety * 55.0) + (wFactor * 15.0)))),
      technology: clamp(overrides.interiorTechnology ?? (isPremium ? (82.0 + (wFactor * 12.0)) : (20.0 + (wFactor * 40.0) + (Math.max(0, yr - 1940) / 80.0 * 20.0)))),
    };

    // 3. Materials Sliders (0 - 100%)
    const materials = {
      materialQuality: clamp(overrides.materialQuality ?? (isPremium ? (82.0 + (wFactor * 12.0) + (p.Dependability * 5.0)) : (20.0 + (wFactor * 50.0) + (p.Dependability * 15.0)))),
      interiorQuality: clamp(overrides.interiorQuality ?? (isPremium ? (88.0 + (p.Luxury * 8.0)) : (20.0 + (wFactor * 45.0) + (p.Luxury * 25.0)))),
      paintQuality: clamp(overrides.paintQuality ?? (isPremium ? (86.0 + (p.Luxury * 8.0)) : (20.0 + (wFactor * 45.0) + (p.Luxury * 20.0)))),
      techniques: clamp(overrides.techniques ?? (isPremium ? (82.0 + (wFactor * 12.0) + (p.Dependability * 5.0)) : (25.0 + (wFactor * 45.0) + (p.Dependability * 15.0)))),
    };

    // 4. Demographics
    const demographics = {
      gender: overrides.gender || demo.bestGender || 'Neutral',
      wealth: overrides.wealth || String(wealthLevel),
      wealthLabel: wealthStr,
      age: overrides.age || demo.bestAge || (isPremium ? 'Greater Than 55' : '35-55'),
    };

    // 5. Testing Sliders (0 - 100%)
    const testing = {
      demographics: clamp(overrides.testDemographics ?? (demo.recommendedTesting || (isPremium ? (88.0 + (wFactor * 8.0)) : (65.0 + (wFactor * 20.0))))),
      performance: clamp(overrides.testPerformance ?? (20.0 + (p.Performance * 75.0))),
      fuelEconomy: clamp(overrides.testFuelEconomy ?? (15.0 + (p.Fuel * 80.0))),
      comfort: clamp(overrides.testComfort ?? (isPremium ? (84.0 + (p.Driveability * 12.0)) : (20.0 + (p.Driveability * 40.0) + (p.Luxury * 25.0)))),
      utility: clamp(overrides.testUtility ?? (15.0 + (p.Cargo * 75.0) + (p.Power * 10.0))),
      reliability: clamp(overrides.testReliability ?? (isPremium ? (82.0 + (p.Dependability * 14.0)) : (30.0 + (p.Dependability * 55.0) + (wFactor * 10.0)))),
    };

    const simulated = simulateWikiVehicleRatings(carType, yr, { designFocus, interior, materials, testing });

    return {
      carType,
      year: yr,
      demographics,
      designFocus,
      interior,
      materials,
      testing,
      predictedRatings: simulated,
    };
  }

  /**
   * Convert Vehicle configuration dictionary to GearCity SavedSliders XML blueprint string.
   * Matches exact in-game SavedSliders tag names and formatting as verified in archive/Car_sample.xml.
   */
  function generateVehicleXml(config) {
    const it = config.interior || {};
    const mat = config.materials || {};
    const df = config.designFocus || {};
    const dg = config.demographics || {};
    const ts = config.testing || {};

    const v = (val, def = 50.0) => (val != null ? Number(val) : def).toFixed(1);

    // Gender enum: 0 = Male, 1 = Female, 2 = Neutral
    let genderEnum = 2;
    if (dg.gender === 'Male' || dg.gender === 0 || dg.gender === '0') genderEnum = 0;
    else if (dg.gender === 'Female' || dg.gender === 1 || dg.gender === '1') genderEnum = 1;
    else if (dg.gender === 'Neutral' || dg.gender === 2 || dg.gender === '2') genderEnum = 2;

    // Age enum: 0 = Less Than 25, 1 = 25-35, 2 = 35-55, 3 = Greater Than 55
    let ageEnum = 2;
    if (dg.age === 'Less Than 25' || dg.age === 0 || dg.age === '<25' || dg.age === '0') ageEnum = 0;
    else if (dg.age === '25-35' || dg.age === 1 || dg.age === '1') ageEnum = 1;
    else if (dg.age === '35-55' || dg.age === 2 || dg.age === '2') ageEnum = 2;
    else if (dg.age === 'Greater Than 55' || dg.age === 3 || dg.age === '>55' || dg.age === '3') ageEnum = 3;

    // Wealth tier: integer 1 to 7 (default 4)
    let wealthVal = 4;
    if (dg.wealth != null) {
      const parsed = parseInt(dg.wealth, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 7) {
        wealthVal = parsed;
      }
    }

    return `\t<Car>
\t<Scroll_InteriorStyle>${v(it.style)}</Scroll_InteriorStyle>
\t<Scroll_InteriorInno>${v(it.innovation)}</Scroll_InteriorInno>
\t<Scroll_InteriorLux>${v(it.luxury)}</Scroll_InteriorLux>
\t<Scroll_InteriorComf>${v(it.comfort)}</Scroll_InteriorComf>
\t<Scroll_InteriorSafe>${v(it.safety)}</Scroll_InteriorSafe>
\t<Scroll_InteriorTech>${v(it.technology)}</Scroll_InteriorTech>
\t<Scroll_MatMatQual>${v(mat.materialQuality)}</Scroll_MatMatQual>
\t<Scroll_MatMatInterQual >${v(mat.interiorQuality)}</Scroll_MatMatInterQual>
\t<Scroll_MatPaintQual>${v(mat.paintQuality)}</Scroll_MatPaintQual>
\t<Scroll_MatManuTech>${v(mat.techniques)}</Scroll_MatManuTech>
\t<Scroll_DesignStyle>${v(df.style)}</Scroll_DesignStyle>
\t<Scroll_DesignLux>${v(df.luxury)}</Scroll_DesignLux>
\t<Scroll_DesignSafety>${v(df.safety)}</Scroll_DesignSafety>
\t<Scroll_DesignCargo>${v(df.cargo)}</Scroll_DesignCargo>
\t<Scroll_DesignDepend>${v(df.dependability)}</Scroll_DesignDepend>
\t<Scroll_TestDemo>${v(ts.demographics)}</Scroll_TestDemo>
\t<Scroll_TestPerform>${v(ts.performance)}</Scroll_TestPerform>
\t<Scroll_TestFuel>${v(ts.fuelEconomy)}</Scroll_TestFuel>
\t<Scroll_TestComf>${v(ts.comfort)}</Scroll_TestComf>
\t<Scroll_TestUtil>${v(ts.utility)}</Scroll_TestUtil>
\t<Scroll_TestReli>${v(ts.reliability)}</Scroll_TestReli>
\t<DesignPace>${v(df.designPace, 50.0)}</DesignPace>
\t<DemoGender>${genderEnum}</DemoGender>
\t<DemoAge>${ageEnum}</DemoAge>
\t<DemoWealth>${wealthVal}</DemoWealth>
\t</Car>
`;
  }

  const generateCarXml = generateVehicleXml;

  function evaluateDemographics(vehicleType) {
    const data = getActiveData();
    const profiles = GEARCITY_DATA.vehicleProfiles;
    const gMods = GEARCITY_DATA.genderModifiers;
    const aMods = GEARCITY_DATA.ageModifiers;
    const vc = (data.vehicleClasses && data.vehicleClasses.find(v => v.carType === vehicleType)) ||
               (GEARCITY_DATA.vehicleClasses && GEARCITY_DATA.vehicleClasses.find(v => v.carType === vehicleType)) || {};

    const wealthStr = vc.wealth || 'Middle';
    const wealthLevel = WEALTH_LEVELS[wealthStr] || 3;
    const wFactor = (wealthLevel - 1) / 6.0;

    const baseAttr = profiles[vehicleType];
    if (!baseAttr) return null;
    const attr = { ...baseAttr };
    // Quality importance in GearCity scales with buyer wealth tier
    attr.Quality = 0.40 + (wFactor * 0.50);

    let bestScore = -Infinity;
    let bestGender = 'Neutral';
    let bestAge = '35-55';
    const allScores = {};

    for (const [gName, gVal] of Object.entries(gMods)) {
      for (const [aName, aVal] of Object.entries(aMods)) {
        let score = 0;
        const allStats = new Set([...Object.keys(attr), ...Object.keys(gVal), ...Object.keys(aVal)]);
        for (const col of allStats) {
          const baseVal = attr[col] != null ? attr[col] : 0.5;
          const mod = 1.0 + (gVal[col] || 0) + (aVal[col] || 0);
          score += baseVal * mod;
        }
        allScores[`${gName} (${aName})`] = Math.round(score * 10000) / 10000;
        if (score > bestScore) {
          bestScore = score;
          bestGender = gName;
          bestAge = aName;
        }
      }
    }

    const bestG = gMods[bestGender] || {};
    const bestA = aMods[bestAge] || {};
    const bonuses = [];
    const penalties = [];
    const combinedStats = new Set([...Object.keys(bestG), ...Object.keys(bestA)]);
    for (const st of combinedStats) {
      const net = (bestG[st] || 0) + (bestA[st] || 0);
      if (net > 0) bonuses.push({ stat: st, delta: `+${net.toFixed(2)}` });
      else if (net < 0) penalties.push({ stat: st, delta: net.toFixed(2) });
    }

    const isPremium = (wealthLevel >= 5 || (baseAttr.Luxury && baseAttr.Luxury >= 0.65));
    const recommendedTesting = isPremium ? Math.round((88.0 + (wFactor * 8.0)) * 10) / 10 : Math.round((65.0 + (wFactor * 20.0)) * 10) / 10;

    return {
      vehicleType,
      bestGender,
      bestAge,
      wealthLabel: wealthStr,
      wealthTier: wealthLevel,
      recommendedTesting,
      bestScore: Math.round(bestScore * 10000) / 10000,
      bonuses,
      penalties,
      allScores,
    };
  }
  /**
   * Get full design advice for a vehicle type from the spreadsheet data.
   * Returns chassis, engine, and gearbox design concepts with year-aware components.
   */
  function getVehicleDesignAdvice(carType, year, ver) {
    const data = getActiveData(ver);
    const vc = data.vehicleClasses.find(v => v.carType === carType);
    if (!vc) return null;

    // Parse comma/slash-separated concepts into arrays
    const parseConcepts = (str) => str.split(/[,\/]/).map(s => s.trim()).filter(Boolean);

    const chassisConcepts = parseConcepts(vc.chassis);
    const engineConcepts = parseConcepts(vc.engineType);
    const gearConcepts = parseConcepts(vc.gear);

    // Look up each design concept
    const chassisDetails = chassisConcepts.map(c => {
      const cd = data.chassisDesigns[c];
      if (!cd) return { name: c, notFound: true };

      // Parse year-based component lines into {year, name} arrays
      const parseYearLines = (text) => {
        if (!text) return [];
        return text.split('\n').map(line => {
          const match = line.match(/^(\d{4})\s+(.+)$/);
          if (match) return { year: parseInt(match[1]), name: match[2].trim() };
          return { year: 0, name: line.trim() };
        });
      };

      // Filter components available by year
      const filterByYear = (items) => {
        return items.filter(item => item.year <= year || item.year === 0);
      };

      const frameOptions = parseYearLines(cd.frame);
      const drivetrainOptions = parseYearLines(cd.drivetrain);
      const suspensionOptions = parseYearLines(cd.suspension);

      return {
        name: c,
        maxEngine: cd.maxEngine,
        note: cd.note,
        ratings: cd.ratings,
        sliderValues: cd.sliderValues,
        dimensions: cd.dimensions,
        suspensionTuning: cd.suspensionTuning,
        designFocus: cd.designFocus,
        techSliders: cd.techSliders,
        frameAll: frameOptions,
        frameAvailable: filterByYear(frameOptions),
        drivetrainAll: drivetrainOptions,
        drivetrainAvailable: filterByYear(drivetrainOptions),
        suspensionAll: suspensionOptions,
        suspensionAvailable: filterByYear(suspensionOptions),
        eraBenchmark: getChassisEraBenchmark(c, year, ver),
      };
    });

    const engineDetails = engineConcepts.map(c => {
      const ed = data.engineDesigns[c];
      if (!ed) return { name: c, notFound: true };

      // Find cost target for the current year
      let costTarget = null;
      if (ed.costTargets) {
        const eras = Object.keys(ed.costTargets).map(Number).sort((a, b) => a - b);
        for (const era of eras) {
          if (year >= era) costTarget = ed.costTargets[String(era)];
        }
      }

      return { ...ed, costTarget };
    });

    const gearDetails = gearConcepts.map(c => {
      const gd = data.gearboxDesigns[c];
      if (!gd) return { name: c, notFound: true };

      const parseYearLines = (text) => {
        if (!text) return [];
        return text.split('\n').map(line => {
          const match = line.match(/^(\d{4})\s+(.+)$/);
          if (match) return { year: parseInt(match[1]), name: match[2].trim() };
          return { year: 0, name: line.trim() };
        });
      };

      const gearboxOptions = parseYearLines(gd.gearboxes);
      const available = gearboxOptions.filter(g => g.year <= year || g.year === 0);

      return {
        ...gd,
        gearboxAll: gearboxOptions,
        gearboxAvailable: available,
      };
    });

    return {
      vehicle: vc,
      chassisDetails,
      engineDetails,
      gearDetails,
    };
  }

  /**
   * Get optimizer-ready constraints from an Engine Design concept name.
   */
  function getEngineDesignConstraints(conceptName, year, ver) {
    const data = getActiveData(ver);
    let ed = data.engineDesigns ? data.engineDesigns[conceptName] : null;
    if (!ed && typeof GEARCITY_DATA !== 'undefined') {
      if (GEARCITY_DATA.engineDesigns && GEARCITY_DATA.engineDesigns[conceptName]) {
        ed = GEARCITY_DATA.engineDesigns[conceptName];
      } else if (GEARCITY_DATA.v2?.engineDesigns && GEARCITY_DATA.v2.engineDesigns[conceptName]) {
        ed = GEARCITY_DATA.v2.engineDesigns[conceptName];
      }
    }
    if (!ed) return null;

    let targetCost = null;
    if (ed.costTargets) {
      const eras = Object.keys(ed.costTargets).map(Number).sort((a, b) => a - b);
      for (const era of eras) {
        if (year >= era) targetCost = ed.costTargets[String(era)];
      }
    }

    let maxHpTorqueRatio = ed.optimizeFocus === 'HP' ? null : ed.maxHpTorqueRatio;
    if (maxHpTorqueRatio != null && year < 1930) {
      const eraDelta = Math.max(0, 1930 - year);
      maxHpTorqueRatio = Number((maxHpTorqueRatio + (eraDelta / 30.0) * 0.6).toFixed(2));
    }

    return {
      maxCost: targetCost,
      maxWeight: ed.maxWeight,
      maxHpTorqueRatio,
      focus: ed.optimizeFocus === 'HP' ? 'HP' : 'Torque',
      designDependability: ed.designDependability,
      performanceFuel: ed.performanceFuel,
      techComponent: ed.techComponent,
      techTechnology: ed.techTechnology,
      techTechnique: ed.techTechnique,
    };
  }

  /**
   * Optimize engine based on vehicle class and design concept requirements
   */
  function optimizeEngineForVehicle(carType, concept, year, customConstraints = {}, ver) {
    const defaultConstraints = getEngineDesignConstraints(concept, year, ver) || {};

    const constraints = {
      ...defaultConstraints,
      ...customConstraints,
      year: year,
      modelName: `${carType}_${concept ? concept.split(' ')[0] : 'Engine'}_${year}`,
    };

    if (customConstraints.engineBayLength != null && !isNaN(customConstraints.engineBayLength)) {
      constraints.maxLength = Number(customConstraints.engineBayLength) / 10.0;
    }
    if (customConstraints.engineBayWidth != null && !isNaN(customConstraints.engineBayWidth)) {
      constraints.maxWidth = Number(customConstraints.engineBayWidth) / 10.0;
    }
    if (customConstraints.preferredFuel && customConstraints.preferredFuel !== 'Any' && customConstraints.preferredFuel !== 'Any Available Fuel') {
      constraints.allowedFuels = [customConstraints.preferredFuel];
    }
    if (customConstraints.allowedLayouts && customConstraints.allowedLayouts.length > 0) {
      constraints.allowedLayouts = customConstraints.allowedLayouts;
    }
    if (customConstraints.allowedCylinders && customConstraints.allowedCylinders.length > 0) {
      constraints.allowedCylinders = customConstraints.allowedCylinders;
    }
    if (customConstraints.allowedInductions && customConstraints.allowedInductions.length > 0) {
      constraints.allowedInductions = customConstraints.allowedInductions;
    }
    if (customConstraints.allowedValves && customConstraints.allowedValves.length > 0) {
      constraints.allowedValves = customConstraints.allowedValves;
    }

    // Vehicle-Class Cylinder Floor:
    // Multi-passenger and cargo vehicles (Sedan, Coupe, Truck, Wagon, etc.) require at least 2 cylinders.
    // Single Cylinder is only permitted for subcompact classes, or if the user explicitly selected Single in custom filters.
    const SUBCOMPACT_CLASSES = ['Microcar', 'Microvan', 'Compact Car', 'Subcompact'];
    const isSubcompact = SUBCOMPACT_CLASSES.includes(carType);

    if (!isSubcompact) {
      const explicitlySelectedSingle = customConstraints.allowedCylinders &&
        customConstraints.allowedCylinders.length === 1 &&
        (customConstraints.allowedCylinders[0] === 'Cylinder' || customConstraints.allowedCylinders[0] === 'Single');

      if (!explicitlySelectedSingle) {
        if (!constraints.allowedCylinders || constraints.allowedCylinders.length === 0) {
          constraints.allowedCylinders = GEARCITY_DATA.cylinders
            .filter((c) => Number(c.Year) <= year && c.Name !== 'Cylinder')
            .map((c) => c.Name);
        } else {
          constraints.allowedCylinders = constraints.allowedCylinders.filter((c) => c !== 'Cylinder');
        }

        if (!constraints.allowedLayouts || constraints.allowedLayouts.length === 0) {
          constraints.allowedLayouts = GEARCITY_DATA.layouts
            .filter((l) => Number(l.Year) <= year && l.Name !== 'Single')
            .map((l) => l.Name);
        } else {
          constraints.allowedLayouts = constraints.allowedLayouts.filter((l) => l !== 'Single');
        }
      }
    }

    const optResult = optimizeEngine(year, constraints);

    if (!optResult || !optResult.config || !optResult.performance) {
      return {
        success: false,
        message: 'No optimal engine found matching the selected vehicle constraints.',
      };
    }

    return {
      success: true,
      config: optResult.config,
      performance: optResult.performance,
      score: optResult.score,
      elapsedMs: optResult.elapsedMs,
      budgetExceeded: optResult.budgetExceeded,
      budgetExcess: optResult.budgetExcess,
      bestCandidate: {
        layout: optResult.config.components.layout,
        cylinders: optResult.config.components.cylinders,
        fuel: optResult.config.components.fuel,
        induction: optResult.config.components.induction,
        valvetrain: optResult.config.components.valve,
        performance: optResult.performance,
      },
    };
  }

  /**
   * Approximate finished-vehicle ratings from Chassis, Engine, and Gearbox stats
   */
  function assembleVehicleRatings(components) {
    const clamp = (val, min = 0.0, max = 100.0) => Math.max(min, Math.min(max, val));

    const c = components.chassis || {};
    const e = components.engine || {};
    const g = components.gearbox || {};

    const cPerf = c.performance != null ? Number(c.performance) : (c.sliderValues?.performance ?? 50.0);
    const cComfort = c.comfort != null ? Number(c.comfort) : (c.sliderValues?.comfort ?? 50.0);
    const cStrength = c.strength != null ? Number(c.strength) : (c.sliderValues?.strength ?? 50.0);
    const cDurability = c.durability != null ? Number(c.durability) : (c.sliderValues?.durability ?? 50.0);
    const cWeight = c.weightKg != null ? Number(c.weightKg) : 250.0;
    const cOverall = c.overall != null ? Number(c.overall) : ((cPerf + cComfort + cStrength + cDurability) / 4.0);

    const ePowerRating = e.powerRating != null ? Number(e.powerRating) : (e.ratings?.power ?? (e.horsepower ? clamp(e.horsepower / 0.8) : 50.0));
    const eTorqueRating = e.torqueRating != null ? Number(e.torqueRating) : (e.torqueNm ? clamp((e.torqueNm / 1.3558) / 1.2) : (e.ratings?.power ?? 50.0));
    const eSmoothness = e.smoothness != null ? Number(e.smoothness) : (e.ratings?.smoothness ?? 50.0);
    const eFuelEco = e.fuelEconomy != null ? Number(e.fuelEconomy) : (e.ratings?.fuelEconomy ?? 50.0);
    const eDependability = e.dependability != null ? Number(e.dependability) : (e.ratings?.dependability ?? 50.0);
    const eOverall = e.overall != null ? Number(e.overall) : (e.ratings?.overall ?? 50.0);

    const gPerf = g.performance != null ? Number(g.performance) : (g.sliderValues?.performance ?? 50.0);
    const gComfort = g.comfort != null ? Number(g.comfort) : (g.sliderValues?.comfort ?? 50.0);
    const gReliability = g.reliability != null ? Number(g.reliability) : (g.sliderValues?.reliability ?? 50.0);
    const gPower = g.power != null ? Number(g.power) : (g.sliderValues?.power ?? 50.0);
    const gFuelEco = g.fuelEconomy != null ? Number(g.fuelEconomy) : (g.designFocus?.fuel ?? 50.0);
    const gOverall = g.overall != null ? Number(g.overall) : ((gPerf + gComfort + gReliability + gPower) / 4.0);

    const performance = clamp(
      0.30 * cPerf
      + 0.35 * ePowerRating
      + 0.20 * eTorqueRating
      + 0.15 * gPerf
    );

    const drivability = clamp(
      0.35 * cComfort
      + 0.35 * eSmoothness
      + 0.30 * gComfort
    );

    const luxury = clamp(
      0.30 * cComfort
      + 0.50 * eSmoothness
      + 0.20 * gComfort
    );

    const safety = clamp(
      0.70 * cStrength
      + 0.30 * cDurability
    );

    const fuel = clamp(
      0.45 * eFuelEco
      + 0.45 * gFuelEco
      + 0.10 * clamp(100.0 - (cWeight / 6.0))
    );

    const power = clamp(
      0.40 * eTorqueRating
      + 0.35 * ePowerRating
      + 0.25 * gPower
    );

    const cargo = clamp(
      0.55 * cStrength
      + 0.45 * cDurability
    );

    const dependability = clamp(
      0.30 * cDurability
      + 0.35 * eDependability
      + 0.35 * gReliability
    );

    const quality = clamp((cOverall + eOverall + gOverall) / 3.0);

    const overall = clamp(
      0.35 * cOverall
      + 0.40 * eOverall
      + 0.25 * gOverall
    );

    return {
      performance: Math.round(performance * 10) / 10,
      drivability: Math.round(drivability * 10) / 10,
      luxury: Math.round(luxury * 10) / 10,
      safety: Math.round(safety * 10) / 10,
      fuel: Math.round(fuel * 10) / 10,
      power: Math.round(power * 10) / 10,
      cargo: Math.round(cargo * 10) / 10,
      dependability: Math.round(dependability * 10) / 10,
      quality: Math.round(quality * 10) / 10,
      overall: Math.round(overall * 10) / 10,
    };
  }

  /**
   * Calculate overall Buyer Fit % (0-100%) against target vehicle demand weights
   */
  function calculateVehicleTypeFit(ratings, vehicleTypeName) {
    const profiles = GEARCITY_DATA.vehicleProfiles || GEARCITY_DATA.demographics?.vehicle_types || {};
    const normName = vehicleTypeName === 'Compact SUV' ? 'Compact Sport Utility' : (vehicleTypeName === 'SUV' ? 'Sport Utility Vehicle' : vehicleTypeName);
    const weights = profiles[normName] || profiles[vehicleTypeName] || profiles['Sedan'] || {
      Performance: 0.4,
      Driveability: 0.4,
      Luxury: 0.45,
      Safety: 0.65,
      Fuel: 0.65,
      Power: 0.45,
      Cargo: 0.5,
      Dependability: 0.45,
    };

    const rawScore = (
      (ratings.performance * (weights.Performance || 0))
      + (ratings.drivability * (weights.Driveability || 0))
      + (ratings.luxury * (weights.Luxury || 0))
      + (ratings.safety * (weights.Safety || 0))
      + (ratings.fuel * (weights.Fuel || 0))
      + (ratings.power * (weights.Power || 0))
      + (ratings.cargo * (weights.Cargo || 0))
      + (ratings.dependability * (weights.Dependability || 0))
    );

    const totalWeight = (
      (weights.Performance || 0)
      + (weights.Driveability || 0)
      + (weights.Luxury || 0)
      + (weights.Safety || 0)
      + (weights.Fuel || 0)
      + (weights.Power || 0)
      + (weights.Cargo || 0)
      + (weights.Dependability || 0)
    );

    const maxScore = totalWeight * 100.0;
    const fitPercent = maxScore > 0 ? (rawScore / maxScore) * 100.0 : 0.0;

    return {
      fitPercent: Math.round(fitPercent * 10) / 10,
      weights,
      rawScore: Math.round(rawScore * 10) / 10,
      maxScore: Math.round(maxScore * 10) / 10,
    };
  }

  /**
   * Complete vehicle evaluation combining Chassis, Engine, and Gearbox concepts
   */
  function evaluateCompleteVehicle(vehicleTypeName, year = 1960, overrides = {}, ver) {
    const data = getActiveData(ver);
    const vc = data.vehicleClasses.find((v) => v.carType === vehicleTypeName) || data.vehicleClasses[0];

    const rawChassis = vc.chassis.split(/[>,/]/)[0].trim();
    const rawEngine = vc.engineType.split(/[>/]/)[0].trim();
    const rawGear = vc.gear.split(/[>/]/)[0].trim();

    const chassisKey = overrides.chassisConcept || rawChassis;
    const engineKey = overrides.engineConcept || rawEngine;
    const gearKey = overrides.gearboxConcept || rawGear;

    const chassisData = data.chassisDesigns[chassisKey] || data.chassisDesigns['Balance'] || data.chassisDesigns['Eco'] || {};
    const gearboxData = data.gearboxDesigns[gearKey] || data.gearboxDesigns['Balance'] || data.gearboxDesigns['Fuel'] || {};

    let decadeKey = '1960s';
    if (year < 1910) decadeKey = '1900s';
    else if (year < 1920) decadeKey = '1910s';
    else if (year < 1930) decadeKey = '1920s';
    else if (year < 1940) decadeKey = '1930s';
    else if (year < 1950) decadeKey = '1940s';
    else if (year < 1960) decadeKey = '1950s';
    else if (year < 1970) decadeKey = '1960s';
    else if (year < 1980) decadeKey = '1970s';
    else if (year < 1990) decadeKey = '1980s';
    else if (year < 2000) decadeKey = '1990s';
    else if (year < 2010) decadeKey = '2000s';
    else decadeKey = '2010s';

    const decadeBench = data.chassisTargetWeights?.[decadeKey] || {};
    const cat = chassisData.category || 'General';
    const eraTargetKg = decadeBench[cat]?.avgChassisKg || 250;

    let enginePerf = overrides.enginePerformance;
    let engineConfig = overrides.engineConfig;

    if (!enginePerf) {
      const constraints = getEngineDesignConstraints(engineKey, year, ver) || {};
      const optResult = optimizeEngine(year, constraints);
      if (optResult && optResult.config && optResult.performance) {
        enginePerf = optResult.performance;
        engineConfig = optResult.config;
      }
    }

    const chassisInput = {
      name: chassisData.name || chassisKey,
      sliderValues: chassisData.sliderValues || { performance: 50, strength: 50, comfort: 50, durability: 50 },
      weightKg: eraTargetKg,
    };

    const gearboxInput = {
      name: gearboxData.name || gearKey,
      sliderValues: gearboxData.sliderValues || { performance: 50, comfort: 50, reliability: 50, power: 50 },
      designFocus: gearboxData.designFocus || { fuel: 50 },
    };

    const assembledRatings = assembleVehicleRatings({
      chassis: chassisInput,
      engine: enginePerf || {},
      gearbox: gearboxInput,
    });

    const fitResult = calculateVehicleTypeFit(assembledRatings, vehicleTypeName);

    return {
      vehicleTypeName,
      year,
      version: ver || activeVersion,
      vehicleClass: vc,
      chassisConcept: chassisKey,
      engineConcept: engineKey,
      gearboxConcept: gearKey,
      chassis: chassisInput,
      gearbox: gearboxInput,
      engine: {
        config: engineConfig,
        performance: enginePerf,
      },
      ratings: assembledRatings,
      fit: fitResult,
    };
  }

  return {
    setVersion,
    getVersion,
    getActiveData,
    calculateYearFactors,
    getBoreStrokeLimits,
    getWorldRates,
    getValidValvetrains,
    calculatePerformance,
    calculateComponentRatings,
    optimizeEngine,
    optimizeEngineForVehicle,
    assembleVehicleRatings,
    calculateVehicleTypeFit,
    evaluateCompleteVehicle,
    generateEngineXml,
    generateChassisXml,
    generateGearboxXml,
    generateVehicleXml,
    generateCarXml,
    calculateVehicleSliders,
    simulateWikiVehicleRatings,
    evaluateDemographics,
    getVehicleDesignAdvice,
    getEngineDesignConstraints,
    getChassisEraBenchmark,
    getChassisGearboxRecommendations: getVehicleDesignAdvice,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GearCityEngine;
}
