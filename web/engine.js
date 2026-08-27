/**
 * GearCity Pure JavaScript Calculation & Fast Optimizer Engine
 */

const GearCityEngine = (() => {
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
  function optimizeEngine(year, constraints = {}) {
    const startTime = performance.now();
    const maxCost = constraints.maxCost != null && !isNaN(constraints.maxCost) ? Number(constraints.maxCost) : null;
    const maxCc = constraints.maxCc != null && !isNaN(constraints.maxCc) ? Number(constraints.maxCc) : null;
    const maxWeight = constraints.maxWeight != null && !isNaN(constraints.maxWeight) ? Number(constraints.maxWeight) : null;
    const maxLength = constraints.maxLength != null && !isNaN(constraints.maxLength) ? Number(constraints.maxLength) : null;
    const maxWidth = constraints.maxWidth != null && !isNaN(constraints.maxWidth) ? Number(constraints.maxWidth) : null;
    const focus = constraints.focus || 'HP';
    const allowedLayouts = constraints.allowedLayouts && constraints.allowedLayouts.length > 0 ? constraints.allowedLayouts : null;
    const allowedCylinders = constraints.allowedCylinders && constraints.allowedCylinders.length > 0 ? constraints.allowedCylinders : null;
    const allowedFuels = constraints.allowedFuels && constraints.allowedFuels.length > 0 ? constraints.allowedFuels : null;
    const allowedInductions = constraints.allowedInductions && constraints.allowedInductions.length > 0 ? constraints.allowedInductions : null;
    const allowedValves = constraints.allowedValves && constraints.allowedValves.length > 0 ? constraints.allowedValves : null;

    // 1. Gather all valid unlocked components (respecting year and manual overrides)
    const validLayouts = GEARCITY_DATA.layouts.filter((l) => (!allowedLayouts ? Number(l.Year) <= year : allowedLayouts.includes(l.Name)));
    const validCylinders = GEARCITY_DATA.cylinders.filter((c) => (!allowedCylinders ? Number(c.Year) <= year : allowedCylinders.includes(c.Name)));
    const validFuels = GEARCITY_DATA.fuel.filter((f) => (!allowedFuels ? Number(f.Year) <= year : allowedFuels.includes(f.Name)));
    const validInductions = GEARCITY_DATA.induction.filter((i) => (!allowedInductions ? Number(i.Year) <= year : allowedInductions.includes(i.Name)));
    const validValves = GEARCITY_DATA.valvetrain.filter((v) => (!allowedValves ? Number(v.Year) <= year : allowedValves.includes(v.Name)));

    const candidateComponents = [];

    for (const l of validLayouts) {
      const allowedCylNames = l.Cylinders || [];
      const allowedFuelNames = l.Fuel_Types || l['Fuel Types'] || [];
      const allowedIndNames = l.Inductions || [];
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
      return penalty;
    }

    // Pass 1: Quick screening across candidate component combinations
    const screened = [];
    const screenBores = [150, 400, 700];
    const screenStrokes = [200, 500, 750];

    for (const comp of candidateComponents) {
      let bestCompScore = -Infinity;
      for (const sb of screenBores) {
        for (const ss of screenStrokes) {
          const testConfig = {
            components: comp,
            sliders: {
              boreSlide: sb,
              strokeSlide: ss,
              performanceTorque: 0.7,
              performanceRevolutions: 0.8,
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
      screened.push({ comp, initialScore: bestCompScore });
    }

    screened.sort((a, b) => b.initialScore - a.initialScore);
    const topCandidates = screened.slice(0, 20).map((s) => s.comp);

    // Pass 2: Fine-grained slider search across top candidate architectures
    let bestScore = -Infinity;
    let bestConfig = null;
    let bestPerf = null;

    const boreSteps = [50, 200, 350, 500, 650, 800, 950];
    const strokeSteps = [100, 250, 400, 550, 700, 850, 1000];
    const torqueSteps = [0.4, 0.7, 0.95];
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
                  performanceFuelEconomy: 0.0,
                  designFocusPerformance: 0.85,
                  designFocusFuelEconomy: 0.0,
                  designFocusDependability: 0.5,
                  layoutLength: 0.2,
                  layoutWidth: 0.2,
                  layoutWeight: 0.5,
                  technologyMaterials: m,
                  technologyComponents: 0.0,
                  technologyTechnologies: 0.0,
                  technologyTechniques: 0.0,
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

    const elapsedMs = performance.now() - startTime;
    return {
      config: bestConfig,
      performance: bestPerf,
      score: bestScore,
      elapsedMs: Math.round(elapsedMs * 10) / 10,
    };
  }

  function generateEngineXml(config) {
    const comp = config.components;
    const sliders = config.sliders;
    const limits = getBoreStrokeLimits(comp.layout, config.year);
    const boreMm = limits.minBore + ((limits.maxBore - limits.minBore) * (sliders.boreSlide / 1000.0));
    const strokeMm = limits.minStroke + ((limits.maxStroke - limits.minStroke) * (sliders.strokeSlide / 1000.0));

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
  <Cylinders>${comp.cylinders}</Cylinders>
  <Fueltype>${comp.fuel}</Fueltype>
  <Induction>${comp.induction}</Induction>
  <Valve>${comp.valve}</Valve>
  <Layout>${comp.layout}</Layout>
</Engine>`;
  }

  function evaluateDemographics(vehicleType) {
    const profiles = GEARCITY_DATA.vehicleProfiles;
    const gMods = GEARCITY_DATA.genderModifiers;
    const aMods = GEARCITY_DATA.ageModifiers;

    const attr = profiles[vehicleType];
    if (!attr) return null;

    let bestScore = -Infinity;
    let bestGender = 'Neutral';
    let bestAge = '25-35';
    const allScores = {};

    for (const [gName, gVal] of Object.entries(gMods)) {
      for (const [aName, aVal] of Object.entries(aMods)) {
        let score = 0;
        for (const [col, baseVal] of Object.entries(attr)) {
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

    return {
      vehicleType,
      bestGender,
      bestAge,
      bestScore: Math.round(bestScore * 10000) / 10000,
      allScores,
    };
  }

  function getChassisGearboxRecommendations(vehicleType, year) {
    const arch = GEARCITY_DATA.archetypes[vehicleType];
    if (!arch) return null;

    const cStyle = arch.chassis_style;
    const gStyle = arch.gearbox_style;
    const eStyle = arch.engine_style;

    // Frame selection with detailed rationale
    let frame = "Wood / Basic Frame";
    let frameYear = 1890;
    let frameReason = "Basic historical carriage frame suitable for early 1890s horseless carriages.";
    if (cStyle.includes("Race") && year >= 1924) {
      frame = "Superleggera / Spaceframe";
      frameYear = 1924;
      frameReason = "Ultra-lightweight tubular truss design offering maximum torsional rigidity and agile cornering for sports and racing vehicles.";
    } else if (cStyle.includes("Truck") || (cStyle.includes("Drive") && (vehicleType.includes("Pickup") || vehicleType.includes("Van") || vehicleType.includes("Sport Utility")))) {
      frame = year >= 1902 ? "Ladder Frame" : "Heavy Wood Frame";
      frameYear = 1902;
      frameReason = "High-tensile steel perimeter rails capable of handling extreme payloads, rough terrain, and heavy towing without chassis twist.";
    } else if (year >= 1930) {
      frame = "Unibody (Monocoque)";
      frameYear = 1930;
      frameReason = "Integrated body-and-frame structure providing superior passenger safety, significant weight reduction, and low manufacturing costs.";
    } else if (year >= 1902) {
      frame = "Ladder Frame";
      frameYear = 1902;
      frameReason = "Sturdy steel frame providing durable structural support for early road vehicles.";
    }

    // Suspension selection with detailed rationale
    let suspension = "Solid Axle / Leaf Springs";
    let suspensionYear = 1890;
    let suspensionReason = "Rugged, low-cost suspension ideal for heavy cargo and rough roads.";
    if (cStyle.includes("Lux")) {
      if (year >= 1990) {
        suspension = "Magnetorheological / Adaptive";
        suspensionYear = 1990;
        suspensionReason = "Electromagnetic fluid dampers adjusting damping rates thousands of times per second for the ultimate luxury ride quality.";
      } else if (year >= 1944) {
        suspension = "Hydropneumatic Suspension";
        suspensionYear = 1944;
        suspensionReason = "Self-leveling nitrogen gas and hydraulic fluid system that completely isolates the passenger cabin from road bumps.";
      } else if (year >= 1915) {
        suspension = "Air Suspension";
        suspensionYear = 1915;
        suspensionReason = "Pressurized air bellows absorbing high-frequency road vibrations for premium comfort.";
      }
    } else if (cStyle.includes("Truck")) {
      suspension = "Heavy-Duty Leaf Springs";
      suspensionYear = 1890;
      suspensionReason = "Maximum load-bearing capacity designed for high cargo weights and commercial hauling.";
    } else if (cStyle.includes("Race") || cStyle.includes("Sport")) {
      if (year >= 1988) {
        suspension = "Multi-Link Independent";
        suspensionYear = 1988;
        suspensionReason = "Multi-axis control arms providing precise wheel geometry under aggressive cornering and high-speed braking.";
      } else if (year >= 1924) {
        suspension = "Double Wishbone";
        suspensionYear = 1924;
        suspensionReason = "Parallel A-arms maintaining optimal tire contact patch across full suspension travel.";
      } else if (year >= 1901) {
        suspension = "Swing Axle";
        suspensionYear = 1901;
        suspensionReason = "Early independent rear suspension improving road grip over solid axles.";
      }
    } else {
      if (year >= 1988) {
        suspension = "Multi-Link Independent";
        suspensionYear = 1988;
        suspensionReason = "The modern gold standard balancing ride smoothness and responsive handling.";
      } else if (year >= 1939 && cStyle.includes("Tiny")) {
        suspension = "MacPherson Strut";
        suspensionYear = 1939;
        suspensionReason = "Compact, cost-effective strut layout leaving maximum space for the engine and passenger cabin.";
      } else if (year >= 1924) {
        suspension = "Double Wishbone";
        suspensionYear = 1924;
        suspensionReason = "Excellent wheel stability and cornering control for mid-century sedans and wagons.";
      } else if (year >= 1901) {
        suspension = "Swing Axle";
        suspensionYear = 1901;
        suspensionReason = "Improved wheel articulation over early rutted roads.";
      }
    }

    // Transmission selection with detailed rationale
    let transmission = "Early Direct / Chain Drive";
    let transmissionYear = 1890;
    let transmissionReason = "Rudimentary early drivetrain mechanism.";
    if (year >= 1980 && (gStyle.includes("Race") || gStyle.includes("Sport"))) {
      transmission = "Dual-Clutch Transmission (DCT) / Sequential";
      transmissionYear = 1980;
      transmissionReason = "Instantaneous sub-100ms gear shifts keeping the engine in its peak powerband with zero boost loss.";
    } else if (year >= 1950 && gStyle.includes("Lux")) {
      transmission = "Torque Converter Automatic";
      transmissionYear = 1950;
      transmissionReason = "Seamless, shift-shock-free gear changes offering maximum comfort for luxury buyers.";
    } else if (year >= 1935 && (gStyle.includes("Fuel") || gStyle.includes("Balance"))) {
      transmission = "Semi-Automatic / Overdrive";
      transmissionYear = 1935;
      transmissionReason = "Taller highway overdrive gear reducing cruising RPM and improving fuel economy.";
    } else if (year >= 1925 && gStyle.includes("Lux")) {
      transmission = "Early Automatic / Pre-Selector";
      transmissionYear = 1925;
      transmissionReason = "Effortless gear pre-selection catering to affluent buyers.";
    } else if (year >= 1912) {
      transmission = "Synchromesh Manual";
      transmissionYear = 1912;
      transmissionReason = "High power transmission efficiency, driver control, and durable mechanical reliability.";
    }

    return {
      vehicleType,
      archetype: arch,
      recommendedFrame: frame,
      recommendedFrameYear: frameYear,
      frameReason,
      recommendedSuspension: suspension,
      recommendedSuspensionYear: suspensionYear,
      suspensionReason,
      recommendedTransmission: transmission,
      recommendedTransmissionYear: transmissionYear,
      transmissionReason,
    };
  }

  return {
    calculateYearFactors,
    getBoreStrokeLimits,
    getWorldRates,
    getValidValvetrains,
    calculatePerformance,
    calculateComponentRatings,
    optimizeEngine,
    generateEngineXml,
    evaluateDemographics,
    getChassisGearboxRecommendations
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GearCityEngine;
}
