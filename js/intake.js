/**
 * Client Intake Form
 * Handles the public-facing client intake form
 */

/**
 * Show client intake form
 */
async function showClientIntakeForm(clientId) {
    try {
        // Verify client exists
        const { data: client, error } = await ClientService.getById(clientId);

        if (error || !client) {
            document.body.innerHTML = `
                <div style="padding: 3rem; text-align: center; font-family: 'Inter', sans-serif;">
                    <h1 style="color: var(--danger); margin-bottom: 1rem;">Invalid Link</h1>
                    <p style="color: var(--text-secondary);">This intake form link is not valid or has expired.</p>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Please contact your therapist for a new link.</p>
                </div>
            `;
            return;
        }

        console.log('Showing intake form for client:', clientId);
        
        // Hide all other views and show intake form
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            console.log('Removed active from view:', v.id);
        });
        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.remove('active');
            t.style.display = 'none'; // Hide all nav tabs
        });
        
        // Hide navigation completely
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.style.display = 'none';
            console.log('Navigation hidden');
        }
        
        // Keep header but customize it
        const header = document.querySelector('.header');
        if (header) {
            const logoH1 = header.querySelector('.logo h1');
            const logoP = header.querySelector('.logo p');
            if (logoH1) logoH1.textContent = 'Spiral Light Healing';
            if (logoP) logoP.textContent = 'Client Intake Form';
            console.log('Header customized');
        }

        const intakeView = document.getElementById('clientIntakeView');
        console.log('Intake view element:', intakeView);
        
        if (!intakeView) {
            console.error('clientIntakeView element not found!');
            document.body.innerHTML = `
                <div style="padding: 3rem; text-align: center; font-family: 'Inter', sans-serif;">
                    <h1 style="color: var(--danger); margin-bottom: 1rem;">Error</h1>
                    <p style="color: var(--text-secondary);">Intake form view not found. Please contact support.</p>
                </div>
            `;
            return;
        }

        // Force hide ALL other views first
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });
        
        // Double-check that clientsView is hidden
        const clientsView = document.getElementById('clientsView');
        if (clientsView) {
            clientsView.classList.remove('active');
            clientsView.style.display = 'none';
            console.log('Clients view hidden');
        }

        // Show the intake view - force it to be visible
        intakeView.classList.add('active');
        intakeView.style.display = 'block';
        intakeView.style.visibility = 'visible';
        intakeView.style.opacity = '1';
        console.log('Intake view activated and displayed');
        
        // Verify it's actually visible
        setTimeout(() => {
            const isVisible = intakeView.classList.contains('active') && intakeView.style.display !== 'none';
            console.log('Intake view visibility check:', isVisible);
            if (!isVisible) {
                console.error('Intake view is not visible! Forcing display...');
                intakeView.style.display = 'block';
                intakeView.style.visibility = 'visible';
                intakeView.classList.add('active');
            }
        }, 100);
        
        const intakeClientIdInput = document.getElementById('intakeClientId');
        if (intakeClientIdInput) {
            intakeClientIdInput.value = clientId;
            console.log('Client ID set:', clientId);
        } else {
            console.error('intakeClientId input not found!');
        }
        
        // Set today's date as minimum and default
        const today = new Date().toISOString().split('T')[0];
        const sessionDateInput = document.getElementById('intakeSessionDate');
        if (sessionDateInput) {
            sessionDateInput.setAttribute('min', today);
            sessionDateInput.value = today;
            console.log('Session date set to:', today);
        } else {
            console.error('intakeSessionDate input not found!');
        }

        // Initialize intake form tables with one empty row each
        resetIntakeForm();
        console.log('Intake form reset and ready');
    } catch (error) {
        console.error('Error loading intake form:', error);
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center; font-family: 'Inter', sans-serif;">
                <h1 style="color: var(--danger); margin-bottom: 1rem;">Error</h1>
                <p style="color: var(--text-secondary);">Failed to load intake form. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Submit client intake form
 */
async function submitClientIntake(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const clientId = document.getElementById('intakeClientId').value;

        const sessionData = {
            clientId: clientId,
            date: document.getElementById('intakeSessionDate').value,
            status: 'pending', // Client submissions are pending until approved
            practitioner: null,
            complaints: getIntakeTableData('intakeComplaintsTable'),
            aggravates: document.getElementById('intakeAggravates').value || null,
            swelling: document.getElementById('intakeSwelling').value || null,
            injurySite: document.getElementById('intakeInjurySite').value || null,
            medications: getIntakeTableData('intakeMedicationsTable'),
            healthcare: getIntakeTableData('intakeHealthcareTable'),
            therapies: getIntakeTableData('intakeTherapiesTable'),
            implants: document.getElementById('intakeImplants').value || null,
            injuries: getIntakeTableData('intakeInjuriesTable'),
            operations: getIntakeTableData('intakeOperationsTable'),
            exercise: document.getElementById('intakeExercise').value || null,
            bowenHistory: document.getElementById('intakeBowenHistory').value || null,
            additional: document.getElementById('intakeAdditional').value || null,
            notes: null
        };

        const result = await SessionService.create(sessionData);

        if (result.error) {
            throw result.error;
        }

        // Show success message
        document.getElementById('clientIntakeForm').style.display = 'none';
        document.getElementById('intakeSuccessMessage').style.display = 'block';
    } catch (error) {
        console.error('Error submitting intake form:', error);
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        alert('Failed to submit intake form. Please try again. If the problem persists, please contact your therapist.');
    }
}

/**
 * Get table data from intake form tables
 */
function getIntakeTableData(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return [];

    const rows = table.querySelectorAll('tbody tr');
    const data = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const rowData = {};
        inputs.forEach((input, index) => {
            if (input.value.trim()) {
                rowData[`col${index}`] = input.value;
            }
        });
        if (Object.keys(rowData).length > 0) {
            data.push(rowData);
        }
    });

    // Map column names based on table
    if (tableId === 'intakeComplaintsTable') {
        return data.map(d => ({
            complaint: d.col0 || '',
            since: d.col1 || '',
            causes: d.col2 || '',
            severity: d.col3 || ''
        }));
    } else if (tableId === 'intakeMedicationsTable') {
        return data.map(d => ({
            medication: d.col0 || '',
            since: d.col1 || '',
            effects: d.col2 || ''
        }));
    } else if (tableId === 'intakeHealthcareTable') {
        return data.map(d => ({
            provider: d.col0 || '',
            condition: d.col1 || '',
            treatment: d.col2 || ''
        }));
    } else if (tableId === 'intakeTherapiesTable') {
        return data.map(d => ({
            therapy: d.col0 || '',
            since: d.col1 || '',
            results: d.col2 || ''
        }));
    } else if (tableId === 'intakeInjuriesTable') {
        return data.map(d => ({
            injury: d.col0 || '',
            since: d.col1 || '',
            complications: d.col2 || ''
        }));
    } else if (tableId === 'intakeOperationsTable') {
        return data.map(d => ({
            operation: d.col0 || '',
            when: d.col1 || '',
            complications: d.col2 || ''
        }));
    }

    return data;
}

/**
 * Reset intake form
 */
function resetIntakeForm() {
    // Reset all tables to one empty row
    ['intakeComplaintsBody', 'intakeMedicationsBody', 'intakeHealthcareBody', 
     'intakeTherapiesBody', 'intakeInjuriesBody', 'intakeOperationsBody'].forEach(bodyId => {
        const tbody = document.getElementById(bodyId);
        if (tbody) {
            tbody.innerHTML = '';
        }
    });

    // Add one empty row to each table
    addIntakeComplaintRow();
    addIntakeMedicationRow();
    addIntakeHealthcareRow();
    addIntakeTherapyRow();
    addIntakeInjuryRow();
    addIntakeOperationRow();
}

// Intake table row management functions
function addIntakeComplaintRow(complaint = '', since = '', causes = '', severity = '') {
    const tbody = document.getElementById('intakeComplaintsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Describe complaint" value="${escapeHtml(complaint)}"></td>
        <td><input type="text" placeholder="When did it start?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="What caused it?" value="${escapeHtml(causes)}"></td>
        <td><input type="number" min="1" max="10" placeholder="1-10" value="${escapeHtml(severity)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addIntakeMedicationRow(medication = '', since = '', effects = '') {
    const tbody = document.getElementById('intakeMedicationsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Medication name" value="${escapeHtml(medication)}"></td>
        <td><input type="text" placeholder="How long?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Any side effects?" value="${escapeHtml(effects)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addIntakeHealthcareRow(provider = '', condition = '', treatment = '') {
    const tbody = document.getElementById('intakeHealthcareBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Provider name" value="${escapeHtml(provider)}"></td>
        <td><input type="text" placeholder="Condition" value="${escapeHtml(condition)}"></td>
        <td><input type="text" placeholder="Treatment type" value="${escapeHtml(treatment)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addIntakeTherapyRow(therapy = '', since = '', results = '') {
    const tbody = document.getElementById('intakeTherapiesBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Therapy type" value="${escapeHtml(therapy)}"></td>
        <td><input type="text" placeholder="How long?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Effectiveness" value="${escapeHtml(results)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addIntakeInjuryRow(injury = '', since = '', complications = '') {
    const tbody = document.getElementById('intakeInjuriesBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Injury or condition" value="${escapeHtml(injury)}"></td>
        <td><input type="text" placeholder="When?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Effects" value="${escapeHtml(complications)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addIntakeOperationRow(operation = '', when = '', complications = '') {
    const tbody = document.getElementById('intakeOperationsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Operation type" value="${escapeHtml(operation)}"></td>
        <td><input type="text" placeholder="Date/Year" value="${escapeHtml(when)}"></td>
        <td><input type="text" placeholder="Any complications?" value="${escapeHtml(complications)}"></td>
        <td><button type="button" onclick="removeIntakeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function removeIntakeTableRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    if (tbody.children.length > 1) {
        row.remove();
    } else {
        // Clear the last row instead of removing it
        row.querySelectorAll('input').forEach(input => input.value = '');
    }
}

