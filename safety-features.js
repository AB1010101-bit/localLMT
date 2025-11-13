// ===== CHEMICAL SAFETY SYSTEM =====
// Additional safety features for the Lab Management Tool

// Emergency contact information
const emergencyContacts = {
    // Emergency contact entries removed - only safety protocols remain available
};

// Chemical incompatibility database
const incompatibleChemicals = {
    "nitric acid": ["organic compounds", "alcohols", "acetone", "hydrogen peroxide"],
    "hydrogen peroxide": ["organic compounds", "metals", "flammable materials"],
    "sodium": ["water", "alcohols", "acids", "oxidizers"],
    "potassium": ["water", "alcohols", "acids", "oxidizers"],
    "hydrazine": ["oxidizers", "acids", "metals", "heat sources"],
    "nitrobenzene": ["strong acids", "alkalis", "oxidizers"],
    "acetone": ["acids", "oxidizers", "halogens"],
    "ether": ["acids", "oxidizers", "heat sources"],
    "benzene": ["oxidizers", "halogens", "heat sources"]
};

// PPE requirements based on hazard level
const ppeRequirements = {
    extreme: {
        icons: ["🥽", "🧤", "🥼", "😷", "👟"],
        descriptions: ["Safety goggles", "Chemical-resistant gloves", "Lab coat", "Respirator", "Closed-toe shoes"],
        additional: "Work in fume hood. Have emergency shower/eyewash nearby."
    },
    high: {
        icons: ["🥽", "🧤", "🥼", "😷"],
        descriptions: ["Safety goggles", "Chemical-resistant gloves", "Lab coat", "Face mask"],
        additional: "Use fume hood when possible. Ensure good ventilation."
    },
    medium: {
        icons: ["🥽", "🧤", "🥼"],
        descriptions: ["Safety glasses", "Nitrile gloves", "Lab coat"],
        additional: "Standard laboratory precautions."
    },
    low: {
        icons: ["🥽", "🧤"],
        descriptions: ["Safety glasses", "Disposable gloves"],
        additional: "Basic safety precautions sufficient."
    }
};

// Current chemical being viewed (for safety modal)
let currentChemicalForSafety = null;

// Show emergency contact modal
function showEmergencyContact(type) {
    const modal = document.getElementById('emergencyModal');
    const content = document.getElementById('emergencyContent');
    const contact = emergencyContacts[type];
    
    // Emergency contacts have been removed - redirect to safety protocols
    if (!contact) {
        showSafetyProtocols();
        return;
    }
    
    content.innerHTML = `
        <div class="emergency-contact-card">
            <h3>${contact.title}</h3>
            <a href="tel:${contact.phone}" class="emergency-phone">${contact.phone}</a>
            <p><strong>${contact.description}</strong></p>
            <div style="margin-top: 15px;">
                <h4>Instructions:</h4>
                <ul style="text-align: left; margin-top: 10px;">
                    ${contact.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ul>
            </div>
        </div>
        <button onclick="showIncidentReport()" class="incident-submit-btn" style="margin-top: 20px;">
            🚨 Report Chemical Incident
        </button>
    `;
    
    modal.style.display = 'block';
}

// Close emergency modal
function closeEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
}

// Show safety protocols
function showSafetyProtocols() {
    const modal = document.getElementById('emergencyModal');
    const content = document.getElementById('emergencyContent');
    
    content.innerHTML = `
        <div class="emergency-contact-card">
            <h3>🛡️ Laboratory Safety Protocols</h3>
            <div style="text-align: left; line-height: 1.8;">
                <h4>Before Working with Chemicals:</h4>
                <ul>
                    <li>Read all Safety Data Sheets (SDS)</li>
                    <li>Inspect PPE for damage</li>
                    <li>Check fume hood operation</li>
                    <li>Locate emergency equipment</li>
                    <li>Never work alone with hazardous chemicals</li>
                </ul>
                
                <h4>During Chemical Work:</h4>
                <ul>
                    <li>Always wear appropriate PPE</li>
                    <li>Work in well-ventilated areas</li>
                    <li>Use smallest quantities possible</li>
                    <li>Label all containers immediately</li>
                    <li>Never eat, drink, or smoke in lab</li>
                </ul>
                
                <h4>Emergency Procedures:</h4>
                <ul>
                    <li><strong>Spill:</strong> Contain, absorb, neutralize if safe</li>
                    <li><strong>Fire:</strong> Evacuate, call emergency services, use appropriate extinguisher</li>
                    <li><strong>Exposure:</strong> Flush with water 15+ minutes, seek medical attention</li>
                    <li><strong>Ingestion:</strong> Seek immediate medical attention, call emergency services</li>
                </ul>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Check for chemical safety warnings
function checkChemicalSafety(chemical) {
    if (!chemical) {
        console.log('No chemical provided to safety check');
        return true;
    }
    
    console.log('Safety check for chemical:', chemical.name, 'Hazard level:', chemical.hazardLevel);
    
    // Check for extreme hazards that require special warnings
    const extremeHazards = [
        'hydrazine', 'benzene', 'carbon tetrachloride', 'chloroform', 
        'nitrobenzene', 'naphthalene', 'hexane-1,6-diamine'
    ];
    
    const chemicalName = chemical.name.toLowerCase();
    const hasExtremeHazard = extremeHazards.some(hazard => chemicalName.includes(hazard));
    
    if (hasExtremeHazard || chemical.hazardLevel === 'extreme') {
        console.log('Extreme hazard detected for:', chemical.name, 'Showing safety alert');
        showSafetyAlert(chemical);
        return false; // Prevent immediate display
    }
    
    console.log('Chemical passed safety check:', chemical.name);
    return true; // Safe to display normally
}

// Show safety alert modal
function showSafetyAlert(chemical) {
    currentChemicalForSafety = chemical;
    const modal = document.getElementById('safetyModal');
    const content = document.getElementById('safetyContent');
    
    // Get PPE requirements
    const ppe = ppeRequirements[chemical.hazardLevel] || ppeRequirements.medium;
    
    // Check for incompatible chemicals
    const incompatibles = findIncompatibleChemicals(chemical.name);
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: #ff5252; font-size: 1.5rem;">${chemical.name}</h3>
            <div class="hazard-level hazard-${chemical.hazardLevel}">
                ${chemical.hazardLevel.toUpperCase()} HAZARD
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4>⚠️ Safety Warnings:</h4>
            <ul style="margin-left: 20px; line-height: 1.8;">
                ${getSafetyWarnings(chemical).map(warning => `<li>${warning}</li>`).join('')}
            </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4>🛡️ Required PPE:</h4>
            <div class="ppe-requirements">
                ${ppe.icons.map((icon, index) => 
                    `<div class="ppe-icon" title="${ppe.descriptions[index]}">${icon}</div>`
                ).join('')}
            </div>
            <p><strong>Additional:</strong> ${ppe.additional}</p>
        </div>
        
        ${incompatibles.length > 0 ? `
            <div class="incompatibility-warning">
                <h4>🚫 INCOMPATIBLE WITH:</h4>
                <p>${incompatibles.join(', ')}</p>
                <p><strong>DO NOT store or use near these substances!</strong></p>
            </div>
        ` : ''}
        
        <div style="margin-top: 20px;">
            <h4>📞 Emergency Actions:</h4>
            <ul style="margin-left: 20px;">
                <li><strong>Skin contact:</strong> Remove contaminated clothing, flush with water 15+ minutes</li>
                <li><strong>Eye contact:</strong> Flush with water 15+ minutes, seek immediate medical attention</li>
                <li><strong>Inhalation:</strong> Move to fresh air, seek medical attention if breathing difficulty</li>
                <li><strong>Ingestion:</strong> Seek immediate medical attention, call emergency services</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="downloadSDS('${chemical.name}')" class="safety-btn" style="background: linear-gradient(135deg, #2196f3, #21cbf3); margin-right: 10px;">
                📄 Download SDS
            </button>
            <button onclick="viewChemicalReferences('${chemical.name}')" class="safety-btn" style="background: linear-gradient(135deg, #9c27b0, #e91e63);">
                🔗 Safety References
            </button>
        </div>
    `;
    
    // Reset acknowledgment
    const checkbox = document.getElementById('safetyAcknowledge');
    const button = document.getElementById('safetyProceed');
    checkbox.checked = false;
    button.disabled = true;
    
    modal.style.display = 'block';
}

// Get safety warnings for a chemical
function getSafetyWarnings(chemical) {
    const warnings = [];
    const name = chemical.name.toLowerCase();
    
    // Specific chemical warnings
    if (name.includes('hydrazine')) {
        warnings.push("CARCINOGEN - May cause cancer");
        warnings.push("EXPLOSIVE when heated or contaminated");
        warnings.push("CORROSIVE - Causes severe burns");
    } else if (name.includes('benzene')) {
        warnings.push("CARCINOGEN - Causes leukemia");
        warnings.push("FLAMMABLE - Keep away from heat sources");
    } else if (name.includes('nitrobenzene')) {
        warnings.push("SUSPECTED CARCINOGEN");
        warnings.push("TOXIC - Can cause methemoglobinemia");
        warnings.push("Absorbs through skin");
    } else if (name.includes('naphthalene')) {
        warnings.push("POSSIBLE CARCINOGEN");
        warnings.push("FLAMMABLE solid");
        warnings.push("Toxic to aquatic life");
    } else if (name.includes('sodium') && !name.includes('chloride')) {
        warnings.push("REACTS VIOLENTLY with water");
        warnings.push("FLAMMABLE - Produces hydrogen gas");
        warnings.push("Store under mineral oil");
    } else if (name.includes('potassium') && !name.includes('chloride')) {
        warnings.push("REACTS VIOLENTLY with water");
        warnings.push("EXPLOSIVE when heated");
        warnings.push("Store under mineral oil");
    }
    
    // General hazard level warnings
    if (chemical.hazardLevel === 'extreme') {
        warnings.push("EXTREME HAZARD - Handle with maximum precautions");
        warnings.push("Use only in fume hood");
        warnings.push("Emergency shower/eyewash must be nearby");
    } else if (chemical.hazardLevel === 'high') {
        warnings.push("HIGH HAZARD - Use appropriate safety measures");
        warnings.push("Avoid skin and eye contact");
    }
    
    return warnings.length > 0 ? warnings : ["Follow standard laboratory safety procedures"];
}

// Find incompatible chemicals
function findIncompatibleChemicals(chemicalName) {
    const name = chemicalName.toLowerCase();
    const incompatibles = [];
    
    for (const [chemical, incompatibleList] of Object.entries(incompatibleChemicals)) {
        if (name.includes(chemical)) {
            incompatibles.push(...incompatibleList);
        }
    }
    
    return [...new Set(incompatibles)]; // Remove duplicates
}

// Handle safety acknowledgment
document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('safetyAcknowledge');
    const button = document.getElementById('safetyProceed');
    
    if (checkbox && button) {
        checkbox.addEventListener('change', function() {
            button.disabled = !this.checked;
        });
    }
});

// Proceed with chemical after safety acknowledgment
function proceedWithChemical() {
    if (currentChemicalForSafety) {
        closeSafetyModal();
        // Show the chemical details normally using the original function
        if (window.labSystem && window.labSystem.showOverlay) {
            // Call the original function directly with the chemical ID
            const originalShowOverlay = window.labSystem.showOverlay.originalFunction || window.labSystem.showOverlay;
            originalShowOverlay.call(window.labSystem, currentChemicalForSafety.id, 'chemical');
        }
        currentChemicalForSafety = null;
    }
}

// Close safety modal
function closeSafetyModal() {
    document.getElementById('safetyModal').style.display = 'none';
    currentChemicalForSafety = null;
}

// Show incident report modal
function showIncidentReport() {
    closeEmergencyModal(); // Close emergency modal first
    document.getElementById('incidentModal').style.display = 'block';
}

// Close incident modal
function closeIncidentModal() {
    document.getElementById('incidentModal').style.display = 'none';
    document.getElementById('incidentForm').reset();
}

// Handle incident form submission
document.addEventListener('DOMContentLoaded', function() {
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const incident = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: document.getElementById('incidentType').value,
                chemicals: document.getElementById('incidentChemicals').value,
                description: document.getElementById('incidentDescription').value,
                injuries: document.getElementById('incidentInjuries').value,
                actions: document.getElementById('incidentActions').value
            };
            
            // Save incident to localStorage
            const incidents = JSON.parse(localStorage.getItem('chemicalIncidents')) || [];
            incidents.push(incident);
            localStorage.setItem('chemicalIncidents', JSON.stringify(incidents));
            
            alert('Incident report submitted successfully. Report ID: ' + incident.id);
            closeIncidentModal();
            
            // Log for debugging
            console.log('Chemical incident reported:', incident);
        });
    }
});

// Show incident reports (admin only)
function showIncidentReports() {
    const incidents = JSON.parse(localStorage.getItem('chemicalIncidents')) || [];
    const modal = document.getElementById('incidentReportsModal');
    const content = document.getElementById('incidentReportsList');
    
    if (incidents.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #4caf50;">No incidents reported. Good safety record!</p>';
    } else {
        content.innerHTML = incidents.map(incident => `
            <div class="incident-report-card">
                <div class="incident-header">
                    <h4>Incident #${incident.id}</h4>
                    <span class="incident-date">${new Date(incident.timestamp).toLocaleString()}</span>
                </div>
                <div class="incident-details">
                    <p><strong>Type:</strong> ${incident.type}</p>
                    <p><strong>Chemicals:</strong> ${incident.chemicals}</p>
                    <p><strong>Description:</strong> ${incident.description}</p>
                    ${incident.injuries ? `<p><strong>Injuries:</strong> ${incident.injuries}</p>` : ''}
                    <p><strong>Actions Taken:</strong> ${incident.actions}</p>
                </div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'block';
}

// Close incident reports modal
function closeIncidentReportsModal() {
    document.getElementById('incidentReportsModal').style.display = 'none';
}

// Show safety dashboard
function showSafetyDashboard() {
    const modal = document.getElementById('safetyDashboardModal');
    const content = document.getElementById('safetyDashboardContent');
    
    // Get chemical statistics
    const chemicals = window.labSystem ? window.labSystem.chemicals : [];
    const hazardCounts = {
        extreme: chemicals.filter(c => c.hazardLevel === 'extreme').length,
        high: chemicals.filter(c => c.hazardLevel === 'high').length,
        medium: chemicals.filter(c => c.hazardLevel === 'medium').length,
        low: chemicals.filter(c => c.hazardLevel === 'low').length
    };
    
    const incidents = JSON.parse(localStorage.getItem('chemicalIncidents')) || [];
    const recentIncidents = incidents.filter(i => 
        new Date(i.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    content.innerHTML = `
        <div class="safety-stats-grid">
            <div class="safety-stat-card">
                <h3>Chemical Inventory</h3>
                <div class="hazard-breakdown">
                    <div class="hazard-stat extreme">🔴 Extreme: ${hazardCounts.extreme}</div>
                    <div class="hazard-stat high">🟠 High: ${hazardCounts.high}</div>
                    <div class="hazard-stat medium">🟡 Medium: ${hazardCounts.medium}</div>
                    <div class="hazard-stat low">🟢 Low: ${hazardCounts.low}</div>
                </div>
            </div>
            
            <div class="safety-stat-card">
                <h3>Incident Reports</h3>
                <div class="incident-stats">
                    <p><strong>Total Incidents:</strong> ${incidents.length}</p>
                    <p><strong>Last 30 Days:</strong> ${recentIncidents.length}</p>
                    <p><strong>Most Recent:</strong> ${incidents.length > 0 ? 
                        new Date(incidents[incidents.length - 1].timestamp).toLocaleDateString() : 'None'}</p>
                </div>
            </div>
            
            <div class="safety-stat-card">
                <h3>High-Risk Chemicals</h3>
                <div class="high-risk-list">
                    ${chemicals.filter(c => c.hazardLevel === 'extreme').slice(0, 5).map(c => 
                        `<p>⚠️ ${c.name} - ${c.location || 'Unknown location'}</p>`
                    ).join('') || '<p>No extreme hazard chemicals found</p>'}
                </div>
            </div>
            
            <div class="safety-stat-card">
                <h3>Safety Actions</h3>
                <div class="safety-actions">
                    <button onclick="runSafetyInspection()" class="safety-action-btn">
                        🔍 Run Safety Inspection
                    </button>
                    <button onclick="generateSafetyReport()" class="safety-action-btn">
                        📊 Generate Safety Report
                    </button>
                    <button onclick="showSafetyTraining()" class="safety-action-btn">
                        🎓 Safety Training
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close safety dashboard modal
function closeSafetyDashboardModal() {
    document.getElementById('safetyDashboardModal').style.display = 'none';
}

// Run safety inspection
function runSafetyInspection() {
    const chemicals = window.labSystem ? window.labSystem.chemicals : [];
    const issues = [];
    
    // Check for expired chemicals
    chemicals.forEach(chemical => {
        if (chemical.expiry && new Date(chemical.expiry) < new Date()) {
            issues.push(`⚠️ EXPIRED: ${chemical.name} expired on ${chemical.expiry}`);
        }
    });
    
    // Check for missing locations
    const noLocation = chemicals.filter(c => !c.location || c.location.trim() === '');
    if (noLocation.length > 0) {
        issues.push(`📍 ${noLocation.length} chemicals have no storage location specified`);
    }
    
    // Check for extreme hazards without proper warnings
    const extremeHazards = chemicals.filter(c => c.hazardLevel === 'extreme');
    if (extremeHazards.length > 0) {
        issues.push(`🔥 ${extremeHazards.length} extreme hazard chemicals require special attention`);
    }
    
    const resultHTML = issues.length > 0 ? 
        `<h4>⚠️ Safety Issues Found:</h4><ul>${issues.map(issue => `<li>${issue}</li>`).join('')}</ul>` :
        `<h4>✅ No Safety Issues Found</h4><p>All chemicals appear to be properly managed.</p>`;
    
    showEmergencyContact('inspection');
    setTimeout(() => {
        document.getElementById('emergencyContent').innerHTML = `
            <div class="emergency-contact-card">
                <h3>🔍 Safety Inspection Results</h3>
                ${resultHTML}
                <button onclick="closeEmergencyModal()" class="safety-btn" style="margin-top: 20px;">
                    Close Report
                </button>
            </div>
        `;
    }, 100);
}

// Generate safety report
function generateSafetyReport() {
    const chemicals = window.labSystem ? window.labSystem.chemicals : [];
    const incidents = JSON.parse(localStorage.getItem('chemicalIncidents')) || [];
    
    const reportData = {
        timestamp: new Date().toISOString(),
        totalChemicals: chemicals.length,
        hazardBreakdown: {
            extreme: chemicals.filter(c => c.hazardLevel === 'extreme').length,
            high: chemicals.filter(c => c.hazardLevel === 'high').length,
            medium: chemicals.filter(c => c.hazardLevel === 'medium').length,
            low: chemicals.filter(c => c.hazardLevel === 'low').length
        },
        totalIncidents: incidents.length,
        recentIncidents: incidents.filter(i => 
            new Date(i.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
    };
    
    // Save report
    const reports = JSON.parse(localStorage.getItem('safetyReports')) || [];
    reports.push(reportData);
    localStorage.setItem('safetyReports', JSON.stringify(reports));
    
    alert(`Safety report generated successfully!\nReport ID: SR-${Date.now()}\nTotal Chemicals: ${reportData.totalChemicals}\nExtreme Hazards: ${reportData.hazardBreakdown.extreme}`);
}

// Show safety training
function showSafetyTraining() {
    showEmergencyContact('training');
    setTimeout(() => {
        document.getElementById('emergencyContent').innerHTML = `
            <div class="emergency-contact-card">
                <h3>🎓 Laboratory Safety Training</h3>
                <div style="text-align: left; line-height: 1.8;">
                    <h4>Required Training Topics:</h4>
                    <ul>
                        <li>✅ Chemical Hazard Recognition</li>
                        <li>✅ Personal Protective Equipment (PPE)</li>
                        <li>✅ Emergency Response Procedures</li>
                        <li>✅ Spill Response and Cleanup</li>
                        <li>✅ Fire Safety and Evacuation</li>
                        <li>✅ First Aid for Chemical Exposure</li>
                        <li>✅ Waste Disposal Procedures</li>
                        <li>✅ Storage and Compatibility</li>
                    </ul>
                    
                    <h4>Training Resources:</h4>
                    <ul>
                        <li>📖 Safety Data Sheets (SDS) Review</li>
                        <li>🎥 Emergency Response Videos</li>
                        <li>🧪 Hands-on Safety Equipment Demo</li>
                        <li>📋 Safety Protocol Checklists</li>
                    </ul>
                </div>
                <button onclick="closeEmergencyModal()" class="safety-btn" style="margin-top: 20px;">
                    Complete Training
                </button>
            </div>
        `;
    }, 100);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const safetyModal = document.getElementById('safetyModal');
    const emergencyModal = document.getElementById('emergencyModal');
    const incidentModal = document.getElementById('incidentModal');
    const incidentReportsModal = document.getElementById('incidentReportsModal');
    const safetyDashboardModal = document.getElementById('safetyDashboardModal');
    
    if (event.target === safetyModal) {
        closeSafetyModal();
    } else if (event.target === emergencyModal) {
        closeEmergencyModal();
    } else if (event.target === incidentModal) {
        closeIncidentModal();
    } else if (event.target === incidentReportsModal) {
        closeIncidentReportsModal();
    } else if (event.target === safetyDashboardModal) {
        closeSafetyDashboardModal();
    }
});

// SDS and Reference Functions
function downloadSDS(chemicalName) {
    // Common SDS database URLs
    const sdsUrls = {
        'fisher': `https://www.fishersci.com/us/en/catalog/search/sds?keyword=${encodeURIComponent(chemicalName)}`,
        'sigma': `https://www.sigmaaldrich.com/US/en/search/${encodeURIComponent(chemicalName)}`,
        'merck': `https://www.merckmillipore.com/US/en/search/${encodeURIComponent(chemicalName)}`,
        'chemspider': `https://www.chemspider.com/Search.aspx?q=${encodeURIComponent(chemicalName)}`
    };
    
    showEmergencyContact('sds');
    setTimeout(() => {
        document.getElementById('emergencyContent').innerHTML = `
            <div class="emergency-contact-card">
                <h3>📄 Safety Data Sheet Sources for ${chemicalName}</h3>
                <p style="margin-bottom: 20px;">Click on any source below to search for the SDS:</p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="${sdsUrls.fisher}" target="_blank" class="sds-link">
                        🔬 Fisher Scientific SDS Database
                    </a>
                    <a href="${sdsUrls.sigma}" target="_blank" class="sds-link">
                        🧪 Sigma-Aldrich Product Search
                    </a>
                    <a href="${sdsUrls.merck}" target="_blank" class="sds-link">
                        ⚗️ Merck Millipore Database
                    </a>
                    <a href="${sdsUrls.chemspider}" target="_blank" class="sds-link">
                        🔍 ChemSpider Reference
                    </a>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px;">
                    <p><strong>⚠️ Important:</strong> Always verify that the SDS matches your exact chemical grade and supplier.</p>
                </div>
                <button onclick="closeEmergencyModal()" class="safety-btn" style="margin-top: 15px;">
                    Close
                </button>
            </div>
        `;
    }, 100);
}

function viewChemicalReferences(chemicalName) {
    // Reference URLs for chemical safety information
    const referenceUrls = {
        'niosh': `https://www.cdc.gov/niosh/npg/npgsyn-a.html`,
        'nist': `https://webbook.nist.gov/chemistry/name-ser/`,
        'pubchem': `https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(chemicalName)}`,
        'echa': `https://echa.europa.eu/information-on-chemicals`
    };
    
    showEmergencyContact('references');
    setTimeout(() => {
        document.getElementById('emergencyContent').innerHTML = `
            <div class="emergency-contact-card">
                <h3>🔗 Safety References for ${chemicalName}</h3>
                <p style="margin-bottom: 20px;">Professional chemical safety databases:</p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="${referenceUrls.niosh}" target="_blank" class="sds-link">
                        🏛️ NIOSH Pocket Guide to Chemical Hazards
                    </a>
                    <a href="${referenceUrls.nist}" target="_blank" class="sds-link">
                        🔬 NIST Chemistry WebBook
                    </a>
                    <a href="${referenceUrls.pubchem}" target="_blank" class="sds-link">
                        🧬 PubChem Compound Database
                    </a>
                    <a href="${referenceUrls.echa}" target="_blank" class="sds-link">
                        🇪🇺 ECHA Chemical Information
                    </a>
                </div>
                <div style="margin-top: 20px;">
                    <h4>Quick Safety Facts:</h4>
                    <div id="quickFacts" style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 10px;">
                        ${getQuickSafetyFacts(chemicalName)}
                    </div>
                </div>
                <button onclick="closeEmergencyModal()" class="safety-btn" style="margin-top: 15px;">
                    Close
                </button>
            </div>
        `;
    }, 100);
}

function getQuickSafetyFacts(chemicalName) {
    const name = chemicalName.toLowerCase();
    
    if (name.includes('hydrazine')) {
        return `
            <p><strong>⚠️ EXTREME CAUTION:</strong> Carcinogenic, explosive when heated</p>
            <p><strong>PPE:</strong> Full face respirator, chemical-resistant gloves, lab coat</p>
            <p><strong>Storage:</strong> Cool, dry place away from heat and oxidizers</p>
        `;
    } else if (name.includes('benzene')) {
        return `
            <p><strong>⚠️ CARCINOGEN:</strong> Causes leukemia, highly flammable</p>
            <p><strong>PPE:</strong> Respirator, chemical-resistant gloves, lab coat</p>
            <p><strong>Storage:</strong> Flammable storage cabinet, away from ignition sources</p>
        `;
    } else if (name.includes('sodium') && !name.includes('chloride')) {
        return `
            <p><strong>⚠️ WATER REACTIVE:</strong> Violent reaction with water producing hydrogen</p>
            <p><strong>PPE:</strong> Safety goggles, dry gloves, lab coat</p>
            <p><strong>Storage:</strong> Under mineral oil, dry environment</p>
        `;
    } else if (name.includes('acid')) {
        return `
            <p><strong>⚠️ CORROSIVE:</strong> Causes severe burns to skin and eyes</p>
            <p><strong>PPE:</strong> Safety goggles, acid-resistant gloves, lab coat</p>
            <p><strong>Storage:</strong> Corrosive storage area, secondary containment</p>
        `;
    } else {
        return `
            <p><strong>General Precautions:</strong> Follow standard laboratory safety procedures</p>
            <p><strong>PPE:</strong> Safety glasses, appropriate gloves, lab coat</p>
            <p><strong>Storage:</strong> Follow manufacturer's recommendations</p>
        `;
    }
}

// Integrate safety checks into the main system
// Override the showOverlay function to include safety checks
function initializeSafetyIntegration() {
    if (window.labSystem && window.labSystem.showOverlay && !window.labSystem.showOverlay.safetyIntegrated) {
        console.log('Integrating safety system with lab management...');
        const originalShowOverlay = window.labSystem.showOverlay;
        window.labSystem.showOverlay = function(id, type) {
            console.log('Safety check for ID:', id, 'Type:', type);
            
            // Get the actual item from the ID
            const item = type === 'chemical' ? 
                this.chemicals.find(c => c.id === id) : 
                this.apparatus.find(a => a.id === id);
            
            if (!item) {
                console.log('Item not found for ID:', id);
                return originalShowOverlay.call(this, id, type);
            }
            
            console.log('Found item:', item.name);
            
            if (type === 'chemical' && !checkChemicalSafety(item)) {
                // Safety alert was shown, don't proceed with normal overlay
                console.log('Safety alert triggered for:', item.name);
                return;
            }
            // Proceed with normal overlay
            console.log('Proceeding with normal overlay for:', item.name);
            originalShowOverlay.call(this, id, type);
        };
        
        // Mark as integrated and store original function reference
        window.labSystem.showOverlay.safetyIntegrated = true;
        window.labSystem.showOverlay.originalFunction = originalShowOverlay;
        return true;
    }
    return false;
}

// Try to initialize safety integration when DOM is ready
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, attempting safety integration...');
    if (!initializeSafetyIntegration()) {
        // If not ready, try again after a short delay
        setTimeout(function() {
            if (!initializeSafetyIntegration()) {
                // Try once more after lab system is likely initialized
                setTimeout(initializeSafetyIntegration, 2000);
            }
        }, 1000);
    }
});

// Also try to initialize when the window is fully loaded
window.addEventListener('load', function() {
    console.log('Window loaded, attempting safety integration...');
    initializeSafetyIntegration();
});