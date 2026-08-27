/**
 * GearCity Web Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // DOM Elements - Optimizer Inputs
  const inputYear = document.getElementById('input-year');
  const labelYearVal = document.getElementById('label-year-val');
  const goalOptions = document.querySelectorAll('.goal-option');
  const inputMaxCost = document.getElementById('input-max-cost');
  const inputMaxWeight = document.getElementById('input-max-weight');
  const inputMaxLen = document.getElementById('input-max-len');
  const inputMaxWid = document.getElementById('input-max-wid');
  const selectOptFuel = document.getElementById('select-opt-fuel');
  const btnAutoOptimize = document.getElementById('btn-auto-optimize');
  const optimizerStatus = document.getElementById('optimizer-status');

  // DOM Elements - Component Dropdowns
  const selectLayout = document.getElementById('select-layout');
  const selectCylinders = document.getElementById('select-cylinders');
  const selectInduction = document.getElementById('select-induction');
  const selectValvetrain = document.getElementById('select-valvetrain');

  // DOM Elements - Sliders & Values
  const sliderBore = document.getElementById('slider-bore');
  const valBore = document.getElementById('val-bore');
  const sliderStroke = document.getElementById('slider-stroke');
  const valStroke = document.getElementById('val-stroke');
  const sliderRpm = document.getElementById('slider-rpm');
  const valRpm = document.getElementById('val-rpm');
  const sliderTorq = document.getElementById('slider-torq');
  const valTorq = document.getElementById('val-torq');
  const sliderPerfFocus = document.getElementById('slider-perf-focus');
  const valPerfFocus = document.getElementById('val-perf-focus');
  const sliderEcoFocus = document.getElementById('slider-eco-focus');
  const valEcoFocus = document.getElementById('val-eco-focus');
  const sliderMaterials = document.getElementById('slider-materials');
  const valMaterials = document.getElementById('val-materials');
  const sliderWeight = document.getElementById('slider-weight');
  const valWeight = document.getElementById('val-weight');

  // DOM Elements - Metrics
  const statHeroHp = document.getElementById('stat-hero-hp');
  const statHeroSub = document.getElementById('stat-hero-sub');
  const statTorque = document.getElementById('stat-torque');
  const statDisp = document.getElementById('stat-disp');
  const badgeDispLive = document.getElementById('badge-disp-live');
  const statCost = document.getElementById('stat-cost');
  const statWeight = document.getElementById('stat-weight');
  const statDim = document.getElementById('stat-dim');
  const inputModelName = document.getElementById('input-model-name');
  const btnDownloadXml = document.getElementById('btn-download-xml');

  // DOM Elements - Demographics Tab
  const selectDemoVehicle = document.getElementById('select-demo-vehicle');
  const demoHighlightBox = document.getElementById('demo-highlight-box');
  const tableDemographicsBody = document.getElementById('table-demographics-body');

  // DOM Elements - Chassis & Synergies Tab
  const selectSynergyVehicle = document.getElementById('select-synergy-vehicle');
  const inputSynergyYear = document.getElementById('input-synergy-year');
  const synergyResultsBox = document.getElementById('synergy-results-box');

  let currentFocus = 'HP';

  /* ==========================================================================
     Tab Navigation
     ========================================================================== */
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  /* ==========================================================================
     Goal Focus Toggle
     ========================================================================== */
  goalOptions.forEach((option) => {
    option.addEventListener('click', () => {
      goalOptions.forEach((o) => o.classList.remove('active'));
      option.classList.add('active');
      currentFocus = option.dataset.focus;
    });
  });

  /* ==========================================================================
     Dynamic Dropdown Population based on Target Year
     ========================================================================== */
  function populateComponentDropdowns(selectedValues = {}) {
    const year = Number(inputYear.value);

    // Layouts
    const validLayouts = GEARCITY_DATA.layouts.filter((l) => Number(l.Year) <= year);
    selectLayout.innerHTML = '';
    validLayouts.forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l.Name;
      opt.textContent = `${l.Name} Layout`;
      selectLayout.appendChild(opt);
    });
    if (selectedValues.layout && validLayouts.some((l) => l.Name === selectedValues.layout)) {
      selectLayout.value = selectedValues.layout;
    } else if (validLayouts.some((l) => l.Name === 'I')) {
      selectLayout.value = 'I';
    } else if (validLayouts.length > 0) {
      selectLayout.value = validLayouts[0].Name;
    }

    updateCylinderAndFuelOptions(selectedValues);
  }

  function updateCylinderAndFuelOptions(selectedValues = {}) {
    const year = Number(inputYear.value);
    const layoutName = selectLayout.value;
    const layoutRow = GEARCITY_DATA.layouts.find((l) => l.Name === layoutName);
    // Fuels
    const allowedFuelNames = layoutRow.Fuel_Types || layoutRow['Fuel Types'] || [];
    const validFuels = GEARCITY_DATA.fuel.filter(
      (f) => Number(f.Year) <= year && allowedFuelNames.includes(f.Name)
    );
    selectOptFuel.innerHTML = '';
    validFuels.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.Name;
      opt.textContent = f.Name;
      selectOptFuel.appendChild(opt);
    });
    if (selectedValues.fuel && validFuels.some((f) => f.Name === selectedValues.fuel)) {
      selectOptFuel.value = selectedValues.fuel;
    } else if (validFuels.some((f) => f.Name === 'Gasoline')) {
      selectOptFuel.value = 'Gasoline';
    } else if (validFuels.length > 0) {
      selectOptFuel.value = validFuels[0].Name;
    }

    // Cylinders
    const allowedCylNames = layoutRow.Cylinders || [];
    const validCylinders = GEARCITY_DATA.cylinders.filter(
      (c) => Number(c.Year) <= year && allowedCylNames.includes(c.Name)
    );
    selectCylinders.innerHTML = '';
    validCylinders.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.Name;
      opt.textContent = `${c.Name} Cylinders`;
      selectCylinders.appendChild(opt);
    });
    if (selectedValues.cylinders && validCylinders.some((c) => c.Name === selectedValues.cylinders)) {
      selectCylinders.value = selectedValues.cylinders;
    } else if (validCylinders.some((c) => c.Name === '4')) {
      selectCylinders.value = '4';
    } else if (validCylinders.length > 0) {
      selectCylinders.value = validCylinders[0].Name;
    }

    // Induction
    const allowedIndNames = layoutRow.Inductions || [];
    const validInductions = GEARCITY_DATA.induction.filter(
      (i) => Number(i.Year) <= year && allowedIndNames.includes(i.Name)
    );
    selectInduction.innerHTML = '';
    validInductions.forEach((i) => {
      const opt = document.createElement('option');
      opt.value = i.Name;
      opt.textContent = i.Name;
      selectInduction.appendChild(opt);
    });
    if (selectedValues.induction && validInductions.some((i) => i.Name === selectedValues.induction)) {
      selectInduction.value = selectedValues.induction;
    } else if (validInductions.length > 0) {
      selectInduction.value = validInductions[0].Name;
    }

    // Valvetrain
    const validValveNames = GearCityEngine.getValidValvetrains(layoutRow, year);
    const validValves = GEARCITY_DATA.valvetrain.filter(
      (v) => Number(v.Year) <= year && validValveNames.includes(v.Name)
    );
    selectValvetrain.innerHTML = '';
    validValves.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.Name;
      opt.textContent = v.Name;
      selectValvetrain.appendChild(opt);
    });
    if (selectedValues.valve && validValves.some((v) => v.Name === selectedValues.valve)) {
      selectValvetrain.value = selectedValues.valve;
    } else if (validValves.length > 0) {
      selectValvetrain.value = validValves[0].Name;
    }
  }

  /* ==========================================================================
     Recalculate & Update UI
     ========================================================================== */
  function updateCalculations() {
    const year = Number(inputYear.value);
    labelYearVal.textContent = year;

    const layoutName = selectLayout.value;
    const cylName = selectCylinders.value;
    const indName = selectInduction.value;
    const valveName = selectValvetrain.value;
    const fuelName = selectOptFuel.value || 'Gasoline';

    if (!layoutName || !cylName || !indName || !valveName) return;

    const limits = GearCityEngine.getBoreStrokeLimits(layoutName, year);
    const boreSlide = Number(sliderBore.value);
    const strokeSlide = Number(sliderStroke.value);

    const boreMm = limits.minBore + ((limits.maxBore - limits.minBore) * (boreSlide / 1000.0));
    const strokeMm = limits.minStroke + ((limits.maxStroke - limits.minStroke) * (strokeSlide / 1000.0));

    valBore.textContent = `${boreMm.toFixed(1)} mm`;
    valStroke.textContent = `${strokeMm.toFixed(1)} mm`;
    valRpm.textContent = `${sliderRpm.value}%`;
    valTorq.textContent = `${sliderTorq.value}%`;
    valPerfFocus.textContent = `${sliderPerfFocus.value}%`;
    valEcoFocus.textContent = `${sliderEcoFocus.value}%`;
    valMaterials.textContent = `${sliderMaterials.value}%`;
    valWeight.textContent = `${sliderWeight.value}%`;

    const config = {
      components: {
        layout: layoutName,
        cylinders: cylName,
        fuel: fuelName,
        induction: indName,
        valve: valveName,
      },
      sliders: {
        boreSlide,
        strokeSlide,
        performanceTorque: Number(sliderTorq.value) / 100.0,
        performanceRevolutions: Number(sliderRpm.value) / 100.0,
        performanceFuelEconomy: Number(sliderEcoFocus.value) / 100.0,
        designFocusPerformance: Number(sliderPerfFocus.value) / 100.0,
        designFocusFuelEconomy: Number(sliderEcoFocus.value) / 100.0,
        designFocusDependability: 0.5,
        layoutLength: 0.3,
        layoutWidth: 0.3,
        layoutWeight: Number(sliderWeight.value) / 100.0,
        technologyMaterials: Number(sliderMaterials.value) / 100.0,
        technologyComponents: 0.0,
        technologyTechnologies: 0.0,
        technologyTechniques: 0.0,
      },
      year,
      name: inputModelName.value || `Engine_${year}`,
    };

    try {
      const res = GearCityEngine.calculatePerformance(config, year);
      statHeroHp.textContent = `${res.horsepower.toFixed(1)} HP`;
      statHeroSub.textContent = `@ ${res.rpm.toFixed(0)} RPM`;
      statTorque.textContent = `${res.torqueNm.toFixed(1)} Nm (${res.torqueFtLb.toFixed(1)} lb-ft)`;
      statDisp.textContent = `${res.displacementCc.toFixed(0)} cc`;
      badgeDispLive.textContent = `${res.displacementCc.toFixed(0)} cc`;
      statCost.textContent = `$${res.unitCost.toFixed(2)}`;
      statWeight.textContent = `${res.weightKg.toFixed(1)} kg`;
      statDim.textContent = `${res.lengthCm.toFixed(1)} x ${res.widthCm.toFixed(1)} cm`;
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }

  // Event Listeners for Live Updates
  inputYear.addEventListener('input', () => {
    populateComponentDropdowns();
    updateCalculations();
  });

  selectLayout.addEventListener('change', () => {
    updateCylinderAndFuelOptions();
    updateCalculations();
  });

  [selectCylinders, selectInduction, selectValvetrain, selectOptFuel].forEach((el) => {
    el.addEventListener('change', updateCalculations);
  });

  [sliderBore, sliderStroke, sliderRpm, sliderTorq, sliderPerfFocus, sliderEcoFocus, sliderMaterials, sliderWeight].forEach((el) => {
    el.addEventListener('input', updateCalculations);
  });

  /* ==========================================================================
     Auto-Optimizer Trigger
     ========================================================================== */
  btnAutoOptimize.addEventListener('click', () => {
    const year = Number(inputYear.value);
    const maxCost = inputMaxCost.value ? Number(inputMaxCost.value) : null;
    const maxWeight = inputMaxWeight.value ? Number(inputMaxWeight.value) : null;
    const maxLength = inputMaxLen.value ? Number(inputMaxLen.value) : null;
    const maxWidth = inputMaxWid.value ? Number(inputMaxWid.value) : null;
    const fuel = selectOptFuel.value || 'Gasoline';

    optimizerStatus.textContent = 'Optimizing blueprint...';
    btnAutoOptimize.disabled = true;

    setTimeout(() => {
      try {
        const optRes = GearCityEngine.optimizeEngine(year, {
          maxCost,
          maxWeight,
          maxLength,
          maxWidth,
          focus: currentFocus,
          allowedFuels: [fuel],
          modelName: inputModelName.value || `Optima_${year}`,
        });

        if (optRes && optRes.config) {
          const cfg = optRes.config;
          populateComponentDropdowns(cfg.components);

          sliderBore.value = cfg.sliders.boreSlide;
          sliderStroke.value = cfg.sliders.strokeSlide;
          sliderTorq.value = Math.round(cfg.sliders.performanceTorque * 100);
          sliderRpm.value = Math.round(cfg.sliders.performanceRevolutions * 100);
          sliderPerfFocus.value = Math.round(cfg.sliders.designFocusPerformance * 100);
          sliderEcoFocus.value = Math.round(cfg.sliders.designFocusFuelEconomy * 100);
          sliderMaterials.value = Math.round(cfg.sliders.technologyMaterials * 100);
          sliderWeight.value = Math.round(cfg.sliders.layoutWeight * 100);

          updateCalculations();
          optimizerStatus.textContent = `⚡ Optimized in ${optRes.elapsedMs} ms! Found ${cfg.components.layout} ${cfg.components.cylinders}-cyl setup.`;
        } else {
          optimizerStatus.textContent = 'Could not find a valid engine within tight constraints.';
        }
      } catch (err) {
        optimizerStatus.textContent = 'Optimization error occurred.';
        console.error(err);
      } finally {
        btnAutoOptimize.disabled = false;
      }
    }, 20);
  });

  /* ==========================================================================
     XML Blueprint Download
     ========================================================================== */
  btnDownloadXml.addEventListener('click', () => {
    const year = Number(inputYear.value);
    const modelName = (inputModelName.value || `Engine_${year}`).replace(/\s+/g, '_');

    const config = {
      components: {
        layout: selectLayout.value,
        cylinders: selectCylinders.value,
        fuel: selectOptFuel.value || 'Gasoline',
        induction: selectInduction.value,
        valve: selectValvetrain.value,
      },
      sliders: {
        boreSlide: Number(sliderBore.value),
        strokeSlide: Number(sliderStroke.value),
        performanceTorque: Number(sliderTorq.value) / 100.0,
        performanceRevolutions: Number(sliderRpm.value) / 100.0,
        performanceFuelEconomy: Number(sliderEcoFocus.value) / 100.0,
        designFocusPerformance: Number(sliderPerfFocus.value) / 100.0,
        designFocusFuelEconomy: Number(sliderEcoFocus.value) / 100.0,
        designFocusDependability: 0.5,
        layoutLength: 0.3,
        layoutWidth: 0.3,
        layoutWeight: Number(sliderWeight.value) / 100.0,
        technologyMaterials: Number(sliderMaterials.value) / 100.0,
        technologyComponents: 0.0,
        technologyTechnologies: 0.0,
        technologyTechniques: 0.0,
      },
      year,
      name: modelName,
    };

    const xmlContent = GearCityEngine.generateEngineXml(config);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Engine_${modelName}_${year}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  /* ==========================================================================
     Demographics Tab Controller
     ========================================================================== */
  function initDemographics() {
    const vehicles = Object.keys(GEARCITY_DATA.vehicleProfiles);
    selectDemoVehicle.innerHTML = '';
    tableDemographicsBody.innerHTML = '';

    vehicles.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      selectDemoVehicle.appendChild(opt);

      // Populate summary table
      const res = GearCityEngine.evaluateDemographics(v);
      const tr = document.createElement('tr');
      const gClass = res.bestGender === 'Female' ? 'tag-female' : 'tag-male';

      tr.innerHTML = `
        <td style="font-weight: 600;">${v}</td>
        <td><span class="tag-badge ${gClass}">${res.bestGender}</span></td>
        <td><span class="tag-badge" style="background: rgba(255,255,255,0.08);">${res.bestAge}</span></td>
        <td><span class="tag-badge tag-score">${res.bestScore.toFixed(4)}</span></td>
      `;
      tableDemographicsBody.appendChild(tr);
    });

    selectDemoVehicle.value = 'Luxury Sedan';
    updateDemographicHighlight();

    selectDemoVehicle.addEventListener('change', updateDemographicHighlight);
  }

  function updateDemographicHighlight() {
    const v = selectDemoVehicle.value;
    const res = GearCityEngine.evaluateDemographics(v);
    if (!res) return;

    const gClass = res.bestGender === 'Female' ? 'tag-female' : 'tag-male';
    demoHighlightBox.innerHTML = `
      <div class="metric-item">
        <div class="metric-item-label">Optimal Buyer Gender</div>
        <div class="metric-item-val"><span class="tag-badge ${gClass}" style="font-size: 16px;">${res.bestGender}</span></div>
      </div>
      <div class="metric-item">
        <div class="metric-item-label">Optimal Age Bracket</div>
        <div class="metric-item-val" style="color: var(--accent-cyan); font-size: 18px;">${res.bestAge}</div>
      </div>
      <div class="metric-item">
        <div class="metric-item-label">Top Preference Score</div>
        <div class="metric-item-val"><span class="tag-badge tag-score" style="font-size: 16px;">${res.bestScore.toFixed(4)}</span></div>
      </div>
    `;
  }

  /* ==========================================================================
     Chassis & Gearbox Synergies Tab Controller
     ========================================================================== */
  function initChassisAdvisor() {
    const vehicles = Object.keys(GEARCITY_DATA.archetypes);
    selectSynergyVehicle.innerHTML = '';
    vehicles.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      selectSynergyVehicle.appendChild(opt);
    });
    selectSynergyVehicle.value = 'Luxury Sedan';

    function updateSynergies() {
      const v = selectSynergyVehicle.value;
      const year = Number(inputSynergyYear.value) || 1960;
      const rec = GearCityEngine.getChassisGearboxRecommendations(v, year);
      if (!rec) return;

      synergyResultsBox.innerHTML = `
        <div class="metric-item">
          <div class="metric-item-label">Chassis / Suspension Archetype</div>
          <div class="metric-item-val" style="color: var(--accent-cyan);">${rec.archetype.chassis_style}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Recommended: <strong>${rec.recommendedFrame}</strong> with <strong>${rec.recommendedSuspension}</strong> (${year})</div>
        </div>
        <div class="metric-item">
          <div class="metric-item-label">Engine Archetype</div>
          <div class="metric-item-val" style="color: var(--accent-amber);">${rec.archetype.engine_style}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Wealth Tier: <strong>${rec.archetype.wealth_demographic}</strong> | Fleet: <strong>${rec.archetype.civilian_fleet ? 'Civilian' : 'Private'}</strong></div>
        </div>
        <div class="metric-item">
          <div class="metric-item-label">Gearbox Style</div>
          <div class="metric-item-val" style="color: var(--accent-emerald);">${rec.archetype.gearbox_style}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Recommended: <strong>${rec.recommendedTransmission}</strong> (${year})</div>
        </div>
      `;
    }

    selectSynergyVehicle.addEventListener('change', updateSynergies);
    inputSynergyYear.addEventListener('input', updateSynergies);
    updateSynergies();
  }

  // Initialize all tabs & calculations on load
  populateComponentDropdowns();
  updateCalculations();
  initDemographics();
  initChassisAdvisor();
});
