const contributorsDiv = document.getElementById('contributors');
const resultsDiv = document.getElementById('results');
const addPersonButton = document.getElementById('addPerson');
const calculateButton = document.getElementById('calculate');
const resetButton = document.getElementById('reset');

let downloadPdfButton; // Declare the button variable outside of functions removed html static button

// Add Contributor
addPersonButton.addEventListener('click', () => {
    const contributorRow = document.createElement('div');
    contributorRow.className = 'contributor-row';
    contributorRow.innerHTML = `
        <input type="text" class="contributor-name" placeholder="Name" />
        <input type="number" class="contribution-amount" placeholder="Contribution (INR)" />
        <button class="remove-button" onclick="removeContributor(this)">Remove</button>
    `;
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
        payments.push(`${owes[j].name} ~to pay~ ${owes[i].name}: ${owedAmount.toFixed(2)} INR`);
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

    // Store the settlement summary for PDF generation
    const summaryData = {
        totalContribution,
        equalShare,
        payments,
        contributors: contributions.map((amt, i) => ({
            name: names[i],
            contribution: amt,
            owedAmount: equalShare - amt
        }))
    };

    // Add or recreate the download button
    if (!downloadPdfButton) {
        downloadPdfButton = document.createElement('button');
        downloadPdfButton.textContent = 'Download PDF';
        downloadPdfButton.className = 'download-pdf';
        resultsDiv.appendChild(downloadPdfButton);
    } else if (!resultsDiv.contains(downloadPdfButton)) {
        resultsDiv.appendChild(downloadPdfButton); // Re-add button if missing
    }

    // Attach the PDF generation function
    downloadPdfButton.onclick = () => generatePDF(summaryData);
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
    if (downloadPdfButton) {
        downloadPdfButton.remove();
        downloadPdfButton = null;
    }
});

// Generate PDF Function
function generatePDF({ totalContribution, equalShare, payments, contributors }) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add watermark
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(50);
    pdf.text('SplitEasy', 50, 150, { angle: 45 });
    pdf.setFontSize(20);
    pdf.text('Built by: instagram/@theaatif01', 50, 180, { angle: 45 });

    // Add header content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Total Contribution: ${totalContribution.toFixed(2)} INR`, 10, 20);
    pdf.text(`Equal Share per Person: ${equalShare.toFixed(2)} INR`, 10, 30);

    // Add contributors table
    pdf.autoTable({
        head: [['Name', 'Contribution (INR)', 'Owed Amount (INR)']],
        body: contributors.map(({ name, contribution, owedAmount }) => [
            name,
            contribution.toFixed(2),
            owedAmount.toFixed(2)
        ]),
        startY: 40,
        theme: 'striped',
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 50 },
            2: { cellWidth: 50 }
        }
    });

    // Add payment breakdown
    pdf.text('Settlement Details:', 10, pdf.lastAutoTable.finalY + 10);
    payments.forEach((payment, index) => {
        pdf.text(`${index + 1}. ${payment}`, 10, pdf.lastAutoTable.finalY + 20 + index * 10);
    });

    // Save the PDF
    pdf.save('settlement-summary.pdf');
}
