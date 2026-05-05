document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    
    // Settings
    const toggleSettingsBtn = document.getElementById('toggle-settings');
    const settingsContent = document.getElementById('settings-content');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    const tankCapacityInput = document.getElementById('tank-capacity');
    const fuelPriceInput = document.getElementById('fuel-price');
    const fuelEfficiencyInput = document.getElementById('fuel-efficiency');

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Trip Calc
    const calcTripBtn = document.getElementById('calc-trip-btn');
    const tripResultCard = document.getElementById('trip-result');
    
    // Shift Calc
    const calcShiftBtn = document.getElementById('calc-shift-btn');
    const shiftResultCard = document.getElementById('shift-result');

    // --- Initialization ---
    loadSettings();

    // --- Event Listeners ---

    // Toggle Settings
    toggleSettingsBtn.addEventListener('click', () => {
        settingsContent.classList.toggle('show');
        const icon = toggleSettingsBtn.querySelector('i');
        if (settingsContent.classList.contains('show')) {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
        alert('¡Ajustes guardados correctamente!');
        settingsContent.classList.remove('show');
        toggleSettingsBtn.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
    });

    // Tabs logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Calculate Trip
    calcTripBtn.addEventListener('click', calculateTrip);

    // Calculate Shift
    calcShiftBtn.addEventListener('click', calculateShift);

    // --- Functions ---

    function saveSettings() {
        const settings = {
            tankCapacity: parseFloat(tankCapacityInput.value) || 50,
            fuelPrice: parseFloat(fuelPriceInput.value) || 2200,
            fuelEfficiency: parseFloat(fuelEfficiencyInput.value) || 10
        };
        localStorage.setItem('rendimientoDriverSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('rendimientoDriverSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            tankCapacityInput.value = settings.tankCapacity;
            fuelPriceInput.value = settings.fuelPrice;
            fuelEfficiencyInput.value = settings.fuelEfficiency;
        }
    }

    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function updateVerdictUI(bannerElement, netIncome, isPositive) {
        if (isPositive) {
            bannerElement.className = 'verdict-banner positive';
            bannerElement.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Es Rentable!';
        } else {
            bannerElement.className = 'verdict-banner negative';
            bannerElement.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No Rentable';
        }
    }

    function updateNetIncomeUI(element, netIncome) {
        element.textContent = formatCurrency(netIncome);
        element.className = netIncome > 0 ? 'positive-net' : 'negative-net';
    }

    function calculateTrip() {
        // Inputs
        const income = parseFloat(document.getElementById('trip-income').value) || 0;
        const pickupDist = parseFloat(document.getElementById('pickup-distance').value) || 0;
        const tripDist = parseFloat(document.getElementById('trip-distance').value) || 0;
        const tripTime = parseFloat(document.getElementById('trip-time').value) || 0;
        
        // Settings
        const fuelPrice = parseFloat(fuelPriceInput.value) || 2200;
        const fuelEfficiency = parseFloat(fuelEfficiencyInput.value) || 10;

        // Logic
        if (pickupDist < 0 || tripDist < 0 || tripTime < 0) {
            alert('Por favor ingresa valores válidos (no negativos).');
            return;
        }

        const totalDist = pickupDist + tripDist;
        if (totalDist === 0) {
            alert('Por favor ingresa al menos una distancia.');
            return;
        }

        const fuelCost = (totalDist / fuelEfficiency) * fuelPrice;
        const netIncome = income - fuelCost;

        // Update UI
        document.getElementById('res-trip-income').textContent = formatCurrency(income);
        document.getElementById('res-trip-cost').textContent = '-' + formatCurrency(fuelCost);
        
        const hourlyContainer = document.getElementById('hourly-profit-container');
        if (tripTime > 0) {
            const hourlyProfit = (netIncome / tripTime) * 60;
            document.getElementById('res-trip-hourly').textContent = formatCurrency(hourlyProfit) + ' /hr';
            document.getElementById('res-trip-hourly').className = hourlyProfit > 0 ? 'positive-net' : 'negative-net';
            hourlyContainer.style.display = 'flex';
        } else {
            hourlyContainer.style.display = 'none';
        }
        
        const netEl = document.getElementById('res-trip-net');
        updateNetIncomeUI(netEl, netIncome);

        const verdictBanner = document.getElementById('trip-verdict');
        updateVerdictUI(verdictBanner, netIncome, netIncome > 0);

        tripResultCard.style.display = 'block';
    }

    function calculateShift() {
        // Inputs
        const income = parseFloat(document.getElementById('shift-income').value) || 0;
        const distance = parseFloat(document.getElementById('shift-distance').value) || 0;

        if (distance <= 0) {
            alert('Por favor ingresa una distancia válida mayor a 0.');
            return;
        }

        // Settings
        const fuelPrice = parseFloat(fuelPriceInput.value) || 2200;
        const fuelEfficiency = parseFloat(fuelEfficiencyInput.value) || 10;

        // Logic
        const litersConsumed = distance / fuelEfficiency;
        const fuelCost = litersConsumed * fuelPrice;
        const netIncome = income - fuelCost;

        // Update UI
        document.getElementById('res-shift-income').textContent = formatCurrency(income);
        document.getElementById('res-shift-cost').textContent = '-' + formatCurrency(fuelCost);
        document.getElementById('res-shift-liters').textContent = litersConsumed.toFixed(2) + ' L';
        
        const netEl = document.getElementById('res-shift-net');
        updateNetIncomeUI(netEl, netIncome);

        const verdictBanner = document.getElementById('shift-verdict');
        updateVerdictUI(verdictBanner, netIncome, netIncome > 0);

        shiftResultCard.style.display = 'block';
    }
});
