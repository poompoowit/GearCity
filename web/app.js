/**
 * GearCity Web Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Usage / Analytics Event Logging (GoatCounter)
  function trackUsageEvent(name, title) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({
          path: name,
          title: title || name,
          event: true,
        });
      }
    } catch (err) {
      // Graceful fallback if analytics is blocked or unavailable
    }
  }

  /* ==========================================================================
     Session & Preset State Persistence (localStorage)
     ========================================================================== */
  const CACHE_KEY = 'gearcity_app_state_v1';

  function getCachedState() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCachedState(partial) {
    try {
      const current = getCachedState();
      const updated = { ...current, ...partial };
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
      // Ignore quota/private browsing issues
    }
  }

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

  // DOM Elements - Design Skill
  const inputDesignSkillNum = document.getElementById('input-design-skill-num');
  const sliderDesignSkill = document.getElementById('slider-design-skill');
  const btnSkillPresets = document.querySelectorAll('.btn-skill-preset');

  // DOM Elements - In-Game Quality Ratings
  const ratingOverallBadge = document.getElementById('rating-overall-badge');
  const valRatingDep = document.getElementById('val-rating-dep');
  const barRatingDep = document.getElementById('bar-rating-dep');
  const valRatingPower = document.getElementById('val-rating-power');
  const barRatingPower = document.getElementById('bar-rating-power');
  const valRatingSmooth = document.getElementById('val-rating-smooth');
  const barRatingSmooth = document.getElementById('bar-rating-smooth');
  const valRatingEco = document.getElementById('val-rating-eco');
  const barRatingEco = document.getElementById('bar-rating-eco');

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
      saveCachedState({ activeTab: tab.dataset.tab });
      trackUsageEvent('tab_' + tab.dataset.tab, 'Tab: ' + (tab.innerText.trim() || tab.dataset.tab));
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
      saveCachedState({ optGoal: currentFocus });
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

  const btnVoptOpenFilterModal = document.getElementById('btn-vopt-open-filter-modal');
  const openFilterModal = () => {
    filterModal.style.setProperty('display', 'flex', 'important');
    filterModal.classList.add('active');
  };

  btnOpenFilterModal.addEventListener('click', openFilterModal);
  if (btnVoptOpenFilterModal) {
    btnVoptOpenFilterModal.addEventListener('click', openFilterModal);
  }

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
    const isVoptTab = document.getElementById('tab-vehicle-engine')?.classList.contains('active');
    const voptYearInput = document.getElementById('input-vopt-year');
    const year = isVoptTab && voptYearInput ? Number(voptYearInput.value) || 1960 : Number(inputYear.value) || 1957;
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

    const designSkill = Number(sliderDesignSkill ? sliderDesignSkill.value : (inputDesignSkillNum ? inputDesignSkillNum.value : 70));

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
      designSkill,
      name: inputModelName.value || `Engine_${year}`,
    };

    try {
      const res = GearCityEngine.calculatePerformance(config);
      statHeroHp.textContent = `${res.horsepower.toFixed(1)} HP`;
      statHeroSub.textContent = `@ ${res.rpm.toFixed(0)} RPM`;
      statTorque.textContent = `${res.torqueNm.toFixed(1)} Nm (${res.torqueFtLb.toFixed(1)} lb-ft)`;
      statDisp.textContent = `${res.displacementCc.toFixed(0)} cc`;
      badgeDispLive.textContent = `${res.displacementCc.toFixed(0)} cc`;
      statCost.textContent = `$${res.unitCost.toFixed(2)}`;
      statWeight.textContent = `${res.weightKg.toFixed(1)} kg`;
      statDim.textContent = `L: ${(res.lengthCm * 10).toFixed(0)} mm | W: ${(res.widthCm * 10).toFixed(0)} mm (${res.lengthCm.toFixed(1)} x ${res.widthCm.toFixed(1)} cm)`;

      if (res.ratings && ratingOverallBadge) {
        ratingOverallBadge.textContent = `Overall: ${res.ratings.overall.toFixed(1)} ⭐`;
        if (valRatingDep) valRatingDep.textContent = `${res.ratings.dependability.toFixed(0)}%`;
        if (barRatingDep) barRatingDep.style.width = `${res.ratings.dependability}%`;
        if (valRatingPower) valRatingPower.textContent = `${res.ratings.power.toFixed(0)}%`;
        if (barRatingPower) barRatingPower.style.width = `${res.ratings.power}%`;
        if (valRatingSmooth) valRatingSmooth.textContent = `${res.ratings.smoothness.toFixed(0)}%`;
        if (barRatingSmooth) barRatingSmooth.style.width = `${res.ratings.smoothness}%`;
        if (valRatingEco) valRatingEco.textContent = `${res.ratings.fuelEconomy.toFixed(0)}%`;
        if (barRatingEco) barRatingEco.style.width = `${res.ratings.fuelEconomy}%`;
      }
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }

  // Function to set year and refresh UI
  function setGameYear(val, forceFilterReset = false) {
    const clamped = Math.max(1900, Math.min(2020, Number(val) || 1900));
    inputYear.value = clamped;
    if (inputYearNum) inputYearNum.value = clamped;

    saveCachedState({ year: clamped });

    // Synchronize year inputs in other tabs if present
    const elAdvYear = document.getElementById('input-advisor-year');
    const elAdvYearNum = document.getElementById('input-advisor-year-num');
    if (elAdvYear && elAdvYear.value != clamped) elAdvYear.value = clamped;
    if (elAdvYearNum && elAdvYearNum.value != clamped) elAdvYearNum.value = clamped;

    const elVoptYear = document.getElementById('input-vopt-year');
    const elVoptYearNum = document.getElementById('input-vopt-year-num');
    if (elVoptYear && elVoptYear.value != clamped) elVoptYear.value = clamped;
    if (elVoptYearNum && elVoptYearNum.value != clamped) elVoptYearNum.value = clamped;

    if (forceFilterReset) {
      initFiltersForYear(clamped, true);
    }
    populateComponentDropdowns();
    updateCalculations();
  }

  // Function to set Design Skill
  function setDesignSkill(val) {
    const clamped = Math.max(0, Math.min(100, Number(val) || 70));
    if (sliderDesignSkill) sliderDesignSkill.value = clamped;
    if (inputDesignSkillNum) inputDesignSkillNum.value = clamped;
    saveCachedState({ designSkill: clamped });
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

  if (sliderDesignSkill) {
    sliderDesignSkill.addEventListener('input', () => setDesignSkill(sliderDesignSkill.value));
  }

  if (inputDesignSkillNum) {
    inputDesignSkillNum.addEventListener('input', () => {
      if (inputDesignSkillNum.value !== '') setDesignSkill(inputDesignSkillNum.value);
    });
    inputDesignSkillNum.addEventListener('change', () => setDesignSkill(inputDesignSkillNum.value));
  }

  btnSkillPresets.forEach((btn) => {
    btn.addEventListener('click', () => {
      setDesignSkill(Number(btn.dataset.skill));
    });
  });

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
    el.addEventListener('change', () => {
      updateCalculations();
    });
  });

  [sliderBore, sliderStroke, sliderRpm, sliderTorq, sliderPerfFocus, sliderEcoFocus, sliderMaterials, sliderWeight].forEach((el) => {
    el.addEventListener('input', () => {
      updateCalculations();
      saveCachedState({
        engineSliders: {
          bore: sliderBore?.value,
          stroke: sliderStroke?.value,
          rpm: sliderRpm?.value,
          torque: sliderTorq?.value,
          perfFocus: sliderPerfFocus?.value,
          ecoFocus: sliderEcoFocus?.value,
          materials: sliderMaterials?.value,
          weight: sliderWeight?.value,
        }
      });
    });
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

    trackUsageEvent('optimize_engine_base', `Base Optimizer (${year} - ${currentFocus})`);

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
          designSkill: Number(sliderDesignSkill ? sliderDesignSkill.value : 70),
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

    trackUsageEvent('download_xml_base', `Download XML: ${modelName} (${year})`);

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

    const cached = getCachedState();
    if (cached.demoVehicle && vehicles.includes(cached.demoVehicle)) {
      selectDemoVehicle.value = cached.demoVehicle;
    } else {
      selectDemoVehicle.value = 'Luxury Sedan';
    }
    updateDemographicHighlight();

    selectDemoVehicle.addEventListener('change', () => {
      saveCachedState({ demoVehicle: selectDemoVehicle.value });
      updateDemographicHighlight();
    });
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
  // ============================================================
  // TAB 3: Vehicle Class Advisor
  // ============================================================
  function initVehicleAdvisor() {
    const selectVehicle = document.getElementById('select-vehicle-advisor');
    const inputYear = document.getElementById('input-advisor-year');
    const inputYearNum = document.getElementById('input-advisor-year-num');
    const btnPrev = document.getElementById('btn-advisor-year-prev');
    const btnNext = document.getElementById('btn-advisor-year-next');
    const summaryCard = document.getElementById('vehicle-summary-card');
    const designCards = document.getElementById('vehicle-design-cards');
    const tableBody = document.getElementById('table-vehicle-classes-body');

    // Rating level to percentage for bar display
    const RATING_LEVELS = {
      'Minimum': 5, 'Very low': 15, 'Low': 25, 'Low Mid': 35,
      'Mid': 45, 'Mid +': 55, 'High': 65, 'Very High': 80,
      'Highest': 95
    };

    const RATING_COLORS = {
      performance: '#ef5350',
      strength: '#81c784',
      comfort: '#ce93d8',
      durability: '#ffb74d',
      reliability: '#ffb74d',
      power: '#ff7043',
      driveability: '#64b5f6',
      safety: '#81c784',
      luxury: '#ce93d8',
      dependability: '#ffb74d'
    };

    const CHASSIS_RATING_NAMES = {
      performance: 'Performance Rating',
      strength: 'Strength Rating',
      comfort: 'Comfort Rating',
      durability: 'Durability Rating',
    };

    const GEARBOX_RATING_NAMES = {
      comfort: 'Comfort Rating',
      performance: 'Performance Rating',
      reliability: 'Reliability Rating',
      power: 'Power Rating',
    };

    function ratingBar(label, value, colorKey) {
      const pct = RATING_LEVELS[value] || 50;
      const color = RATING_COLORS[colorKey] || '#ffb74d';
      return `<div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="color: var(--gc-text-ivory);">${label}</span>
          <span style="color: ${color}; font-weight: 600;">${value}</span>
        </div>
        <div style="background: rgba(0,0,0,0.4); border-radius: 3px; height: 6px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 3px; transition: width 0.3s;"></div>
        </div>
      </div>`;
    }

    function yearTag(items) {
      return items.map(item => {
        const yearStr = item.year > 0 ? `<span class="filter-year-tag" style="font-size: 10px; padding: 1px 5px;">${item.year}</span> ` : '';
        return `<div style="margin-bottom: 3px; font-size: 12px; color: var(--gc-text-ivory);">${yearStr}${item.name}</div>`;
      }).join('');
    }

    function unavailableTag(items) {
      return items.map(item => {
        return `<div style="margin-bottom: 3px; font-size: 11px; color: var(--gc-text-muted); opacity: 0.5;">🔒 <span style="text-decoration: line-through;">${item.year} ${item.name}</span></div>`;
      }).join('');
    }

    // Populate vehicle class reference table
    function renderTable() {
      const vc = GEARCITY_DATA.vehicleClasses;
      tableBody.innerHTML = vc.map(v => `
        <tr data-vehicle="${v.carType}" style="cursor: pointer;" class="vehicle-class-row">
          <td style="font-weight: 700; color: var(--gc-text-gold);">${v.carType}</td>
          <td><span style="color: var(--gc-text-amber);">${v.chassis}</span></td>
          <td><span style="color: var(--gc-text-green);">${v.engineType}</span></td>
          <td><span style="color: #64b5f6;">${v.gear}</span></td>
          <td style="text-align: center;">${v.milFleet ? '✓' : '—'}</td>
          <td style="text-align: center;">${v.civFleet ? '✓' : '—'}</td>
          <td style="text-align: center;">${v.lowFunding ? '💰' : '—'}</td>
          <td style="text-align: center;">${v.highFunding ? '💎' : '—'}</td>
          <td style="font-size: 11px;">${v.bodyFocus}</td>
          <td style="font-size: 11px;">${v.wealth}</td>
        </tr>
      `).join('');

      // Click row to select vehicle
      tableBody.querySelectorAll('.vehicle-class-row').forEach(row => {
        row.addEventListener('click', () => {
          const vt = row.dataset.vehicle;
          selectVehicle.value = vt;
          selectVehicle.dispatchEvent(new Event('change'));
          // Highlight row
          tableBody.querySelectorAll('.vehicle-class-row').forEach(r => r.style.background = '');
          row.style.background = 'rgba(176, 111, 64, 0.15)';
        });
      });
    }

    // Populate dropdown
    GEARCITY_DATA.vehicleClasses.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.carType;
      opt.textContent = v.carType;
      selectVehicle.appendChild(opt);
    });
    selectVehicle.value = 'Sedan';

    function updateDetail() {
      const carType = selectVehicle.value;
      const year = Number(inputYear.value) || 1960;
      const advice = GearCityEngine.getVehicleDesignAdvice(carType, year);
      if (!advice) {
        summaryCard.innerHTML = '<div style="color: var(--gc-text-muted);">Select a vehicle type.</div>';
        designCards.innerHTML = '';
        return;
      }

      const v = advice.vehicle;

      // Vehicle Summary
      summaryCard.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
          <div style="font-size: 18px; font-weight: 800; color: var(--gc-text-gold); flex: 1;">${v.carType}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px;">
            ${v.milFleet ? '<span style="background: rgba(76,175,80,0.15); color: #81c784; padding: 3px 8px; border-radius: 3px; border: 1px solid rgba(76,175,80,0.3);">🎖️ Military Fleet</span>' : ''}
            ${v.civFleet ? '<span style="background: rgba(100,181,246,0.15); color: #64b5f6; padding: 3px 8px; border-radius: 3px; border: 1px solid rgba(100,181,246,0.3);">🏢 Civilian Fleet</span>' : ''}
            ${v.lowFunding ? '<span style="background: rgba(255,183,77,0.15); color: #ffb74d; padding: 3px 8px; border-radius: 3px; border: 1px solid rgba(255,183,77,0.3);">💰 Low Budget Model</span>' : ''}
            ${v.highFunding ? '<span style="background: rgba(206,147,216,0.15); color: #ce93d8; padding: 3px 8px; border-radius: 3px; border: 1px solid rgba(206,147,216,0.3);">💎 High Budget Model</span>' : ''}
          </div>
        </div>
        <div style="display: flex; gap: 24px; margin-top: 10px; font-size: 12px; color: var(--gc-text-muted);">
          <span>📦 Body: <strong style="color: var(--gc-text-ivory);">${v.bodyFocus}</strong></span>
          <span>💰 Wealth: <strong style="color: var(--gc-text-ivory);">${v.wealth}</strong></span>
        </div>
        ${v.lowFunding && v.highFunding ? '<div style="margin-top: 8px; font-size: 11px; color: var(--gc-text-amber); background: rgba(255,183,77,0.08); padding: 6px 10px; border-radius: 3px; border: 1px solid rgba(255,183,77,0.15);">⚠️ This vehicle type needs <strong>two models</strong>: one for budget buyers and one for premium buyers.</div>' : ''}
      `;

      // Build design cards
      let html = '';

      // Chassis Design Cards
      advice.chassisDetails.forEach((ch, idx) => {
        if (ch.notFound) {
          html += `<div class="metric-item" style="padding: 16px;"><div style="color: var(--gc-text-muted);">Chassis concept "${ch.name}" not found.</div></div>`;
          return;
        }
        const unavailFrames = ch.frameAll.filter(f => f.year > year && f.year > 0);
        const unavailDrive = ch.drivetrainAll.filter(f => f.year > year && f.year > 0);
        const unavailSusp = ch.suspensionAll.filter(f => f.year > year && f.year > 0);

        html += `
          <div class="metric-item" style="padding: 16px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-weight: 800; font-size: 15px; color: var(--gc-text-gold);">🏗️ Chassis: ${ch.name}</div>
              ${advice.chassisDetails.length > 1 ? `<span class="filter-year-tag" style="font-size: 10px;">Option ${idx+1}</span>` : ''}
            </div>
            <div style="background: rgba(255,183,77,0.1); border: 1px solid rgba(255,183,77,0.25); border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; font-size: 12px;">
              <span style="color: var(--gc-text-amber); font-weight: 700;">🎯 Engine Compatibility:</span>
              <span style="color: var(--gc-text-gold); font-weight: 800;"> Designed for "${ch.maxEngine}" Engine</span>
            </div>
            ${ch.eraBenchmark ? `
            <div style="background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="color: #81c784; font-weight: 700;">⚖️ ${ch.eraBenchmark.decade} Era Target Chassis Mass:</span>
                <span style="color: #81c784; font-weight: 800; font-size: 13px;">${ch.eraBenchmark.avgChassisKg} kg</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: var(--gc-text-muted); font-size: 10px;">
                <span>Bare Range: <strong style="color: var(--gc-text-ivory);">${ch.eraBenchmark.chassisRangeKg} kg</strong></span>
                <span>Total Curb: <strong style="color: var(--gc-text-gold);">${ch.eraBenchmark.curbRangeKg} kg</strong></span>
              </div>
            </div>
            ` : ''}
            ${ch.note ? `<div style="font-size: 11px; color: var(--gc-text-amber); margin-bottom: 8px;">📝 <strong>Note:</strong> ${ch.note}</div>` : ''}
            <div style="font-weight: 700; font-size: 11px; color: var(--gc-text-gold); margin-bottom: 6px;">📊 In-Game Design Ratings</div>
            <div style="margin-bottom: 12px;">
              ${Object.entries(ch.ratings).map(([k,v]) => ratingBar(CHASSIS_RATING_NAMES[k] || (k.charAt(0).toUpperCase() + k.slice(1) + ' Rating'), v, k)).join('')}
            </div>
            <div style="border-top: 1px solid #3d2314; padding-top: 8px;">
              <div style="font-weight: 700; font-size: 11px; color: var(--gc-text-amber); margin-bottom: 4px;">🏗️ Frame</div>
              ${yearTag(ch.frameAvailable)}
              ${unavailableTag(unavailFrames)}
              <div style="font-weight: 700; font-size: 11px; color: var(--gc-text-amber); margin-bottom: 4px; margin-top: 8px;">🔧 Drivetrain</div>
              ${yearTag(ch.drivetrainAvailable)}
              ${unavailableTag(unavailDrive)}
              <div style="font-weight: 700; font-size: 11px; color: var(--gc-text-amber); margin-bottom: 4px; margin-top: 8px;">🌀 Suspension</div>
              ${yearTag(ch.suspensionAvailable)}
              ${unavailableTag(unavailSusp)}
            </div>

            <div style="border-top: 1px solid #3d2314; padding-top: 8px; margin-top: 8px; font-size: 11px; color: var(--gc-text-muted);">
              <div style="font-weight: 700; color: var(--gc-text-gold); margin-bottom: 6px;">🎛️ Detailed Advanced Designer Sliders</div>
              ${ch.suspensionTuning ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: #64b5f6; font-weight: 700; font-size: 10px; margin-bottom: 3px;">🌀 SUSPENSION TUNING (0-100)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Stability: <strong style="color: var(--gc-text-ivory);">${ch.suspensionTuning.stability}</strong></div>
                  <div>Comfort: <strong style="color: var(--gc-text-ivory);">${ch.suspensionTuning.comfort}</strong></div>
                  <div>Performance: <strong style="color: var(--gc-text-ivory);">${ch.suspensionTuning.performance}</strong></div>
                  <div>Braking: <strong style="color: var(--gc-text-ivory);">${ch.suspensionTuning.braking}</strong></div>
                  <div style="grid-column: span 2;">Durability: <strong style="color: var(--gc-text-ivory);">${ch.suspensionTuning.durability}</strong></div>
                </div>
              </div>
              ` : ''}
              ${ch.dimensions ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: var(--gc-text-amber); font-weight: 700; font-size: 10px; margin-bottom: 3px;">📐 DIMENSIONS & WEIGHT (0-100)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Length: <strong style="color: var(--gc-text-ivory);">${ch.dimensions.length}</strong></div>
                  <div>Width: <strong style="color: var(--gc-text-ivory);">${ch.dimensions.width}</strong></div>
                  <div>Height: <strong style="color: var(--gc-text-ivory);">${ch.dimensions.height}</strong></div>
                  <div>Weight Red.: <strong style="color: var(--gc-text-ivory);">${ch.dimensions.weight}</strong></div>
                  <div style="grid-column: span 2;">Engine Bay: <strong style="color: var(--gc-text-ivory);">${ch.dimensions.engWidth}W × ${ch.dimensions.engLength}L</strong></div>
                </div>
              </div>
              ` : ''}
              ${ch.designFocus ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: var(--gc-text-green); font-weight: 700; font-size: 10px; margin-bottom: 3px;">🎯 DESIGN FOCUS (0-100)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Perf Focus: <strong style="color: #ef5350;">${ch.designFocus.performance}</strong></div>
                  <div>Control: <strong style="color: #81c784;">${ch.designFocus.control}</strong></div>
                  <div>Strength: <strong style="color: #ce93d8;">${ch.designFocus.strength}</strong></div>
                  <div>Dependability: <strong style="color: #ffb74d;">${ch.designFocus.dependability}</strong></div>
                </div>
              </div>
              ` : ''}
              ${ch.techSliders ? `
              <div style="background: rgba(0,0,0,0.25); padding: 5px 8px; border-radius: 4px; font-size: 10px; margin-bottom: 8px;">
                <span style="color: var(--gc-text-gold); font-weight: 700;">Tech Sliders: </span>
                <span>Mat: <strong style="color: var(--gc-text-ivory);">${ch.techSliders.materials}</strong>, </span>
                <span>Comp: <strong style="color: var(--gc-text-ivory);">${ch.techSliders.components}</strong>, </span>
                <span>Tech: <strong style="color: var(--gc-text-ivory);">${ch.techSliders.technology}</strong>, </span>
                <span>Techq: <strong style="color: var(--gc-text-ivory);">${ch.techSliders.techniques}</strong></span>
              </div>
              ` : ''}
              <button class="btn btn-secondary btn-chassis-download-xml" data-chassis-name="${ch.name}" style="width: 100%; padding: 6px 10px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: 1px solid var(--gc-border-gold); background: rgba(255,183,77,0.15);">
                <span>📥</span> <span style="font-weight: 700; color: var(--gc-text-gold);">Download Chassis Blueprint (.xml)</span>
              </button>
            </div>
          </div>
        `;
      });

      // Engine Design Cards
      advice.engineDetails.forEach((ed, idx) => {
        if (ed.notFound) {
          html += `<div class="metric-item" style="padding: 16px;"><div style="color: var(--gc-text-muted);">Engine concept "${ed.name}" not found.</div></div>`;
          return;
        }
        html += `
          <div class="metric-item" style="padding: 16px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-weight: 800; font-size: 15px; color: var(--gc-text-green);">🔥 Engine: ${ed.name}</div>
              ${advice.engineDetails.length > 1 ? `<span class="filter-year-tag" style="font-size: 10px;">Option ${idx+1}</span>` : ''}
            </div>
            <div style="background: rgba(129,199,132,0.1); border: 1px solid rgba(129,199,132,0.25); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 12px;">
              <span style="color: #81c784; font-weight: 700;">🎯 Optimization Focus:</span>
              <span style="color: var(--gc-text-gold); font-weight: 800;"> Max ${ed.optimizeFocus || 'Torque'} (${ed.maxWeight} kg, Ratio ≤ ${ed.maxHpTorqueRatio || 'None'})</span>
            </div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); margin-bottom: 8px;">💡 ${ed.concept}</div>
            ${ed.ratingNeed ? `<div style="font-size: 11px; color: var(--gc-text-amber); margin-bottom: 8px;">⚠️ Prioritize: <strong>${ed.ratingNeed}</strong></div>` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
              <div style="color: var(--gc-text-muted);">Focus: <strong style="color: var(--gc-text-ivory);">${ed.optimizeFocus || 'HP'}</strong></div>
              <div style="color: var(--gc-text-muted);">Max Weight: <strong style="color: var(--gc-text-ivory);">${ed.maxWeight} kg</strong></div>
              <div style="color: var(--gc-text-muted);">HP:Torque: <strong style="color: var(--gc-text-ivory);">${ed.maxHpTorqueRatio != null ? '≤ ' + ed.maxHpTorqueRatio : 'No limit'}</strong></div>
              <div style="color: var(--gc-text-muted);">Est. Cost: <strong style="color: var(--gc-text-ivory);">$${ed.costTarget || '—'}</strong></div>
            </div>
            <div style="border-top: 1px solid #3d2314; padding-top: 8px; font-size: 11px; color: var(--gc-text-muted);">
              <div style="font-weight: 700; color: var(--gc-text-green); margin-bottom: 4px;">📊 Design Sliders</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <div>Design Depend.: <strong style="color: var(--gc-text-ivory);">${ed.designDependability != null ? ed.designDependability : '—'}</strong></div>
                <div>Perf Fuel: <strong style="color: var(--gc-text-ivory);">${ed.performanceFuel != null ? ed.performanceFuel : '—'}</strong></div>
                <div>Tech Comp.: <strong style="color: var(--gc-text-ivory);">${ed.techComponent != null ? ed.techComponent : '—'}</strong></div>
                <div>Tech Tech.: <strong style="color: var(--gc-text-ivory);">${ed.techTechnology != null ? ed.techTechnology : '—'}</strong></div>
                <div>Tech Technique: <strong style="color: var(--gc-text-ivory);">${ed.techTechnique != null ? ed.techTechnique : '—'}</strong></div>
              </div>
            </div>
          </div>
        `;
      });

      // Gearbox Design Cards
      advice.gearDetails.forEach((gd, idx) => {
        if (gd.notFound) {
          html += `<div class="metric-item" style="padding: 16px;"><div style="color: var(--gc-text-muted);">Gearbox concept "${gd.name}" not found.</div></div>`;
          return;
        }
        const unavailGears = gd.gearboxAll.filter(g => g.year > year && g.year > 0);

        html += `
          <div class="metric-item" style="padding: 16px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-weight: 800; font-size: 15px; color: #64b5f6;">⚙️ Gearbox: ${gd.name}</div>
              ${advice.gearDetails.length > 1 ? `<span class="filter-year-tag" style="font-size: 10px;">Option ${idx+1}</span>` : ''}
            </div>
            <div style="background: rgba(100,181,246,0.1); border: 1px solid rgba(100,181,246,0.3); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 12px;">
              <span style="color: #64b5f6; font-weight: 700;">🎯 Max T from Engine:</span>
              <span style="color: var(--gc-text-gold); font-weight: 800;"> Must handle Max T from "${gd.maxEngineType}" Engine</span>
            </div>
            <div style="font-size: 12px; color: var(--gc-text-ivory); margin-bottom: 8px;">💡 ${gd.concept}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--gc-text-muted); margin-bottom: 8px;">
              <span>Est. Cost: <strong style="color: var(--gc-text-ivory);">${gd.cost || '$200 - $300'}</strong></span>
            </div>
            ${gd.note ? `<div style="font-size: 11px; color: var(--gc-text-amber); margin-bottom: 8px;">📝 <strong>Note:</strong> ${gd.note}</div>` : ''}
            <div style="font-weight: 700; font-size: 11px; color: #64b5f6; margin-bottom: 6px;">📊 In-Game Design Ratings</div>
            <div style="margin-bottom: 10px;">
              ${Object.entries(gd.ratings).map(([k,v]) => ratingBar(GEARBOX_RATING_NAMES[k] || (k.charAt(0).toUpperCase() + k.slice(1) + ' Rating'), v, k)).join('')}
            </div>
            <div style="border-top: 1px solid #3d2314; padding-top: 8px;">
              <div style="font-weight: 700; font-size: 11px; color: #64b5f6; margin-bottom: 4px;">🔧 Gearbox Types (Year Unlocks)</div>
              ${yearTag(gd.gearboxAvailable)}
              ${unavailableTag(unavailGears)}
            </div>

            <div style="border-top: 1px solid #3d2314; padding-top: 8px; margin-top: 8px; font-size: 11px; color: var(--gc-text-muted);">
              <div style="font-weight: 700; color: #64b5f6; margin-bottom: 6px;">🎛️ Detailed Advanced Designer Sliders</div>
              ${gd.gearing ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: #64b5f6; font-weight: 700; font-size: 10px; margin-bottom: 3px;">⚙️ GEARING & TORQUE LIMITS</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Lo-Ratio: <strong style="color: var(--gc-text-ivory);">${gd.gearing.loRatio}%</strong></div>
                  <div>Hi-Ratio: <strong style="color: var(--gc-text-ivory);">${gd.gearing.hiRatio}%</strong></div>
                  <div>Torque Slider: <strong style="color: var(--gc-text-ivory);">${gd.gearing.torqueInputRatio}%</strong></div>
                  <div>Max Torque: <strong style="color: #ffb74d;">${gd.gearing.maxTorqueInput} Nm</strong></div>
                </div>
              </div>
              ` : ''}
              ${gd.features ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: var(--gc-text-amber); font-weight: 700; font-size: 10px; margin-bottom: 3px;">🎚️ FEATURES & DRIVETRAIN</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Forward Gears: <strong style="color: var(--gc-text-ivory);">${gd.features.gears}</strong></div>
                  <div>Overdrive: <strong style="color: var(--gc-text-ivory);">${gd.features.overdrive ? 'Yes' : 'No'}</strong></div>
                  <div>Limited Slip Diff: <strong style="color: var(--gc-text-ivory);">${gd.features.limited ? 'Yes' : 'No'}</strong></div>
                  <div>Transaxle: <strong style="color: var(--gc-text-ivory);">${gd.features.transaxle ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
              ` : ''}
              ${gd.designFocus ? `
              <div style="background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="color: var(--gc-text-green); font-weight: 700; font-size: 10px; margin-bottom: 3px;">🎯 DESIGN FOCUS (0-100)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px;">
                  <div>Comfort: <strong style="color: #ce93d8;">${gd.designFocus.comfort}%</strong></div>
                  <div>Performance: <strong style="color: #ef5350;">${gd.designFocus.performance}%</strong></div>
                  <div>Dependability: <strong style="color: #ffb74d;">${gd.designFocus.dependability}%</strong></div>
                  <div>Fuel Economy: <strong style="color: #81c784;">${gd.designFocus.fuel}%</strong></div>
                </div>
              </div>
              ` : ''}
              ${gd.techSliders ? `
              <div style="background: rgba(0,0,0,0.25); padding: 5px 8px; border-radius: 4px; font-size: 10px; margin-bottom: 8px;">
                <span style="color: #64b5f6; font-weight: 700;">Tech Sliders: </span>
                <span>Mat: <strong style="color: var(--gc-text-ivory);">${gd.techSliders.materials}</strong>, </span>
                <span>Comp: <strong style="color: var(--gc-text-ivory);">${gd.techSliders.components}</strong>, </span>
                <span>Tech: <strong style="color: var(--gc-text-ivory);">${gd.techSliders.technology}</strong>, </span>
                <span>Techq: <strong style="color: var(--gc-text-ivory);">${gd.techSliders.techniques}</strong></span>
              </div>
              ` : ''}
              <button class="btn btn-secondary btn-gearbox-download-xml" data-gearbox-name="${gd.name}" style="width: 100%; padding: 6px 10px; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: 1px solid #64b5f6; background: rgba(100,181,246,0.15);">
                <span>📥</span> <span style="font-weight: 700; color: #64b5f6;">Download Gearbox Blueprint (.xml)</span>
              </button>
            </div>
          </div>
        `;
      });

      designCards.innerHTML = html;

      // Attach download listeners
      designCards.querySelectorAll('.btn-chassis-download-xml').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cName = e.currentTarget.getAttribute('data-chassis-name');
          const chData = GEARCITY_DATA.chassisDesigns[cName];
          if (!chData) return;
          const carType = selectVehicle.value;
          const currentYear = parseInt(inputYear.value) || 1960;

          const getBestAvail = (text) => {
            if (!text) return 'Standard';
            const lines = text.split('\n');
            let best = lines[0].replace(/^\d{4}\s+/, '').replace(/\?$/, '').trim();
            for (const l of lines) {
              const m = l.match(/^(\d{4})\s+(.+)$/);
              if (m && parseInt(m[1]) <= currentYear) {
                best = m[2].replace(/\?$/, '').trim();
              }
            }
            return best;
          };

          const frameType = getBestAvail(chData.frame);
          const drivetrain = getBestAvail(chData.drivetrain);
          const frSusp = getBestAvail(chData.suspension);
          const rrSusp = frSusp;

          const xmlContent = GearCityEngine.generateChassisXml({
            ...chData,
            frameType,
            drivetrain,
            frSuspension: frSusp,
            rrSuspension: rrSusp,
          });

          trackUsageEvent('download_xml_chassis', `Download Chassis XML: ${carType}_${cName}_${currentYear}`);
          const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Chassis_${carType}_${cName}_${currentYear}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });

      designCards.querySelectorAll('.btn-gearbox-download-xml').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const gName = e.currentTarget.getAttribute('data-gearbox-name');
          const gdData = GEARCITY_DATA.gearboxDesigns[gName];
          if (!gdData) return;
          const carType = selectVehicle.value;
          const currentYear = parseInt(inputYear.value) || 1960;

          const getBestAvail = (text) => {
            if (!text) return 'Manual';
            const lines = text.split('\n');
            let best = lines[0].replace(/^\d{4}\s+/, '').replace(/\?$/, '').trim();
            for (const l of lines) {
              const m = l.match(/^(\d{4})\s+(.+)$/);
              if (m && parseInt(m[1]) <= currentYear) {
                best = m[2].replace(/\?$/, '').trim();
              }
            }
            return best;
          };

          const gbType = getBestAvail(gdData.gearboxes);

          const xmlContent = GearCityEngine.generateGearboxXml({
            ...gdData,
            gearboxType: gbType,
          });

          trackUsageEvent('download_xml_gearbox', `Download Gearbox XML: ${carType}_${gName}_${currentYear}`);
          const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Gearbox_${carType}_${gName}_${currentYear}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });
    }

    // Concept Reference Tables Rendering
    function renderRefTables() {
      // Helper to find best available component line for a given year
      const getBestAvailForYear = (text, yr) => {
        if (!text) return 'Standard';
        const lines = text.split('\n');
        let best = lines[0].replace(/^\d{4}\s+/, '').replace(/\?$/, '').trim();
        for (const l of lines) {
          const m = l.match(/^(\d{4})\s+(.+)$/);
          if (m && parseInt(m[1]) <= yr) {
            best = m[2].replace(/\?$/, '').trim();
          }
        }
        return best;
      };

      // 1. Gearbox Concepts Reference Table
      const tbGearbox = document.getElementById('table-ref-gearbox-body');
      if (tbGearbox) {
        tbGearbox.innerHTML = '';
        Object.values(GEARCITY_DATA.gearboxDesigns).forEach(g => {
          const tr = document.createElement('tr');
          const sliderStr = g.gearing ? `Lo: ${g.gearing.loRatio}%, Hi: ${g.gearing.hiRatio}%, MaxT: ${g.gearing.maxTorqueInput}Nm<br><span style="color: #64b5f6;">Focus:</span> Comf ${g.designFocus.comfort}%, Perf ${g.designFocus.performance}%, Rel ${g.designFocus.dependability}%` : (g.sliderValues ? `Comf: ${g.sliderValues.comfort}%, Perf: ${g.sliderValues.performance}%, Rel: ${g.sliderValues.reliability}%, Pow: ${g.sliderValues.power}%` : '—');
          const techStr = g.techSliders ? `Mat: ${g.techSliders.materials}, Comp: ${g.techSliders.components}, Tech: ${g.techSliders.technology}, Techq: ${g.techSliders.techniques}` : '—';
          tr.innerHTML = `
            <td style="font-weight: 800; color: #64b5f6;">${g.name}</td>
            <td style="font-size: 12px;">${g.concept}</td>
            <td><strong style="color: var(--gc-text-gold); background: rgba(100,181,246,0.1); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(100,181,246,0.2);">${g.maxEngineType}</strong></td>
            <td>${g.ratings.comfort}</td>
            <td>${g.ratings.performance}</td>
            <td>${g.ratings.reliability}</td>
            <td>${g.ratings.power}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${sliderStr}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${techStr}</td>
            <td style="font-size: 11px; white-space: pre-line;">${g.gearboxes}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${g.cost || '$200 - $300'}${g.note ? `<div style="color: var(--gc-text-amber); margin-top: 4px;">${g.note}</div>` : ''}</td>
            <td>
              <button class="btn btn-secondary btn-ref-dl-gearbox" data-gearbox-name="${g.name}" style="padding: 3px 8px; font-size: 11px; white-space: nowrap; border: 1px solid #64b5f6; background: rgba(100,181,246,0.15); color: #64b5f6; cursor: pointer; border-radius: 3px; font-weight: 700;">
                📥 .xml
              </button>
            </td>
          `;
          tbGearbox.appendChild(tr);
        });

        tbGearbox.querySelectorAll('.btn-ref-dl-gearbox').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const gName = e.currentTarget.getAttribute('data-gearbox-name');
            const gdData = GEARCITY_DATA.gearboxDesigns[gName];
            if (!gdData) return;
            const currentYear = parseInt(inputYear?.value) || 1960;
            const gbType = getBestAvailForYear(gdData.gearboxes, currentYear);

            const xmlContent = GearCityEngine.generateGearboxXml({
              ...gdData,
              gearboxType: gbType,
            });

            trackUsageEvent('download_xml_ref_gearbox', `Download Ref Gearbox XML: ${gName}_${currentYear}`);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Gearbox_Preset_${gName}_${currentYear}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        });
      }

      // 2. Chassis Concepts Reference Table
      const tbChassis = document.getElementById('table-ref-chassis-body');
      if (tbChassis) {
        tbChassis.innerHTML = '';
        Object.values(GEARCITY_DATA.chassisDesigns).forEach(c => {
          const tr = document.createElement('tr');
          const sliderStr = c.suspensionTuning ? `Sus: Stab ${c.suspensionTuning.stability}%, Comf ${c.suspensionTuning.comfort}%, Perf ${c.suspensionTuning.performance}%, Brk ${c.suspensionTuning.braking}%, Dur ${c.suspensionTuning.durability}%<br><span style="color: var(--gc-text-gold);">Focus:</span> Perf ${c.designFocus.performance}%, Str ${c.designFocus.strength}%, Dep ${c.designFocus.dependability}%` : (c.sliderValues ? `Perf: ${c.sliderValues.performance}%, Str: ${c.sliderValues.strength}%, Comf: ${c.sliderValues.comfort}%, Dur: ${c.sliderValues.durability}%` : '—');
          const techStr = c.techSliders ? `Mat: ${c.techSliders.materials}, Comp: ${c.techSliders.components}, Tech: ${c.techSliders.technology}, Techq: ${c.techSliders.techniques}` : '—';
          tr.innerHTML = `
            <td style="font-weight: 800; color: var(--gc-text-gold);">${c.name}</td>
            <td><strong style="color: var(--gc-text-amber); background: rgba(255,183,77,0.1); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(255,183,77,0.2);">${c.maxEngine}</strong></td>
            <td>${c.ratings.performance}</td>
            <td>${c.ratings.strength}</td>
            <td>${c.ratings.comfort}</td>
            <td>${c.ratings.durability}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${sliderStr}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${techStr}</td>
            <td style="font-size: 11px; white-space: pre-line;">${c.frame}</td>
            <td style="font-size: 11px; white-space: pre-line;">${c.drivetrain}</td>
            <td style="font-size: 11px; white-space: pre-line;">${c.suspension}</td>
            <td style="font-size: 11px; color: var(--gc-text-amber);">${c.note || '—'}</td>
            <td>
              <button class="btn btn-secondary btn-ref-dl-chassis" data-chassis-name="${c.name}" style="padding: 3px 8px; font-size: 11px; white-space: nowrap; border: 1px solid var(--gc-border-gold); background: rgba(255,183,77,0.15); color: var(--gc-text-gold); cursor: pointer; border-radius: 3px; font-weight: 700;">
                📥 .xml
              </button>
            </td>
          `;
          tbChassis.appendChild(tr);
        });

        tbChassis.querySelectorAll('.btn-ref-dl-chassis').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const cName = e.currentTarget.getAttribute('data-chassis-name');
            const chData = GEARCITY_DATA.chassisDesigns[cName];
            if (!chData) return;
            const currentYear = parseInt(inputYear?.value) || 1960;

            const frameType = getBestAvailForYear(chData.frame, currentYear);
            const drivetrain = getBestAvailForYear(chData.drivetrain, currentYear);
            const frSusp = getBestAvailForYear(chData.suspension, currentYear);
            const rrSusp = frSusp;

            const xmlContent = GearCityEngine.generateChassisXml({
              ...chData,
              frameType,
              drivetrain,
              frSuspension: frSusp,
              rrSuspension: rrSusp,
            });

            trackUsageEvent('download_xml_ref_chassis', `Download Ref Chassis XML: ${cName}_${currentYear}`);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Chassis_Preset_${cName}_${currentYear}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        });
      }

      // 3. Engine Concepts Reference Table
      const tbEngine = document.getElementById('table-ref-engine-body');
      if (tbEngine) {
        tbEngine.innerHTML = '';
        Object.values(GEARCITY_DATA.engineDesigns).forEach(e => {
          const tr = document.createElement('tr');
          const costStr = `$${e.costTargets['1932'] || '—'} / $${e.costTargets['1944'] || '—'} / $${e.costTargets['1954'] || '—'}`;
          const sliderStr = `Dep: ${e.designDependability ?? '—'}, Fuel: ${e.performanceFuel ?? '—'}, Comp: ${e.techComponent ?? '—'}, Tech: ${e.techTechnology ?? '—'}, Techq: ${e.techTechnique ?? '—'}`;
          tr.innerHTML = `
            <td style="font-weight: 800; color: var(--gc-text-green);">${e.name}</td>
            <td style="font-size: 12px;">${e.concept}</td>
            <td><strong style="color: var(--gc-text-gold);">${e.optimizeFocus}</strong></td>
            <td>${e.maxWeight} kg</td>
            <td>${e.maxHpTorqueRatio != null ? '≤ ' + e.maxHpTorqueRatio : 'No limit'}</td>
            <td>${e.ratingNeed ? `<strong style="color: var(--gc-text-amber);">${e.ratingNeed}</strong>` : '—'}</td>
            <td style="font-size: 11px; color: var(--gc-text-muted);">${sliderStr}</td>
            <td style="font-size: 11px; font-weight: 700; color: var(--gc-text-ivory);">${costStr}</td>
            <td>
              <button class="btn btn-secondary btn-ref-dl-engine" data-engine-name="${e.name}" style="padding: 3px 8px; font-size: 11px; white-space: nowrap; border: 1px solid var(--gc-text-green); background: rgba(129,199,132,0.15); color: var(--gc-text-green); cursor: pointer; border-radius: 3px; font-weight: 700;">
                ⚡ Optimize & XML
              </button>
            </td>
          `;
          tbEngine.appendChild(tr);
        });

        tbEngine.querySelectorAll('.btn-ref-dl-engine').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const eName = e.currentTarget.getAttribute('data-engine-name');
            const currentYear = parseInt(inputYear?.value) || 1960;
            const constraints = GearCityEngine.getEngineDesignConstraints(eName, currentYear);
            if (!constraints) return;

            const optResult = GearCityEngine.optimizeEngine(currentYear, constraints);
            if (!optResult || !optResult.bestCandidate) return;

            const xmlContent = GearCityEngine.generateEngineXml(optResult.bestCandidate);

            trackUsageEvent('download_xml_ref_engine', `Download Ref Engine XML: ${eName}_${currentYear}`);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Engine_Preset_${eName}_${currentYear}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        });
      }

      // 4. Decade Weight Benchmarks Table
      const tbBenchmarks = document.getElementById('table-ref-benchmarks-body');
      if (tbBenchmarks && GEARCITY_DATA.decadeChassisBenchmarks) {
        tbBenchmarks.innerHTML = '';
        const catMap = {
          Micro: { name: 'Minicar / Micro', chassis: 'Tiny' },
          Sport: { name: 'Sport', chassis: 'Sport, Race, Drive' },
          General: { name: 'General (Sedan/Hatch)', chassis: 'Balance' },
          Luxury: { name: 'Luxury', chassis: 'CLux, Lux, SafLux' },
          Truck: { name: 'Truck / Utility', chassis: 'Truck' }
        };

        for (const [decade, cats] of Object.entries(GEARCITY_DATA.decadeChassisBenchmarks)) {
          for (const [catKey, b] of Object.entries(cats)) {
            const tr = document.createElement('tr');
            const catInfo = catMap[catKey] || { name: catKey, chassis: catKey };
            const primaryChassis = catInfo.chassis.split(',')[0].trim();
            const startYear = parseInt(decade) || 1960;

            tr.innerHTML = `
              <td><strong style="color: var(--gc-text-gold); font-family: var(--font-game-mono);">${decade}</strong></td>
              <td style="font-weight: 600; color: var(--gc-text-ivory);">${catInfo.name}</td>
              <td><span class="tag-badge tag-focus">${catInfo.chassis}</span></td>
              <td><strong style="color: #81c784; font-size: 13px;">${b.avgChassisKg} kg</strong></td>
              <td style="color: var(--gc-text-muted);">${b.chassisRangeKg} kg</td>
              <td><strong style="color: var(--gc-text-gold);">${b.curbRangeKg} kg</strong></td>
              <td><span class="tag-badge" style="background: rgba(255,183,77,0.15); color: var(--gc-text-amber);">${b.frame}</span></td>
              <td><span class="tag-badge" style="background: rgba(100,181,246,0.15); color: #64b5f6;">${b.drivetrain}</span></td>
              <td style="font-size: 11px; color: var(--gc-text-muted); max-width: 220px;">${b.notes}</td>
              <td>
                <button class="btn btn-secondary btn-ref-dl-benchmark" data-chassis-name="${primaryChassis}" data-year="${startYear}" data-decade="${decade}" data-category="${catKey}" style="padding: 3px 8px; font-size: 11px; white-space: nowrap; border: 1px solid #81c784; background: rgba(76,175,80,0.15); color: #81c784; cursor: pointer; border-radius: 3px; font-weight: 700;">
                  📥 .xml
                </button>
              </td>
            `;
            tbBenchmarks.appendChild(tr);
          }
        }

        tbBenchmarks.querySelectorAll('.btn-ref-dl-benchmark').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const cName = e.currentTarget.getAttribute('data-chassis-name');
            const dYear = parseInt(e.currentTarget.getAttribute('data-year')) || 1960;
            const decade = e.currentTarget.getAttribute('data-decade');
            const catKey = e.currentTarget.getAttribute('data-category');
            const chData = GEARCITY_DATA.chassisDesigns[cName] || GEARCITY_DATA.chassisDesigns['Balance'];

            const getBestAvail = (text) => {
              if (!text) return 'Standard';
              const lines = text.split('\n');
              let best = lines[0].replace(/^\d{4}\s+/, '').replace(/\?$/, '').trim();
              for (const l of lines) {
                const m = l.match(/^(\d{4})\s+(.+)$/);
                if (m && parseInt(m[1]) <= dYear) {
                  best = m[2].replace(/\?$/, '').trim();
                }
              }
              return best;
            };

            const frameType = getBestAvail(chData.frame);
            const drivetrain = getBestAvail(chData.drivetrain);
            const frSusp = getBestAvail(chData.suspension);
            const rrSusp = frSusp;

            const xmlContent = GearCityEngine.generateChassisXml({
              ...chData,
              year: dYear,
              frameType,
              drivetrain,
              frSuspension: frSusp,
              rrSuspension: rrSusp,
            });

            trackUsageEvent('download_xml_benchmark_chassis', `Download Benchmark Chassis XML: ${decade}_${catKey}_${cName}`);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Chassis_Benchmark_${decade}_${catKey}_${cName}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        });
      }
    }

    // Tab switching for Reference Directory
    const btnRefGearbox = document.getElementById('btn-ref-tab-gearbox');
    const btnRefChassis = document.getElementById('btn-ref-tab-chassis');
    const btnRefEngine = document.getElementById('btn-ref-tab-engine');
    const btnRefBenchmarks = document.getElementById('btn-ref-tab-benchmarks');
    const panelRefGearbox = document.getElementById('ref-panel-gearbox');
    const panelRefChassis = document.getElementById('ref-panel-chassis');
    const panelRefEngine = document.getElementById('ref-panel-engine');
    const panelRefBenchmarks = document.getElementById('ref-panel-benchmarks');

    function switchRefTab(activeBtn, activePanel, type) {
      [btnRefGearbox, btnRefChassis, btnRefEngine, btnRefBenchmarks].forEach(b => b?.classList.remove('active'));
      [panelRefGearbox, panelRefChassis, panelRefEngine, panelRefBenchmarks].forEach(p => { if (p) p.style.display = 'none'; });
      activeBtn?.classList.add('active');
      if (activePanel) activePanel.style.display = 'block';
      saveCachedState({ refSubTab: type });
      if (type) trackUsageEvent('ref_directory_' + type, 'Reference Directory: ' + type);
    }

    if (btnRefGearbox) btnRefGearbox.addEventListener('click', () => switchRefTab(btnRefGearbox, panelRefGearbox, 'gearbox'));
    if (btnRefChassis) btnRefChassis.addEventListener('click', () => switchRefTab(btnRefChassis, panelRefChassis, 'chassis'));
    if (btnRefEngine) btnRefEngine.addEventListener('click', () => switchRefTab(btnRefEngine, panelRefEngine, 'engine'));
    if (btnRefBenchmarks) btnRefBenchmarks.addEventListener('click', () => switchRefTab(btnRefBenchmarks, panelRefBenchmarks, 'benchmarks'));

    function setAdvisorYear(val) {
      const clamped = Math.max(1900, Math.min(2020, Number(val) || 1900));
      inputYear.value = clamped;
      if (inputYearNum) inputYearNum.value = clamped;
      saveCachedState({ year: clamped });
      updateDetail();
    }

    selectVehicle.addEventListener('change', () => {
      saveCachedState({ advisorVehicle: selectVehicle.value });
      trackUsageEvent('advisor_select_' + selectVehicle.value, 'Advisor Model: ' + selectVehicle.value);
      updateDetail();
    });
    inputYear.addEventListener('input', () => setAdvisorYear(inputYear.value));
    if (inputYearNum) {
      inputYearNum.addEventListener('input', () => {
        if (inputYearNum.value.length >= 4) setAdvisorYear(inputYearNum.value);
      });
      inputYearNum.addEventListener('change', () => setAdvisorYear(inputYearNum.value));
    }
    if (btnPrev) btnPrev.addEventListener('click', () => setAdvisorYear(Number(inputYear.value) - 1));
    if (btnNext) btnNext.addEventListener('click', () => setAdvisorYear(Number(inputYear.value) + 1));

    // Restore cached selection if available
    const cachedAdv = getCachedState();
    if (cachedAdv.advisorVehicle && Array.from(selectVehicle.options).some(o => o.value === cachedAdv.advisorVehicle)) {
      selectVehicle.value = cachedAdv.advisorVehicle;
    }
    if (cachedAdv.year) {
      inputYear.value = cachedAdv.year;
      if (inputYearNum) inputYearNum.value = cachedAdv.year;
    }

    renderTable();
    updateDetail();
    renderRefTables();

    // Restore cached reference sub-tab
    if (cachedAdv.refSubTab === 'chassis' && btnRefChassis) {
      switchRefTab(btnRefChassis, panelRefChassis, 'chassis');
    } else if (cachedAdv.refSubTab === 'engine' && btnRefEngine) {
      switchRefTab(btnRefEngine, panelRefEngine, 'engine');
    } else if (cachedAdv.refSubTab === 'benchmarks' && btnRefBenchmarks) {
      switchRefTab(btnRefBenchmarks, panelRefBenchmarks, 'benchmarks');
    } else if (btnRefGearbox) {
      switchRefTab(btnRefGearbox, panelRefGearbox, 'gearbox');
    }
  }

  // ============================================================
  // TAB 5: Vehicle Engine Optimizer
  // ============================================================
  function initVehicleEngineOptimizer() {
    const selectVehicle = document.getElementById('select-vopt-vehicle');
    const selectConcept = document.getElementById('select-vopt-concept');
    const inputYear = document.getElementById('input-vopt-year');
    const inputYearNum = document.getElementById('input-vopt-year-num');
    const btnYearPrev = document.getElementById('btn-vopt-year-prev');
    const btnYearNext = document.getElementById('btn-vopt-year-next');
    const inputSkillNum = document.getElementById('input-vopt-skill-num');
    const sliderSkill = document.getElementById('slider-vopt-skill');

    const inputMaxCost = document.getElementById('input-vopt-max-cost');
    const inputMaxWeight = document.getElementById('input-vopt-max-weight');
    const inputMaxRatio = document.getElementById('input-vopt-max-ratio');
    const selectFocus = document.getElementById('select-vopt-focus');
    const selectFuel = document.getElementById('select-vopt-fuel');
    const inputMaxLen = document.getElementById('input-vopt-max-len');
    const inputMaxWid = document.getElementById('input-vopt-max-wid');

    const sliderDepend = document.getElementById('slider-vopt-depend');
    const valDepend = document.getElementById('val-vopt-depend');
    const sliderFuel = document.getElementById('slider-vopt-fuel');
    const valFuel = document.getElementById('val-vopt-fuel');
    const sliderTechComp = document.getElementById('slider-vopt-tech-comp');
    const valTechComp = document.getElementById('val-vopt-tech-comp');
    const sliderTechTech = document.getElementById('slider-vopt-tech-tech');
    const valTechTech = document.getElementById('val-vopt-tech-tech');
    const sliderTechTechq = document.getElementById('slider-vopt-tech-techq');
    const valTechTechq = document.getElementById('val-vopt-tech-techq');

    const btnResetDefaults = document.getElementById('btn-vopt-reset-defaults');
    const btnOptimize = document.getElementById('btn-vopt-optimize');
    const statusEl = document.getElementById('vopt-status');
    const resultsBox = document.getElementById('vopt-results-box');

    // Populate vehicle dropdown
    GEARCITY_DATA.vehicleClasses.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.carType;
      opt.textContent = v.carType;
      selectVehicle.appendChild(opt);
    });

    const cachedVopt = getCachedState();
    if (cachedVopt.voptVehicle && Array.from(selectVehicle.options).some(o => o.value === cachedVopt.voptVehicle)) {
      selectVehicle.value = cachedVopt.voptVehicle;
    } else {
      selectVehicle.value = 'Sedan';
    }

    selectVehicle.addEventListener('change', () => {
      saveCachedState({ voptVehicle: selectVehicle.value });
      updateConceptDropdown();
    });

    selectConcept.addEventListener('change', () => {
      saveCachedState({ voptConcept: selectConcept.value });
      populateConceptDefaults();
    });

    function syncSliders() {
      if (valDepend && sliderDepend) valDepend.textContent = sliderDepend.value;
      if (valFuel && sliderFuel) valFuel.textContent = sliderFuel.value;
      if (valTechComp && sliderTechComp) valTechComp.textContent = sliderTechComp.value;
      if (valTechTech && sliderTechTech) valTechTech.textContent = sliderTechTech.value;
      if (valTechTechq && sliderTechTechq) valTechTechq.textContent = sliderTechTechq.value;
    }

    [sliderDepend, sliderFuel, sliderTechComp, sliderTechTech, sliderTechTechq].forEach(s => {
      if (s) s.addEventListener('input', syncSliders);
    });

    // Skill slider sync
    if (sliderSkill && inputSkillNum) {
      if (cachedVopt.voptSkill != null) {
        sliderSkill.value = cachedVopt.voptSkill;
        inputSkillNum.value = cachedVopt.voptSkill;
      }
      sliderSkill.addEventListener('input', () => {
        inputSkillNum.value = sliderSkill.value;
        saveCachedState({ voptSkill: Number(sliderSkill.value) });
      });
      inputSkillNum.addEventListener('input', () => {
        const val = Math.max(0, Math.min(100, Number(inputSkillNum.value) || 0));
        sliderSkill.value = val;
        saveCachedState({ voptSkill: val });
      });
    }

    // Year slider sync
    function setVoptYear(val) {
      const clamped = Math.max(1900, Math.min(2020, Number(val) || 1900));
      if (inputYear) inputYear.value = clamped;
      if (inputYearNum) inputYearNum.value = clamped;
      saveCachedState({ year: clamped });
      populateConceptDefaults();
    }

    if (inputYear) {
      if (cachedVopt.year) {
        inputYear.value = cachedVopt.year;
        if (inputYearNum) inputYearNum.value = cachedVopt.year;
      }
      inputYear.addEventListener('input', () => setVoptYear(inputYear.value));
    }
    if (inputYearNum) {
      inputYearNum.addEventListener('input', () => {
        if (inputYearNum.value.length >= 4) setVoptYear(inputYearNum.value);
      });
      inputYearNum.addEventListener('change', () => setVoptYear(inputYearNum.value));
    }
    if (btnYearPrev) btnYearPrev.addEventListener('click', () => setVoptYear(Number(inputYear.value) - 1));
    if (btnYearNext) btnYearNext.addEventListener('click', () => setVoptYear(Number(inputYear.value) + 1));

    function updateConceptDropdown() {
      const vc = GEARCITY_DATA.vehicleClasses.find(v => v.carType === selectVehicle.value);
      selectConcept.innerHTML = '';
      if (!vc) return;
      const concepts = vc.engineType.split(/[,\/]/).map(s => s.trim()).filter(Boolean);
      concepts.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c + (GEARCITY_DATA.engineDesigns[c] ? ` — ${GEARCITY_DATA.engineDesigns[c].concept}` : '');
        selectConcept.appendChild(opt);
      });
      populateConceptDefaults();
    }

    function populateConceptDefaults() {
      const concept = selectConcept.value;
      const year = Number(inputYear.value) || 1960;
      const constraints = GearCityEngine.getEngineDesignConstraints(concept, year);
      if (!constraints) return;

      if (inputMaxCost) inputMaxCost.value = constraints.maxCost != null ? constraints.maxCost : '';
      if (inputMaxWeight) inputMaxWeight.value = constraints.maxWeight != null ? constraints.maxWeight : '';
      if (inputMaxRatio) inputMaxRatio.value = constraints.maxHpTorqueRatio != null ? constraints.maxHpTorqueRatio : '';
      if (selectFocus) selectFocus.value = constraints.focus === 'HP' ? 'HP' : 'Torque';
      if (selectFuel) selectFuel.value = 'Any';
      if (inputMaxLen) inputMaxLen.value = '';
      if (inputMaxWid) inputMaxWid.value = '';

      if (sliderDepend) sliderDepend.value = constraints.designDependability != null ? constraints.designDependability : 50;
      if (sliderFuel) sliderFuel.value = constraints.performanceFuel != null ? constraints.performanceFuel : 0;
      if (sliderTechComp) sliderTechComp.value = constraints.techComponent != null ? constraints.techComponent : 0;
      if (sliderTechTech) sliderTechTech.value = constraints.techTechnology != null ? constraints.techTechnology : 0;
      if (sliderTechTechq) sliderTechTechq.value = constraints.techTechnique != null ? constraints.techTechnique : 0;
      syncSliders();
    }

    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', populateConceptDefaults);
    }

    if (selectVehicle) {
      selectVehicle.addEventListener('change', updateConceptDropdown);
    }
    if (selectConcept) {
      selectConcept.addEventListener('change', populateConceptDefaults);
    }

    // Run Optimization Handler
    btnOptimize.addEventListener('click', () => {
      btnOptimize.disabled = true;
      statusEl.textContent = '⚙️ Optimizing vehicle engine candidate...';
      resultsBox.innerHTML = '';

      const carType = selectVehicle.value;
      const concept = selectConcept.value;
      const year = Number(inputYear.value) || 1960;
      trackUsageEvent('optimize_vehicle_engine', `Optimize Vehicle Engine: ${carType}_${concept}_${year}`);

      try {
        const customConstraints = {
          maxCost: inputMaxCost.value !== '' ? Number(inputMaxCost.value) : null,
          maxWeight: inputMaxWeight.value !== '' ? Number(inputMaxWeight.value) : null,
          maxHpTorqueRatio: inputMaxRatio.value !== '' ? Number(inputMaxRatio.value) : null,
          focus: selectFocus.value,
          preferredFuel: selectFuel.value,
          engineBayWidth: inputMaxWid.value !== '' ? Number(inputMaxWid.value) : null,
          engineBayLength: inputMaxLen.value !== '' ? Number(inputMaxLen.value) : null,
          designDependability: Number(sliderDepend.value),
          performanceFuel: Number(sliderFuel.value),
          techComponent: Number(sliderTechComp.value),
          techTechnology: Number(sliderTechTech.value),
          techTechnique: Number(sliderTechTechq.value),
          designSkill: Number(inputSkillNum.value) || 70,
        };

        const result = GearCityEngine.optimizeEngineForVehicle(carType, concept, year, customConstraints);
        if (!result.success) {
          statusEl.textContent = '⚠️ ' + result.message;
          btnOptimize.disabled = false;
          return;
        }

        const b = result.bestCandidate;
        const perf = result.performance;

        resultsBox.innerHTML = `
          <div class="result-card" style="background: rgba(0,0,0,0.3); border: 1px solid var(--gc-border-gold); border-radius: 6px; padding: 20px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <span class="badge" style="background: rgba(76,175,80,0.2); color: #81c784; border: 1px solid rgba(76,175,80,0.4); padding: 3px 8px; border-radius: 3px; font-weight: 700; font-size: 11px;">OPTIMAL CANDIDATE</span>
                <span style="color: var(--gc-text-gold); font-weight: 800; font-size: 16px; margin-left: 8px;">${result.config.name}</span>
              </div>
              <button id="btn-vopt-download-xml" class="btn btn-secondary" style="font-size: 12px; padding: 6px 12px; border-color: var(--gc-border-gold); color: var(--gc-text-gold);">
                📥 Download XML Blueprint
              </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 12px; margin-top: 10px;">
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Architecture</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${b.layout} ${b.cylinders} Cyl</div>
              </div>
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Fuel Type</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${b.fuel}</div>
              </div>
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Valvetrain</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${b.valvetrain}</div>
              </div>
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Induction</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${b.induction}</div>
              </div>
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Displacement</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${perf.displacementCc?.toFixed(0) || '—'} cc</div>
              </div>
              <div>
                <div style="color: var(--gc-text-muted); font-size: 11px;">Bore × Stroke</div>
                <div style="color: var(--gc-text-ivory); font-weight: 700;">${perf.boreMm?.toFixed(1) || '—'} × ${perf.strokeMm?.toFixed(1) || '—'} mm</div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #3d2314;">
              <div style="text-align: center;">
                <div style="color: var(--gc-text-muted); font-size: 10px;">TORQUE</div>
                <div style="color: var(--gc-text-gold); font-size: 20px; font-weight: 800;">${perf.torqueNm?.toFixed(1) || '—'}</div>
                <div style="color: var(--gc-text-muted); font-size: 10px;">Nm</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--gc-text-muted); font-size: 10px;">POWER</div>
                <div style="color: var(--gc-text-amber); font-size: 20px; font-weight: 800;">${perf.horsepower?.toFixed(1) || '—'}</div>
                <div style="color: var(--gc-text-muted); font-size: 10px;">HP</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--gc-text-muted); font-size: 10px;">WEIGHT</div>
                <div style="color: var(--gc-text-green); font-size: 20px; font-weight: 800;">${perf.weightKg?.toFixed(1) || '—'}</div>
                <div style="color: var(--gc-text-muted); font-size: 10px;">kg</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--gc-text-muted); font-size: 10px;">EST. COST</div>
                <div style="color: #ef5350; font-size: 20px; font-weight: 800;">$${perf.unitCost?.toFixed(0) || '—'}</div>
                <div style="color: var(--gc-text-muted); font-size: 10px;">per unit</div>
              </div>
            </div>
            ${perf.ratings ? `
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #3d2314;">
              <div style="font-weight: 700; font-size: 11px; color: var(--gc-text-gold); margin-bottom: 6px;">🏅 In-Game Quality Ratings (Skill: ${perf.designSkill || 0}/100)</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; font-size: 11px;">
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 3px;">Dependability: <strong style="color: #ffb74d;">${perf.ratings.dependability}</strong></div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 3px;">Power: <strong style="color: #ef5350;">${perf.ratings.power}</strong></div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 3px;">Smoothness: <strong style="color: #ce93d8;">${perf.ratings.smoothness}</strong></div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 3px;">Fuel Eco: <strong style="color: #81c784;">${perf.ratings.fuelEconomy}</strong></div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 3px;">Overall: <strong style="color: var(--gc-text-gold);">${perf.ratings.overall}</strong></div>
              </div>
            </div>
            ` : ''}
          </div>
        `;

        const btnXml = document.getElementById('btn-vopt-download-xml');
        if (btnXml && result.config) {
          btnXml.addEventListener('click', () => {
            trackUsageEvent('download_xml_vehicle', `Download Vehicle XML: ${selectVehicle.value}_${concept}_${year}`);
            const xml = GearCityEngine.generateEngineXml(result.config);
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectVehicle.value}_${concept}_${year}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        }

        statusEl.textContent = `✅ Optimization complete in ${result.elapsedMs}ms.`;
      } catch (err) {
        statusEl.textContent = '❌ Error: ' + err.message;
      }
      btnOptimize.disabled = false;
    });

    updateConceptDropdown();
    if (cachedVopt.voptConcept && Array.from(selectConcept.options).some(o => o.value === cachedVopt.voptConcept)) {
      selectConcept.value = cachedVopt.voptConcept;
      populateConceptDefaults();
    }
  }

  // Initialize filters, dropdowns & calculations on load with cached state
  const cached = getCachedState();
  const initialYear = Number(cached.year) || Number(inputYear.value) || 1957;

  if (cached.year) {
    inputYear.value = cached.year;
    if (inputYearNum) inputYearNum.value = cached.year;
  }

  if (cached.designSkill != null) {
    setDesignSkill(cached.designSkill);
  }

  if (cached.optGoal) {
    const goalOption = Array.from(goalOptions).find(o => o.dataset.focus === cached.optGoal);
    if (goalOption) {
      goalOptions.forEach((o) => o.classList.remove('active'));
      goalOption.classList.add('active');
      currentFocus = cached.optGoal;
    }
  }

  if (cached.engineSliders) {
    if (cached.engineSliders.bore && sliderBore) sliderBore.value = cached.engineSliders.bore;
    if (cached.engineSliders.stroke && sliderStroke) sliderStroke.value = cached.engineSliders.stroke;
    if (cached.engineSliders.rpm && sliderRpm) sliderRpm.value = cached.engineSliders.rpm;
    if (cached.engineSliders.torque && sliderTorq) sliderTorq.value = cached.engineSliders.torque;
    if (cached.engineSliders.perfFocus && sliderPerfFocus) sliderPerfFocus.value = cached.engineSliders.perfFocus;
    if (cached.engineSliders.ecoFocus && sliderEcoFocus) sliderEcoFocus.value = cached.engineSliders.ecoFocus;
    if (cached.engineSliders.materials && sliderMaterials) sliderMaterials.value = cached.engineSliders.materials;
    if (cached.engineSliders.weight && sliderWeight) sliderWeight.value = cached.engineSliders.weight;
  }

  initFiltersForYear(initialYear, true);
  populateComponentDropdowns();
  updateCalculations();
  initDemographics();
  initVehicleAdvisor();
  initVehicleEngineOptimizer();

  // Restore Active Tab
  if (cached.activeTab) {
    const savedTab = Array.from(navTabs).find(t => t.dataset.tab === cached.activeTab);
    if (savedTab) {
      savedTab.click();
    }
  }
});

