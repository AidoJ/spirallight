/**
 * Session Management
 * Handles all session-related operations using Supabase
 */

let currentSessionId = null;

/**
 * Start a new session for the current client
 */
async function startNewSession() {
    if (!currentClientId) return;

    try {
        const { data: client } = await ClientService.getById(currentClientId);
        if (client) {
            resetSessionForm();
            document.getElementById('sessionClientId').value = currentClientId;
            document.getElementById('sessionFormTitle').textContent = `New Session for ${client.name}`;
            showView('newSession');
        }
    } catch (error) {
        console.error('Error loading client:', error);
        showToast('Failed to load client', 'error');
    }
}

/**
 * Save session (create or update)
 */
async function saveSession(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const sessionId = document.getElementById('sessionId').value;
        const existingSession = sessionId ? await SessionService.getById(sessionId).then(r => r.data) : null;

        const sessionData = {
            clientId: document.getElementById('sessionClientId').value,
            date: document.getElementById('sessionDate').value,
            status: existingSession ? existingSession.status : 'approved',
            practitioner: document.getElementById('sessionPractitioner').value || null,
            complaints: getTableData('complaintsTable'),
            aggravates: document.getElementById('sessionAggravates').value || null,
            swelling: document.getElementById('sessionSwelling').value || null,
            injurySite: document.getElementById('sessionInjurySite').value || null,
            medications: getTableData('medicationsTable'),
            healthcare: getTableData('healthcareTable'),
            therapies: getTableData('therapiesTable'),
            implants: document.getElementById('sessionImplants').value || null,
            injuries: getTableData('injuriesTable'),
            operations: getTableData('operationsTable'),
            exercise: document.getElementById('sessionExercise').value || null,
            bowenHistory: document.getElementById('sessionBowenHistory').value || null,
            additional: document.getElementById('sessionAdditional').value || null,
            notes: document.getElementById('sessionNotes').value || null,
            therapistSignature: document.getElementById('sessionTherapistSignatureData')?.value || null
        };

        let result;
        if (sessionId) {
            result = await SessionService.update(sessionId, sessionData);
        } else {
            result = await SessionService.create(sessionData);
        }

        if (result.error) {
            throw result.error;
        }

        showToast('Session saved successfully!', 'success');
        resetSessionForm();
        await viewClient(sessionData.clientId);
    } catch (error) {
        console.error('Error saving session:', error);
        showToast('Failed to save session. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

/**
 * Get table data from a form table
 */
function getTableData(tableId) {
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
    if (tableId === 'complaintsTable') {
        return data.map(d => ({
            complaint: d.col0 || '',
            since: d.col1 || '',
            causes: d.col2 || '',
            severity: d.col3 || ''
        }));
    } else if (tableId === 'medicationsTable') {
        return data.map(d => ({
            medication: d.col0 || '',
            since: d.col1 || '',
            effects: d.col2 || ''
        }));
    } else if (tableId === 'healthcareTable') {
        return data.map(d => ({
            provider: d.col0 || '',
            condition: d.col1 || '',
            treatment: d.col2 || ''
        }));
    } else if (tableId === 'therapiesTable') {
        return data.map(d => ({
            therapy: d.col0 || '',
            since: d.col1 || '',
            results: d.col2 || ''
        }));
    } else if (tableId === 'injuriesTable') {
        return data.map(d => ({
            injury: d.col0 || '',
            since: d.col1 || '',
            complications: d.col2 || ''
        }));
    } else if (tableId === 'operationsTable') {
        return data.map(d => ({
            operation: d.col0 || '',
            when: d.col1 || '',
            complications: d.col2 || ''
        }));
    }

    return data;
}

/**
 * Set table data from session data
 */
function setTableData(tableId, data, bodyId) {
    const tbody = document.getElementById(bodyId);
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        // Add one empty row
        if (tableId === 'complaintsTable') addComplaintRow();
        else if (tableId === 'medicationsTable') addMedicationRow();
        else if (tableId === 'healthcareTable') addHealthcareRow();
        else if (tableId === 'therapiesTable') addTherapyRow();
        else if (tableId === 'injuriesTable') addInjuryRow();
        else if (tableId === 'operationsTable') addOperationRow();
        return;
    }

    data.forEach(item => {
        if (tableId === 'complaintsTable') {
            addComplaintRow(item.complaint, item.since, item.causes, item.severity);
        } else if (tableId === 'medicationsTable') {
            addMedicationRow(item.medication, item.since, item.effects);
        } else if (tableId === 'healthcareTable') {
            addHealthcareRow(item.provider, item.condition, item.treatment);
        } else if (tableId === 'therapiesTable') {
            addTherapyRow(item.therapy, item.since, item.results);
        } else if (tableId === 'injuriesTable') {
            addInjuryRow(item.injury, item.since, item.complications);
        } else if (tableId === 'operationsTable') {
            addOperationRow(item.operation, item.when, item.complications);
        }
    });
}

// Table row management functions
function addComplaintRow(complaint = '', since = '', causes = '', severity = '') {
    const tbody = document.getElementById('complaintsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Describe complaint" value="${escapeHtml(complaint)}"></td>
        <td><input type="text" placeholder="When did it start?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="What caused it?" value="${escapeHtml(causes)}"></td>
        <td><input type="number" min="1" max="10" placeholder="1-10" value="${escapeHtml(severity)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addMedicationRow(medication = '', since = '', effects = '') {
    const tbody = document.getElementById('medicationsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Medication name" value="${escapeHtml(medication)}"></td>
        <td><input type="text" placeholder="How long?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Any side effects?" value="${escapeHtml(effects)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addHealthcareRow(provider = '', condition = '', treatment = '') {
    const tbody = document.getElementById('healthcareBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Provider name" value="${escapeHtml(provider)}"></td>
        <td><input type="text" placeholder="Condition" value="${escapeHtml(condition)}"></td>
        <td><input type="text" placeholder="Treatment type" value="${escapeHtml(treatment)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addTherapyRow(therapy = '', since = '', results = '') {
    const tbody = document.getElementById('therapiesBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Therapy type" value="${escapeHtml(therapy)}"></td>
        <td><input type="text" placeholder="How long?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Effectiveness" value="${escapeHtml(results)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addInjuryRow(injury = '', since = '', complications = '') {
    const tbody = document.getElementById('injuriesBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Injury or condition" value="${escapeHtml(injury)}"></td>
        <td><input type="text" placeholder="When?" value="${escapeHtml(since)}"></td>
        <td><input type="text" placeholder="Effects" value="${escapeHtml(complications)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function addOperationRow(operation = '', when = '', complications = '') {
    const tbody = document.getElementById('operationsBody');
    if (!tbody) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Operation type" value="${escapeHtml(operation)}"></td>
        <td><input type="text" placeholder="Date/Year" value="${escapeHtml(when)}"></td>
        <td><input type="text" placeholder="Any complications?" value="${escapeHtml(complications)}"></td>
        <td><button type="button" onclick="removeTableRow(this)" class="btn-ghost" style="padding: 0.25rem;">×</button></td>
    `;
    tbody.appendChild(row);
}

function removeTableRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    if (tbody.children.length > 1) {
        row.remove();
    } else {
        // Clear the last row instead of removing it
        row.querySelectorAll('input').forEach(input => input.value = '');
    }
}

/**
 * Reset session form
 */
function resetSessionForm() {
    const form = document.getElementById('sessionForm');
    if (form) form.reset();
    
    const sessionId = document.getElementById('sessionId');
    if (sessionId) sessionId.value = '';
    
    const sessionDate = document.getElementById('sessionDate');
    if (sessionDate) sessionDate.valueAsDate = new Date();

    // Reset all tables to one empty row
    ['complaintsBody', 'medicationsBody', 'healthcareBody', 'therapiesBody', 'injuriesBody', 'operationsBody'].forEach(bodyId => {
        const tbody = document.getElementById(bodyId);
        if (tbody) tbody.innerHTML = '';
    });

    addComplaintRow();
    addMedicationRow();
    addHealthcareRow();
    addTherapyRow();
    addInjuryRow();
    addOperationRow();

    // Clear therapist signature
    clearTherapistSignature();
    
    // Initialize therapist signature canvas if not already done
    if (!window.therapistSignatureInitialized) {
        initTherapistSignatureCanvas();
        window.therapistSignatureInitialized = true;
    }
}

/**
 * Initialize therapist signature canvas
 */
function initTherapistSignatureCanvas() {
    const canvas = document.getElementById('sessionTherapistSignature');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 150;

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
    });
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY;
        
        // Save signature data
        const input = document.getElementById('sessionTherapistSignatureData');
        if (input) input.value = canvas.toDataURL('image/png');
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            const input = document.getElementById('sessionTherapistSignatureData');
            if (input) input.value = canvas.toDataURL('image/png');
        }
    }
}

/**
 * Clear therapist signature
 */
function clearTherapistSignature() {
    const canvas = document.getElementById('sessionTherapistSignature');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const input = document.getElementById('sessionTherapistSignatureData');
    if (input) input.value = '';
}

/**
 * Load signature image to canvas
 */
function loadSignatureToCanvas(canvasId, signatureData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !signatureData) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
    };
    img.src = signatureData;
}

/**
 * View session details
 */
async function viewSession(id) {
    currentSessionId = id;

    try {
        const { data: session, error: sessionError } = await SessionService.getById(id);

        if (sessionError || !session) {
            throw sessionError || new Error('Session not found');
        }

        const { data: client, error: clientError } = await ClientService.getById(session.client_id);

        if (clientError) {
            console.error('Error loading client:', clientError);
        }

        const clientName = client?.name || 'Unknown Client';

        document.getElementById('sessionDetailTitle').textContent = `Session - ${formatDate(session.date)}`;

        let html = `
            <div class="detail-grid">
                <div class="detail-card">
                    <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600;">Session Information</h3>
                    <div class="detail-row">
                        <div class="detail-label">Client</div>
                        <div class="detail-value">${escapeHtml(clientName)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date</div>
                        <div class="detail-value">${formatDate(session.date)}</div>
                    </div>
                    ${session.practitioner ? `
                    <div class="detail-row">
                        <div class="detail-label">Practitioner</div>
                        <div class="detail-value">${escapeHtml(session.practitioner)}</div>
                    </div>` : ''}
                    <div class="detail-row">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">
                            <span class="badge ${session.status === 'pending' ? 'badge-secondary' : 'badge-primary'}">
                                ${session.status === 'pending' ? 'Pending' : 'Approved'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Display complaints
        if (session.complaints && session.complaints.length > 0 && session.complaints.some(c => c.complaint)) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Chief Complaints</h3>
                    <div class="detail-card">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Complaint</th>
                                    <th>Since</th>
                                    <th>Causes</th>
                                    <th>Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${session.complaints.filter(c => c.complaint).map(c => `
                                    <tr>
                                        <td>${escapeHtml(c.complaint || '-')}</td>
                                        <td>${escapeHtml(c.since || '-')}</td>
                                        <td>${escapeHtml(c.causes || '-')}</td>
                                        <td>${escapeHtml(c.severity || '-')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Display Pain & Injury Details
        if (session.aggravates || session.swelling || session.injury_site) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Pain & Injury Details</h3>
                    <div class="detail-card">
                        ${session.aggravates ? `
                        <div class="detail-row">
                            <div class="detail-label">What aggravates pain?</div>
                            <div class="detail-value">${escapeHtml(session.aggravates)}</div>
                        </div>` : ''}
                        ${session.swelling ? `
                        <div class="detail-row">
                            <div class="detail-label">Are you experiencing any swelling? Where?</div>
                            <div class="detail-value">${escapeHtml(session.swelling)}</div>
                        </div>` : ''}
                        ${session.injury_site ? `
                        <div class="detail-row">
                            <div class="detail-label">Indicate injury site and areas of pain</div>
                            <div class="detail-value">${escapeHtml(session.injury_site)}</div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }

        // Display Medications
        if (session.medications && session.medications.length > 0 && session.medications.some(m => m.medication)) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Medications</h3>
                    <div class="detail-card">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Medication</th>
                                    <th>Since?</th>
                                    <th>Adverse Effects?</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${session.medications.filter(m => m.medication).map(m => `
                                    <tr>
                                        <td>${escapeHtml(m.medication || '-')}</td>
                                        <td>${escapeHtml(m.since || '-')}</td>
                                        <td>${escapeHtml(m.effects || '-')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Display Healthcare Providers
        if (session.healthcare && session.healthcare.length > 0 && session.healthcare.some(h => h.provider)) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Current Healthcare</h3>
                    <div class="detail-card">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Healthcare Provider</th>
                                    <th>For (Condition)</th>
                                    <th>Treatment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${session.healthcare.filter(h => h.provider).map(h => `
                                    <tr>
                                        <td>${escapeHtml(h.provider || '-')}</td>
                                        <td>${escapeHtml(h.condition || '-')}</td>
                                        <td>${escapeHtml(h.treatment || '-')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Display Therapies
        if (session.therapies && session.therapies.length > 0 && session.therapies.some(t => t.therapy)) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Current Therapy/Treatment</h3>
                    <div class="detail-card">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Therapy Type</th>
                                    <th>Since?</th>
                                    <th>Results?</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${session.therapies.filter(t => t.therapy).map(t => `
                                    <tr>
                                        <td>${escapeHtml(t.therapy || '-')}</td>
                                        <td>${escapeHtml(t.since || '-')}</td>
                                        <td>${escapeHtml(t.results || '-')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Display Medical History
        if (session.implants || (session.injuries && session.injuries.length > 0) || (session.operations && session.operations.length > 0)) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Medical History</h3>
                    <div class="detail-card">
                        ${session.implants ? `
                        <div class="detail-row">
                            <div class="detail-label">Do you have a pacemaker or any implants including orthotics?</div>
                            <div class="detail-value">${escapeHtml(session.implants)}</div>
                        </div>` : ''}
                    </div>
                </div>
            `;

            // Display Injuries
            if (session.injuries && session.injuries.length > 0 && session.injuries.some(i => i.injury)) {
                html += `
                    <div class="form-section">
                        <h3 class="section-header">Other Injuries/Conditions</h3>
                        <div class="detail-card">
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Injury or Condition</th>
                                        <th>Since?</th>
                                        <th>Complications?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${session.injuries.filter(i => i.injury).map(i => `
                                        <tr>
                                            <td>${escapeHtml(i.injury || '-')}</td>
                                            <td>${escapeHtml(i.since || '-')}</td>
                                            <td>${escapeHtml(i.complications || '-')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            // Display Operations
            if (session.operations && session.operations.length > 0 && session.operations.some(o => o.operation)) {
                html += `
                    <div class="form-section">
                        <h3 class="section-header">Operations</h3>
                        <div class="detail-card">
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Operation Type</th>
                                        <th>When?</th>
                                        <th>Complications?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${session.operations.filter(o => o.operation).map(o => `
                                        <tr>
                                            <td>${escapeHtml(o.operation || '-')}</td>
                                            <td>${escapeHtml(o.when || '-')}</td>
                                            <td>${escapeHtml(o.complications || '-')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        }

        // Display Lifestyle
        if (session.exercise || session.bowen_history || session.additional) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Lifestyle & Additional Information</h3>
                    <div class="detail-card">
                        ${session.exercise ? `
                        <div class="detail-row">
                            <div class="detail-label">What exercise(s) do you do, how much, and how often?</div>
                            <div class="detail-value">${escapeHtml(session.exercise)}</div>
                        </div>` : ''}
                        ${session.bowen_history ? `
                        <div class="detail-row">
                            <div class="detail-label">Have you been treated with Bowen before?</div>
                            <div class="detail-value">${escapeHtml(session.bowen_history)}</div>
                        </div>` : ''}
                        ${session.additional ? `
                        <div class="detail-row">
                            <div class="detail-label">Is there anything you would like to add?</div>
                            <div class="detail-value">${escapeHtml(session.additional)}</div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }

        // Display Therapist Notes (if any)
        if (session.notes) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Therapist Notes</h3>
                    <div class="detail-card">
                        <div class="detail-row">
                            <div class="detail-value">${escapeHtml(session.notes)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Display Signatures
        if (session.client_signature || session.therapist_signature) {
            html += `
                <div class="form-section">
                    <h3 class="section-header">Signatures</h3>
                    <div class="detail-card">
                        ${session.client_signature ? `
                        <div style="margin-bottom: 2rem;">
                            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Client Signature</div>
                            <div style="border: 1px solid var(--border); border-radius: 8px; padding: 1rem; background: white;">
                                <img src="${session.client_signature}" alt="Client Signature" style="max-width: 100%; height: auto; display: block;">
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">Signed: ${formatDateTime(session.created_at)}</div>
                        </div>` : ''}
                        ${session.therapist_signature ? `
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Therapist Signature</div>
                            <div style="border: 1px solid var(--border); border-radius: 8px; padding: 1rem; background: white;">
                                <img src="${session.therapist_signature}" alt="Therapist Signature" style="max-width: 100%; height: auto; display: block;">
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">Signed: ${formatDateTime(session.updated_at)}</div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }

        // Add approve/reject buttons for pending sessions
        if (session.status === 'pending') {
            html += `
                <div class="form-section" style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid var(--border);">
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="approveSession('${session.id}')" style="padding: 0.75rem 2rem;">
                            ✓ Approve Session
                        </button>
                        <button class="btn btn-danger" onclick="deletePendingSession('${session.id}')" style="padding: 0.75rem 2rem;">
                            ✕ Reject & Delete
                        </button>
                    </div>
                </div>
            `;
        }

        const sessionDetailContent = document.getElementById('sessionDetailContent');
        if (sessionDetailContent) {
            sessionDetailContent.innerHTML = html;
        }

        showView('sessionDetail');
    } catch (error) {
        console.error('Error loading session:', error);
        showToast('Failed to load session details', 'error');
    }
}

/**
 * Display sessions for a client
 */
function displaySessions(clientSessions) {
    const sessionList = document.getElementById('sessionList');
    if (!sessionList) return;

    if (clientSessions.length === 0) {
        sessionList.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <div class="empty-icon" style="font-size: 3rem;">📋</div>
                <h3>No approved sessions yet</h3>
                <p>Approved sessions will appear here</p>
            </div>
        `;
        return;
    }

    sessionList.innerHTML = clientSessions.map(session => `
        <div class="session-card" onclick="viewSession('${session.id}')">
            <div class="session-header">
                <div>
                    <div class="session-date">Session: ${formatDate(session.date)}</div>
                    ${session.practitioner ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">Practitioner: ${escapeHtml(session.practitioner)}</p>` : ''}
                </div>
                <span class="badge badge-secondary">View Details</span>
            </div>
            ${session.complaints && session.complaints.length > 0 ? `
                <div class="session-info">
                    <strong>Chief Complaints:</strong>
                    ${session.complaints.filter(c => c.complaint).map(c => escapeHtml(c.complaint)).join(', ')}
                </div>
            ` : ''}
            ${session.notes ? `
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: #fffbeb; border-radius: 6px; font-size: 0.875rem;">
                    <strong>Notes:</strong> ${escapeHtml(session.notes.substring(0, 150))}${session.notes.length > 150 ? '...' : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Display pending sessions
 */
function displayPendingSessions(pendingSessions) {
    const sessionList = document.getElementById('sessionList');
    if (!sessionList) return;

    let pendingHTML = `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>⏳</span> Pending Client Submissions (${pendingSessions.length})
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
                These intake forms were submitted by the client and are awaiting your review and approval.
            </p>
            <div style="display: grid; gap: 1rem;">
    `;

    pendingSessions.forEach(session => {
        pendingHTML += `
            <div style="background: white; border-radius: 8px; padding: 1rem; border-left: 4px solid #f59e0b;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                            Appointment: ${formatDate(session.date)}
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            Submitted: ${formatDateTime(session.created_at)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); viewSession('${session.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                            👁️ Review
                        </button>
                        <button class="btn btn-primary" onclick="event.stopPropagation(); approveSession('${session.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                            ✓ Approve
                        </button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deletePendingSession('${session.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                            ✕
                        </button>
                    </div>
                </div>
                ${session.complaints && session.complaints.length > 0 && session.complaints.some(c => c.complaint) ? `
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        <strong>Chief Complaints:</strong> ${session.complaints.filter(c => c.complaint).map(c => escapeHtml(c.complaint)).join(', ')}
                    </div>
                ` : ''}
            </div>
        `;
    });

    pendingHTML += `
            </div>
        </div>
    `;

    const container = sessionList.parentElement;
    const existingPending = container.querySelector('.pending-sessions-container');
    if (existingPending) {
        existingPending.remove();
    }

    const pendingDiv = document.createElement('div');
    pendingDiv.className = 'pending-sessions-container';
    pendingDiv.innerHTML = pendingHTML;
    const sectionHeader = container.querySelector('.section-header');
    if (sectionHeader && sectionHeader.nextSibling) {
        container.insertBefore(pendingDiv, sectionHeader.nextSibling);
    } else {
        container.insertBefore(pendingDiv, sessionList);
    }
}

/**
 * Edit current session
 */
async function editCurrentSession() {
    if (!currentSessionId) return;

    try {
        const { data: session, error } = await SessionService.getById(currentSessionId);

        if (error || !session) {
            throw error || new Error('Session not found');
        }

        // Load client name
        const { data: client } = await ClientService.getById(session.client_id);
        const clientName = client?.name || 'Unknown';

        document.getElementById('sessionFormTitle').textContent = `Edit Session for ${clientName}`;
        document.getElementById('sessionId').value = session.id;
        document.getElementById('sessionClientId').value = session.client_id;
        document.getElementById('sessionDate').value = session.date;
        document.getElementById('sessionPractitioner').value = session.practitioner || '';
        document.getElementById('sessionAggravates').value = session.aggravates || '';
        document.getElementById('sessionSwelling').value = session.swelling || '';
        document.getElementById('sessionInjurySite').value = session.injury_site || '';
        document.getElementById('sessionImplants').value = session.implants || '';
        document.getElementById('sessionExercise').value = session.exercise || '';
        document.getElementById('sessionBowenHistory').value = session.bowen_history || '';
        document.getElementById('sessionAdditional').value = session.additional || '';
        document.getElementById('sessionNotes').value = session.notes || '';
        
        // Load therapist signature if exists
        if (session.therapist_signature) {
            const input = document.getElementById('sessionTherapistSignatureData');
            if (input) input.value = session.therapist_signature;
        } else {
            clearTherapistSignature();
        }
        
        // Initialize therapist signature canvas if not already done
        if (!window.therapistSignatureInitialized) {
            initTherapistSignatureCanvas();
            window.therapistSignatureInitialized = true;
        }
        
        // Load signature to canvas after a brief delay to ensure canvas is ready
        if (session.therapist_signature) {
            setTimeout(() => {
                loadSignatureToCanvas('sessionTherapistSignature', session.therapist_signature);
            }, 100);
        }
        
        // Set table data
        setTableData('complaintsTable', session.complaints || [], 'complaintsBody');
        setTableData('medicationsTable', session.medications || [], 'medicationsBody');
        setTableData('healthcareTable', session.healthcare || [], 'healthcareBody');
        setTableData('therapiesTable', session.therapies || [], 'therapiesBody');
        setTableData('injuriesTable', session.injuries || [], 'injuriesBody');
        setTableData('operationsTable', session.operations || [], 'operationsBody');

        showView('newSession');
    } catch (error) {
        console.error('Error loading session:', error);
        showToast('Failed to load session', 'error');
    }
}

/**
 * Delete current session
 */
async function deleteCurrentSession() {
    if (!currentSessionId) return;

    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    try {
        const { data: session } = await SessionService.getById(currentSessionId);
        const clientId = session?.client_id;

        const { error } = await SessionService.delete(currentSessionId);

        if (error) {
            throw error;
        }

        showToast('Session deleted successfully!', 'success');
        if (clientId) {
            await viewClient(clientId);
        } else {
            showView('clients');
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        showToast('Failed to delete session', 'error');
    }
}

/**
 * Approve a pending session
 */
async function approveSession(sessionId) {
    try {
        const { error } = await SessionService.updateStatus(sessionId, 'approved');

        if (error) {
            throw error;
        }

        showToast('Session approved!', 'success');
        
        // Refresh the client view to update pending sessions list
        if (currentClientId) {
            await viewClient(currentClientId);
        } else {
            // If we're viewing the session directly, go back to client view
            const { data: session } = await SessionService.getById(sessionId);
            if (session && session.client_id) {
                await viewClient(session.client_id);
            }
        }
    } catch (error) {
        console.error('Error approving session:', error);
        showToast('Failed to approve session', 'error');
    }
}

/**
 * Delete a pending session
 */
async function deletePendingSession(sessionId) {
    if (!confirm('Are you sure you want to delete this pending session? This action cannot be undone.')) {
        return;
    }

    try {
        // Get session info before deleting to know which client to refresh
        const { data: session } = await SessionService.getById(sessionId);
        const clientId = session?.client_id || currentClientId;

        const { error } = await SessionService.delete(sessionId);

        if (error) {
            throw error;
        }

        showToast('Pending session deleted!', 'success');
        
        // Refresh the client view to update pending sessions list
        if (clientId) {
            await viewClient(clientId);
        }
    } catch (error) {
        console.error('Error deleting pending session:', error);
        showToast('Failed to delete pending session', 'error');
    }
}

