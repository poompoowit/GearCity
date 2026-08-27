/**
 * GearCity Web Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // DOM Elements - Optimizer Inputs
  const inputYear = document.getElementById('input-year');
  const inputYearNum = document.getElementById('input-year-num');
  const btnYearPrev = document.getElementById('btn-year-prev');
  const btnYearNext = document.getElementById('btn-year-next');
  const btnYearPresets = document.querySelectorAll('.btn-year-preset');
  const goalOptions = document.querySelectorAll('.goal-option');
  const inputMaxCost = document.getElementById('input-max-cost');
  const inputMaxWeight = document.getElementById('input-max-weight');
  const inputMaxLen = document.getElementById('input-max-len');
  const inputMaxWid = document.getElementById('input-max-wid');
  const selectOptFuel = document.getElementById('select-opt-fuel');
  const btnAutoOptimize = document.getElementById('btn-auto-optimize');
  const optimizerStatus = document.getElementById('optimizer-status');

  // DOM Elements - Component Filters Modal
  const filterModal = document.getElementById('filter-modal');
  const btnOpenFilterModal = document.getElementById('btn-open-filter-modal');
  const btnCloseFilterModal = document.getElementById('btn-close-filter-modal');
  const btnSaveCloseFilters = document.getElementById('btn-save-close-filters');
  const btnResetFiltersYear = document.getElementById('btn-reset-filters-year');
  const btnSelectAllFilters = document.getElementById('btn-select-all-filters');

  const filterListLayouts = document.getElementById('filter-list-layouts');
  const filterListCylinders = document.getElementById('filter-list-cylinders');
  const filterListFuel = document.getElementById('filter-list-fuel');
  const filterListInduction = document.getElementById('filter-list-induction');
  const filterListValves = document.getElementById('filter-list-valves');

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
  const inputSynergyYearNum = document.getElementById('input-synergy-year-num');
  const btnSynergyYearPrev = document.getElementById('btn-synergy-year-prev');
  const btnSynergyYearNext = document.getElementById('btn-synergy-year-next');
  const btnSynergyYearPresets = document.querySelectorAll('.btn-synergy-year-preset');
  const synergyResultsBox = document.getElementById('synergy-results-box');

  let currentFocus = 'HP';

  // User Filter State (Allowed components)
  const userAllowed = {
    layouts: new Set(),
    cylinders: new Set(),
    fuels: new Set(),
    inductions: new Set(),
    valves: new Set(),
  };

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
     Component Filters Modal & Checkbox Management
     ========================================================================== */
  function initFiltersForYear(year, forceReset = true) {
    if (forceReset) {
      userAllowed.layouts.clear();
      GEARCITY_DATA.layouts.forEach((l) => {
        if (Number(l.Year) <= year) userAllowed.layouts.add(l.Name);
      });

      userAllowed.cylinders.clear();
      GEARCITY_DATA.cylinders.forEach((c) => {
        if (Number(c.Year) <= year) userAllowed.cylinders.add(c.Name);
      });

      userAllowed.fuels.clear();
      GEARCITY_DATA.fuel.forEach((f) => {
        if (Number(f.Year) <= year) userAllowed.fuels.add(f.Name);
      });

      userAllowed.inductions.clear();
      GEARCITY_DATA.induction.forEach((i) => {
        if (Number(i.Year) <= year) userAllowed.inductions.add(i.Name);
      });

      userAllowed.valves.clear();
      GEARCITY_DATA.valvetrain.forEach((v) => {
        if (Number(v.Year) <= year) userAllowed.valves.add(v.Name);
      });
    }

    renderFilterCheckboxes();
  }

  function renderFilterCategory(container, items, allowedSet) {
    container.innerHTML = '';
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'filter-item';

      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = allowedSet.has(item.Name);

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          allowedSet.add(item.Name);
        } else {
          allowedSet.delete(item.Name);
        }
        populateComponentDropdowns();
        updateCalculations();
      });

      const spanName = document.createElement('span');
      spanName.textContent = item.Name;

      const spanYear = document.createElement('span');
      spanYear.className = 'filter-year-tag';
      spanYear.textContent = `${item.Year}`;

      label.appendChild(checkbox);
      label.appendChild(spanName);
      div.appendChild(label);
      div.appendChild(spanYear);
      container.appendChild(div);
    });
  }

  function renderFilterCheckboxes() {
    renderFilterCategory(filterListLayouts, GEARCITY_DATA.layouts, userAllowed.layouts);
    renderFilterCategory(filterListCylinders, GEARCITY_DATA.cylinders, userAllowed.cylinders);
    renderFilterCategory(filterListFuel, GEARCITY_DATA.fuel, userAllowed.fuels);
    renderFilterCategory(filterListInduction, GEARCITY_DATA.induction, userAllowed.inductions);
    renderFilterCategory(filterListValves, GEARCITY_DATA.valvetrain, userAllowed.valves);
  }

  btnOpenFilterModal.addEventListener('click', () => {
    filterModal.style.setProperty('display', 'flex', 'important');
    filterModal.classList.add('active');
  });

  const closeFilterModal = () => {
    filterModal.style.setProperty('display', 'none', 'important');
    filterModal.classList.remove('active');
  };
  btnCloseFilterModal.addEventListener('click', closeFilterModal);
  btnSaveCloseFilters.addEventListener('click', closeFilterModal);
  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) closeFilterModal();
  });

  btnResetFiltersYear.addEventListener('click', () => {
    const year = Number(inputYear.value);
    initFiltersForYear(year, true);
    populateComponentDropdowns();
    updateCalculations();
  });

  btnSelectAllFilters.addEventListener('click', () => {
    GEARCITY_DATA.layouts.forEach((l) => userAllowed.layouts.add(l.Name));
    GEARCITY_DATA.cylinders.forEach((c) => userAllowed.cylinders.add(c.Name));
    GEARCITY_DATA.fuel.forEach((f) => userAllowed.fuels.add(f.Name));
    GEARCITY_DATA.induction.forEach((i) => userAllowed.inductions.add(i.Name));
    GEARCITY_DATA.valvetrain.forEach((v) => userAllowed.valves.add(v.Name));
    renderFilterCheckboxes();
    populateComponentDropdowns();
    updateCalculations();
  });

  /* ==========================================================================
     Dynamic Dropdown Population based on Year & User Allowed Filters
     ========================================================================== */
  function populateComponentDropdowns(selectedValues = {}) {
    const validLayouts = GEARCITY_DATA.layouts.filter((l) => userAllowed.layouts.has(l.Name));
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
    const layoutName = selectLayout.value;
    const layoutRow = GEARCITY_DATA.layouts.find((l) => l.Name === layoutName);
    if (!layoutRow) return;

    // Fuels
    const allowedFuelNames = layoutRow.Fuel_Types || layoutRow['Fuel Types'] || [];
    const validFuels = GEARCITY_DATA.fuel.filter(
      (f) => userAllowed.fuels.has(f.Name) && allowedFuelNames.includes(f.Name)
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
      (c) => userAllowed.cylinders.has(c.Name) && allowedCylNames.includes(c.Name)
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
      (i) => userAllowed.inductions.has(i.Name) && allowedIndNames.includes(i.Name)
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
    const validValveNames = GearCityEngine.getValidValvetrains(layoutRow, Number(inputYear.value));
    const validValves = GEARCITY_DATA.valvetrain.filter(
      (v) => userAllowed.valves.has(v.Name) && validValveNames.includes(v.Name)
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
      statDim.textContent = `L: ${(res.lengthCm * 10).toFixed(0)} mm | W: ${(res.widthCm * 10).toFixed(0)} mm (${res.lengthCm.toFixed(1)} x ${res.widthCm.toFixed(1)} cm)`;
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }

  // Function to set year and refresh UI
  function setGameYear(val, forceFilterReset = false) {
    const clamped = Math.max(1900, Math.min(2020, Number(val) || 1900));
    inputYear.value = clamped;
    if (inputYearNum) inputYearNum.value = clamped;

    if (forceFilterReset) {
      initFiltersForYear(clamped, true);
    }
    populateComponentDropdowns();
    updateCalculations();
  }

  // Event Listeners for Live Updates
  inputYear.addEventListener('input', () => {
    setGameYear(inputYear.value, false);
  });

  if (inputYearNum) {
    inputYearNum.addEventListener('input', () => {
      if (inputYearNum.value.length >= 4) {
        setGameYear(inputYearNum.value, false);
      }
    });
    inputYearNum.addEventListener('change', () => {
      setGameYear(inputYearNum.value, false);
    });
  }

  if (btnYearPrev) {
    btnYearPrev.addEventListener('click', () => {
      setGameYear(Number(inputYear.value) - 1, false);
    });
  }

  if (btnYearNext) {
    btnYearNext.addEventListener('click', () => {
      setGameYear(Number(inputYear.value) + 1, false);
    });
  }

  btnYearPresets.forEach((btn) => {
    btn.addEventListener('click', () => {
      const yr = Number(btn.dataset.year);
      setGameYear(yr, false);
    });
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
     Auto-Optimizer Trigger (Respecting User Allowed Filters)
     ========================================================================== */
  btnAutoOptimize.addEventListener('click', () => {
    const year = Number(inputYear.value);
    const maxCost = inputMaxCost.value ? Number(inputMaxCost.value) : null;
    const maxWeight = inputMaxWeight.value ? Number(inputMaxWeight.value) : null;
    const maxLength = inputMaxLen.value ? Number(inputMaxLen.value) / 10.0 : null; // mm to cm
    const maxWidth = inputMaxWid.value ? Number(inputMaxWid.value) / 10.0 : null;   // mm to cm

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
          allowedLayouts: Array.from(userAllowed.layouts),
          allowedCylinders: Array.from(userAllowed.cylinders),
          allowedFuels: Array.from(userAllowed.fuels),
          allowedInductions: Array.from(userAllowed.inductions),
          allowedValves: Array.from(userAllowed.valves),
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
          optimizerStatus.textContent = `Optimal setup found: ${cfg.components.layout} ${cfg.components.cylinders}-cyl (${cfg.components.induction}, ${cfg.components.valve}).`;
        } else {
          optimizerStatus.textContent = 'No configuration found matching all limits. Try adjusting budget, weight, or filters.';
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
        <div class="metric-item-val" style="color: var(--gc-text-amber); font-size: 18px;">${res.bestAge}</div>
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

      const arch = rec.archetype;

      // Decode Engine Style Acronyms
      let engineExplanation = "";
      if (arch.engine_style.includes("SmallB")) {
        engineExplanation += "• <strong>SmallB</strong>: Small-Bore, high fuel efficiency engine (sub-2.0L) to minimize displacement taxes and fuel costs.<br>";
      }
      if (arch.engine_style.includes("Power")) {
        engineExplanation += "• <strong>Power</strong>: High torque & horsepower output (V8/I6) for effortless highway passing and hauling.<br>";
      }
      if (arch.engine_style.includes("SafeLux") || arch.engine_style.includes("Lux")) {
        engineExplanation += "• <strong>SafeLux</strong>: Ultra-smooth, quiet, highly dependable multi-cylinder architecture (V8/V12/I6).<br>";
      }
      if (arch.engine_style.includes("Sport") || arch.engine_style.includes("Race")) {
        engineExplanation += "• <strong>Sport/Race</strong>: High-revving, responsive powerband with optimized intake flow and lightweight materials.<br>";
      }
      if (arch.engine_style.includes("Truck")) {
        engineExplanation += "• <strong>Truck</strong>: High low-end torque curve, rugged cast materials, and high thermal dependability.<br>";
      }
      if (arch.engine_style.includes("Balance")) {
        engineExplanation += "• <strong>Balance</strong>: Moderate displacement inline/flat engine offering optimal cost-to-performance ratio.<br>";
      }
      if (!engineExplanation) {
        engineExplanation = "• Balanced output tailored for general passenger transport.";
      }

      synergyResultsBox.innerHTML = `
        <!-- Card 1: Frame Selection -->
        <div class="metric-item" style="display: flex; flex-direction: column; justify-content: space-between; text-align: left; padding: 18px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="metric-item-label" style="font-size: 13px;">🏗️ Recommended Frame</div>
              <span class="filter-year-tag">${rec.recommendedFrameYear} Unlocked</span>
            </div>
            <div class="metric-item-val" style="color: var(--gc-text-gold); font-size: 18px; margin-bottom: 8px;">${rec.recommendedFrame}</div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); line-height: 1.5;">${rec.frameReason}</div>
          </div>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #3d2314; font-size: 11px; color: var(--gc-text-muted);">
            Target Tuning: <strong style="color: var(--gc-text-amber);">${arch.chassis_style}</strong>
          </div>
        </div>

        <!-- Card 2: Suspension Selection -->
        <div class="metric-item" style="display: flex; flex-direction: column; justify-content: space-between; text-align: left; padding: 18px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="metric-item-label" style="font-size: 13px;">🌀 Recommended Suspension</div>
              <span class="filter-year-tag">${rec.recommendedSuspensionYear} Unlocked</span>
            </div>
            <div class="metric-item-val" style="color: var(--gc-text-amber); font-size: 18px; margin-bottom: 8px;">${rec.recommendedSuspension}</div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); line-height: 1.5;">${rec.suspensionReason}</div>
          </div>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #3d2314; font-size: 11px; color: var(--gc-text-muted);">
            Ride Profile: <strong style="color: var(--gc-text-amber);">${arch.chassis_style}</strong>
          </div>
        </div>

        <!-- Card 3: Transmission Selection -->
        <div class="metric-item" style="display: flex; flex-direction: column; justify-content: space-between; text-align: left; padding: 18px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="metric-item-label" style="font-size: 13px;">⚙️ Recommended Transmission</div>
              <span class="filter-year-tag">${rec.recommendedTransmissionYear} Unlocked</span>
            </div>
            <div class="metric-item-val" style="color: var(--gc-text-green); font-size: 18px; margin-bottom: 8px;">${rec.recommendedTransmission}</div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); line-height: 1.5;">${rec.transmissionReason}</div>
          </div>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #3d2314; font-size: 11px; color: var(--gc-text-muted);">
            Gearbox Behavior: <strong style="color: var(--gc-text-green);">${arch.gearbox_style}</strong>
          </div>
        </div>

        <!-- Card 4: Target Engine Pairing Profile -->
        <div class="metric-item" style="display: flex; flex-direction: column; justify-content: space-between; text-align: left; padding: 18px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div class="metric-item-label" style="font-size: 13px;">🏎️ Target Engine Synergy Profile</div>
              <span class="filter-year-tag">Archetype: ${arch.engine_style}</span>
            </div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); line-height: 1.6; margin-top: 4px;">
              ${engineExplanation}
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #3d2314; font-size: 11px; color: var(--gc-text-muted); display: flex; justify-content: space-between;">
            <span>Wealth Tier: <strong style="color: var(--gc-text-gold);">Tier ${arch.wealth_demographic} / 6</strong></span>
            <span>Fleet: <strong style="color: ${arch.civilian_fleet ? 'var(--gc-text-green)' : 'var(--gc-text-muted)'};">${arch.civilian_fleet ? 'Civilian Fleet OK' : 'Private Only'}</strong></span>
          </div>
        </div>
      `;
    }

    function setSynergyYear(val) {
      const clamped = Math.max(1900, Math.min(2020, Number(val) || 1900));
      inputSynergyYear.value = clamped;
      if (inputSynergyYearNum) inputSynergyYearNum.value = clamped;
      updateSynergies();
    }

    selectSynergyVehicle.addEventListener('change', updateSynergies);
    inputSynergyYear.addEventListener('input', () => setSynergyYear(inputSynergyYear.value));

    if (inputSynergyYearNum) {
      inputSynergyYearNum.addEventListener('input', () => {
        if (inputSynergyYearNum.value.length >= 4) {
          setSynergyYear(inputSynergyYearNum.value);
        }
      });
      inputSynergyYearNum.addEventListener('change', () => {
        setSynergyYear(inputSynergyYearNum.value);
      });
    }

    if (btnSynergyYearPrev) {
      btnSynergyYearPrev.addEventListener('click', () => {
        setSynergyYear(Number(inputSynergyYear.value) - 1);
      });
    }

    if (btnSynergyYearNext) {
      btnSynergyYearNext.addEventListener('click', () => {
        setSynergyYear(Number(inputSynergyYear.value) + 1);
      });
    }

    btnSynergyYearPresets.forEach((btn) => {
      btn.addEventListener('click', () => {
        setSynergyYear(Number(btn.dataset.year));
      });
    });

    updateSynergies();
  }

  // Initialize filters, dropdowns & calculations on load
  const initialYear = Number(inputYear.value) || 1957;
  initFiltersForYear(initialYear, true);
  populateComponentDropdowns();
  updateCalculations();
  initDemographics();
  initChassisAdvisor();
});
