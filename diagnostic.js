// Global diagnostic function for chemical ID issues
window.runChemicalDiagnostic = function() {
    if (window.labSystem) {
        const results = window.labSystem.diagnoseChemicalIds();
        alert(`Diagnostic Results:\n\nTotal Chemicals: ${results.total}\nMissing IDs: ${results.missingIds}\nDuplicate IDs: ${results.duplicates}\n\nCheck console for detailed information.`);
        
        if (results.missingIds > 0) {
            console.log('Running automatic fix for missing IDs...');
            window.labSystem.fixMissingIds();
            window.labSystem.renderItems();
            alert('Fixed missing IDs! Please check the diagnostic again.');
        }
    } else {
        alert('System not ready. Please try again.');
    }
};