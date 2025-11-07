// Lab Management System JavaScript

class LabManagement {
    constructor() {
        // Force a complete data restoration with ALL documented chemicals including M1-M5 shelves
        const dataVersion = localStorage.getItem('dataVersion');
        if (dataVersion !== '6.5') {
            // Clear and force reload to restore complete inventory including M1-M5
            localStorage.clear();
            localStorage.setItem('dataVersion', '6.5');
            console.log('Data version updated to 6.5 - restoring COMPLETE inventory with all shelves including M1-M5');
        }
        
        this.chemicals = JSON.parse(localStorage.getItem('chemicals')) || [];
        this.apparatus = JSON.parse(localStorage.getItem('apparatus')) || [];
        this.currentTab = 'chemicals';
        this.editingChemicalId = null;
        this.editingApparatusId = null;
        this.userModificationsEnabled = false; // Disable user modifications by default
        this.isAdminLoggedIn = false; // Admin authentication state
        this.adminPassword = 'admin123'; // Change this to your desired password
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSampleData();
        this.renderItems();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchItems(e.target.value);
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            const searchValue = document.getElementById('searchInput').value;
            this.searchItems(searchValue);
        });

        // Admin authentication
        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.showAdminLoginPrompt();
        });

        document.getElementById('adminLogoutBtn').addEventListener('click', () => {
            this.adminLogout();
        });

        // Form submissions - will be enabled when admin logs in
        // document.getElementById('chemicalForm').addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     this.addChemical();
        // });

        // document.getElementById('apparatusForm').addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     this.addApparatus();
        // });

        // Tab switching
        window.openTab = (evt, tabName) => {
            this.openTab(evt, tabName);
        };
    }

    async loadSampleData() {
        // Check if we need to restore data (if we accidentally cleared everything)
        const needsRestoration = this.chemicals.length === 0 && this.apparatus.length === 0;
        
        if (needsRestoration) {
            console.log('Restoring complete inventory data...');
            // First load Excel data
            try {
                const response = await fetch('./data.json');
                const excelData = await response.json();
                this.loadExcelData(excelData);
            } catch (error) {
                console.log('Could not load Excel data, using default samples');
                this.loadDefaultSamples();
            }
        }

        // Always check if we need to add oxidizer chemicals
        const hasOxidizerChemicals = this.chemicals.some(chem => 
            chem.location && chem.location.toLowerCase().includes('oxidizer'));
        
        if (!hasOxidizerChemicals) {
            console.log('Adding oxidizer chemical inventory...');
            this.loadOxidizerChemicals();
            localStorage.setItem('hasOxidizers', 'true');
        }

        // Check if we need to add shelf chemicals - check each shelf individually
        const hasShelfA1 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf A1'));
        const hasShelfA2 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf A2'));
        const hasShelfB1 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf B1'));
        const hasShelfB2 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf B2'));
        const hasShelfC1 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf C1'));
        const hasShelfC2 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf C2'));
        const hasShelfM1 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf M1'));
        const hasShelfM2 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf M2'));
        const hasShelfM3 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf M3'));
        const hasShelfM4 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf M4'));
        const hasShelfM5 = this.chemicals.some(chem => chem.location && chem.location.includes('Shelf M5'));
        
        // Force reload for version 6.5 to include new shelves M1-M5
        const currentVersion = localStorage.getItem('shelfChemicalsVersion') || '6.3';
        const mShelfVersion = localStorage.getItem('mShelfChemicalsAdded') || 'false';
        
        // Additional force reload for M-shelf chemicals specifically
        if (!hasShelfA1 || !hasShelfA2 || !hasShelfB1 || !hasShelfB2 || !hasShelfC1 || !hasShelfC2 || 
            !hasShelfM1 || !hasShelfM2 || !hasShelfM3 || !hasShelfM4 || !hasShelfM5 || 
            currentVersion !== '6.5' || mShelfVersion !== 'true') {
            console.log('Adding/updating shelf chemical inventory (A1, A2, B1, B2, C1, C2, M1-M5)...');
            
            // Force clear M-shelf chemicals if they exist to ensure clean reload
            this.chemicals = this.chemicals.filter(chem => !chem.location || !chem.location.includes('Shelf M'));
            
            this.addShelfChemicals();
            localStorage.setItem('hasShelfChemicals', 'true');
            localStorage.setItem('shelfChemicalsVersion', '6.5');
            localStorage.setItem('mShelfChemicalsAdded', 'true');
            console.log('M-shelf chemicals force-loaded!');
        }

        this.saveData();
        
        // Debug: Log total chemical count and shelf breakdown
        console.log(`Total chemicals loaded: ${this.chemicals.length}`);
        const shelfCounts = {};
        this.chemicals.forEach(chem => {
            if (chem.location) {
                const shelf = chem.location.split(' ')[1] || chem.location;
                shelfCounts[shelf] = (shelfCounts[shelf] || 0) + 1;
            }
        });
        console.log('Chemicals per shelf:', shelfCounts);
    }

    loadOxidizerChemicals() {
        console.log('Adding oxidizer chemicals to inventory...');
        let idCounter = this.getNextId();
        
        // Oxidizers 1 - Upper Section (8 chemicals per documentation)
        const oxidizers1Upper = [
            // Strong Acids
            { name: 'Ethanoic Acid', formula: 'CH₃COOH', quantity: 1, unit: 'bottle', location: 'Oxidizers 1 - Upper', hazard: 'medium' },
            { name: 'Hydrochloric Acid', formula: 'HCl', quantity: 5, unit: 'L', location: 'Oxidizers 1 - Upper', hazard: 'high' },
            { name: 'Hydrochloric Acid', formula: 'HCl', quantity: 2.5, unit: 'L', location: 'Oxidizers 1 - Upper', hazard: 'high' },
            { name: 'Sulphuric Acid', formula: 'H₂SO₄', quantity: 1, unit: 'L', location: 'Oxidizers 1 - Upper', hazard: 'high' },
            
            // Phosphorus Compounds
            { name: 'Metaphosphoric Acid Powder', formula: 'HPO₃', quantity: 1, unit: 'container', location: 'Oxidizers 1 - Upper', hazard: 'medium' },
            { name: 'Phosphorus Pentaoxide', formula: 'P₂O₅', quantity: 2, unit: 'containers', location: 'Oxidizers 1 - Upper', hazard: 'extreme' },
            { name: 'Phosphorus Pentachloride', formula: 'PCl₅', quantity: 4, unit: 'bottles', location: 'Oxidizers 1 - Upper', hazard: 'extreme' },
            
            // Unidentified Materials
            { name: 'Unidentified Chemical', formula: 'Unknown', quantity: 3, unit: 'bottles', location: 'Oxidizers 1 - Upper', hazard: 'high' }
        ];

        // Oxidizers 1 - Lower Section  
        const oxidizers1Lower = [
            { name: 'Nitric acid', formula: 'HNO₃', quantity: 10, unit: 'L', location: 'Oxidizers 1 - Lower', hazard: 'high' },
            { name: 'Sulphuric acid', formula: 'H₂SO₄', quantity: 2.5, unit: 'L', location: 'Oxidizers 1 - Lower', hazard: 'high' },
            { name: 'Hydrochloric acid', formula: 'HCl', quantity: 2.5, unit: 'L', location: 'Oxidizers 1 - Lower', hazard: 'high' },
            { name: 'Ethanoic acid', formula: 'CH₃COOH', quantity: 2.5, unit: 'L', location: 'Oxidizers 1 - Lower', hazard: 'high' },
            { name: 'Ethanoic acid glacial', formula: 'CH₃COOH', quantity: 2.5, unit: 'L', location: 'Oxidizers 1 - Lower', hazard: 'high' },
            { name: 'Nitric acid bench', formula: 'HNO₃', quantity: 1, unit: 'bottle', location: 'Oxidizers 1 - Lower', hazard: 'medium' },
            { name: 'Ethanoic acid bench', formula: 'CH₃COOH', quantity: 1, unit: 'bottle', location: 'Oxidizers 1 - Lower', hazard: 'medium' }
        ];

        // Oxidizers 2 - Organic Section 2.1 (13 chemicals per documentation)
        const oxidizers2Organic21 = [
            // Primary Alcohols
            { name: 'n-Amyl Alcohol (Pentanol)', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            
            // Tertiary Alcohols
            { name: 'tert-Butanol', formula: 'C₄H₁₀O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'low' },
            
            // Amines
            { name: 'n-Butylamine', formula: 'C₄H₁₁N', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            
            // Ketones
            { name: 'Cyclohexanone', formula: 'C₆H₁₀O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Cyclohexanone', formula: 'C₆H₁₀O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            
            // Cyclic Hydrocarbons
            { name: 'Cyclohexane', formula: 'C₆H₁₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' },
            { name: 'Cyclohexane', formula: 'C₆H₁₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.1', hazard: 'medium' }
        ];

        // Oxidizers 2 - Organic Section 2.2 (COMPLETE LIST - 25 chemicals)
        const oxidizers2Organic22 = [
            // Glycols & Diols
            { name: 'Glycerol', formula: 'C₃H₈O₃', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.2', hazard: 'low' },
            { name: 'Propane-1,2-diol (Propylene Glycol)', formula: 'C₃H₈O₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'low' },
            { name: 'Propane-1,2-diol (Propylene Glycol)', formula: 'C₃H₈O₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'low' },
            
            // Simple Alcohols  
            { name: 'Ethanol', formula: 'C₂H₆O', quantity: 100, unit: 'ml', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butan-1-ol', formula: 'C₄H₁₀O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butan-1-ol', formula: 'C₄H₁₀O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butan-1-ol', formula: 'C₄H₁₀O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butan-1-ol', formula: 'C₄H₁₀O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butan-2-ol', formula: 'C₄H₁₀O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Methylpropan-2-ol', formula: 'C₄H₁₀O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'low' },
            
            // Alkanes
            { name: 'n-Pentane', formula: 'C₅H₁₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'n-Heptane', formula: 'C₇H₁₆', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            
            // Halogenated Compounds
            { name: 'Bromoethane', formula: 'C₂H₅Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'high' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '1-Chlorobutane', formula: 'C₄H₉Cl', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            
            // Ketones
            { name: 'Butanone', formula: 'C₄H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            { name: 'Butanone', formula: 'C₄H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'medium' },
            
            // Aromatic Compounds
            { name: 'Nitrobenzene', formula: 'C₆H₅NO₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.2', hazard: 'high' }
        ];

        // Oxidizers 2 - Organic Section 2.3 (COMPLETE LIST - 29 chemicals)
        const oxidizers2Organic23 = [
            // High-Hazard Aromatic Amines
            { name: 'Aniline', formula: 'C₆H₇N', quantity: 500, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            { name: 'Aniline', formula: 'C₆H₇N', quantity: 100, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            { name: 'Aniline', formula: 'C₆H₇N', quantity: 250, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            { name: 'Aniline', formula: 'C₆H₇N', quantity: 250, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            
            // High-Hazard Alcohols  
            { name: 'Methanol', formula: 'CH₄O', quantity: 1, unit: 'L', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            { name: 'Methanol', formula: 'CH₄O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            { name: 'Methanol', formula: 'CH₄O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            
            // Regular Alcohols & Solvents
            { name: 'Propan-1-ol', formula: 'C₃H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Propan-2-ol (Isopropanol)', formula: 'C₃H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Pentan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Cyclohexanol', formula: 'C₆H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Methylated Spirit (Industrial)', formula: 'C₂H₆O + additives', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            
            // Alkanes
            { name: 'n-Pentane', formula: 'C₅H₁₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            
            // Iodoalkanes (7 bottles)
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Iodobutane', formula: 'C₄H₉I', quantity: 25, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            
            // Additional Halogenated Compounds
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '2-Bromobutane', formula: 'C₄H₉Br', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Chlorobutane', formula: 'C₄H₉Cl', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Chlorobutane', formula: 'C₄H₉Cl', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: '1-Chlorobutane', formula: 'C₄H₉Cl', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Bromoethane', formula: 'C₂H₅Br', quantity: 50, unit: 'ml', location: 'Oxidizers 2 - Organic 2.3', hazard: 'high' },
            
            // Ketones & Other Organics
            { name: 'Propanone', formula: 'C₃H₆O', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.3', hazard: 'medium' },
            { name: 'Octanoic acid', formula: 'C₈H₁₆O₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.3', hazard: 'low' }
        ];

        // Oxidizers 2 - Organic Section 2.4 (12 chemicals per documentation)
        const oxidizers2Organic24 = [
            // High-Hazard Synthetic Reagents
            { name: 'Acetic Anhydride', formula: 'C₄H₆O₃', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.4', hazard: 'high' },
            { name: 'Acetic Anhydride', formula: 'C₄H₆O₃', quantity: 2.5, unit: 'L', location: 'Oxidizers 2 - Organic 2.4', hazard: 'high' },
            { name: 'Dichloromethane', formula: 'CH₂Cl₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'high' },
            { name: 'Methanoic Acid (Formic Acid)', formula: 'HCOOH', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'high' },
            { name: 'Ethanediol (Ethylene Glycol)', formula: 'C₂H₆O₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'high' },
            
            // Medium-Hazard Alcohols
            { name: 'Amyl Alcohol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            { name: '3-Methylbutan-1-ol', formula: 'C₅H₁₂O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            { name: 'Propan-1-ol', formula: 'C₃H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            
            // Ketones & Cyclic Compounds
            { name: 'Butanone', formula: 'C₄H₈O', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            { name: 'Cyclohexane', formula: 'C₆H₁₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            
            // Organic Acids
            { name: 'Propanoic Acid', formula: 'C₃H₆O₂', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' },
            
            // Specialized Esters  
            { name: 'Di-n-butyl Phthalate', formula: 'C₁₆H₂₂O₄', quantity: 1, unit: 'bottle', location: 'Oxidizers 2 - Organic 2.4', hazard: 'medium' }
        ];

        // Add all chemicals
        [...oxidizers1Upper, ...oxidizers1Lower, ...oxidizers2Organic21, ...oxidizers2Organic22, ...oxidizers2Organic23, ...oxidizers2Organic24].forEach(chem => {
            this.chemicals.push({
                id: idCounter++,
                name: chem.name,
                formula: chem.formula,
                quantity: chem.quantity,
                unit: chem.unit,
                location: chem.location,
                expiry: '',
                hazard: chem.hazard,
                notes: ''
            });
        });
        
        const totalChemicals = oxidizers1Upper.length + oxidizers1Lower.length + oxidizers2Organic21.length + 
                              oxidizers2Organic22.length + oxidizers2Organic23.length + oxidizers2Organic24.length;
        console.log(`Added ${totalChemicals} oxidizer chemicals to inventory (Complete inventory with all documented chemicals)`);
    }

    getNextId() {
        const maxChemId = this.chemicals.length > 0 ? Math.max(...this.chemicals.map(c => c.id)) : 0;
        const maxAppId = this.apparatus.length > 0 ? Math.max(...this.apparatus.map(a => a.id)) : 0;
        return Math.max(maxChemId, maxAppId) + 1;
    }

    loadExcelData(data) {
        const sheet = data.Sheet1;
        let idCounter = 1;
        const chemicalKeywords = ['acid', 'chloride', 'sulphate', 'nitrate', 'hydroxide', 'carbonate', 
                                  'oxide', 'bromide', 'iodide', 'phosphate', 'acetate', 'sodium', 
                                  'potassium', 'calcium', 'magnesium', 'iron', 'copper', 'zinc', 
                                  'lead', 'silver', 'barium', 'manganese', 'cobalt', 'nickel',
                                  'indicator', 'litmus', 'phenol', 'methyl', 'eosin', 'blue', 
                                  'solution', 'powder', 'reagent', 'chromate', 'dichromate'];
        
        const apparatusKeywords = ['tube', 'flask', 'beaker', 'burette', 'pipette', 'electrode',
                                   'thermometer', 'balance', 'crucible', 'apparatus', 'stirrer',
                                   'syringe', 'funnel', 'watch', 'glass', 'wool', 'paper',
                                   'clips', 'magnets', 'lamps', 'batteries', 'gauge'];

        sheet.forEach(row => {
            Object.keys(row).forEach(key => {
                const itemName = row[key];
                if (!itemName || itemName === 'Top' || itemName === 'Bottom' || 
                    itemName.includes('box') && itemName.length < 10) return;

                const location = key.replace(/_\d+$/, ''); // Remove trailing _1, _2, etc
                const shelf = row[key + '_shelf'] || key.includes('_') ? 'Bottom' : 'Top';
                const fullLocation = `${location} - ${shelf}`;

                const itemLower = itemName.toLowerCase();
                const isChemical = chemicalKeywords.some(keyword => itemLower.includes(keyword));
                const isApparatus = apparatusKeywords.some(keyword => itemLower.includes(keyword));

                // Extract quantity from name if present (e.g., "2x", "3x")
                const quantityMatch = itemName.match(/(\d+)x/i);
                const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
                const cleanName = itemName.replace(/\s*\d+x\s*/gi, '').trim();

                if (isChemical || (!isApparatus && itemLower.length > 3)) {
                    // Determine hazard level based on chemical type
                    let hazard = 'low';
                    if (itemLower.includes('acid') || itemLower.includes('peroxide')) hazard = 'high';
                    if (itemLower.includes('dichromate') || itemLower.includes('chromate')) hazard = 'medium';
                    if (itemLower.includes('cyanide') || itemLower.includes('mercury')) hazard = 'extreme';

                    this.chemicals.push({
                        id: idCounter++,
                        name: cleanName,
                        formula: '',
                        quantity: quantity,
                        unit: itemLower.includes('solution') ? 'ml' : 'g',
                        location: fullLocation,
                        expiry: '',
                        hazard: hazard,
                        notes: ''
                    });
                } else if (isApparatus) {
                    this.apparatus.push({
                        id: idCounter++,
                        name: cleanName,
                        type: this.determineApparatusType(itemLower),
                        quantity: quantity,
                        location: fullLocation,
                        condition: 'Good',
                        lastMaintenance: '',
                        notes: ''
                    });
                }
            });
        });

        console.log(`Loaded ${this.chemicals.length} chemicals and ${this.apparatus.length} apparatus from Excel`);
    }

    determineApparatusType(itemName) {
        if (itemName.includes('tube') || itemName.includes('flask') || itemName.includes('beaker')) return 'Glassware';
        if (itemName.includes('electrode') || itemName.includes('battery') || itemName.includes('lamp')) return 'Electronic';
        if (itemName.includes('balance') || itemName.includes('thermometer') || itemName.includes('gauge')) return 'Measuring';
        if (itemName.includes('stirrer') || itemName.includes('shaker')) return 'Mechanical';
        return 'General Equipment';
    }

    getChemicalInfo(chemicalName) {
        const name = chemicalName.toLowerCase();
        
        // Comprehensive chemical usage database
        const chemicalDatabase = {
            // Indicators
            'phenol red': {
                uses: 'pH indicator with color transition from yellow (pH 6.8) to red (pH 8.4). Used in cell culture media, water testing, and general pH determination in laboratories.',
                formula: 'C₁₉H₁₄O₅S',
                disposal: 'Small amounts can be diluted and flushed down drain with plenty of water. Larger quantities should be collected for hazardous waste disposal. Do not pour concentrated solutions down drain.'
            },
            'phenolphthalein': {
                uses: 'pH indicator turning colorless in acidic solutions and pink in basic solutions (pH 8.2-10). Commonly used in acid-base titrations and demonstrations.',
                formula: 'C₂₀H₁₄O₄',
                disposal: 'Collect waste solutions containing phenolphthalein for proper hazardous waste disposal. Do not flush down drain in concentrated form. Can be neutralized before disposal.'
            },
            'methyl orange': {
                uses: 'pH indicator changing from red (pH < 3.1) to yellow (pH > 4.4). Used for titrations of strong acids with weak bases and pH testing.',
                formula: 'C₁₄H₁₄N₃NaO₃S',
                disposal: 'Contains azo dye - collect for hazardous waste disposal. Do not pour down drain. Treat as organic waste and dispose through licensed waste contractor.'
            },
            'methyl red': {
                uses: 'pH indicator showing red in acidic solutions (pH < 4.4) and yellow in basic solutions (pH > 6.2). Used in microbiological pH testing and titrations.',
                formula: 'C₁₅H₁₅N₃O₂',
                disposal: 'Azo dye compound - collect for hazardous waste disposal. Do not discharge to drain or environment. Store waste solutions in labeled containers for pickup.'
            },
            'bromothymol blue': {
                uses: 'pH indicator transitioning from yellow (acidic) to blue (basic) around pH 6.0-7.6. Ideal for near-neutral pH measurements, photosynthesis experiments, and water quality testing.',
                formula: 'C₂₇H₂₈Br₂O₅S',
                disposal: 'Dilute solutions can be flushed with copious water. Concentrated solutions should be collected for hazardous waste disposal due to bromine content.'
            },
            'bromocresol green': {
                uses: 'pH indicator changing from yellow (pH 3.8) to blue (pH 5.4). Used in DNA agarose gel loading buffers and microbiological culture media.',
                formula: 'C₂₁H₁₄Br₄O₅S'
            },
            'bromocresol purple': {
                uses: 'pH indicator with yellow to purple transition (pH 5.2-6.8). Used in biological pH measurements and bacterial culture media.',
                formula: 'C₂₁H₁₆Br₂O₅S'
            },
            'bromophenol blue': {
                uses: 'pH indicator (pH 3.0-4.6) and protein tracking dye in electrophoresis. Changes from yellow to blue. Used in SDS-PAGE and DNA gel loading buffers.',
                formula: 'C₁₉H₁₀Br₄O₅S'
            },
            'eosin': {
                uses: 'Fluorescent red dye used in histology staining (H&E staining), cell biology, and as a pH indicator. Stains cytoplasm, red blood cells, and collagen fibers pink.',
                formula: 'C₂₀H₆Br₄Na₂O₅'
            },
            'methylene blue': {
                uses: 'Biological stain for microscopy, redox indicator, and medical dye. Used to stain bacteria, nuclei, and in photodynamic therapy. Also used in oxygen depletion experiments.',
                formula: 'C₁₆H₁₈ClN₃S'
            },
            'congo red': {
                uses: 'pH indicator and dye for detecting amyloid proteins. Changes from blue-violet (pH 3.0) to red (pH 5.0). Used in histology and testing for amyloidosis.',
                formula: 'C₃₂H₂₂N₆Na₂O₆S₂'
            },
            'litmus': {
                uses: 'Natural pH indicator extracted from lichens. Turns red in acidic solutions and blue in basic solutions. Used in litmus paper for quick pH testing.',
                formula: 'Natural mixture'
            },
            'universal indicator': {
                uses: 'pH indicator mixture showing different colors across pH range 1-14. Used for general pH determination with color ranging from red (acidic) through green (neutral) to purple (basic).',
                formula: 'Mixture of indicators'
            },
            'fluorescein': {
                uses: 'Fluorescent dye used in tracing water flow, leak detection, ophthalmology (eye examinations), and as a pH indicator. Shows intense green fluorescence under UV light.',
                formula: 'C₂₀H₁₂O₅'
            },
            'eriochrome black t': {
                uses: 'Complexometric indicator used in EDTA titrations for water hardness testing. Detects calcium and magnesium ions in water analysis.',
                formula: 'C₂₀H₁₂N₃NaO₇S'
            },
            'murexide': {
                uses: 'Complexometric indicator for calcium and other metal ion titrations. Changes color when binding to metal ions, used in analytical chemistry.',
                formula: 'C₈H₈N₆O₆'
            },
            'aluminon': {
                uses: 'Reagent for detecting aluminum ions. Forms red lake with aluminum, used in qualitative analysis and water testing for aluminum content.',
                formula: 'C₂₂H₂₃N₃O₉'
            },
            'luminol': {
                uses: 'Chemiluminescent compound that emits blue light when oxidized. Used in forensic science to detect blood traces, demonstrates oxidation reactions and light emission.',
                formula: 'C₈H₇N₃O₂'
            },
            'magneson reagent': {
                uses: 'Analytical reagent used for detection of magnesium ions. Forms blue-purple color complex with Mg²⁺ in alkaline solution. Used in water hardness testing.',
                formula: 'C₁₇H₁₃N₃O₄'
            },
            'schiffs reagent': {
                uses: 'Reagent for detecting aldehydes and DNA/RNA in histology (Feulgen reaction). Decolorized fuchsine that turns magenta-purple with aldehydes. Used in carbohydrate analysis.',
                formula: 'Fuchsine-SO₂'
            },
            'dichlorophenolindophenol': {
                uses: 'Redox indicator (DCPIP) used to measure vitamin C content and in photosynthesis experiments. Blue in oxidized form, colorless when reduced. Used in biochemical assays.',
                formula: 'C₁₂H₇Cl₂NO₂'
            },
            'bicarbonate indicator': {
                uses: 'pH indicator solution containing hydrogencarbonate, used in photosynthesis and respiration experiments. Changes color with CO₂ levels: red (high CO₂), yellow (neutral), purple (low CO₂).',
                formula: 'Mixed indicator with NaHCO₃'
            },
            'potassium hydrogen phthalate': {
                uses: 'Primary standard for acid-base titrations. Highly pure, stable compound used to standardize sodium hydroxide solutions. Also known as KHP.',
                formula: 'C₈H₅KO₄'
            },
            'harris universal indicator': {
                uses: 'Multi-range pH indicator showing full spectrum of colors from pH 1-14. Used for comprehensive pH testing with color chart for accurate pH determination.',
                formula: 'Mixed indicator'
            },
            'epsilon blue': {
                uses: 'pH indicator used in specific pH range determinations. Part of comprehensive pH indicator collection for precise measurements.',
                formula: 'Mixed indicator'
            },
            'eriochrome blue black se': {
                uses: 'Metal ion indicator used in complexometric titrations, similar to Eriochrome Black T. Forms colored complexes with metal ions for analytical determinations.',
                formula: 'C₂₀H₁₃N₃NaO₇S'
            },
            'duranol brilliant yellow': {
                uses: 'Synthetic textile dye used for coloring fabrics and demonstrations of dyeing chemistry. Shows bright yellow coloration.',
                formula: 'Textile dye'
            },
            'duranol brilliant blue': {
                uses: 'Synthetic textile dye for fabric coloring and chemistry demonstrations. Produces intense blue color for dye chemistry experiments.',
                formula: 'Textile dye'
            },
            '1,10-phenanthroline': {
                uses: 'Iron(II) indicator forming red complex with Fe²⁺. Used in spectrophotometric determination of iron and as a redox indicator. Also chelates other metal ions.',
                formula: 'C₁₂H₈N₂·FeSO₄'
            },
            
            // Acids
            'hydrochloric acid': {
                uses: 'Strong acid used for pH adjustment, metal cleaning, ore processing, and digestive acid in stomach. Laboratory uses include titrations, chemical synthesis, and sample preparation.',
                formula: 'HCl',
                disposal: 'NEVER pour concentrated HCl down drain. Dilute carefully with large amounts of water while stirring, then neutralize with sodium bicarbonate until pH 6-8. Dispose neutralized solution down drain with copious water. Concentrated acid requires hazardous waste disposal.'
            },
            'sulfuric acid': {
                uses: 'Highly corrosive strong acid used in battery acid, fertilizer production, oil refining, and chemical synthesis. Laboratory uses include dehydration reactions and pH adjustment.',
                formula: 'H₂SO₄',
                disposal: 'EXTREMELY HAZARDOUS - never add water to concentrated H₂SO₄. Dilute by slowly adding acid to ice water while stirring. Neutralize with sodium bicarbonate until pH 6-8. Concentrated acid must be disposed as hazardous waste. Generate heat - use caution.'
            },
            'nitric acid': {
                uses: 'Strong oxidizing acid used in fertilizer production, metal etching, explosives manufacturing, and gold purification. Laboratory uses include digestion of samples and nitration reactions.',
                formula: 'HNO₃',
                disposal: 'Strong oxidizer - handle with extreme care. Dilute carefully with water, neutralize with sodium bicarbonate until pH 6-8. Do not mix with organics or metals during neutralization. Dispose through hazardous waste contractor.'
            },
            'acetic acid': {
                uses: 'Weak acid (vinegar) used in food preservation, cleaning, pH adjustment, and chemical synthesis. Laboratory uses include buffer preparation and esterification reactions.',
                formula: 'CH₃COOH',
                disposal: 'Dilute solutions can be neutralized with sodium bicarbonate and flushed down drain. Concentrated acetic acid should be diluted first, then neutralized to pH 6-8 before disposal.'
            },
            'vinegar': {
                uses: 'Dilute acetic acid solution (typically 4-8%) used in food preservation, pickling, cleaning, and laboratory demonstrations. Used to demonstrate acid-base reactions and pH changes.',
                formula: 'CH₃COOH (aq)'
            },
            'baking powder': {
                uses: 'Leavening agent containing sodium bicarbonate and acid salts. Releases CO₂ when moistened and heated. Used in baking and laboratory demonstrations of gas production and chemical reactions.',
                formula: 'NaHCO₃ + Ca(H₂PO₄)₂'
            },
            'stearic acid': {
                uses: 'Saturated fatty acid used in soap and candle making, lubricants, and cosmetics. Used in surface tension experiments and as a surfactant.',
                formula: 'C₁₈H₃₆O₂'
            },
            
            // Salts and Compounds
            'sodium chloride': {
                uses: 'Common table salt used for food seasoning, de-icing, saline solutions, and as an electrolyte. Laboratory uses include solution preparation and osmosis experiments.',
                formula: 'NaCl',
                disposal: 'Generally safe for drain disposal with water. Large quantities should be dissolved and diluted before disposal. Food-grade salt can go down drain, analytical grade should be treated as chemical waste if contaminated.'
            },
            'calcium carbonate': {
                uses: 'Found in limestone and chalk, used as antacid, calcium supplement, in cement production, and water treatment. Laboratory uses include acid-base reactions and CO₂ production.',
                formula: 'CaCO₃',
                disposal: 'Environmentally safe - can be disposed in trash or compost. Excess can be neutralized with mild acid and flushed down drain. Solid waste goes in regular trash unless contaminated.'
            },
            'magnesium sulphate': {
                uses: 'Epsom salt used as laxative, bath salt, and in agriculture. Laboratory uses include buffer solutions and crystallization experiments.',
                formula: 'MgSO₄·7H₂O',
                disposal: 'Safe for drain disposal when dissolved in water. Can be used in garden as fertilizer if pure. Small amounts can go down drain, larger amounts should be diluted first.'
            },
            'copper sulphate': {
                uses: 'Blue crystalline compound used as fungicide, algaecide, and in electroplating. Laboratory uses include crystal growing and redox reactions.',
                formula: 'CuSO₄·5H₂O',
                disposal: 'TOXIC TO AQUATIC LIFE - never pour down drain or into environment. Collect for hazardous waste disposal. Can be precipitated with carbonate, filtered, and sent to metal recovery facility.'
            },
            'potassium permanganate': {
                uses: 'Purple oxidizing agent used for water treatment, disinfection, and oxidation reactions. Laboratory uses include redox titrations and organic synthesis.',
                formula: 'KMnO₄',
                disposal: 'Strong oxidizer - reduce with sodium bisulfite or hydrogen peroxide until colorless, then neutralize and flush down drain. Never mix with organics. Collect concentrated solutions for hazardous waste.'
            },
            'sodium hydroxide': {
                uses: 'Strong base (lye) used in soap making, drain cleaning, pH adjustment, and chemical synthesis. Laboratory uses include titrations and saponification.',
                formula: 'NaOH',
                disposal: 'CAUSTIC - neutralize carefully with acid (HCl or H₂SO₄) until pH 6-8. Add acid slowly while stirring and cooling. Neutralized solution can be flushed down drain with water. Never pour concentrated base down drain.'
            },
            'ammonium chloride': {
                uses: 'Used in dry cell batteries, as fertilizer, flux for soldering, and cough medicine. Laboratory uses include buffer solutions and demonstrations.',
                formula: 'NH₄Cl',
                disposal: 'Generally safe for drain disposal when dissolved in water. Large amounts should be diluted before disposal. Can be used as fertilizer if pure. Avoid disposal in areas with sensitive vegetation.'
            },
            'barium chloride': {
                uses: 'Used for testing sulfate ions, in manufacturing pigments, and in fireworks. Forms white precipitate with sulfates in qualitative analysis.',
                formula: 'BaCl₂',
                disposal: 'TOXIC - never pour down drain or into environment. Precipitate with sulfate solution, filter, and send solid to hazardous waste disposal. Contains heavy metal - requires special handling.'
            },
            'cobalt chloride': {
                uses: 'Used as humidity indicator (blue when dry, pink when wet), catalyst, and in invisible ink. Laboratory uses include testing for water and desiccant.',
                formula: 'CoCl₂',
                disposal: 'TOXIC HEAVY METAL - collect for hazardous waste disposal. Never pour down drain. Can cause cancer and respiratory sensitization. Neutralize solutions and collect precipitate for proper disposal.'
            },
            'nickel chloride': {
                uses: 'Used in electroplating nickel, as catalyst, and in nickel-cadmium batteries. Laboratory uses include analytical chemistry and synthesis.',
                formula: 'NiCl₂',
                disposal: 'CARCINOGENIC HEAVY METAL - never pour down drain. Collect all solutions for hazardous waste disposal. Potential skin sensitizer - avoid contact. Requires special handling as toxic metal waste.'
            },
            'potassium chromate': {
                uses: 'Yellow compound used as indicator in silver chloride titrations, in dyeing, and leather tanning. Used in analytical chemistry.',
                formula: 'K₂CrO₄',
                disposal: 'CARCINOGENIC CHROMIUM(VI) - extremely hazardous. Never pour down drain. Reduce to Cr(III) with sodium bisulfite before disposal. Collect all waste for licensed hazardous waste contractor. Avoid dust and skin contact.'
            },
            'ammonium dichromate': {
                uses: 'Orange oxidizing agent used in "volcano" demonstrations, photography, and lithography. Shows dramatic decomposition reaction when heated.',
                formula: '(NH₄)₂Cr₂O₇',
                disposal: 'EXTREMELY HAZARDOUS - carcinogenic Cr(VI). Reduce to Cr(III) with sodium bisulfite, neutralize, then dispose through hazardous waste contractor. Never pour down drain. Oxidizer - keep away from organics.'
            },
            'lead acetate': {
                uses: 'Used for detecting hydrogen sulfide (forms black precipitate), in hair dyes, and historical paint pigment. Toxic compound used carefully in labs.',
                formula: 'Pb(CH₃COO)₂',
                disposal: 'TOXIC HEAVY METAL - never pour down drain or into environment. Precipitate with carbonate, filter, and send to hazardous waste disposal. Causes neurological damage - handle with extreme care.'
            },
            'iron oxide': {
                uses: 'Rust, used as pigment (red, yellow, brown), in thermite reactions, and as polishing compound. Laboratory uses include redox reactions.',
                formula: 'Fe₂O₃',
                disposal: 'Generally safe - can be disposed in regular trash if dry. Large amounts can be dissolved in acid, neutralized, and flushed down drain. Iron is not toxic and can be disposed with minimal environmental concerns.'
            },
            'calcium carbide': {
                uses: 'Produces acetylene gas when reacted with water. Used in welding, carbide lamps, and synthesis of organic compounds. Demonstrates gas production and exothermic reactions.',
                formula: 'CaC₂',
                disposal: 'React slowly with water in well-ventilated area to produce acetylene (flammable gas) and calcium hydroxide. Allow complete reaction, neutralize resulting calcium hydroxide, then flush down drain. Never dispose dry - fire hazard.'
            },
            'potassium': {
                uses: 'Highly reactive alkali metal stored in mineral oil. Used to demonstrate reactivity of Group 1 metals, reacts violently with water producing hydrogen and heat. EXTREME CAUTION required in handling.',
                formula: 'K'
            },
            'naphthalene': {
                uses: 'Mothballs, precursor to many dyes and plastics. Used in sublimation demonstrations and as fumigant. Shows phase change properties.',
                formula: 'C₁₀H₈'
            },
            
            // Organic compounds from Storage 14
            'methyl acetate': {
                uses: 'Ester solvent with fruity odor. Used in chromatography, extraction, and as nail polish remover. Demonstrates esterification and hydrolysis reactions.',
                formula: 'C₃H₆O₂'
            },
            'ethyl acetate': {
                uses: 'Common ester solvent with pleasant fruity smell. Used in chromatography, extraction, nail polish remover, and as flavoring agent. Demonstrates esterification reactions.',
                formula: 'C₄H₈O₂',
                disposal: 'Flammable organic solvent - collect in labeled waste container for disposal. Small amounts can be allowed to evaporate in fume hood. Do not pour down drain. Dispose through organic waste program.'
            },
            'di-n-butyl phthalate': {
                uses: 'Plasticizer used to make plastics flexible. Used in experiments demonstrating polymer properties and plasticization. Shows effects of additives on material properties.',
                formula: 'C₁₆H₂₂O₄',
                disposal: 'Potential endocrine disruptor - collect for hazardous waste disposal. Do not pour down drain or into environment. Dispose through licensed hazardous waste contractor.'
            },
            'hexane-1-ol': {
                uses: 'Primary alcohol (hexanol) used as solvent and in organic synthesis. Demonstrates alcohol properties, oxidation reactions, and esterification.',
                formula: 'C₆H₁₄O',
                disposal: 'Organic alcohol - collect for hazardous waste disposal. Do not pour down drain. Can be incinerated at appropriate facility. Small amounts may be evaporated in fume hood.'
            },
            'n-octane': {
                uses: 'Straight-chain alkane hydrocarbon used as non-polar solvent and fuel component. Standard for octane rating. Used in chromatography and extraction experiments.',
                formula: 'C₈H₁₈'
            },
            'benzoyl chloride': {
                uses: 'Acyl chloride used in organic synthesis (Schotten-Baumann reaction). Highly reactive with water and alcohols. Used to prepare benzoate esters and benzamides. HANDLE WITH CARE - corrosive and lachrymatory.',
                formula: 'C₇H₅ClO'
            },
            'pentan-1-ol': {
                uses: 'Primary alcohol (pentanol) used as solvent and in organic synthesis. Demonstrates alcohol reactions including oxidation, esterification, and elimination.',
                formula: 'C₅H₁₂O'
            },
            'propan-2-ol': {
                uses: 'Isopropyl alcohol (IPA), common disinfectant and solvent. Used for cleaning, hand sanitizer (70% solution), and as rubbing alcohol. Secondary alcohol showing different reactivity than primary alcohols.',
                formula: 'C₃H₈O'
            },
            'methyl benzoate': {
                uses: 'Benzoic acid ester with pleasant smell. Used in perfumes, as solvent, and in organic synthesis. Demonstrates ester properties and hydrolysis reactions.',
                formula: 'C₈H₈O₂'
            },
            'phenyl salicylate': {
                uses: 'Salol, used as UV absorber in sunscreens and as antiseptic. Hydrolyzes to salicylic acid and phenol. Demonstrates ester hydrolysis and melting point determination.',
                formula: 'C₁₃H₁₀O₃'
            },
            'magnesium carbonate': {
                uses: 'White powder used as antacid, drying agent, and in gymnastic chalk. Decomposes on heating to release CO₂. Used in thermal decomposition experiments and acid-base reactions.',
                formula: 'MgCO₃'
            },
            
            // Additional common chemicals
            'metaphosphoric acid': {
                uses: 'Dehydrated form of phosphoric acid, highly hygroscopic. Used in analytical chemistry for protein precipitation and as dehydrating agent. Forms when phosphoric acid is heated.',
                formula: 'HPO₃'
            },
            'phosphorus pentoxide': {
                uses: 'Powerful desiccant and dehydrating agent. Reacts violently with water to form phosphoric acid. Used to remove water from organic solvents and gases. EXTREME CAUTION - highly corrosive.',
                formula: 'P₂O₅',
                disposal: 'EXTREMELY HAZARDOUS - add slowly to large amount of ice water in fume hood, allow to react completely to form phosphoric acid. Neutralize resulting acid with sodium bicarbonate to pH 6-8, then dispose down drain. Never add water to P₂O₅ directly.'
            },
            'dichloromethane': {
                uses: 'Common organic solvent (methylene chloride) used in paint stripping, extraction, and chromatography. Less toxic than chloroform but still requires good ventilation. Non-flammable solvent.',
                formula: 'CH₂Cl₂',
                disposal: 'Halogenated solvent - NEVER pour down drain or evaporate in lab. Collect in labeled waste container for hazardous waste disposal. Do not mix with other solvents. Dispose through licensed waste contractor only.'
            },
            'aluminium nitrate': {
                uses: 'White crystalline salt used in tanning leather, antiperspirants, and corrosion inhibitors. Used in analytical chemistry and as mordant in textile dyeing.',
                formula: 'Al(NO₃)₃·9H₂O'
            },
            'potassium nitrate': {
                uses: 'Saltpeter used in fertilizers, food preservation, fireworks, and gunpowder. Oxidizing agent in pyrotechnics. Used in meat curing and toothpaste for sensitivity.',
                formula: 'KNO₃'
            },
            'sodium bicarbonate': {
                uses: 'Baking soda used in cooking, cleaning, fire extinguishing, and as antacid. Releases CO₂ when heated or mixed with acids. Used in laboratory demonstrations and pH adjustment.',
                formula: 'NaHCO₃'
            },
            'calcium chloride': {
                uses: 'Hygroscopic salt used for de-icing roads, desiccant, dust control, and food additive. Releases heat when dissolved in water. Used in concrete acceleration and brine refrigeration.',
                formula: 'CaCl₂'
            },
            'zinc sulfate': {
                uses: 'White crystalline salt used in medicine, agriculture, and industry. Zinc supplement, fungicide, and mordant in dyeing. Used in electroplating and wood preservation.',
                formula: 'ZnSO₄·7H₂O'
            },
            'iron sulfate': {
                uses: 'Green crystalline salt (ferrous sulfate) used as iron supplement, lawn treatment, and water treatment. Reduces soil pH and provides iron for plants. Used in ink manufacturing.',
                formula: 'FeSO₄·7H₂O'
            },
            'high vacuum grease': {
                uses: 'Specialized lubricant for high-vacuum systems, ground glass joints, and stopcocks. Resistant to solvents and maintains seal under vacuum. Essential for glassware assembly.',
                formula: 'Silicone-based compound'
            },
            'petroleum ether': {
                uses: 'Mixture of light hydrocarbons used as non-polar solvent for extraction and chromatography. Different from diethyl ether - actually a petroleum distillate. Highly flammable.',
                formula: 'C₅-C₇ alkanes'
            },
            'absolute ethanol': {
                uses: 'Pure ethyl alcohol (99.5%+) used as solvent, fuel, antiseptic, and in molecular biology. More expensive than denatured ethanol. Used when water content must be minimal.',
                formula: 'C₂H₅OH'
            },
            'industrial methylated spirits': {
                uses: 'Denatured ethanol (contains methanol to make it unfit for drinking) used as solvent, fuel, and cleaning agent. Cheaper than absolute ethanol for industrial use.',
                formula: 'C₂H₅OH + CH₃OH (denaturant)',
                disposal: 'Flammable - collect for hazardous waste disposal. Small amounts can be evaporated in fume hood. Do not pour down drain due to methanol content. Dispose through organic solvent waste program.'
            },
            'sodium bicarbonate': {
                uses: 'Baking soda used in cooking, cleaning, fire extinguishing, and as antacid. Releases CO₂ when heated or mixed with acids. Used in laboratory demonstrations and pH adjustment.',
                formula: 'NaHCO₃',
                disposal: 'Environmentally safe - can be flushed down drain with water. Large amounts should be dissolved first. Can be composted or disposed in regular trash if food grade.'
            },
            'calcium chloride': {
                uses: 'Hygroscopic salt used for de-icing roads, desiccant, dust control, and food additive. Releases heat when dissolved in water. Used in concrete acceleration and brine refrigeration.',
                formula: 'CaCl₂',
                disposal: 'Generally safe for disposal down drain when dissolved in large amount of water. Concentrated solutions should be diluted first. Solid can go in trash unless contaminated.'
            },
            
            // Additional organic compounds
            'glycerol': {
                uses: 'Glycerin, a viscous sweet liquid used in cosmetics, pharmaceuticals, food preservatives, and antifreeze. Laboratory uses include mounting media for microscopy, density gradient centrifugation, and as humectant. Non-toxic and biodegradable.',
                formula: 'C₃H₈O₃',
                disposal: 'Environmentally safe - biodegradable. Can be diluted and flushed down drain. Large amounts should be collected for biological waste disposal or composting. Food grade can go to organic waste.'
            },
            'butan-1-ol': {
                uses: 'Primary alcohol (butanol) used as solvent for resins, oils, and dyes. Used in paint thinners, hydraulic fluids, and as extractant in liquid-liquid extractions. Shows primary alcohol reactions.',
                formula: 'C₄H₁₀O',
                disposal: 'Flammable organic solvent - collect for hazardous waste disposal. Do not pour down drain. Small amounts may be evaporated in fume hood with adequate ventilation. Dispose through organic waste program.'
            },
            'butan-2-ol': {
                uses: 'Secondary alcohol (sec-butanol) used as solvent and in organic synthesis. Different reactivity than primary alcohols - used to demonstrate alcohol classification. Industrial solvent for lacquers and enamels.',
                formula: 'C₄H₁₀O',
                disposal: 'Flammable alcohol - collect for hazardous waste disposal. Do not pour down drain. Can be evaporated in small amounts in fume hood. Dispose through organic solvent waste program.'
            },
            '2-methylpropan-2-ol': {
                uses: 'Tertiary alcohol (tert-butanol) with unique properties - solid at room temperature. Used as octane booster in gasoline, solvent for perfumes, and in organic synthesis. Demonstrates tertiary alcohol behavior.',
                formula: 'C₄H₁₀O',
                disposal: 'Flammable but less toxic than other butanols. Small amounts can be diluted and flushed. Larger amounts should be collected for organic waste disposal due to flammability.'
            },
            'propane-1,2-diol': {
                uses: 'Propylene glycol used as antifreeze, food additive (E1520), cosmetic ingredient, and pharmaceutical solvent. Less toxic than ethylene glycol. Used in fog machines and e-cigarettes.',
                formula: 'C₃H₈O₂',
                disposal: 'Generally safe - biodegradable and low toxicity. Can be diluted and flushed down drain in small amounts. Large quantities should be disposed through organic waste due to high oxygen demand.'
            },
            'cyclohexane': {
                uses: 'Non-polar cyclic hydrocarbon solvent used in paint thinners, adhesives, and as extraction solvent. Industrial precursor to nylon production. Demonstrates cycloalkane properties and conformational isomerism.',
                formula: 'C₆H₁₂',
                disposal: 'Flammable hydrocarbon - never pour down drain. Collect in labeled container for hazardous waste disposal. Can be incinerated at appropriate facility. Do not evaporate in lab - use fume hood.'
            },
            'cyclohexanone': {
                uses: 'Ketone solvent used in adhesives, wood stains, paint and varnish removers. Precursor to nylon and caprolactam production. Demonstrates ketone reactions and nucleophilic addition.',
                formula: 'C₆H₁₀O',
                disposal: 'Organic ketone solvent - collect for hazardous waste disposal. Do not pour down drain. Flammable and potentially harmful to aquatic life. Dispose through organic waste program.'
            },
            'n-butylamine': {
                uses: 'Primary aliphatic amine used in organic synthesis, rubber chemicals, and as corrosion inhibitor. Used to prepare pharmaceuticals and agricultural chemicals. Demonstrates amine basicity and nucleophilicity.',
                formula: 'C₄H₁₁N',
                disposal: 'TOXIC AND CORROSIVE - never pour down drain. Neutralize with acid to form salt, then dispose through hazardous waste. Caustic to skin and respiratory system. Handle with extreme care.'
            },
            'n-pentane': {
                uses: 'Straight-chain alkane used as blowing agent in foam production, laboratory solvent, and reference standard. Highly volatile and flammable. Used in extraction and chromatography.',
                formula: 'C₅H₁₂',
                disposal: 'Extremely flammable hydrocarbon - collect for hazardous waste disposal. Never pour down drain. High vapor pressure - handle in well-ventilated area. Dispose through hydrocarbon waste program.'
            },
            'n-heptane': {
                uses: 'Straight-chain alkane solvent used in paints, coatings, and as octane reference standard (0 octane rating). Non-polar extraction solvent and industrial degreaser.',
                formula: 'C₇H₁₆',
                disposal: 'Flammable hydrocarbon - collect for hazardous waste disposal. Do not pour down drain or evaporate in lab. Store in appropriate containers and dispose through licensed contractor.'
            },
            'bromoethane': {
                uses: 'Alkyl halide (ethyl bromide) used in organic synthesis as alkylating agent. Demonstrates SN2 reactions and Grignard reagent preparation. Used in pharmaceutical synthesis. CAUTION: Potential carcinogen.',
                formula: 'C₂H₅Br',
                disposal: 'HAZARDOUS HALOGENATED COMPOUND - never pour down drain. Collect for hazardous waste disposal. Potential carcinogen - handle with extreme care in fume hood. Dispose through licensed contractor only.'
            },
            '1-iodobutane': {
                uses: 'Alkyl iodide (butyl iodide) used in organic synthesis for alkylation reactions. Excellent leaving group in nucleophilic substitution. Used to prepare Grignard reagents and in Wurtz reactions.',
                formula: 'C₄H₉I',
                disposal: 'Halogenated organic compound - collect for hazardous waste disposal. Never pour down drain. Contains iodine - avoid exposure to light. Dispose through appropriate organic halogen waste program.'
            },
            '1-chlorobutane': {
                uses: 'Alkyl chloride (butyl chloride) used as solvent and in organic synthesis. Demonstrates nucleophilic substitution reactions. Used in preparation of other organic compounds and as alkylating agent.',
                formula: 'C₄H₉Cl',
                disposal: 'Halogenated solvent - collect for hazardous waste disposal. Do not pour down drain or incinerate inappropriately. Store in appropriate containers and dispose through licensed waste contractor.'
            },
            '2-bromobutane': {
                uses: 'Secondary alkyl halide used in organic synthesis to study substitution vs elimination reactions. Demonstrates chirality (has stereocenter) and different reactivity than primary halides.',
                formula: 'C₄H₉Br',
                disposal: 'Halogenated organic compound - collect for hazardous waste disposal. Never pour down drain. Handle in fume hood due to volatility. Dispose through appropriate halogenated waste program.'
            },
            'butanone': {
                uses: 'Methyl ethyl ketone (MEK) - industrial solvent used in paints, adhesives, and coatings. Lower toxicity than acetone. Used in extraction and demonstrates ketone reactions.',
                formula: 'C₄H₈O',
                disposal: 'Flammable ketone solvent - collect for hazardous waste disposal. Do not pour down drain. Can be evaporated in small amounts in fume hood. Dispose through organic solvent waste program.'
            },
            'phosphorus pentachloride': {
                uses: 'Powerful chlorinating agent used to convert alcohols to alkyl chlorides and carboxylic acids to acyl chlorides. Used in organic synthesis and pharmaceutical manufacturing. EXTREMELY REACTIVE with water.',
                formula: 'PCl₅',
                disposal: 'EXTREMELY HAZARDOUS - reacts violently with water to produce HCl and phosphoric acid. Add slowly to large excess of ice water in fume hood, neutralize resulting acid with sodium bicarbonate, dispose neutralized solution down drain.'
            }
        };

        // Search for matching chemical with improved name matching
        
        // First try exact match
        if (chemicalDatabase[name]) {
            return chemicalDatabase[name];
        }
        
        // Try common synonyms and variations
        const synonyms = {
            'ethanoic acid': 'acetic acid',
            'sulphuric acid': 'sulfuric acid',
            'sulphurous acid': 'sulfurous acid',
            'hydrochloric acid': 'hydrochloric acid',
            'muriatic acid': 'hydrochloric acid',
            'spirit of salt': 'hydrochloric acid',
            'oil of vitriol': 'sulfuric acid',
            'battery acid': 'sulfuric acid',
            'aqua fortis': 'nitric acid',
            'caustic soda': 'sodium hydroxide',
            'lye': 'sodium hydroxide',
            'washing soda': 'sodium carbonate',
            'baking soda': 'sodium bicarbonate',
            'table salt': 'sodium chloride',
            'common salt': 'sodium chloride',
            'epsom salt': 'magnesium sulphate',
            'epsom salts': 'magnesium sulphate',
            'blue vitriol': 'copper sulphate',
            'cupric sulfate': 'copper sulphate',
            'sal volatile': 'ammonium carbonate',
            'smelling salts': 'ammonium carbonate',
            'sal ammoniac': 'ammonium chloride',
            'quicklime': 'calcium oxide',
            'slaked lime': 'calcium hydroxide',
            'limestone': 'calcium carbonate',
            'chalk': 'calcium carbonate',
            'marble': 'calcium carbonate',
            'rust': 'iron oxide',
            'ferric oxide': 'iron oxide',
            'mothballs': 'naphthalene',
            'moth crystals': 'naphthalene'
        };
        
        // Check synonyms
        if (synonyms[name]) {
            const synonymName = synonyms[name];
            if (chemicalDatabase[synonymName]) {
                return chemicalDatabase[synonymName];
            }
        }
        
        // Try partial matching
        for (let key in chemicalDatabase) {
            // Clean names for better matching (remove common suffixes/prefixes)
            const cleanName = name.replace(/\s+(acid|powder|solution|crystals?|salt|marble|powder)\s*$/i, '').trim();
            const cleanKey = key.replace(/\s+(acid|powder|solution|crystals?|salt|marble|powder)\s*$/i, '').trim();
            
            if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
                return chemicalDatabase[key];
            }
            
            // Also try original matching
            if (name.includes(key) || key.includes(name)) {
                return chemicalDatabase[key];
            }
        }

        return null;
    }

    updateChemicalDescriptions() {
        if (!this.isAdminLoggedIn) {
            alert('Admin access required for this operation');
            return;
        }
        
        // Update all existing chemicals with proper descriptions from the database
        let updated = 0;
        
        this.chemicals.forEach(chemical => {
            // Skip if chemical already has notes with substantial content
            if (chemical.notes && chemical.notes.length > 50 && !chemical.notes.includes('from oxidizers') && !chemical.notes.includes('from organic')) {
                return;
            }
            
            const chemicalInfo = this.getChemicalInfo(chemical.name);
            if (chemicalInfo && chemicalInfo.uses) {
                // Preserve location information if it exists in current notes
                const locationInfo = chemical.notes || '';
                const locationPart = locationInfo.includes('from ') ? ` (${locationInfo})` : '';
                
                // Build comprehensive notes with uses and disposal information
                let notes = chemicalInfo.uses;
                
                if (chemicalInfo.disposal) {
                    notes += `\n\n🚮 SAFE DISPOSAL: ${chemicalInfo.disposal}`;
                }
                
                chemical.notes = `${notes}${locationPart}`;
                
                // Update formula if it's missing and available in database
                if (!chemical.formula && chemicalInfo.formula) {
                    chemical.formula = chemicalInfo.formula;
                }
                
                updated++;
            }
        });
        
        if (updated > 0) {
            this.saveData();
            this.renderItems();
            console.log(`Updated descriptions for ${updated} chemicals`);
        }
        
        return updated;
    }

    addEssentialChemicals() {
        if (!this.isAdminLoggedIn) {
            alert('Admin access required for this operation');
            return;
        }
        
        // Add essential chemicals that every lab should have
        const essentialChemicals = [
            {
                name: 'Sodium Chloride',
                formula: 'NaCl',
                quantity: 500,
                unit: 'g',
                location: 'Essential Chemicals',
                expiry: '',
                hazard: 'low',
                notes: 'Common table salt for solution preparation and osmosis experiments.'
            },
            {
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 1,
                unit: 'L',
                location: 'Essential Chemicals - Acids',
                expiry: '',
                hazard: 'high',
                notes: 'Strong acid for titrations and pH adjustment.'
            },
            {
                name: 'Sodium Hydroxide',
                formula: 'NaOH',
                quantity: 250,
                unit: 'g',
                location: 'Essential Chemicals - Bases',
                expiry: '',
                hazard: 'high',
                notes: 'Strong base for titrations and soap making.'
            },
            {
                name: 'Phenolphthalein',
                formula: 'C₂₀H₁₄O₄',
                quantity: 50,
                unit: 'ml',
                location: 'Essential Chemicals - Indicators',
                expiry: '',
                hazard: 'medium',
                notes: 'pH indicator for acid-base titrations.'
            },
            {
                name: 'Universal Indicator',
                formula: 'Mixed indicators',
                quantity: 100,
                unit: 'ml',
                location: 'Essential Chemicals - Indicators',
                expiry: '',
                hazard: 'medium',
                notes: 'Multi-range pH indicator showing colors across pH 1-14.'
            },
            {
                name: 'Copper Sulphate',
                formula: 'CuSO₄·5H₂O',
                quantity: 250,
                unit: 'g',
                location: 'Essential Chemicals - Salts',
                expiry: '',
                hazard: 'medium',
                notes: 'Blue crystalline salt for crystal growing and redox reactions.'
            },
            {
                name: 'Sodium Bicarbonate',
                formula: 'NaHCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Essential Chemicals',
                expiry: '',
                hazard: 'low',
                notes: 'Baking soda for neutralization and CO₂ generation experiments.'
            },
            {
                name: 'Ethanol',
                formula: 'C₂H₅OH',
                quantity: 1,
                unit: 'L',
                location: 'Essential Chemicals - Solvents',
                expiry: '',
                hazard: 'medium',
                notes: 'Alcohol for cleaning, extraction, and organic synthesis.'
            }
        ];

        let added = 0;
        let nextId = Math.max(...this.chemicals.map(c => c.id), 0) + 1;

        essentialChemicals.forEach(chemical => {
            // Check if chemical already exists
            const exists = this.chemicals.some(c => 
                c.name.toLowerCase() === chemical.name.toLowerCase() && 
                c.location.includes('Essential Chemicals')
            );

            if (!exists) {
                this.chemicals.push({
                    id: nextId++,
                    ...chemical
                });
                added++;
            }
        });

        if (added > 0) {
            this.saveData();
            this.renderItems();
            alert(`Added ${added} essential chemicals to the inventory!`);
        } else {
            alert('All essential chemicals are already in the inventory.');
        }

        return added;
    }

    addShelfChemicals() {
        // Add chemicals from Shelf A1, A2, and B1
        const shelfChemicals = [
            // Shelf A1 - Aluminium-based compounds
            {
                name: 'Aluminium Metal powder',
                formula: 'Al',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '2002',
                hazard: 'high',
                notes: 'Flammable metal powder - keep away from ignition sources'
            },
            {
                name: 'Aluminium Metal powder',
                formula: 'Al',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '2008',
                hazard: 'high',
                notes: 'Flammable metal powder - keep away from ignition sources'
            },
            {
                name: 'Aluminium Metal powder',
                formula: 'Al',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '2007',
                hazard: 'high',
                notes: 'Flammable metal powder - keep away from ignition sources'
            },
            {
                name: 'Aluminium Metal powder',
                formula: 'Al',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '2009',
                hazard: 'high',
                notes: 'Flammable metal powder - keep away from ignition sources'
            },
            {
                name: 'Aluminium Metal powder',
                formula: 'Al',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'high',
                notes: 'Flammable metal powder - keep away from ignition sources'
            },
            {
                name: 'Aluminium chloride-6-water',
                formula: 'AlCl₃·6H₂O',
                quantity: 100,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'high',
                notes: 'Corrosive - causes severe burns'
            },
            {
                name: 'Aluminium Nitrate',
                formula: 'Al(NO₃)₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'medium',
                notes: 'Oxidizer - may intensify fire'
            },
            {
                name: 'Aluminium Orthophosphate',
                formula: 'AlPO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'low',
                notes: 'Low hazard compound'
            },
            {
                name: 'Aluminium Sulphate Purified',
                formula: 'Al₂(SO₄)₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '2026',
                hazard: 'low',
                notes: '2 bottles available'
            },
            {
                name: 'Rivets Aluminium',
                formula: 'Al',
                quantity: 1,
                unit: 'pack',
                location: 'Shelf A1',
                expiry: '2017',
                hazard: 'low',
                notes: 'Metal rivets for construction'
            },
            {
                name: 'Aluminium oxide',
                formula: 'Al₂O₃',
                quantity: 10,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'low',
                notes: 'Nearly depleted - needs restocking'
            },
            {
                name: 'Aluminium Chloride',
                formula: 'AlCl₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'high',
                notes: 'Anhydrous form - highly corrosive'
            },
            {
                name: 'Aluminium potassium sulphate',
                formula: 'KAl(SO₄)₂·12H₂O',
                quantity: 250,
                unit: 'g',
                location: 'Shelf A1',
                expiry: '',
                hazard: 'low',
                notes: 'Alum - used for water purification'
            },

            // Shelf A2 - Ammonium-based compounds
            {
                name: 'Ammonium Chloride',
                formula: 'NH₄Cl',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Common ammonium salt'
            },
            {
                name: 'Ammonium Benzoate',
                formula: 'NH₄C₇H₅O₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Organic ammonium salt'
            },
            {
                name: 'Ammonium Benzoate',
                formula: 'NH₄C₇H₅O₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Organic ammonium salt - container 1'
            },
            {
                name: 'Ammonium Benzoate',
                formula: 'NH₄C₇H₅O₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Organic ammonium salt - container 2'
            },
            {
                name: 'Ammonium Cupric Sulphate',
                formula: '(NH₄)₂Cu(SO₄)₂·6H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Copper-containing compound'
            },
            {
                name: 'Ammonium Cupric Chloride',
                formula: '(NH₄)₂CuCl₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Copper-containing compound - corrosive'
            },
            {
                name: 'Ammonium Dichromate',
                formula: '(NH₄)₂Cr₂O₇',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'high',
                notes: 'CARCINOGEN - Handle with extreme care'
            },
            {
                name: 'Ammonium Dichromate',
                formula: '(NH₄)₂Cr₂O₇',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '2004',
                hazard: 'high',
                notes: 'CARCINOGEN - Handle with extreme care'
            },
            {
                name: 'Ammonium Iron (II) Sulphate',
                formula: '(NH₄)₂Fe(SO₄)₂·6H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Mohr\'s salt - analytical reagent'
            },
            {
                name: 'Ammonium Iodide',
                formula: 'NH₄I',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Light sensitive - store in dark'
            },
            {
                name: 'Ammonium Nitrate',
                formula: 'NH₄NO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'high',
                notes: 'OXIDIZER - Explosive potential'
            },
            {
                name: 'Ammonium Dihydrogen Orthophosphate',
                formula: 'NH₄H₂PO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: '2 containers available'
            },
            {
                name: 'Ammonium Oxalate',
                formula: '(NH₄)₂C₂O₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Toxic if ingested'
            },
            {
                name: 'Ammonium Thiocyanate',
                formula: 'NH₄SCN',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: '2 containers - analytical reagent'
            },
            {
                name: 'Ammonium Thiosulphate',
                formula: '(NH₄)₂S₂O₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Photography fixer'
            },
            {
                name: 'Ammonium Sulphate',
                formula: '(NH₄)₂SO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: '3 containers available'
            },
            {
                name: 'Ammonium Sulphate',
                formula: '(NH₄)₂SO₄',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Large container'
            },
            {
                name: 'Aluminium metal leaf',
                formula: 'Al',
                quantity: 10,
                unit: 'sheets',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'low',
                notes: 'Thin metal sheets'
            },
            {
                name: 'Ammonium metavanadate',
                formula: 'NH₄VO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic vanadium compound'
            },
            {
                name: 'Ammonium ethanedioate-1-water',
                formula: '(NH₄)₂C₂O₄·H₂O',
                quantity: 250,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Ammonium oxalate monohydrate'
            },
            {
                name: 'Antimony metal',
                formula: 'Sb',
                quantity: 50,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'medium',
                notes: 'Heavy metal - toxic'
            },
            {
                name: 'Antimony oxide',
                formula: 'Sb₂O₃',
                quantity: 100,
                unit: 'g',
                location: 'Shelf A2',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic compound - use fume hood'
            },

            // Shelf B1 - Barium-based compounds
            {
                name: 'Barium Acetate',
                formula: 'Ba(C₂H₃O₂)₂',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic barium compound'
            },
            {
                name: 'Barium Bromide',
                formula: 'BaBr₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic - 2 containers available'
            },
            {
                name: 'Barium Carbonate',
                formula: 'BaCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic barium compound'
            },
            {
                name: 'Barium Carbonate',
                formula: 'BaCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '2003',
                hazard: 'high',
                notes: 'Toxic barium compound - dated batch'
            },
            {
                name: 'Barium Chloride',
                formula: 'BaCl₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic - cardiac effects'
            },
            {
                name: 'Barium Hydroxide',
                formula: 'Ba(OH)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Caustic and toxic - 2 containers'
            },
            {
                name: 'Barium Hydroxide 8H2O',
                formula: 'Ba(OH)₂·8H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Hydrated form - caustic and toxic'
            },
            {
                name: 'Barium Nitrate',
                formula: 'Ba(NO₃)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Oxidizer and toxic - 6 containers'
            },
            {
                name: 'Barium Nitrate',
                formula: 'Ba(NO₃)₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Oxidizer and toxic - 3 containers'
            },
            {
                name: 'Barium oxide anhydrous',
                formula: 'BaO',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Highly caustic and toxic'
            },
            {
                name: 'Barium Peroxide',
                formula: 'BaO₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Strong oxidizer and toxic - 2 containers'
            },
            {
                name: 'Barium sulphate',
                formula: 'BaSO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'low',
                notes: 'Insoluble - relatively safe barium compound - 2 containers'
            },
            {
                name: 'Brass (rivets)',
                formula: 'Cu/Zn alloy',
                quantity: 100,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'low',
                notes: 'Metal alloy rivets - 2 containers'
            },
            {
                name: 'Bismuth nitrate',
                formula: 'Bi(NO₃)₃',
                quantity: 50,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'medium',
                notes: 'Heavy metal compound'
            },
            {
                name: 'Bismuth Oxide',
                formula: 'Bi₂O₃',
                quantity: 50,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'medium',
                notes: 'Heavy metal oxide'
            },
            {
                name: 'Bismuth',
                formula: 'Bi',
                quantity: 25,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'medium',
                notes: 'Pure bismuth metal'
            },
            {
                name: 'Cadmium Oxide',
                formula: 'CdO',
                quantity: 50,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'HIGHLY TOXIC CARCINOGEN - 2 containers'
            },
            {
                name: 'Barium chromate',
                formula: 'BaCrO₄',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'CARCINOGEN - Toxic chromium compound - 2 containers'
            },
            {
                name: 'Barium iodide',
                formula: 'BaI₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic barium compound - 2 bottles'
            },

            // Shelf B2 - Calcium-based compounds
            {
                name: 'Calcium metal granules',
                formula: 'Ca',
                quantity: 100,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'high',
                notes: 'Highly reactive with water - 4 containers'
            },
            {
                name: 'Calcium carbonate (unilab)',
                formula: 'CaCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '1999',
                hazard: 'low',
                notes: 'EXPIRED - evaluate for disposal'
            },
            {
                name: 'Calcium acetate (dried)',
                formula: 'Ca(C₂H₃O₂)₂',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: '2 containers available'
            },
            {
                name: 'Calcium carbonate (unilab)',
                formula: 'CaCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Standard grade'
            },
            {
                name: 'Calcium carbonate 98%',
                formula: 'CaCO₃',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'High purity grade'
            },
            {
                name: 'Calcium carbonate (marble chips)',
                formula: 'CaCO₃',
                quantity: 3000,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Large pieces for gas generation'
            },
            {
                name: 'Calcium chloride anhydrous',
                formula: 'CaCl₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Hygroscopic - 7 containers'
            },
            {
                name: 'Calcium chloride',
                formula: 'CaCl₂',
                quantity: 50,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Small quantity container'
            },
            {
                name: 'Calcium chloride 6-water',
                formula: 'CaCl₂·6H₂O',
                quantity: 250,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Hexahydrate form'
            },
            {
                name: 'Calcium hydroxide',
                formula: 'Ca(OH)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'high',
                notes: 'Caustic - stored securely'
            },
            {
                name: 'Calcium fluoride precipitated',
                formula: 'CaF₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Toxic if ingested'
            },
            {
                name: 'Calcium formate',
                formula: 'Ca(HCOO)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Organic calcium salt'
            },
            {
                name: 'Calcium hydride',
                formula: 'CaH₂',
                quantity: 50,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'high',
                notes: 'Reacts violently with water - flammable gas'
            },
            {
                name: 'Calcium iodide',
                formula: 'CaI₂',
                quantity: 100,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Light sensitive - 2 bottles'
            },
            {
                name: 'Marble chips (large)',
                formula: 'CaCO₃',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Large size for demonstrations'
            },
            {
                name: 'Calcium oxalate',
                formula: 'CaC₂O₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: '2 containers available'
            },
            {
                name: 'Calcium phosphate',
                formula: 'Ca₃(PO₄)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Bone ash substitute'
            },
            {
                name: 'Calcium Stearate',
                formula: 'Ca(C₁₈H₃₅O₂)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Fatty acid salt'
            },
            {
                name: 'Calcium nitrate-4-Water',
                formula: 'Ca(NO₃)₂·4H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'medium',
                notes: 'Oxidizer - 3 containers'
            },
            {
                name: 'Calcium tetrahydrogen phosphate',
                formula: 'Ca(H₂PO₄)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Monocalcium phosphate'
            },
            {
                name: 'Calcium sulphate (dihydrogen)',
                formula: 'CaSO₄·2H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf B2',
                expiry: '',
                hazard: 'low',
                notes: 'Gypsum - 2 containers'
            },

            // Shelf C1 - Transition metal compounds
            {
                name: 'Chlorine water',
                formula: 'Cl₂(aq)',
                quantity: 250,
                unit: 'ml',
                location: 'Shelf C1',
                expiry: 'expired',
                hazard: 'high',
                notes: 'EXPIRED - corrosive oxidizer - dispose safely'
            },
            {
                name: 'Chromic Potassium Sulphate 12H2O',
                formula: 'KCr(SO₄)₂·12H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Chrome alum - potential carcinogen'
            },
            {
                name: 'Chromic Nitrate',
                formula: 'Cr(NO₃)₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Chromium compound - handle with care'
            },
            {
                name: 'Chromium (III) Oxide Green',
                formula: 'Cr₂O₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: '2 containers - pigment grade'
            },
            {
                name: 'Chromium metal',
                formula: 'Cr',
                quantity: 50,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Pure chromium metal'
            },
            {
                name: 'Cobalt (II) Sulphate 7H2O',
                formula: 'CoSO₄·7H₂O',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic - potential allergen'
            },
            {
                name: 'Cobalt (II) Nitrate 6H2O',
                formula: 'Co(NO₃)₂·6H₂O',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic cobalt compound'
            },
            {
                name: 'Cobalt Chloride',
                formula: 'CoCl₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Color-changing indicator'
            },
            {
                name: 'Cobalt metal',
                formula: 'Co',
                quantity: 25,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Pure cobalt metal'
            },
            {
                name: 'Cobalt chloride',
                formula: 'CoCl₂',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Smaller container'
            },
            {
                name: 'Cobalt (II) Oxide black',
                formula: 'CoO',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Black cobalt oxide'
            },
            {
                name: 'Cobalt (II) carbonate basic',
                formula: 'CoCO₃·Co(OH)₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: '4 containers - basic carbonate'
            },
            {
                name: 'Cobalt Sulphate',
                formula: 'CoSO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Anhydrous form'
            },
            {
                name: 'Cobalt nitrate',
                formula: 'Co(NO₃)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Anhydrous cobalt nitrate'
            },
            {
                name: 'Cobalt ammonium sulphate',
                formula: '(NH₄)₂Co(SO₄)₂',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Double salt'
            },
            {
                name: 'Copper rivets',
                formula: 'Cu',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Copper metal fasteners'
            },
            {
                name: 'Copper (II) acetate 1-hydrate',
                formula: 'Cu(C₂H₃O₂)₂·H₂O',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Verdigris color'
            },
            {
                name: 'Copper rivets',
                formula: 'Cu',
                quantity: 150,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: '3 containers of rivets'
            },
            {
                name: 'Copper metal',
                formula: 'Cu',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Pure copper pieces'
            },
            {
                name: 'Copper metal powder precipitated',
                formula: 'Cu',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Fine powder - 5 containers'
            },
            {
                name: 'Copper (I) chloride',
                formula: 'CuCl',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Cuprous chloride - 2 containers'
            },
            {
                name: 'Copper powder precipitated',
                formula: 'Cu',
                quantity: 200,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Precipitated copper powder'
            },
            {
                name: 'Copper (II) carbonate',
                formula: 'CuCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Basic copper carbonate'
            },
            {
                name: 'Copper (II) carbonate',
                formula: 'CuCO₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Smaller container'
            },
            {
                name: 'Copper (II) oxide',
                formula: 'CuO',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Black copper oxide - 5 containers'
            },
            {
                name: 'Copper metal strips',
                formula: 'Cu',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Metal strips for electrodes'
            },
            {
                name: 'Copper oxalate',
                formula: 'CuC₂O₄',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Copper salt of oxalic acid'
            },
            {
                name: 'Copper oxide',
                formula: 'CuO',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'General purpose copper oxide'
            },
            {
                name: 'Copper 2 oxide wire form',
                formula: 'CuO',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Wire-shaped oxide'
            },
            {
                name: 'Copper (I) Oxide Red (cuprous)',
                formula: 'Cu₂O',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Red cuprous oxide'
            },
            {
                name: 'Copper sulphate',
                formula: 'CuSO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Anhydrous white form'
            },
            {
                name: 'Copper oxide wire form',
                formula: 'CuO',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Wire form - 2 containers'
            },
            {
                name: 'Copper sulphate anhydrous',
                formula: 'CuSO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'White anhydrous form'
            },
            {
                name: 'Dirty copper',
                formula: 'Cu (impure)',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Impure copper metal'
            },
            {
                name: 'Copper (II) sulphate-5-water',
                formula: 'CuSO₄·5H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'medium',
                notes: 'Blue pentahydrate'
            },
            {
                name: 'Copper metal powder',
                formula: 'Cu',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Fine copper powder'
            },
            {
                name: 'Iodine resublimed',
                formula: 'I₂',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'high',
                notes: 'Purified iodine crystals - toxic/corrosive'
            },
            {
                name: 'Ferric chloride',
                formula: 'FeCl₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: 'expired',
                hazard: 'medium',
                notes: 'EXPIRED - 2 containers - corrosive'
            },
            {
                name: 'Iron metal fillings',
                formula: 'Fe',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C1',
                expiry: '',
                hazard: 'low',
                notes: 'Iron metal filings'
            },

            // Shelf C2 - Iron compounds
            {
                name: 'Iron (III) chloride 6-water',
                formula: 'FeCl₃·6H₂O',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'medium',
                notes: 'Hexahydrate form - corrosive'
            },
            {
                name: 'Iron (III) chloride 6-water',
                formula: 'FeCl₃·6H₂O',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf C2',
                expiry: 'expired',
                hazard: 'medium',
                notes: 'EXPIRED - hexahydrate - dispose safely'
            },
            {
                name: 'Iron (II) carbonate saccharated',
                formula: 'FeCO₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Ferrous carbonate with sugar'
            },
            {
                name: 'Iron metal fillings fine',
                formula: 'Fe',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Fine iron filings - 3 containers'
            },
            {
                name: 'Iron (III) oxide',
                formula: 'Fe₂O₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Ferric oxide - 2 containers'
            },
            {
                name: 'Iron (III) oxide',
                formula: 'Fe₂O₃',
                quantity: 2000,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Large container - 2kg'
            },
            {
                name: 'Iron (III) nitrate 9-water',
                formula: 'Fe(NO₃)₃·9H₂O',
                quantity: 100,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'medium',
                notes: 'Nonahydrate form - oxidizer'
            },
            {
                name: 'Ferric oxide red',
                formula: 'Fe₂O₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Red iron oxide - 2 containers'
            },
            {
                name: 'Ferric oxide calcined',
                formula: 'Fe₂O₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Heat-treated iron oxide'
            },
            {
                name: 'Iron carbonate',
                formula: 'FeCO₃',
                quantity: 50,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Ferrous carbonate - 2 containers'
            },
            {
                name: 'Ferrous oxalate',
                formula: 'FeC₂O₄',
                quantity: 250,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'medium',
                notes: 'Iron(II) oxalate dihydrate'
            },
            {
                name: 'Iron (II) sulphate',
                formula: 'FeSO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'low',
                notes: 'Ferrous sulphate - 4 containers'
            },
            {
                name: 'Ferrous sulphide technical',
                formula: 'FeS',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf C2',
                expiry: '',
                hazard: 'high',
                notes: 'DANGER: Can release H₂S gas - broken sticks'
            },

            // Shelf M1 - Old sodium chemicals
            {
                name: 'Sodium acetate',
                formula: 'NaC₂H₃O₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Old chemical - 4 containers'
            },
            {
                name: 'Sodium acetate anhydrous',
                formula: 'NaC₂H₃O₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Anhydrous form'
            },
            {
                name: 'Sodium ammonium phosphate',
                formula: 'NaNH₄HPO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Double salt'
            },
            {
                name: 'Sodium bromide',
                formula: 'NaBr',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: '4 containers available'
            },
            {
                name: 'Sodium bromide',
                formula: 'NaBr',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Smaller container'
            },
            {
                name: 'Sodium bismuthate',
                formula: 'NaBiO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'medium',
                notes: 'Oxidizer - handle with care'
            },
            {
                name: 'Sodium carbonate 10H2O',
                formula: 'Na₂CO₃·10H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Washing soda decahydrate'
            },
            {
                name: 'Sodium carbonate',
                formula: 'Na₂CO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Soda ash'
            },
            {
                name: 'Soda lime self indicating',
                formula: 'NaOH/Ca(OH)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'high',
                notes: 'CO₂ absorbent - caustic'
            },
            {
                name: 'Sodium chloride native',
                formula: 'NaCl',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'low',
                notes: 'Natural rock salt'
            },
            {
                name: 'Sodium chlorate (V)',
                formula: 'NaClO₃',
                quantity: 50,
                unit: 'g',
                location: 'Shelf M1',
                expiry: '',
                hazard: 'high',
                notes: 'STRONG OXIDIZER - fire/explosion risk'
            },

            // Shelf M2 - Old sodium chemicals with unidentified compounds
            {
                name: 'E.D.T.A. Disodium Salt',
                formula: 'Na₂C₁₀H₁₄N₂O₈',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'medium',
                notes: 'Chelating agent - 3 packets'
            },
            {
                name: 'Unidentified chemical',
                formula: 'Unknown',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'high',
                notes: 'REQUIRES IMMEDIATE IDENTIFICATION'
            },
            {
                name: 'Sodium dihydrogenphosphate (V)-2-water',
                formula: 'NaH₂PO₄·2H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'low',
                notes: 'Dibasic sodium phosphate'
            },
            {
                name: 'Sodium dichromate',
                formula: 'Na₂Cr₂O₇',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'high',
                notes: 'CARCINOGEN - extreme caution required'
            },
            {
                name: 'Sodium glutamate',
                formula: 'NaC₅H₈NO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'low',
                notes: 'MSG - food additive'
            },
            {
                name: 'Sodium formate',
                formula: 'NaCHO₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'low',
                notes: '2 containers available'
            },
            {
                name: 'Sodium oxalate',
                formula: 'Na₂C₂O₄',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'medium',
                notes: 'Toxic if ingested'
            },
            {
                name: 'Sodium hexametaphosphate',
                formula: '(NaPO₃)₆',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'low',
                notes: 'Water softener - 2 containers'
            },
            {
                name: 'Sodium fluoride',
                formula: 'NaF',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'high',
                notes: 'TOXIC - lethal if ingested'
            },
            {
                name: 'Sodium iodate',
                formula: 'NaIO₃',
                quantity: 50,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'medium',
                notes: 'Oxidizer'
            },
            {
                name: 'Unidentified chemical 2',
                formula: 'Unknown',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'high',
                notes: 'REQUIRES IMMEDIATE IDENTIFICATION'
            },
            {
                name: 'Sodium iodide',
                formula: 'NaI',
                quantity: 100,
                unit: 'g',
                location: 'Shelf M2',
                expiry: '',
                hazard: 'medium',
                notes: 'Light sensitive - 5 containers'
            },

            // Shelf M3 - Old sodium nitrates and nitrites
            {
                name: 'Sodium Metabisulphite',
                formula: 'Na₂S₂O₅',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'medium',
                notes: 'Releases SO₂ gas - 2 containers'
            },
            {
                name: 'Sodium Nitrite',
                formula: 'NaNO₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'high',
                notes: 'TOXIC - can cause methemoglobinemia'
            },
            {
                name: 'Sodium nitrate',
                formula: 'NaNO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'medium',
                notes: 'Oxidizer - 6 containers'
            },
            {
                name: 'Sodium nitrite',
                formula: 'NaNO₂',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'high',
                notes: 'TOXIC - smaller container'
            },
            {
                name: 'Sodium nitrate',
                formula: 'NaNO₃',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'medium',
                notes: 'Large containers - 2 available'
            },
            {
                name: 'Sodium nitroprusside',
                formula: 'Na₂[Fe(CN)₅NO]',
                quantity: 100,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'high',
                notes: 'TOXIC - releases cyanide'
            },
            {
                name: 'Sodium nitroprusside',
                formula: 'Na₂[Fe(CN)₅NO]',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'high',
                notes: 'TOXIC - releases cyanide'
            },
            {
                name: 'Sodium oxalate',
                formula: 'Na₂C₂O₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'medium',
                notes: 'Toxic if ingested - 4 containers'
            },
            {
                name: 'Unidentified sodium compound',
                formula: 'Na-compound',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'high',
                notes: 'REQUIRES IDENTIFICATION'
            },
            {
                name: 'Sodium molybdate dihydrate',
                formula: 'Na₂MoO₄·2H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M3',
                expiry: '',
                hazard: 'medium',
                notes: 'Heavy metal compound'
            },

            // Shelf M4 - Old specialty sodium compounds
            {
                name: 'Sodium tungstate',
                formula: 'Na₂WO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'medium',
                notes: 'Heavy metal salt'
            },
            {
                name: 'Sodium stannate',
                formula: 'Na₂SnO₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'medium',
                notes: 'Tin compound'
            },
            {
                name: 'Sodium salicylate',
                formula: 'NaC₇H₅O₃',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'low',
                notes: 'Aspirin-like compound'
            },
            {
                name: 'Sodium sulphate',
                formula: 'Na₂SO₄',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'low',
                notes: 'Common salt'
            },
            {
                name: 'Sodium peroxide',
                formula: 'Na₂O₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '1990',
                hazard: 'extreme',
                notes: 'EXPIRED 35 YEARS - EXTREMELY DANGEROUS - DISPOSE IMMEDIATELY'
            },
            {
                name: 'Sodium pyroborate',
                formula: 'Na₂B₄O₇',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '1990',
                hazard: 'medium',
                notes: 'EXPIRED 35 years - evaluate for disposal'
            },
            {
                name: 'Sodium persulphate',
                formula: 'Na₂S₂O₈',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'medium',
                notes: 'Strong oxidizer'
            },
            {
                name: 'Sodium persulphate',
                formula: 'Na₂S₂O₈',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'medium',
                notes: 'Strong oxidizer - smaller container'
            },
            {
                name: 'Unidentified sodium compound',
                formula: 'Na-compound',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'high',
                notes: 'REQUIRES IDENTIFICATION'
            },
            {
                name: 'Sodium bisulphide',
                formula: 'NaHS',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M4',
                expiry: '',
                hazard: 'high',
                notes: 'DANGER: Releases toxic H₂S gas'
            },

            // Shelf M5 - Very old sodium compounds
            {
                name: 'Tri-sodium hydrogen carbonate',
                formula: 'Na₃HCO₃',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '1990',
                hazard: 'medium',
                notes: '35 YEARS OLD - evaluate condition'
            },
            {
                name: 'Unidentified sodium compound (1)',
                formula: 'Na-compound',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '1990',
                hazard: 'extreme',
                notes: 'URGENT: 35-year-old unknown - HAZMAT EVALUATION'
            },
            {
                name: 'Unidentified sodium compound (2)',
                formula: 'Na-compound',
                quantity: 250,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '1990',
                hazard: 'extreme',
                notes: 'URGENT: 35-year-old unknown - HAZMAT EVALUATION'
            },
            {
                name: 'Sodium torocholate',
                formula: 'NaC₂₆H₄₅NO₆S',
                quantity: 100,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '1990',
                hazard: 'medium',
                notes: 'Bile salt - 35 years old'
            },
            {
                name: 'Sodium silicate powder',
                formula: 'Na₂SiO₃',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '',
                hazard: 'medium',
                notes: 'Water glass powder'
            },
            {
                name: 'Sodium sesquicarbonate',
                formula: 'Na₃H(CO₃)₂',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '',
                hazard: 'low',
                notes: 'Trona'
            },
            {
                name: 'Sodium sulphite 7-hydrate',
                formula: 'Na₂SO₃·7H₂O',
                quantity: 500,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '',
                hazard: 'medium',
                notes: 'Reducing agent'
            },
            {
                name: 'Sodium carbonate anhydrous',
                formula: 'Na₂CO₃',
                quantity: 1000,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '',
                hazard: 'low',
                notes: 'Anhydrous soda ash'
            },
            {
                name: 'Sodium silicate solution',
                formula: 'Na₂SiO₃(aq)',
                quantity: 2500,
                unit: 'ml',
                location: 'Shelf M5',
                expiry: '2006',
                hazard: 'medium',
                notes: 'EXPIRED SOLUTION - 19 years old - DISPOSE'
            },
            {
                name: 'Sodium thiosulphate 5H2O',
                formula: 'Na₂S₂O₃·5H₂O',
                quantity: 3000,
                unit: 'g',
                location: 'Shelf M5',
                expiry: '',
                hazard: 'low',
                notes: 'Photography fixer - 2 large containers'
            }
        ];

        let added = 0;
        let nextId = Math.max(...this.chemicals.map(c => c.id), 0) + 1;

        shelfChemicals.forEach(chemical => {
            // Check if this exact chemical already exists (by name, formula, quantity, and location)
            const exists = this.chemicals.some(c => 
                c.name === chemical.name && 
                c.formula === chemical.formula &&
                c.quantity === chemical.quantity &&
                c.location === chemical.location &&
                c.expiry === chemical.expiry
            );

            if (!exists) {
                this.chemicals.push({
                    id: nextId++,
                    ...chemical
                });
                added++;
            }
        });

        if (added > 0) {
            this.saveData();
            this.renderItems();
            console.log(`Added ${added} shelf chemicals to the inventory!`);
            return added;
        } else {
            console.log('All shelf chemicals are already in the inventory.');
            return 0;
        }
    }

    // Admin functions for form control - only accessible through code
    enableUserForms() {
        // Show the forms
        document.getElementById('chemicalFormSection').style.display = 'block';
        document.getElementById('apparatusFormSection').style.display = 'block';
        
        // Enable user modifications
        this.userModificationsEnabled = true;
        
        // Add event listeners for form submissions
        document.getElementById('chemicalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addChemical();
        });

        document.getElementById('apparatusForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addApparatus();
        });
        
        console.log('User forms enabled - users can now add, edit, and delete chemicals and apparatus');
        
        // Re-render items to show/hide edit/delete buttons
        this.renderItems();
    }

    disableUserForms() {
        // Hide the forms
        document.getElementById('chemicalFormSection').style.display = 'none';
        document.getElementById('apparatusFormSection').style.display = 'none';
        
        // Disable user modifications
        this.userModificationsEnabled = false;
        
        console.log('User forms disabled - only programmatic additions allowed');
        
        // Re-render items to show/hide edit/delete buttons
        this.renderItems();
    }

    // Admin Authentication Methods
    showAdminLoginPrompt() {
        const password = prompt('Enter admin password:');
        if (password === this.adminPassword) {
            this.adminLogin();
        } else if (password !== null) { // User didn't cancel
            alert('Incorrect password. Access denied.');
        }
    }

    adminLogin() {
        this.isAdminLoggedIn = true;
        this.userModificationsEnabled = true;
        
        // Show admin controls
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminLoggedSection').style.display = 'flex';
        document.getElementById('adminControlsChemicals').style.display = 'block';
        document.getElementById('adminControlsApparatus').style.display = 'block';
        
        // Enable forms
        this.enableUserForms();
        
        console.log('Admin logged in - full access enabled');
    }

    adminLogout() {
        this.isAdminLoggedIn = false;
        this.userModificationsEnabled = false;
        
        // Hide admin controls
        document.getElementById('adminLoginSection').style.display = 'block';
        document.getElementById('adminLoggedSection').style.display = 'none';
        document.getElementById('adminControlsChemicals').style.display = 'none';
        document.getElementById('adminControlsApparatus').style.display = 'none';
        
        // Disable forms
        this.disableUserForms();
        
        console.log('Admin logged out - access restricted');
    }

    // Form visibility methods
    showAddChemicalForm() {
        if (!this.isAdminLoggedIn) {
            alert('Admin access required');
            return;
        }
        document.getElementById('chemicalFormSection').style.display = 'block';
        document.getElementById('chemicalName').focus();
    }

    showAddApparatusForm() {
        if (!this.isAdminLoggedIn) {
            alert('Admin access required');
            return;
        }
        document.getElementById('apparatusFormSection').style.display = 'block';
        document.getElementById('apparatusName').focus();
    }

    // Programmatic chemical addition (always available)
    addChemicalProgrammatically(chemicalData) {
        const nextId = Math.max(...this.chemicals.map(c => c.id), 0) + 1;
        
        const chemical = {
            id: nextId,
            name: chemicalData.name || '',
            formula: chemicalData.formula || '',
            quantity: chemicalData.quantity || 0,
            unit: chemicalData.unit || '',
            location: chemicalData.location || '',
            expiry: chemicalData.expiry || '',
            hazard: chemicalData.hazard || 'low',
            notes: chemicalData.notes || ''
        };

        this.chemicals.push(chemical);
        this.saveData();
        this.renderItems();
        
        console.log(`Added chemical programmatically: ${chemical.name}`);
        return chemical;
    }

    // Programmatic apparatus addition (always available)
    addApparatusProgrammatically(apparatusData) {
        const nextId = Math.max(...this.apparatus.map(a => a.id), 0) + 1;
        
        const apparatus = {
            id: nextId,
            name: apparatusData.name || '',
            type: apparatusData.type || '',
            quantity: apparatusData.quantity || 0,
            location: apparatusData.location || '',
            condition: apparatusData.condition || '',
            lastMaintenance: apparatusData.lastMaintenance || '',
            notes: apparatusData.notes || ''
        };

        this.apparatus.push(apparatus);
        this.saveData();
        this.renderItems();
        
        console.log(`Added apparatus programmatically: ${apparatus.name}`);
        return apparatus;
    }

    // Force reload M-shelf chemicals - debug function
    forceReloadMShelfChemicals() {
        console.log('Force reloading M-shelf chemicals...');
        
        // Remove all existing M-shelf chemicals
        this.chemicals = this.chemicals.filter(chem => !chem.location || !chem.location.includes('Shelf M'));
        
        // Clear M-shelf flags
        localStorage.removeItem('mShelfChemicalsAdded');
        localStorage.setItem('shelfChemicalsVersion', '6.4'); // Force version mismatch
        
        // Force reload
        this.addShelfChemicals();
        localStorage.setItem('shelfChemicalsVersion', '6.5');
        localStorage.setItem('mShelfChemicalsAdded', 'true');
        
        this.saveData();
        this.renderItems();
        
        // Count M-shelf chemicals
        const mShelfCount = this.chemicals.filter(chem => chem.location && chem.location.includes('Shelf M')).length;
        alert(`Force reload complete! Added ${mShelfCount} M-shelf chemicals.`);
        console.log(`Force reload complete! M-shelf chemicals count: ${mShelfCount}`);
    }

    loadDefaultSamples() {
        // Oxidizer Cabinet Chemicals
        this.chemicals = [
            // Oxidizers 1 - Upper Section
            {
                id: 1,
                name: 'Ethanoic Acid',
                formula: 'CH₃COOH',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'medium',
                notes: 'Acetic acid - common organic acid'
            },
            {
                id: 2,
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'high',
                notes: 'Large container - strong mineral acid'
            },
            {
                id: 3,
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'high',
                notes: 'Medium container - strong mineral acid'
            },
            {
                id: 4,
                name: 'Sulphuric Acid',
                formula: 'H₂SO₄',
                quantity: 1,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'high',
                notes: 'Concentrated sulfuric acid'
            },
            {
                id: 5,
                name: 'Metaphosphoric Acid Powder',
                formula: 'HPO₃',
                quantity: 1,
                unit: 'container',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'medium',
                notes: 'Powder form - dehydrating agent'
            },
            {
                id: 6,
                name: 'Phosphorus Pentaoxide',
                formula: 'P₂O₅',
                quantity: 2,
                unit: 'containers',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'extreme',
                notes: 'Highly reactive - strong dehydrating agent'
            },
            {
                id: 7,
                name: 'Phosphorus Pentachloride',
                formula: 'PCl₅',
                quantity: 4,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'extreme',
                notes: 'Chlorinating agent - moisture sensitive'
            },
            {
                id: 8,
                name: 'Unidentified Chemical',
                formula: 'Unknown',
                quantity: 3,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                expiry: '',
                hazard: 'high',
                notes: 'Requires identification and classification'
            },

            // Oxidizers 1 - Lower Section
            {
                id: 9,
                name: 'Sulphuric Acid',
                formula: 'H₂SO₄',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'high',
                notes: 'Concentrated sulfuric acid - medium container'
            },
            {
                id: 10,
                name: 'Nitric Acid',
                formula: 'HNO₃',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'high',
                notes: 'Bottle 1 of 4 - strong oxidizing acid'
            },
            {
                id: 11,
                name: 'Nitric Acid',
                formula: 'HNO₃',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'high',
                notes: 'Bottle 2 of 4 - strong oxidizing acid'
            },
            {
                id: 12,
                name: 'Nitric Acid',
                formula: 'HNO₃',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'high',
                notes: 'Bottle 3 of 4 - strong oxidizing acid'
            },
            {
                id: 13,
                name: 'Nitric Acid',
                formula: 'HNO₃',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'high',
                notes: 'Bottle 4 of 4 - strong oxidizing acid'
            },
            {
                id: 14,
                name: 'Phosphoric Acid',
                formula: 'H₃PO₄',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'medium',
                notes: 'Standard phosphoric acid'
            },
            {
                id: 15,
                name: 'Orthophosphoric Acid',
                formula: 'H₃PO₄',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                expiry: '',
                hazard: 'medium',
                notes: 'Same as phosphoric acid'
            },

            // Oxidizers 2 - Organic Section 2.1
            {
                id: 16,
                name: 'n-Amyl Alcohol (Pentanol)',
                formula: 'C₅H₁₂O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'medium',
                notes: 'Primary alcohol, 5-carbon chain'
            },
            {
                id: 17,
                name: 'Pentan-1-ol',
                formula: 'C₅H₁₂O',
                quantity: 6,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'medium',
                notes: '6 bottles available'
            },
            {
                id: 18,
                name: 'tert-Butanol',
                formula: 'C₄H₁₀O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'low',
                notes: 'Tertiary alcohol - less reactive'
            },
            {
                id: 19,
                name: 'n-Butylamine',
                formula: 'C₄H₁₁N',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'medium',
                notes: 'Primary amine - flammable and corrosive'
            },
            {
                id: 20,
                name: 'Cyclohexanone',
                formula: 'C₆H₁₀O',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'medium',
                notes: '2 bottles available'
            },
            {
                id: 21,
                name: 'Cyclohexane',
                formula: 'C₆H₁₂',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.1',
                expiry: '',
                hazard: 'medium',
                notes: '2 bottles available'
            },

            // Oxidizers 2 - Organic Section 2.2
            {
                id: 22,
                name: 'Glycerol',
                formula: 'C₃H₈O₃',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'low',
                notes: 'Glycerin - viscous, hygroscopic'
            },
            {
                id: 23,
                name: 'Propane-1,2-diol (Propylene Glycol)',
                formula: 'C₃H₈O₂',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'low',
                notes: 'Safer than ethylene glycol'
            },
            {
                id: 24,
                name: 'Ethanol',
                formula: 'C₂H₆O',
                quantity: 100,
                unit: 'ml',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Small volume - common solvent'
            },
            {
                id: 25,
                name: 'Butan-1-ol',
                formula: 'C₄H₁₀O',
                quantity: 10,
                unit: 'L',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: '4 bottles x 2.5L - primary alcohol'
            },
            {
                id: 26,
                name: 'Butan-2-ol',
                formula: 'C₄H₁₀O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Secondary alcohol'
            },
            {
                id: 27,
                name: '2-Methylpropan-2-ol',
                formula: 'C₄H₁₀O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'low',
                notes: 'tert-Butanol - tertiary alcohol'
            },
            {
                id: 28,
                name: 'n-Pentane',
                formula: 'C₅H₁₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Highly flammable alkane'
            },
            {
                id: 29,
                name: 'n-Heptane',
                formula: 'C₇H₁₆',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Highly flammable alkane'
            },
            {
                id: 30,
                name: 'Bromoethane',
                formula: 'C₂H₅Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'high',
                notes: 'Alkyl halide - suspected carcinogen'
            },
            {
                id: 31,
                name: '1-Iodobutane',
                formula: 'C₄H₉I',
                quantity: 75,
                unit: 'ml',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: '3 bottles x 25ml - alkyl iodide'
            },
            {
                id: 32,
                name: '1-Chlorobutane',
                formula: 'C₄H₉Cl',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Alkyl chloride'
            },
            {
                id: 33,
                name: '2-Bromobutane',
                formula: 'C₄H₉Br',
                quantity: 5,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: '5 bottles - secondary alkyl bromide'
            },
            {
                id: 34,
                name: 'Butanone',
                formula: 'C₄H₈O',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'medium',
                notes: 'Methyl ethyl ketone'
            },
            {
                id: 35,
                name: 'Nitrobenzene',
                formula: 'C₆H₅NO₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.2',
                expiry: '',
                hazard: 'high',
                notes: 'Toxic aromatic nitro compound'
            },

            // Oxidizers 2 - Organic Section 2.3 (HIGH HAZARD SECTION)
            {
                id: 36,
                name: 'Aniline',
                formula: 'C₆H₇N',
                quantity: 1000,
                unit: 'ml',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'extreme',
                notes: '4 bottles total - CARCINOGENIC aromatic amine'
            },
            {
                id: 37,
                name: 'Methanol',
                formula: 'CH₄O',
                quantity: 6,
                unit: 'L',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'extreme',
                notes: '3 bottles total - HIGHLY TOXIC can cause blindness'
            },
            {
                id: 38,
                name: 'Propan-1-ol',
                formula: 'C₃H₈O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: 'Primary alcohol'
            },
            {
                id: 39,
                name: 'Propan-2-ol (Isopropanol)',
                formula: 'C₃H₈O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: 'Secondary alcohol - common disinfectant'
            },
            {
                id: 40,
                name: 'Cyclohexanol',
                formula: 'C₆H₁₂O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: 'Cyclic alcohol'
            },
            {
                id: 41,
                name: 'Methylated Spirit (Industrial)',
                formula: 'C₂H₆O + additives',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: 'Denatured ethanol'
            },
            {
                id: 42,
                name: '1-Iodobutane',
                formula: 'C₄H₉I',
                quantity: 175,
                unit: 'ml',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: '7 bottles x 25ml - alkyl iodide'
            },
            {
                id: 43,
                name: '2-Chloro-2-methylpropane (tert-Butyl Chloride)',
                formula: 'C₄H₉Cl',
                quantity: 9,
                unit: 'bottles',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: '9 bottles - tertiary chloride'
            },
            {
                id: 44,
                name: 'Bromoethane',
                formula: 'C₂H₅Br',
                quantity: 50,
                unit: 'ml',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'high',
                notes: '2 bottles x 25ml - suspected carcinogen'
            },
            {
                id: 45,
                name: 'Methyl Benzoate',
                formula: 'C₈H₈O₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.3',
                expiry: '',
                hazard: 'medium',
                notes: 'Aromatic ester'
            },

            // Oxidizers 2 - Organic Section 2.4 (SPECIALIZED HIGH-HAZARD)
            {
                id: 46,
                name: 'Acetic Anhydride',
                formula: 'C₄H₆O₃',
                quantity: 5,
                unit: 'L',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'extreme',
                notes: '2 bottles x 2.5L - corrosive anhydride - EXTREMELY REACTIVE'
            },
            {
                id: 47,
                name: 'Dichloromethane',
                formula: 'CH₂Cl₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'high',
                notes: 'Methylene chloride - suspected carcinogen'
            },
            {
                id: 48,
                name: 'Methanoic Acid (Formic Acid)',
                formula: 'HCOOH',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'high',
                notes: 'Simplest carboxylic acid - corrosive'
            },
            {
                id: 49,
                name: 'Ethanediol (Ethylene Glycol)',
                formula: 'C₂H₆O₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'extreme',
                notes: 'Toxic diol - antifreeze component - can cause death'
            },
            {
                id: 50,
                name: 'Amyl Alcohol',
                formula: 'C₅H₁₂O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'medium',
                notes: 'Pentanol - primary alcohol'
            },
            {
                id: 51,
                name: '3-Methylbutan-1-ol',
                formula: 'C₅H₁₂O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'medium',
                notes: 'Branched primary alcohol'
            },
            {
                id: 52,
                name: 'Propanoic Acid',
                formula: 'C₃H₆O₂',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'medium',
                notes: 'Propionic acid - preservative'
            },
            {
                id: 53,
                name: 'Di-n-butyl Phthalate',
                formula: 'C₁₆H₂₂O₄',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 - Organic 2.4',
                expiry: '',
                hazard: 'medium',
                notes: 'Plasticizer compound - environmental concern'
            },

            // Original General Storage chemicals (keeping some for continuity)
            {
                id: 54,
                name: 'Naphthalene Marbles',
                formula: 'C₁₀H₈',
                quantity: 1,
                unit: 'container',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'medium'
            },
            {
                id: 55,
                name: 'High Vacuum Grease',
                formula: '',
                quantity: 1,
                unit: 'tube',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 1,
                name: 'Naphthalene Marbles',
                formula: 'C₁₀H₈',
                quantity: 1,
                unit: 'container',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'medium'
            },
            {
                id: 2,
                name: 'High Vacuum Grease',
                formula: '',
                quantity: 1,
                unit: 'tube',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 3,
                name: 'Mercury Collector',
                formula: 'Hg',
                quantity: 1,
                unit: 'unit',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'extreme'
            },
            {
                id: 4,
                name: 'Citro Soda Sachets',
                formula: '',
                quantity: 1,
                unit: 'pack',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 5,
                name: 'Magnesium Trisilicate',
                formula: 'Mg₂Si₃O₈',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 6,
                name: 'Milk of Magnesia',
                formula: 'Mg(OH)₂',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 7,
                name: 'Magnesium Hydroxide',
                formula: 'Mg(OH)₂',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 8,
                name: 'Graphite Leads 2mm',
                formula: 'C',
                quantity: 1,
                unit: 'pack',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 9,
                name: 'Food Colouring',
                formula: '',
                quantity: 1,
                unit: 'set',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            {
                id: 10,
                name: 'Vanish Stain Remover',
                formula: '',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'low'
            },
            // Chemicals from General Storage 8 (Bottom)
            {
                id: 11,
                name: 'Baking Powder',
                formula: 'NaHCO₃ + Ca(H₂PO₄)₂',
                quantity: 1,
                unit: 'container',
                location: 'General Storage 8 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 12,
                name: 'Hydrochloric Pool Acid',
                formula: 'HCl',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Bottom',
                expiry: '',
                hazard: 'high',
                notes: ''
            },
            {
                id: 13,
                name: 'Vinegar',
                formula: 'CH₃COOH',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 8 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 14,
                name: 'Peas',
                formula: '',
                quantity: 1,
                unit: 'bag',
                location: 'General Storage 8 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            // Chemicals from General Storage 9 (Top)
            {
                id: 15,
                name: 'Base Ores (Rock)',
                formula: '',
                quantity: 1,
                unit: 'set',
                location: 'General Storage 9 - Top',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            // Chemicals from General Storage 10 (Bottom)
            {
                id: 16,
                name: 'Calcium Carbide',
                formula: 'CaC₂',
                quantity: 1,
                unit: 'container',
                location: 'General Storage 10 - Bottom',
                expiry: '',
                hazard: 'high',
                notes: ''
            },
            {
                id: 17,
                name: 'Potassium Chunks in Mineral Oil',
                formula: 'K',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 10 - Bottom',
                expiry: '',
                hazard: 'extreme',
                notes: ''
            },
            // Indicators from General Storage 11 (Top)
            {
                id: 18,
                name: 'Eosin',
                formula: 'C20H6Br4Na2O5',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 19,
                name: 'Eosin Gurr\'s',
                formula: 'C20H6Br4Na2O5',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 20,
                name: 'Methyl Red',
                formula: 'C15H15N3O2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 21,
                name: 'Eosin 2',
                formula: 'C20H6Br4Na2O5',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 22,
                name: 'Fluorescein Sodium Technical',
                formula: 'C20H10Na2O5',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 23,
                name: 'Phenolphthalein',
                formula: 'C20H14O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 24,
                name: 'Phenol Red 1',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 25,
                name: 'Methyl Orange',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 26,
                name: 'Methylene Blue',
                formula: 'C16H18ClN3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 27,
                name: 'Phenol Red (Old) (Low)',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 28,
                name: 'Bromocresol Green',
                formula: 'C21H14Br4O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 29,
                name: '1,10-Phenanthroline-Ferrous Sulphate Complex Solution',
                formula: 'C12H8N2·FeSO4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 30,
                name: 'Phenol Red 2',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 31,
                name: 'Methylene Blue 2',
                formula: 'C16H18ClN3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 32,
                name: 'Phenol Red 3',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 33,
                name: 'Eriochrome Black T',
                formula: 'C20H12N3NaO7S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 34,
                name: 'Eriochrome Blue Black SE',
                formula: 'C20H13N3NaO7S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 35,
                name: 'Eriochrome Black T (Old)',
                formula: 'C20H12N3NaO7S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 36,
                name: 'Duranol Brilliant Yellow (Dye)',
                formula: 'Textile Dye',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 37,
                name: 'Duranol Brilliant Blue (Dye)',
                formula: 'Textile Dye',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 38,
                name: 'Bromothymol Blue 2016 (2368)',
                formula: 'C27H28Br2O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 39,
                name: 'Bromothymol Blue 2376',
                formula: 'C27H28Br2O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 40,
                name: 'Methyl Red 2',
                formula: 'C15H15N3O2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 41,
                name: 'Bromocresol Green 2',
                formula: 'C21H14Br4O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 42,
                name: 'Congo Red',
                formula: 'C32H22N6Na2O6S2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 43,
                name: 'Dichlorophenolindophenol (Old)',
                formula: 'C12H7Cl2NO2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 44,
                name: 'Aluminon',
                formula: 'C22H23N3O9',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 45,
                name: 'Aluminon 2',
                formula: 'C22H23N3O9',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 46,
                name: 'Congo Red 2',
                formula: 'C32H22N6Na2O6S2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 47,
                name: 'Bicarbonate Indicator Solution',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 48,
                name: 'Aluminon 3 (Old)',
                formula: 'C22H23N3O9',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 49,
                name: 'pH Indicator Litmus',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 50,
                name: 'pH Indicator Litmus (2)',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 51,
                name: 'Bromothymol Blue (Old)',
                formula: 'C27H28Br2O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 52,
                name: 'Litmus Solution',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 53,
                name: 'Bromocresol Purple',
                formula: 'C21H16Br2O5S',
                quantity: 2,
                unit: 'bottles',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 54,
                name: 'Bromothymol Blue',
                formula: 'C27H28Br2O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 55,
                name: 'Litmus Granulated',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 56,
                name: 'Methyl Orange Solution',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 57,
                name: 'Methyl Orange Xylene Cyanol Solution',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 58,
                name: 'Bromophenol Blue Solution',
                formula: 'C19H10Br4O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 59,
                name: 'Bromophenol Blue 1L',
                formula: 'C19H10Br4O5S',
                quantity: 1,
                unit: 'bottle (1L)',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 60,
                name: 'Murexide Indicator Powder',
                formula: 'C8H8N6O6',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 61,
                name: 'Fluorescein Indicator Powder',
                formula: 'C20H12O5',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 62,
                name: 'Methyl Red 3',
                formula: 'C15H15N3O2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 63,
                name: 'Magneson Reagent',
                formula: 'C17H13N3O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 64,
                name: 'Murexide Indicator Powder',
                formula: 'C8H8N6O6',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 65,
                name: 'Methyl Orange Powder 2',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 66,
                name: 'Methyl Orange Powder 3',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 67,
                name: 'Methyl Orange Powder 4',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 68,
                name: 'Methyl Orange Powder 5',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 69,
                name: 'Magneson Reagent 2',
                formula: 'C17H13N3O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 70,
                name: 'Magneson Reagent 3',
                formula: 'C17H13N3O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 71,
                name: 'Magneson Reagent 4',
                formula: 'C17H13N3O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 72,
                name: 'Methylene Blue 3',
                formula: 'C16H18ClN3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 73,
                name: 'Methylene Blue 4',
                formula: 'C16H18ClN3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 74,
                name: 'Luminol',
                formula: 'C8H7N3O2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 75,
                name: 'Phenol Red 4',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 76,
                name: 'Phenol Red 5',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 77,
                name: 'Methyl Orange Powder 6',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 78,
                name: 'Potassium Hydrogen Phthalate',
                formula: 'C8H5KO4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 79,
                name: 'Epsilon Blue Indicator Solution',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 80,
                name: 'Bromophenol Blue Solution',
                formula: 'C19H10Br4O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 81,
                name: 'Harris Universal Indicator',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 82,
                name: 'Methylene Blue Powder',
                formula: 'C16H18ClN3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 83,
                name: 'Schiffs Reagent',
                formula: 'Fuchsine-SO2',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 84,
                name: 'Phenol Red (Ace Brand)',
                formula: 'C19H14O5S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 85,
                name: 'Litmus Solution 2',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 86,
                name: 'Methyl Orange Solution 2',
                formula: 'C14H14N3NaO3S',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 87,
                name: 'Litmus Solution 3',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 88,
                name: 'Litmus Solution 4',
                formula: 'Natural Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 89,
                name: 'BDH Full Range Indicator',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 90,
                name: 'Phenolphthalein',
                formula: 'C20H14O4',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 91,
                name: 'Universal Indicator Solution',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 92,
                name: 'Universal Indicator Solution 2',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 11 - Top (Indicators)',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            // Indicator Papers and Solutions from General Storage 11 (Bottom)
            {
                id: 93,
                name: 'Cobalt Chloride Paper 10 Pack',
                formula: 'CoCl₂',
                quantity: 1,
                unit: 'pack',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 94,
                name: 'Cobalt Chloride Paper 150 Book',
                formula: 'CoCl₂',
                quantity: 1,
                unit: 'book',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 95,
                name: 'Universal Test Papers',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'pack',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 96,
                name: 'Neutral Litmus Paper 6 Packs',
                formula: 'Natural Indicator',
                quantity: 6,
                unit: 'packs',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 97,
                name: 'Ammonia Paper',
                formula: 'pH Paper',
                quantity: 1,
                unit: 'pack',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 98,
                name: 'Lead Acetate Indicator Paper 2 Packs',
                formula: 'Pb(CH₃COO)₂',
                quantity: 2,
                unit: 'packs',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'medium',
                notes: ''
            },
            {
                id: 99,
                name: 'Universal Indicator Solution 2.5L',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle (2.5L)',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            {
                id: 100,
                name: 'Universal Indicator Solution 500ml',
                formula: 'Mixed Indicator',
                quantity: 1,
                unit: 'bottle (500ml)',
                location: 'General Storage 11 - Bottom',
                expiry: '',
                hazard: 'low',
                notes: ''
            },
            // Chemical from General Storage 13
            {
                id: 101,
                name: 'Stearic Acid',
                formula: 'C₁₈H₃₆O₂',
                quantity: 1,
                unit: 'bottle',
                location: 'General Storage 13',
                expiry: '',
                hazard: 'low',
                notes: ''
            }
               // Chemicals from General Storage 14 (Box 1)
               ,{
                    id: 102,
                    name: 'Nickel Chloride',
                    formula: 'NiCl₂',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 103,
                    name: 'Potassium Hydrogen Phthalate',
                    formula: 'C₈H₅KO₄',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 104,
                    name: 'Cobalt III Chloride',
                    formula: 'CoCl₃',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 105,
                    name: 'Potassium Chromate',
                    formula: 'K₂CrO₄',
                    quantity: 3,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 106,
                    name: 'Manganese II Sulphate',
                    formula: 'MnSO₄',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 107,
                    name: 'Phenyl Salicylate',
                    formula: 'C₁₃H₁₀O₃',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 108,
                    name: 'Potassium Dihydrogen Orthophosphate',
                    formula: 'KH₂PO₄',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 109,
                    name: 'Magnesium Metal Granules',
                    formula: 'Mg',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 110,
                    name: 'Lead Dioxide',
                    formula: 'PbO₂',
                    quantity: 4,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 111,
                    name: 'Iron III Oxide',
                    formula: 'Fe₂O₃',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 112,
                    name: 'Methyl Benzoate',
                    formula: 'C₈H₈O₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 113,
                    name: 'Ammonium Thiocyanate',
                    formula: 'NH₄SCN',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 114,
                    name: 'Potassium Bromide',
                    formula: 'KBr',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 115,
                    name: 'Ammonium Sulphate',
                    formula: '(NH₄)₂SO₄',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 116,
                    name: 'Barium Chloride',
                    formula: 'BaCl₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 117,
                    name: 'Sodium Metabisulphite',
                    formula: 'Na₂S₂O₅',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 118,
                    name: 'Manganese II Chloride-Water',
                    formula: 'MnCl₂·xH₂O',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 119,
                    name: 'Barium Nitrate',
                    formula: 'Ba(NO₃)₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 120,
                    name: 'Barium Oxide Anhydrous',
                    formula: 'BaO',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 121,
                    name: 'Nickel Sulphate 6H/2O',
                    formula: 'NiSO₄·6H₂O',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 122,
                    name: 'Barium Peroxide',
                    formula: 'BaO₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 123,
                    name: 'Lithium Chloride Anhydrous',
                    formula: 'LiCl',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 124,
                    name: 'Zinc Nitrate 6H/2O',
                    formula: 'Zn(NO₃)₂·6H₂O',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 125,
                    name: 'Chromium III Nitrate',
                    formula: 'Cr(NO₃)₃',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 126,
                    name: 'Barium Chloride',
                    formula: 'BaCl₂',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 127,
                    name: 'Nickel Nitrate 6H/2O',
                    formula: 'Ni(NO₃)₂·6H₂O',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 128,
                    name: 'Barium Peroxide',
                    formula: 'BaO₂',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 129,
                    name: 'Cobalt II Chloride 6H/2O',
                    formula: 'CoCl₂·6H₂O',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 130,
                    name: 'Lead Bromide',
                    formula: 'PbBr₂',
                    quantity: 4,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 131,
                    name: 'Lithium Chloride Anhydrous',
                    formula: 'LiCl',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 132,
                    name: 'Ammonium Dichromate',
                    formula: '(NH₄)₂Cr₂O₇',
                    quantity: 2,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 133,
                    name: 'Nickel Chloride',
                    formula: 'NiCl₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 1',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               // Chemicals from General Storage 14 (Box 2)
               ,{
                    id: 134,
                    name: 'Methyl Acetate',
                    formula: 'C₃H₆O₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 135,
                    name: 'Di-n-butyl Phthalate',
                    formula: 'C₁₆H₂₂O₄',
                    quantity: 2,
                    unit: 'bottles',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 136,
                    name: 'Hexane-1-ol',
                    formula: 'C₆H₁₄O',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 137,
                    name: 'Ethyl Acetate',
                    formula: 'C₄H₈O₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 138,
                    name: 'n-Octane',
                    formula: 'C₈H₁₈',
                    quantity: 3,
                    unit: 'bottles',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 139,
                    name: 'Benzoyl Chloride',
                    formula: 'C₇H₅ClO',
                    quantity: 3,
                    unit: 'bottles',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                }
               ,{
                    id: 140,
                    name: 'Pentan-1-ol',
                    formula: 'C₅H₁₂O',
                    quantity: 2,
                    unit: 'bottles',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 141,
                    name: 'Propan-2-ol',
                    formula: 'C₃H₈O',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'medium',
                    notes: ''
                }
               ,{
                    id: 142,
                    name: 'Methyl Benzoate',
                    formula: 'C₈H₈O₂',
                    quantity: 2,
                    unit: 'bottles',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
               ,{
                    id: 143,
                    name: 'Magnesium Carbonate',
                    formula: 'MgCO₃',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'low',
                    notes: ''
                }
                ,{
                    id: 144,
                    name: 'Barium Chloride',
                    formula: 'BaCl₂',
                    quantity: 1,
                    unit: 'bottle',
                    location: 'General Storage 14 - Box 2',
                    expiry: '',
                    hazard: 'high',
                    notes: ''
                },
                // Essential Common Laboratory Chemicals
                {
                    id: 145,
                    name: 'Sodium Chloride',
                    formula: 'NaCl',
                    quantity: 500,
                    unit: 'g',
                    location: 'Essential Chemicals',
                    expiry: '',
                    hazard: 'low',
                    notes: 'Common table salt for solution preparation and osmosis experiments.'
                },
                {
                    id: 146,
                    name: 'Hydrochloric Acid',
                    formula: 'HCl',
                    quantity: 1,
                    unit: 'L',
                    location: 'Essential Chemicals - Acids',
                    expiry: '',
                    hazard: 'high',
                    notes: 'Strong acid for titrations and pH adjustment.'
                },
                {
                    id: 147,
                    name: 'Sodium Hydroxide',
                    formula: 'NaOH',
                    quantity: 250,
                    unit: 'g',
                    location: 'Essential Chemicals - Bases',
                    expiry: '',
                    hazard: 'high',
                    notes: 'Strong base for titrations and soap making.'
                },
                {
                    id: 148,
                    name: 'Phenolphthalein',
                    formula: 'C₂₀H₁₄O₄',
                    quantity: 50,
                    unit: 'ml',
                    location: 'Essential Chemicals - Indicators',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'pH indicator for acid-base titrations.'
                },
                {
                    id: 149,
                    name: 'Methyl Orange',
                    formula: 'C₁₄H₁₄N₃NaO₃S',
                    quantity: 25,
                    unit: 'g',
                    location: 'Essential Chemicals - Indicators',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'pH indicator for strong acid-weak base titrations.'
                },
                {
                    id: 150,
                    name: 'Copper Sulphate',
                    formula: 'CuSO₄·5H₂O',
                    quantity: 250,
                    unit: 'g',
                    location: 'Essential Chemicals - Salts',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'Blue crystalline salt for crystal growing and redox reactions.'
                },
                {
                    id: 151,
                    name: 'Sodium Bicarbonate',
                    formula: 'NaHCO₃',
                    quantity: 500,
                    unit: 'g',
                    location: 'Essential Chemicals',
                    expiry: '',
                    hazard: 'low',
                    notes: 'Baking soda for neutralization and CO₂ generation experiments.'
                },
                {
                    id: 152,
                    name: 'Acetic Acid',
                    formula: 'CH₃COOH',
                    quantity: 500,
                    unit: 'ml',
                    location: 'Essential Chemicals - Acids',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'Weak acid for buffer preparation and esterification reactions.'
                },
                {
                    id: 153,
                    name: 'Calcium Carbonate',
                    formula: 'CaCO₃',
                    quantity: 250,
                    unit: 'g',
                    location: 'Essential Chemicals',
                    expiry: '',
                    hazard: 'low',
                    notes: 'Chalk powder for acid-base reactions and CO₂ production.'
                },
                {
                    id: 154,
                    name: 'Potassium Permanganate',
                    formula: 'KMnO₄',
                    quantity: 100,
                    unit: 'g',
                    location: 'Essential Chemicals - Oxidizers',
                    expiry: '',
                    hazard: 'high',
                    notes: 'Purple oxidizing agent for redox titrations and water treatment.'
                },
                {
                    id: 155,
                    name: 'Magnesium Sulphate',
                    formula: 'MgSO₄·7H₂O',
                    quantity: 250,
                    unit: 'g',
                    location: 'Essential Chemicals',
                    expiry: '',
                    hazard: 'low',
                    notes: 'Epsom salt for crystallization experiments and buffer solutions.'
                },
                {
                    id: 156,
                    name: 'Universal Indicator',
                    formula: 'Mixed indicators',
                    quantity: 100,
                    unit: 'ml',
                    location: 'Essential Chemicals - Indicators',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'Multi-range pH indicator showing colors across pH 1-14.'
                },
                {
                    id: 157,
                    name: 'Ethanol',
                    formula: 'C₂H₅OH',
                    quantity: 1,
                    unit: 'L',
                    location: 'Essential Chemicals - Solvents',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'Alcohol for cleaning, extraction, and organic synthesis.'
                },
                {
                    id: 158,
                    name: 'Methylene Blue',
                    formula: 'C₁₆H₁₈ClN₃S',
                    quantity: 25,
                    unit: 'g',
                    location: 'Essential Chemicals - Indicators',
                    expiry: '',
                    hazard: 'medium',
                    notes: 'Biological stain and redox indicator for microscopy.'
                },
                {
                    id: 159,
                    name: 'Ammonium Chloride',
                    formula: 'NH₄Cl',
                    quantity: 250,
                    unit: 'g',
                    location: 'Essential Chemicals',
                    expiry: '',
                    hazard: 'low',
                    notes: 'Salt for buffer solutions and demonstrations.'
                },
            {
                id: 56,
                name: 'Mercury Collector',
                formula: 'Hg',
                quantity: 1,
                unit: 'unit',
                location: 'General Storage 8 - Top',
                expiry: '',
                hazard: 'extreme',
                notes: 'Mercury spill cleanup device'
            }
        ];

        // Apparatus from General Storage 8 (Top)
        this.apparatus = [
            {
                id: 1,
                name: 'Hazard Label Warnings',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Safety labels for chemical storage'
            },
            {
                id: 2,
                name: 'Rubber Separators',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For separating equipment'
            },
            {
                id: 3,
                name: 'Matches',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For Bunsen burner ignition'
            },
            {
                id: 4,
                name: 'Dymo Embossing Tape',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For labeling equipment'
            },
            {
                id: 5,
                name: 'Vial Glass',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Glass vials for sample storage'
            },
            {
                id: 6,
                name: 'Vial Flip Top',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Flip-top vials for storage'
            },
            {
                id: 7,
                name: 'Colour Pencils',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For marking and documentation'
            },
            {
                id: 8,
                name: 'Balloons',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For gas collection experiments'
            },
            {
                id: 9,
                name: 'Pipette Tips',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Disposable pipette tips'
            },
            {
                id: 10,
                name: 'Glass Tubing Connectors',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For connecting glass tubes'
            },
            {
                id: 11,
                name: 'Flip Chart',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For teaching and presentations'
            },
            {
                id: 12,
                name: 'Reticulated Foam',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Filter or packing material'
            },
            {
                id: 13,
                name: 'Stop Watches',
                type: 'Measuring',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Fair',
                lastMaintenance: '',
                notes: 'Some need batteries'
            },
            {
                id: 14,
                name: 'Rubber Grommet',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Rubber sealing rings'
            },
            {
                id: 15,
                name: 'Hexagonal Nuts',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For apparatus assembly'
            },
            {
                id: 16,
                name: 'Filter Ring',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For filtration setup'
            },
            // Apparatus from General Storage 8 (Bottom)
            {
                id: 17,
                name: 'Vial Shell Closure Borosilicate Glass Snap',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'High-quality borosilicate glass vial closures with snap mechanism'
            },
            {
                id: 18,
                name: 'Vial Flip Top Large',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Large capacity flip-top vials for storage'
            },
            {
                id: 19,
                name: 'Aluminum Bodkin',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Blunt needle-like tool for piercing or making holes'
            },
            {
                id: 20,
                name: 'Filter Paper',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'For filtration and separation processes'
            },
            {
                id: 21,
                name: 'Pipette Fillers',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Bulb pipette fillers for safe liquid transfer'
            },
            {
                id: 22,
                name: 'Pipette Pump Manual',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 8 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Manual pipette pump for precise liquid handling'
            },
            // Apparatus from General Storage 9 (Top)
            {
                id: 23,
                name: 'Delivery Tube Soda Glass',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Soda-lime glass delivery tubes for gas transfer'
            },
            {
                id: 24,
                name: 'Electrostatic Test Materials Kit',
                type: 'Electronic',
                quantity: 2,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Complete kit for testing electrostatic properties'
            },
            {
                id: 25,
                name: 'Graph Books',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Books with graph paper for plotting and recording data'
            },
            {
                id: 26,
                name: 'Graph Paper',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Loose graph paper sheets for data plotting'
            },
            {
                id: 27,
                name: 'Sample Tubes 50ml',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: '50ml capacity sample storage tubes'
            },
            {
                id: 28,
                name: 'U Tubes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'U-shaped glass tubes for manometer and pressure demonstrations'
            },
            {
                id: 29,
                name: 'Combustion Tubes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Heat-resistant tubes for combustion analysis'
            },
            {
                id: 30,
                name: 'Filter Rings',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Support rings for filtration apparatus'
            },
            {
                id: 31,
                name: 'Reverse Thermometer',
                type: 'Measuring',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Specialized thermometer for deep water temperature measurements'
            },
            {
                id: 32,
                name: 'Platinum Electrodes Hoffman',
                type: 'Electronic',
                quantity: 15,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Platinum electrodes for electrolysis experiments (Hoffman apparatus)'
            },
            {
                id: 33,
                name: 'Rubber Stoppers',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Various sizes of rubber stoppers for sealing containers'
            },
            {
                id: 34,
                name: 'Basic Rock Set',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Collection of basic rock samples for geology studies'
            },
            {
                id: 35,
                name: 'Basic Rock Set (Bigger)',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Larger collection of rock samples for geology demonstrations'
            },
            {
                id: 36,
                name: 'Test Tubes with Side Arm',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Test tubes with side arms for gas collection and distillation'
            },
            {
                id: 37,
                name: 'Gas Syringes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Graduated syringes for measuring gas volumes accurately'
            },
            // Apparatus from General Storage 9 (Bottom)
            {
                id: 38,
                name: 'Stackable Plastic Screen',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Plastic screening material for demonstrations or separation'
            },
            {
                id: 39,
                name: 'Old Pipette Fillers',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Fair',
                lastMaintenance: '',
                notes: 'Older model pipette fillers, may need replacement'
            },
            {
                id: 40,
                name: 'Centrifuge Rotor',
                type: 'Mechanical',
                quantity: 3,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Centrifuge rotors for sample separation'
            },
            {
                id: 41,
                name: 'Graduated Test Tubes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Test tubes with graduated markings for volume measurement'
            },
            {
                id: 42,
                name: 'pH Electrodes',
                type: 'Electronic',
                quantity: 6,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'pH meter electrodes for accurate pH measurements'
            },
            {
                id: 43,
                name: 'Graph Papers',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Additional graph paper stock for data recording'
            },
            {
                id: 44,
                name: 'Checker (Hannah)',
                type: 'Electronic',
                quantity: 3,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Hanna instruments checker devices for water quality testing'
            },
            {
                id: 45,
                name: 'Long Delivery Tubes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Extended length delivery tubes for gas transfer over distance'
            },
            {
                id: 46,
                name: 'Electrostatic Test Bars',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Test bars for demonstrating electrostatic charge properties'
            },
            {
                id: 47,
                name: 'Syringe Needles',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Needles for syringes, various gauges'
            },
            {
                id: 48,
                name: 'Large Boiling Tube',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Large capacity boiling tubes for heating experiments'
            },
            {
                id: 49,
                name: 'Glass Wool',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Fine glass fibers for filtration and packing'
            },
            {
                id: 50,
                name: 'Rubber Bungs (Large Number)',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Large stock of rubber bungs in various sizes'
            },
            {
                id: 51,
                name: 'Electrolytic Cells',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Complete electrolytic cells for electrochemistry experiments'
            },
            {
                id: 52,
                name: 'Nickel Crucible',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 9 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Nickel crucible for high-temperature applications and alkaline fusion'
            },
            // Apparatus from General Storage 10 (Top)
            {
                id: 53,
                name: 'Box: Bulbs',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Assorted light bulbs for experiments and demonstrations'
            },
            {
                id: 54,
                name: 'Box: Wires',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Collection of electrical wires and cables'
            },
            {
                id: 55,
                name: 'Box: Lamp Holders',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Lamp holders and sockets for bulb mounting'
            },
            {
                id: 56,
                name: 'Polyester Thread',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Strong polyester thread for suspending objects and demonstrations'
            },
            {
                id: 57,
                name: 'Teaching Aids: Posters',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Educational posters for classroom instruction'
            },
            {
                id: 58,
                name: 'Aluminium Metal Sheet',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Aluminum sheets for metal property demonstrations'
            },
            {
                id: 59,
                name: 'Thermal Conductivity Bars',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Metal bars for demonstrating thermal conductivity differences'
            },
            {
                id: 60,
                name: 'Copper Rings',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Copper rings for electromagnetic demonstrations and experiments'
            },
            {
                id: 61,
                name: 'Cotton Wool',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Cotton wool for insulation, cleaning, and filtration'
            },
            {
                id: 62,
                name: 'PR Series Scale Balance User Guide',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Instruction manual for PR series precision balance'
            },
            {
                id: 63,
                name: 'Copper Sheets',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Copper sheet metal for experiments and demonstrations'
            },
            {
                id: 64,
                name: 'Thermal Conductivity of Metals Apparatus',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Complete apparatus for comparing thermal conductivity of different metals'
            },
            {
                id: 65,
                name: 'Graphite Electrodes',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Carbon/graphite electrodes for electrochemistry and electrolysis'
            },
            {
                id: 66,
                name: 'Fused',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Electrical fuses for circuit protection'
            },
            {
                id: 67,
                name: 'Carbon Electrodes S Shape',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'S-shaped carbon electrodes for specialized electrochemical setups'
            },
            {
                id: 68,
                name: 'Crocodile Clips',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Alligator/crocodile clips for electrical connections'
            },
            {
                id: 69,
                name: 'Wrist Watch Batteries',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Small button cell batteries for watches and small devices'
            },
            {
                id: 70,
                name: 'Magnets',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Various magnets for magnetism demonstrations and experiments'
            },
            {
                id: 71,
                name: 'Projection Lamps',
                type: 'Electronic',
                quantity: 1,
                location: 'General Storage 10 - Top',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'High-intensity lamps for projection and optical demonstrations'
            },
            // Apparatus from General Storage 10 (Bottom)
            {
                id: 72,
                name: 'Dutch Metal Leaves',
                type: 'General Equipment',
                quantity: 2,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Brass/copper-zinc alloy leaves for metal reactivity and leaf electroscope demonstrations'
            },
            {
                id: 73,
                name: 'Vibrofix VF1 Shaker',
                type: 'Mechanical',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Mechanical shaker for mixing and agitation of samples'
            },
            {
                id: 74,
                name: 'Tin Metal Foil',
                type: 'General Equipment',
                quantity: 2,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Tin foil sheets for metal property experiments and demonstrations'
            },
            {
                id: 75,
                name: 'Minimag Stirrer',
                type: 'Mechanical',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Magnetic stirrer for solution mixing and stirring'
            },
            {
                id: 76,
                name: 'Lead Foil',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Lead foil for radiation shielding demonstrations and metal property experiments'
            },
            {
                id: 77,
                name: 'Nickel Metal Foil',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Nickel foil for electroplating, catalysis, and metal property demonstrations'
            },
            {
                id: 78,
                name: 'Dutch Metal Foil',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Brass/copper-zinc alloy foil for gilding and metal experiments'
            },
            {
                id: 79,
                name: 'Box of Metal Foils',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Assorted collection of various metal foils for comparative experiments'
            },
            {
                id: 80,
                name: 'Mineral Wool',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 10 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Inorganic fiber insulation material for high-temperature applications'
            },
            // Apparatus from General Storage 11 (Bottom)
            {
                id: 81,
                name: 'Delivery Tubes Box',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 11 - Bottom',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Collection of glass delivery tubes for gas collection and transfer experiments'
            },
            // Apparatus from General Storage 12
            {
                id: 82,
                name: 'Aprons',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Protective aprons for lab work to prevent chemical splashes on clothing'
            },
            {
                id: 83,
                name: 'Dropping Pipettes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Glass or plastic pipettes for precise liquid transfer and dropwise addition'
            },
            {
                id: 84,
                name: 'Pipette Balls',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Rubber bulbs for safe pipetting without mouth contact'
            },
            {
                id: 85,
                name: 'Pear Shape Pipettes',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Pear-shaped glass pipettes for general liquid transfer'
            },
            {
                id: 86,
                name: 'Wooden Splints',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Wooden splints for flame tests, oxygen tests, and general lab demonstrations'
            },
            {
                id: 87,
                name: 'Test Tubes Disfigured',
                type: 'Glassware',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Fair',
                lastMaintenance: '',
                notes: 'Damaged or misshapen test tubes, may be suitable for non-critical applications'
            },
            {
                id: 88,
                name: 'Masks',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Face masks for respiratory protection during lab work'
            },
            {
                id: 89,
                name: 'Plastic Casings',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Protective plastic covers or storage containers for lab equipment'
            },
            {
                id: 90,
                name: 'Large Size Heat Glove',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Heat-resistant glove for handling hot glassware and equipment'
            },
            {
                id: 91,
                name: 'White Escutcheons',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 12',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Decorative or protective plates, possibly for lab equipment mounting or identification'
            },
            // Apparatus from General Storage 13
            {
                id: 92,
                name: 'Old Goggles',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Fair',
                lastMaintenance: '',
                notes: 'Older safety goggles, check for scratches and proper seal before use'
            },
            {
                id: 93,
                name: 'Polystyrene Cups and Covers',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Insulated cups for calorimetry experiments and temperature measurements'
            },
            {
                id: 94,
                name: 'Plastic Masks, Tight',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Tight-fitting face masks for enhanced protection during chemical work'
            },
            {
                id: 95,
                name: 'Glass Spheres',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Glass beads for various experiments including density, volume displacement, and demonstrations'
            },
            {
                id: 96,
                name: 'Polythene Oversleeves',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Disposable plastic sleeve covers for additional arm protection'
            },
            {
                id: 97,
                name: '500ml Cup',
                type: 'General Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Plastic or polystyrene cup for volume measurements and mixing'
            },
            {
                id: 98,
                name: 'Emergency Bottle for Eye Washing',
                type: 'Safety Equipment',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Emergency eyewash bottle for immediate eye irrigation in case of chemical splash - CHECK EXPIRY REGULARLY'
            },
            {
                id: 99,
                name: 'Gallenkamp Drawers - Molymod Units Inside',
                type: 'Educational',
                quantity: 1,
                location: 'General Storage 13',
                condition: 'Good',
                lastMaintenance: '',
                notes: 'Storage drawers containing molecular modeling kits for teaching chemical structures and bonding'
            }
        ];

        // Load oxidizer chemicals automatically
        this.loadOxidizerChemicals();
    }

    loadOxidizerChemicals() {
        // Add Oxidizers 1 - Upper chemicals
        const oxidizers1Upper = [
            {
                name: 'Ethanoic Acid',
                formula: 'CH3COOH',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Upper',
                hazard: 'medium',
                notes: 'From oxidizers 1 upper section'
            },
            {
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '5L container from oxidizers 1 upper section'
            },
            {
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '2.5L container from oxidizers 1 upper section'
            },
            {
                name: 'Sulphuric Acid',
                formula: 'H2SO4',
                quantity: 1,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '1L container from oxidizers 1 upper section'
            },
            {
                name: 'Metaphosphoric Acid Powder',
                formula: 'HPO3',
                quantity: 1,
                unit: 'container',
                location: 'Oxidizers 1 - Upper',
                hazard: 'medium',
                notes: 'Powder form from oxidizers 1 upper section'
            },
            {
                name: 'Phosphorus Pentaoxide',
                formula: 'P2O5',
                quantity: 2,
                unit: 'containers',
                location: 'Oxidizers 1 - Upper',
                hazard: 'extreme',
                notes: '2 containers from oxidizers 1 upper section'
            },
            {
                name: 'Phosphorus Pentachloride',
                formula: 'PCl5',
                quantity: 4,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                hazard: 'extreme',
                notes: '4 bottles from oxidizers 1 upper section'
            },
            {
                name: 'Unidentified Chemical',
                formula: 'Unknown',
                quantity: 3,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '3 unidentified bottles from oxidizers 1 upper section - requires identification'
            }
        ];

        // Add Oxidizers 1 - Lower chemicals
        const oxidizers1Lower = [
            {
                name: 'Sulphuric Acid',
                formula: 'H2SO4',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '2.5L container from oxidizers 1 lower section'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 1'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 2'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 3'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 4'
            },
            {
                name: 'Phosphoric Acid',
                formula: 'H3PO4',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                hazard: 'medium',
                notes: 'From oxidizers 1 lower section'
            },
            {
                name: 'Orthophosphoric Acid',
                formula: 'H3PO4',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                hazard: 'medium',
                notes: 'From oxidizers 1 lower section (same as phosphoric acid)'
            }
        ];

        // Add all oxidizer chemicals to the main array
        let idCounter = Math.max(...this.chemicals.map(c => c.id), 0) + 1;
        
        // Add organic oxidizer chemicals from sections 2.1-2.4
        const organicOxidizers21 = [
            {
                name: 'n-Amyl Alcohol (Pentanol)',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: 'n-amyl alcohol from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 6,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available from oxidizers 2 organic section 2.1'
            },
            {
                name: 'n-Butylamine',
                formula: 'C4H11N',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: 'Flammable and corrosive amine from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Cyclohexanone',
                formula: 'C6H10O',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Cyclohexane',
                formula: 'C6H12',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available from oxidizers 2 organic section 2.1'
            },
            {
                name: 'tert-Butanol',
                formula: 'C4H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'low',
                notes: 'Tertiary alcohol from oxidizers 2 organic section 2.1'
            }
        ];

        const organicOxidizers22 = [
            {
                name: 'Glycerol',
                formula: 'C3H8O3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: '2.5L container from oxidizers 2 organic section 2.2'
            },
            {
                name: 'n-Pentane',
                formula: 'C5H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'Highly flammable alkane from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Ethanol',
                formula: 'C2H6O',
                quantity: 100,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '100ml bottle from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Bromoethane',
                formula: 'C2H5Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'high',
                notes: 'Halogenated compound from oxidizers 2 organic section 2.2'
            },
            {
                name: '1-Iodobutane',
                formula: 'C4H9I',
                quantity: 3,
                unit: 'bottles (25ml each)',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '3 bottles of 25ml each from oxidizers 2 organic section 2.2'
            },
            {
                name: '1-Chlorobutane',
                formula: 'C4H9Cl',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'Halogenated compound from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 5,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butanone',
                formula: 'C4H8O',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '2 bottles available from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-1-ol',
                formula: 'C4H10O',
                quantity: 4,
                unit: 'bottles (2.5L each)',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '4 bottles of 2.5L each from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-2-ol',
                formula: 'C4H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'Secondary alcohol from oxidizers 2 organic section 2.2'
            },
            {
                name: 'n-Heptane',
                formula: 'C7H16',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'Highly flammable alkane from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Propane-1,2-diol (Propylene Glycol)',
                formula: 'C3H8O2',
                quantity: 2,
                unit: 'bottles',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: '2 bottles available from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Nitrobenzene',
                formula: 'C6H5NO2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'high',
                notes: 'Toxic aromatic nitro compound from oxidizers 2 organic section 2.2'
            }
        ];

        [...oxidizers1Upper, ...oxidizers1Lower, ...organicOxidizers21, ...organicOxidizers22].forEach(chemical => {
            this.chemicals.push({
                id: idCounter++,
                ...chemical
            });
        });
    }

    addChemical() {
        const form = document.getElementById('chemicalForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Basic validation
        const name = document.getElementById('chemicalName').value.trim();
        const quantity = parseInt(document.getElementById('chemicalQuantity').value);
        
        if (!name) {
            this.showNotification('Chemical name is required!', 'error');
            return;
        }
        
        if (!quantity || quantity < 1) {
            this.showNotification('Valid quantity is required!', 'error');
            return;
        }
        
        const chemicalData = {
            name: name,
            formula: document.getElementById('chemicalFormula').value,
            quantity: quantity,
            unit: document.getElementById('chemicalUnit').value,
            location: document.getElementById('chemicalLocation').value,
            expiry: document.getElementById('chemicalExpiry').value,
            hazard: document.getElementById('chemicalHazard').value,
            notes: document.getElementById('chemicalNotes').value
        };

        if (this.editingChemicalId) {
            // Update existing chemical
            const index = this.chemicals.findIndex(c => c.id === this.editingChemicalId);
            if (index !== -1) {
                this.chemicals[index] = { ...this.chemicals[index], ...chemicalData };
                this.showNotification('Chemical updated successfully!', 'success');
            }
            this.editingChemicalId = null;
            submitBtn.textContent = 'Add Chemical';
        } else {
            // Add new chemical
            const chemical = {
                id: Date.now(),
                ...chemicalData
            };
            this.chemicals.push(chemical);
            this.showNotification('Chemical added successfully!', 'success');
        }

        this.saveData();
        this.renderItems();
        form.reset();
    }

    addApparatus() {
        const form = document.getElementById('apparatusForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Basic validation
        const name = document.getElementById('apparatusName').value.trim();
        const quantity = parseInt(document.getElementById('apparatusQuantity').value);
        
        if (!name) {
            this.showNotification('Apparatus name is required!', 'error');
            return;
        }
        
        if (!quantity || quantity < 1) {
            this.showNotification('Valid quantity is required!', 'error');
            return;
        }
        
        const apparatusData = {
            name: name,
            type: document.getElementById('apparatusType').value,
            quantity: quantity,
            location: document.getElementById('apparatusLocation').value,
            condition: document.getElementById('apparatusCondition').value,
            lastMaintenance: document.getElementById('apparatusLastMaintenance').value,
            notes: document.getElementById('apparatusNotes').value
        };

        if (this.editingApparatusId) {
            // Update existing apparatus
            const index = this.apparatus.findIndex(a => a.id === this.editingApparatusId);
            if (index !== -1) {
                this.apparatus[index] = { ...this.apparatus[index], ...apparatusData };
                this.showNotification('Apparatus updated successfully!', 'success');
            }
            this.editingApparatusId = null;
            submitBtn.textContent = 'Add Apparatus';
        } else {
            // Add new apparatus
            const apparatus = {
                id: Date.now(),
                ...apparatusData
            };
            this.apparatus.push(apparatus);
            this.showNotification('Apparatus added successfully!', 'success');
        }

        this.saveData();
        this.renderItems();
        form.reset();
    }

    deleteChemical(id) {
        if (!this.userModificationsEnabled) {
            alert('Chemical modification is disabled. Contact administrator for changes.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this chemical?')) {
            this.chemicals = this.chemicals.filter(chemical => chemical.id !== id);
            this.saveData();
            this.renderItems();
            this.showNotification('Chemical deleted successfully!', 'info');
        }
    }

    deleteApparatus(id) {
        if (!this.userModificationsEnabled) {
            alert('Apparatus modification is disabled. Contact administrator for changes.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this apparatus?')) {
            this.apparatus = this.apparatus.filter(apparatus => apparatus.id !== id);
            this.saveData();
            this.renderItems();
            this.showNotification('Apparatus deleted successfully!', 'info');
        }
    }

    editChemical(id) {
        if (!this.userModificationsEnabled) {
            alert('Chemical modification is disabled. Contact administrator for changes.');
            return;
        }
        
        const chemical = this.chemicals.find(c => c.id === id);
        if (chemical) {
            // Store the ID for editing
            this.editingChemicalId = id;
            
            // Populate the form
            document.getElementById('chemicalName').value = chemical.name;
            document.getElementById('chemicalFormula').value = chemical.formula || '';
            document.getElementById('chemicalQuantity').value = chemical.quantity;
            document.getElementById('chemicalUnit').value = chemical.unit || '';
            document.getElementById('chemicalLocation').value = chemical.location || '';
            document.getElementById('chemicalExpiry').value = chemical.expiry || '';
            document.getElementById('chemicalHazard').value = chemical.hazard || '';
            document.getElementById('chemicalNotes').value = chemical.notes || '';
            
            // Change submit button text
            const submitBtn = document.querySelector('#chemicalForm button[type="submit"]');
            submitBtn.textContent = 'Update Chemical';
            
            // Switch to chemicals tab if not already there
            if (this.currentTab !== 'chemicals') {
                document.querySelector('[onclick*="chemicals"]').click();
            }
            
            // Scroll to form
            document.getElementById('chemicalForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    editApparatus(id) {
        if (!this.userModificationsEnabled) {
            alert('Apparatus modifications are currently disabled. Contact the administrator for changes.');
            return;
        }
        
        const apparatus = this.apparatus.find(a => a.id === id);
        if (apparatus) {
            // Store the ID for editing
            this.editingApparatusId = id;
            
            // Populate the form
            document.getElementById('apparatusName').value = apparatus.name;
            document.getElementById('apparatusType').value = apparatus.type;
            document.getElementById('apparatusQuantity').value = apparatus.quantity;
            document.getElementById('apparatusLocation').value = apparatus.location;
            document.getElementById('apparatusCondition').value = apparatus.condition;
            document.getElementById('apparatusLastMaintenance').value = apparatus.lastMaintenance;
            document.getElementById('apparatusNotes').value = apparatus.notes;
            
            // Change submit button text
            const submitBtn = document.querySelector('#apparatusForm button[type="submit"]');
            submitBtn.textContent = 'Update Apparatus';
            
            // Switch to apparatus tab if not already there
            if (this.currentTab !== 'apparatus') {
                document.querySelector('[onclick*="apparatus"]').click();
            }
            
            // Scroll to form
            document.getElementById('apparatusForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    openTab(evt, tabName) {
        const tabContents = document.getElementsByClassName('tab-content');
        const tabButtons = document.getElementsByClassName('tab-button');
        
        // Cancel any ongoing edits when switching tabs
        if (this.currentTab !== tabName) {
            this.cancelEdit();
        }
        
        // Hide all tab contents
        for (let content of tabContents) {
            content.classList.remove('active');
        }
        
        // Remove active class from all tab buttons
        for (let button of tabButtons) {
            button.classList.remove('active');
        }
        
        // Show selected tab and mark button as active
        document.getElementById(tabName).classList.add('active');
        evt.currentTarget.classList.add('active');
        
        this.currentTab = tabName;
        this.clearSearch();
    }

    searchItems(searchTerm) {
        const items = this.currentTab === 'chemicals' ? this.chemicals : this.apparatus;
        const container = this.currentTab === 'chemicals' ? 
            document.getElementById('chemicalsList') : 
            document.getElementById('apparatusList');

        if (!searchTerm.trim()) {
            this.renderItems();
            return;
        }

        const filteredItems = items.filter(item => {
            return Object.values(item).some(value => 
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        this.renderFilteredItems(filteredItems, searchTerm);
    }

    renderFilteredItems(items, searchTerm) {
        const container = this.currentTab === 'chemicals' ? 
            document.getElementById('chemicalsList') : 
            document.getElementById('apparatusList');

        if (items.length === 0) {
            container.innerHTML = '<div class="no-items">No items found matching your search.</div>';
            return;
        }

        // Sort filtered items alphabetically by name
        const sortedItems = [...items].sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );

        const itemsHtml = sortedItems.map(item => {
            return this.currentTab === 'chemicals' ? 
                this.renderChemicalCard(item, searchTerm) : 
                this.renderApparatusCard(item, searchTerm);
        }).join('');

        container.innerHTML = itemsHtml;
        this.attachEventListeners();
    }

    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.toString().replace(regex, '<span class="search-highlight">$1</span>');
    }

    renderItems() {
        this.renderChemicals();
        this.renderApparatus();
        this.updateStats();
    }

    updateStats() {
        const statsBar = document.getElementById('statsBar');
        if (statsBar) {
            statsBar.innerHTML = `
                <div class="stat-item">
                    <span>🧪 Chemicals:</span>
                    <span class="stat-number">${this.chemicals.length}</span>
                </div>
                <div class="stat-item">
                    <span>🔬 Apparatus:</span>
                    <span class="stat-number">${this.apparatus.length}</span>
                </div>
                <div class="stat-item">
                    <span>📦 Total Items:</span>
                    <span class="stat-number">${this.chemicals.length + this.apparatus.length}</span>
                </div>
            `;
        }
    }

    renderChemicals() {
        const container = document.getElementById('chemicalsList');
        
        if (this.chemicals.length === 0) {
            container.innerHTML = '<div class="no-items">No chemicals in inventory. Add some using the form above.</div>';
            return;
        }

        // Sort chemicals alphabetically by name
        const sortedChemicals = [...this.chemicals].sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );

        const chemicalsHtml = sortedChemicals.map(chemical => this.renderChemicalCard(chemical)).join('');
        container.innerHTML = chemicalsHtml;
        this.attachEventListeners();
    }

    renderChemicalCard(chemical, searchTerm = '') {
        const expiryDate = new Date(chemical.expiry);
        const today = new Date();
        const isExpiringSoon = expiryDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        return `
            <div class="item-card" onclick="labSystem.showOverlay(${chemical.id}, 'chemical')">
                <div class="item-header">
                    ${chemical.hazard ? `<span class="hazard-badge hazard-${chemical.hazard}">${chemical.hazard}</span>` : ''}
                    <h3 class="item-name">${this.highlightSearchTerm(chemical.name, searchTerm)}</h3>
                    <div class="item-quantity">${this.highlightSearchTerm(chemical.quantity, searchTerm)} ${this.highlightSearchTerm(chemical.unit || '', searchTerm)}</div>
                </div>
            </div>
        `;
    }

    renderApparatus() {
        const container = document.getElementById('apparatusList');
        
        if (this.apparatus.length === 0) {
            container.innerHTML = '<div class="no-items">No apparatus in inventory. Add some using the form above.</div>';
            return;
        }

        // Sort apparatus alphabetically by name
        const sortedApparatus = [...this.apparatus].sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );

        const apparatusHtml = sortedApparatus.map(apparatus => this.renderApparatusCard(apparatus)).join('');
        container.innerHTML = apparatusHtml;
        this.attachEventListeners();
    }

    renderApparatusCard(apparatus, searchTerm = '') {
        return `
            <div class="item-card" onclick="labSystem.showOverlay(${apparatus.id}, 'apparatus')">
                <div class="item-header">
                    <h3 class="item-name">${this.highlightSearchTerm(apparatus.name, searchTerm)}</h3>
                    <div class="item-quantity">${this.highlightSearchTerm(apparatus.quantity, searchTerm)}</div>
                    ${apparatus.type ? `<span style="font-size: 0.9rem; color: #bbb;">${this.highlightSearchTerm(apparatus.type, searchTerm)}</span>` : ''}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Event listeners are attached via onclick attributes in the HTML
        // This method is kept for potential future use
    }

    showOverlay(id, type) {
        const item = type === 'chemical' ? 
            this.chemicals.find(c => c.id === id) : 
            this.apparatus.find(a => a.id === id);

        if (!item) return;

        // Remove existing overlay if any
        const existingOverlay = document.querySelector('.overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.closeOverlay();
            }
        };

        // Create overlay content
        const content = type === 'chemical' ? 
            this.createChemicalOverlay(item) : 
            this.createApparatusOverlay(item);

        overlay.innerHTML = content;
        document.body.appendChild(overlay);

        // Trigger animation
        setTimeout(() => overlay.classList.add('active'), 10);
    }

    createChemicalOverlay(chemical) {
        const expiryDate = new Date(chemical.expiry);
        const today = new Date();
        const isExpiringSoon = expiryDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Get chemical information from database
        const chemicalInfo = this.getChemicalInfo(chemical.name);
        const displayFormula = chemicalInfo?.formula || chemical.formula || 'No formula specified';
        const usageInfo = chemicalInfo?.uses || '';
        let customNotes = chemical.notes || '';
        
        // Extract disposal information if present in notes
        let disposalInfo = '';
        if (customNotes.includes('🚮 SAFE DISPOSAL:')) {
            const parts = customNotes.split('🚮 SAFE DISPOSAL:');
            customNotes = parts[0].trim();
            disposalInfo = parts[1] ? parts[1].trim() : '';
        }

        return `
            <div class="overlay-content">
                <button class="overlay-close" onclick="labSystem.closeOverlay()">×</button>
                <div class="overlay-header">
                    <div class="overlay-title">${chemical.name}</div>
                    <div class="overlay-subtitle">${displayFormula}</div>
                    ${chemical.hazard ? `<span class="hazard-badge hazard-${chemical.hazard}" style="margin-top: 10px; display: inline-block;">${chemical.hazard} hazard</span>` : ''}
                </div>
                ${usageInfo ? `
                <div class="chemical-usage-info">
                    <div class="usage-label">💡 Uses & Applications:</div>
                    <div class="usage-text">${usageInfo}</div>
                </div>
                ` : ''}
                ${disposalInfo ? `
                <div class="chemical-usage-info" style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border-left-color: #dc3545;">
                    <div class="usage-label" style="color: #721c24;">🚮 Safe Disposal Instructions:</div>
                    <div class="usage-text" style="font-weight: 500; color: #721c24;">${disposalInfo}</div>
                </div>
                ` : ''}
                ${customNotes ? `
                <div class="chemical-usage-info" style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-left-color: #f39c12;">
                    <div class="usage-label" style="color: #856404;">📝 Additional Notes:</div>
                    <div class="usage-text" style="color: #856404;">${customNotes}</div>
                </div>
                ` : ''}
                <div class="overlay-details">
                    <div class="detail-item">
                        <span class="detail-label">Quantity</span>
                        <span class="detail-value">${chemical.quantity} ${chemical.unit || ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📍 Location</span>
                        <span class="detail-value">${chemical.location || 'Unknown'}</span>
                    </div>
                    ${chemical.expiry ? `
                    <div class="detail-item">
                        <span class="detail-label">Expiry Date</span>
                        <span class="detail-value" style="color: ${isExpiringSoon ? '#dc3545' : '#e0e0e0'}">${chemical.expiry} ${isExpiringSoon ? '⚠️ Expiring soon!' : ''}</span>
                    </div>
                    ` : ''}
                </div>
                ${this.isAdminLoggedIn ? `
                <div class="overlay-actions">
                    <button class="btn-edit" onclick="labSystem.editChemical(${chemical.id}); labSystem.closeOverlay();">Edit</button>
                    <button class="btn-delete" onclick="labSystem.deleteChemical(${chemical.id}); labSystem.closeOverlay();">Delete</button>
                </div>
                ` : ''}
            </div>
        `;
    }

    createApparatusOverlay(apparatus) {
        return `
            <div class="overlay-content">
                <button class="overlay-close" onclick="labSystem.closeOverlay()">×</button>
                <div class="overlay-header">
                    <div class="overlay-title">${apparatus.name}</div>
                    <div class="overlay-subtitle">${apparatus.type || 'Lab Equipment'}</div>
                </div>
                <div class="overlay-details">
                    <div class="detail-item">
                        <span class="detail-label">Quantity Available</span>
                        <span class="detail-value">${apparatus.quantity}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📍 Location</span>
                        <span class="detail-value">${apparatus.location || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Condition</span>
                        <span class="detail-value">${apparatus.condition || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Maintenance</span>
                        <span class="detail-value">${apparatus.lastMaintenance || 'N/A'}</span>
                    </div>
                    ${apparatus.notes ? `
                    <div class="detail-item">
                        <span class="detail-label">Notes</span>
                        <span class="detail-value">${apparatus.notes}</span>
                    </div>
                    ` : ''}
                </div>
                ${this.isAdminLoggedIn ? `
                <div class="overlay-actions">
                    <button class="btn-edit" onclick="labSystem.editApparatus(${apparatus.id}); labSystem.closeOverlay();">Edit</button>
                    <button class="btn-delete" onclick="labSystem.deleteApparatus(${apparatus.id}); labSystem.closeOverlay();">Delete</button>
                </div>
                ` : ''}
            </div>
        `;
    }

    closeOverlay() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.renderItems();
    }

    cancelEdit() {
        // Reset editing states
        this.editingChemicalId = null;
        this.editingApparatusId = null;
        
        // Reset button texts
        const chemicalBtn = document.querySelector('#chemicalForm button[type="submit"]');
        const apparatusBtn = document.querySelector('#apparatusForm button[type="submit"]');
        if (chemicalBtn) chemicalBtn.textContent = 'Add Chemical';
        if (apparatusBtn) apparatusBtn.textContent = 'Add Apparatus';
        
        // Clear forms
        document.getElementById('chemicalForm').reset();
        document.getElementById('apparatusForm').reset();
    }

    addBulkChemicals() {
        const chemicalsToAdd = [
            {
                name: 'Ethanoic Acid',
                formula: 'CH3COOH',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Upper',
                hazard: 'medium',
                notes: 'From oxidizers 1 upper section'
            },
            {
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '5L container from oxidizers 1 upper section'
            },
            {
                name: 'Hydrochloric Acid',
                formula: 'HCl',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '2.5L container from oxidizers 1 upper section'
            },
            {
                name: 'Sulphuric Acid',
                formula: 'H2SO4',
                quantity: 1,
                unit: 'L',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '1L container from oxidizers 1 upper section'
            },
            {
                name: 'Metaphosphoric Acid Powder',
                formula: 'HPO3',
                quantity: 1,
                unit: 'container',
                location: 'Oxidizers 1 - Upper',
                hazard: 'medium',
                notes: 'Powder form from oxidizers 1 upper section'
            },
            {
                name: 'Phosphorus Pentaoxide',
                formula: 'P2O5',
                quantity: 2,
                unit: 'containers',
                location: 'Oxidizers 1 - Upper',
                hazard: 'extreme',
                notes: '2 containers from oxidizers 1 upper section'
            },
            {
                name: 'Phosphorus Pentachloride',
                formula: 'PCl5',
                quantity: 4,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                hazard: 'extreme',
                notes: '4 bottles from oxidizers 1 upper section'
            },
            {
                name: 'Unidentified Chemical',
                formula: 'Unknown',
                quantity: 3,
                unit: 'bottles',
                location: 'Oxidizers 1 - Upper',
                hazard: 'high',
                notes: '3 unidentified bottles from oxidizers 1 upper section - requires identification'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} chemicals from Oxidizers 1 Upper section!`, 'success');
    }

    addBulkChemicalsLower() {
        const chemicalsToAdd = [
            {
                name: 'Sulphuric Acid',
                formula: 'H2SO4',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '2.5L container from oxidizers 1 lower section'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 2'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 3'
            },
            {
                name: 'Nitric Acid',
                formula: 'HNO3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 1 - Lower',
                hazard: 'high',
                notes: '4 bottles of 2.5L each from oxidizers 1 lower section - bottle 4'
            },
            {
                name: 'Phosphoric Acid',
                formula: 'H3PO4',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                hazard: 'medium',
                notes: 'From oxidizers 1 lower section'
            },
            {
                name: 'Orthophosphoric Acid',
                formula: 'H3PO4',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 1 - Lower',
                hazard: 'medium',
                notes: 'From oxidizers 1 lower section (same as phosphoric acid)'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount + 1000, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} chemicals from Oxidizers 1 Lower section!`, 'success');
    }

    addBulkChemicalsOrganic() {
        const chemicalsToAdd = [
            {
                name: 'n-Amyl Alcohol (Pentanol)',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: 'n-amyl alcohol from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 1 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 2 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 3 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 4 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 5 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '6 bottles available - bottle 6 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'n-Butylamine',
                formula: 'C4H11N',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.1 - flammable and corrosive amine'
            },
            {
                name: 'Cyclohexanone',
                formula: 'C6H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available - bottle 1 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Cyclohexanone',
                formula: 'C6H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available - bottle 2 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Cyclohexane',
                formula: 'C6H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available - bottle 1 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'Cyclohexane',
                formula: 'C6H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'medium',
                notes: '2 bottles available - bottle 2 from oxidizers 2 organic section 2.1'
            },
            {
                name: 'tert-Butanol',
                formula: 'C4H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.1',
                hazard: 'low',
                notes: 'From oxidizers 2 organic section 2.1 - tertiary alcohol'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount + 2000, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} organic chemicals from Oxidizers 2 section 2.1!`, 'success');
    }

    addBulkChemicalsOrganic22() {
        const chemicalsToAdd = [
            {
                name: 'Glycerol',
                formula: 'C3H8O3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: '2.5L container from oxidizers 2 organic section 2.2'
            },
            {
                name: 'n-Pentane',
                formula: 'C5H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.2 - highly flammable alkane'
            },
            {
                name: 'Ethanol',
                formula: 'C2H6O',
                quantity: 100,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '100ml bottle from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Bromoethane',
                formula: 'C2H5Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'high',
                notes: 'From oxidizers 2 organic section 2.2 - halogenated compound'
            },
            {
                name: '1-Iodobutane',
                formula: 'C4H9I',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '3 bottles of 25ml each - bottle 1 from oxidizers 2 organic section 2.2'
            },
            {
                name: '1-Iodobutane',
                formula: 'C4H9I',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '3 bottles of 25ml each - bottle 2 from oxidizers 2 organic section 2.2'
            },
            {
                name: '1-Iodobutane',
                formula: 'C4H9I',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '3 bottles of 25ml each - bottle 3 from oxidizers 2 organic section 2.2'
            },
            {
                name: '1-Chlorobutane',
                formula: 'C4H9Cl',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.2 - halogenated compound'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available - bottle 1 from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available - bottle 2 from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available - bottle 3 from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available - bottle 4 from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Bromobutane',
                formula: 'C4H9Br',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '5 bottles available - bottle 5 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butanone',
                formula: 'C4H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '2 bottles available - bottle 1 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butanone',
                formula: 'C4H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '2 bottles available - bottle 2 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-1-ol',
                formula: 'C4H10O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '4 bottles of 2.5L each - bottle 1 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-1-ol',
                formula: 'C4H10O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '4 bottles of 2.5L each - bottle 2 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-1-ol',
                formula: 'C4H10O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '4 bottles of 2.5L each - bottle 3 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-1-ol',
                formula: 'C4H10O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: '4 bottles of 2.5L each - bottle 4 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Butan-2-ol',
                formula: 'C4H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.2 - secondary alcohol'
            },
            {
                name: 'n-Heptane',
                formula: 'C7H16',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.2 - highly flammable alkane'
            },
            {
                name: 'Propane-1,2-diol (Propylene Glycol)',
                formula: 'C3H8O2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: '2 bottles available - bottle 1 from oxidizers 2 organic section 2.2'
            },
            {
                name: 'Propane-1,2-diol (Propylene Glycol)',
                formula: 'C3H8O2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: '2 bottles available - bottle 2 from oxidizers 2 organic section 2.2'
            },
            {
                name: '2-Methylpropan-2-ol',
                formula: 'C4H10O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'low',
                notes: 'From oxidizers 2 organic section 2.2 - tertiary alcohol (tert-butanol)'
            },
            {
                name: 'Nitrobenzene',
                formula: 'C6H5NO2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.2',
                hazard: 'high',
                notes: 'From oxidizers 2 organic section 2.2 - toxic aromatic nitro compound'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount + 3000, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} organic chemicals from Oxidizers 2 section 2.2!`, 'success');
    }

    addBulkChemicalsOrganic23() {
        const chemicalsToAdd = [
            // 1-Iodobutane bottles (7 total)
            ...Array.from({length: 7}, (_, i) => ({
                name: '1-Iodobutane',
                formula: 'C4H9I',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: `7 bottles of 25ml each - bottle ${i + 1} from oxidizers 2 organic section 2.3`
            })),
            {
                name: 'n-Pentane',
                formula: 'C5H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - highly flammable alkane'
            },
            {
                name: 'Aniline',
                formula: 'C6H7N',
                quantity: 500,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '500ml bottle from oxidizers 2 organic section 2.3 - toxic aromatic amine'
            },
            {
                name: 'Propan-2-ol (Isopropanol)',
                formula: 'C3H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - secondary alcohol'
            },
            {
                name: 'Methylated Spirit (Industrial)',
                formula: 'C2H6O + additives',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'Industrial methylated spirit from oxidizers 2 organic section 2.3'
            },
            {
                name: 'Propan-1-ol',
                formula: 'C3H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - primary alcohol'
            },
            {
                name: 'Methanol',
                formula: 'CH4O',
                quantity: 1,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '1L container from oxidizers 2 organic section 2.3 - toxic alcohol'
            },
            {
                name: 'Methanol',
                formula: 'CH4O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 2.5L each - bottle 1 from oxidizers 2 organic section 2.3'
            },
            {
                name: 'Methanol',
                formula: 'CH4O',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 2.5L each - bottle 2 from oxidizers 2 organic section 2.3'
            },
            {
                name: 'Methyl Benzoate',
                formula: 'C8H8O2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - aromatic ester'
            },
            {
                name: 'Cyclohexanol',
                formula: 'C6H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - cyclic alcohol'
            },
            // 2-Chloro-2-methylpropane bottles (9 total)
            ...Array.from({length: 9}, (_, i) => ({
                name: '2-Chloro-2-methylpropane (tert-Butyl Chloride)',
                formula: 'C4H9Cl',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: `9 bottles available - bottle ${i + 1} from oxidizers 2 organic section 2.3`
            })),
            {
                name: 'Bromoethane',
                formula: 'C2H5Br',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 25ml each - bottle 1 from oxidizers 2 organic section 2.3'
            },
            {
                name: 'Bromoethane',
                formula: 'C2H5Br',
                quantity: 25,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 25ml each - bottle 2 from oxidizers 2 organic section 2.3'
            },
            {
                name: '1-Chlorobutane',
                formula: 'C4H9Cl',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - halogenated compound'
            },
            {
                name: 'Pentan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.3 - primary alcohol'
            },
            {
                name: 'Aniline',
                formula: 'C6H7N',
                quantity: 100,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '100ml bottle from oxidizers 2 organic section 2.3 - toxic aromatic amine'
            },
            {
                name: 'Aniline',
                formula: 'C6H7N',
                quantity: 250,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 250ml each - bottle 1 from oxidizers 2 organic section 2.3'
            },
            {
                name: 'Aniline',
                formula: 'C6H7N',
                quantity: 250,
                unit: 'ml',
                location: 'Oxidizers 2 (Organic) - 2.3',
                hazard: 'high',
                notes: '2 bottles of 250ml each - bottle 2 from oxidizers 2 organic section 2.3'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount + 4000, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} organic chemicals from Oxidizers 2 section 2.3!`, 'success');
    }

    addBulkChemicalsOrganic24() {
        const chemicalsToAdd = [
            {
                name: 'Amyl Alcohol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - pentanol'
            },
            {
                name: 'Butanone',
                formula: 'C4H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - methyl ethyl ketone'
            },
            {
                name: 'Di-n-butyl Phthalate',
                formula: 'C16H22O4',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - plasticizer compound'
            },
            {
                name: 'Acetic Anhydride',
                formula: 'C4H6O3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'high',
                notes: '2 bottles of 2.5L each - bottle 1 from oxidizers 2 organic section 2.4 - corrosive anhydride'
            },
            {
                name: 'Acetic Anhydride',
                formula: 'C4H6O3',
                quantity: 2.5,
                unit: 'L',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'high',
                notes: '2 bottles of 2.5L each - bottle 2 from oxidizers 2 organic section 2.4 - corrosive anhydride'
            },
            {
                name: 'Cyclohexane',
                formula: 'C6H12',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - cyclic alkane'
            },
            {
                name: 'Methanoic Acid (Formic Acid)',
                formula: 'HCOOH',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'high',
                notes: 'From oxidizers 2 organic section 2.4 - simplest carboxylic acid'
            },
            {
                name: '3-Methylbutan-1-ol',
                formula: 'C5H12O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - branched primary alcohol'
            },
            {
                name: 'Propan-1-ol',
                formula: 'C3H8O',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - propanol'
            },
            {
                name: 'Dichloromethane',
                formula: 'CH2Cl2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'high',
                notes: 'From oxidizers 2 organic section 2.4 - methylene chloride, suspected carcinogen'
            },
            {
                name: 'Propanoic Acid',
                formula: 'C3H6O2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'medium',
                notes: 'From oxidizers 2 organic section 2.4 - propionic acid'
            },
            {
                name: 'Ethanediol (Ethylene Glycol)',
                formula: 'C2H6O2',
                quantity: 1,
                unit: 'bottle',
                location: 'Oxidizers 2 (Organic) - 2.4',
                hazard: 'high',
                notes: 'From oxidizers 2 organic section 2.4 - toxic diol, antifreeze component'
            }
        ];

        let addedCount = 0;
        chemicalsToAdd.forEach(chemical => {
            const newChemical = {
                id: Date.now() + addedCount + 5000, // Ensure unique IDs
                ...chemical
            };
            this.chemicals.push(newChemical);
            addedCount++;
        });

        this.saveData();
        this.renderItems();
        this.showNotification(`Successfully added ${addedCount} organic chemicals from Oxidizers 2 section 2.4!`, 'success');
    }

    saveData() {
        localStorage.setItem('chemicals', JSON.stringify(this.chemicals));
        localStorage.setItem('apparatus', JSON.stringify(this.apparatus));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles for dark theme
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            backgroundColor: type === 'success' ? '#2d4a32' : type === 'error' ? '#4a2d32' : '#2d3d4a',
            color: type === 'success' ? '#a3d9a5' : type === 'error' ? '#d9a3a5' : '#a3c4d9',
            border: `1px solid ${type === 'success' ? '#4a5d4a' : type === 'error' ? '#5d4a4a' : '#4a5a5d'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
            zIndex: '1000',
            fontSize: '14px',
            maxWidth: '300px'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the lab management system when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading message
    const chemicalsList = document.getElementById('chemicalsList');
    const apparatusList = document.getElementById('apparatusList');
    chemicalsList.innerHTML = '<div class="no-items">Loading inventory data...</div>';
    apparatusList.innerHTML = '<div class="no-items">Loading inventory data...</div>';
    
    window.labSystem = new LabManagement();
});

// Fallback initialization for immediate access
if (typeof window !== 'undefined') {
    window.labSystem = window.labSystem || null;
}

// Global function wrappers to ensure they work on Vercel
window.addEssentialChemicals = function() {
    if (window.labSystem) {
        return window.labSystem.addEssentialChemicals();
    } else {
        setTimeout(() => {
            if (window.labSystem) {
                window.labSystem.addEssentialChemicals();
            } else {
                alert('System is still loading. Please try again in a moment.');
            }
        }, 1000);
    }
};

// Function to manually add shelf chemicals
window.addShelfChemicals = function() {
    if (window.labSystem) {
        const added = window.labSystem.addShelfChemicals();
        if (added > 0) {
            alert(`Added ${added} chemicals from shelves A1, A2, and B1 to the inventory!`);
        } else {
            alert('All shelf chemicals are already in the inventory.');
        }
    } else {
        setTimeout(() => {
            if (window.labSystem) {
                const added = window.labSystem.addShelfChemicals();
                if (added > 0) {
                    alert(`Added ${added} chemicals from shelves A1, A2, and B1 to the inventory!`);
                } else {
                    alert('All shelf chemicals are already in the inventory.');
                }
            } else {
                alert('System is still loading. Please try again in a moment.');
            }
        }, 1000);
    }
};

window.updateChemicalDescriptions = function() {
    if (window.labSystem) {
        window.labSystem.updateChemicalDescriptions();
        alert('Chemical descriptions updated! Check your inventory for detailed information about each chemical.');
    } else {
        setTimeout(() => {
            if (window.labSystem) {
                window.labSystem.updateChemicalDescriptions();
                alert('Chemical descriptions updated! Check your inventory for detailed information about each chemical.');
            } else {
                alert('System is still loading. Please try again in a moment.');
            }
        }, 1000);
    }
};