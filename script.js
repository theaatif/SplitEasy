const contributorsDiv = document.getElementById('contributors');
const resultsDiv = document.getElementById('results');
const addPersonButton = document.getElementById('addPerson');
const calculateButton = document.getElementById('calculate');
const resetButton = document.getElementById('reset');

// Add Contributor
addPersonButton.addEventListener('click', () => {
    const contributorRow = document.createElement('div');
    contributorRow.className = 'contributor-row';
    contributorRow.innerHTML = `
        <input type="text" class="contributor-name" placeholder="Name" />
        <input type="number" class="contribution-amount" placeholder="Contribution (INR)" />
        <button class="remove-button" onclick="removeContributor(this)">Remove</button>
    `;
    
    // Ensure the new row is added inside the 'input-section'
    const inputSection = contributorsDiv.querySelector('.input-section');
    inputSection.appendChild(contributorRow);
});

// Remove Contributor
function removeContributor(button) {
    button.parentElement.remove();
}

// Calculate Settlement
calculateButton.addEventListener('click', () => {
    const names = Array.from(document.querySelectorAll('.contributor-name')).map(input => input.value.trim());
    const contributions = Array.from(document.querySelectorAll('.contribution-amount')).map(input => Number(input.value));
    const totalContribution = contributions.reduce((acc, val) => acc + val, 0);
    const equalShare = totalContribution / contributions.length;
    const payments = [];
    const owes = contributions.map((amt, i) => ({ name: names[i], amount: equalShare - amt })).sort((a, b) => a.amount - b.amount);

    let i = 0, j = owes.length - 1;
    while (i < j) {
        const owedAmount = Math.min(-owes[i].amount, owes[j].amount);
        payments.push(`${owes[j].name} pays ${owes[i].name}: ${owedAmount.toFixed(2)} INR`);
        owes[i].amount += owedAmount;
        owes[j].amount -= owedAmount;
        if (owes[i].amount >= 0) i++;
        if (owes[j].amount <= 0) j--;
    }

    resultsDiv.innerHTML = `
        <h3>Settlement Summary</h3>
        <div class="summary">
            <p>Total Contribution: ${totalContribution.toFixed(2)} INR</p>
            <p>Equal Share per Person: ${equalShare.toFixed(2)} INR</p>
        </div>
        <div class="settlement">
            ${payments.map(payment => `<div class="payment-card">${payment}</div>`).join('')}
        </div>
    `;
});

// Reset Form
resetButton.addEventListener('click', () => {
    document.querySelector('.input-section').innerHTML = `
        <div class="contributor-row">
            <input type="text" class="contributor-name" placeholder="Name" />
            <input type="number" class="contribution-amount" placeholder="Contribution (INR)" />
            <button class="remove-button" onclick="removeContributor(this)">Remove</button>
        </div>
    `;
    resultsDiv.innerHTML = '';
}); 
