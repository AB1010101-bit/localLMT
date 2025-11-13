// Chemical Click Test - Run this in browser console to test chemical click functionality

function testChemicalClicks() {
    console.log('Testing chemical click functionality...');
    
    // Get all chemical cards
    const chemicalCards = document.querySelectorAll('#chemicalsList .item-card');
    console.log(`Found ${chemicalCards.length} chemical cards`);
    
    if (chemicalCards.length === 0) {
        console.error('No chemical cards found! Make sure you are on the chemicals tab.');
        return;
    }
    
    // Test the first few chemicals
    const testCount = Math.min(5, chemicalCards.length);
    console.log(`Testing first ${testCount} chemicals...`);
    
    for (let i = 0; i < testCount; i++) {
        const card = chemicalCards[i];
        const chemicalId = card.getAttribute('data-chemical-id');
        const chemicalName = card.getAttribute('data-chemical-name');
        const onclick = card.getAttribute('onclick');
        
        console.log(`Chemical ${i + 1}:`);
        console.log(`  Name: ${chemicalName}`);
        console.log(`  ID: ${chemicalId} (${typeof chemicalId})`);
        console.log(`  OnClick: ${onclick}`);
        
        // Test if the chemical exists in the labSystem
        if (window.labSystem) {
            const chemical = window.labSystem.chemicals.find(c => parseInt(c.id) === parseInt(chemicalId));
            console.log(`  Found in system: ${chemical ? 'YES' : 'NO'}`);
            if (chemical) {
                console.log(`  System ID: ${chemical.id} (${typeof chemical.id})`);
            }
        }
        console.log('---');
    }
    
    console.log('Test complete. Try clicking on a chemical card to see if the popup appears.');
}

// Auto-run the test when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testChemicalClicks);
} else {
    testChemicalClicks();
}