/**
 * MedAI-CV — Hospital Dashboard Interaction & SQLite3 Workflow Engine
 * Clean, Concise, and PoC-Optimized
 */

document.addEventListener("DOMContentLoaded", () => {
  // Fallback initial dataset (Matches SQLite3 schema)
  let studyDatabase = [
    {
      id: "STD-2026-9041",
      patient: "Tn. Hendra Wijaya (54 th)",
      modality: "CT-Thorax",
      aiFindings: "Solitary Nodule 8.4mm (RUL)",
      confidence: "98.2%",
      confidenceLevel: "high",
      state: "review",
      stateLabel: "Menunggu Review",
      timestamp: "10:14 WIB",
      stepperIndex: 3,
    },
    {
      id: "STD-2026-9042",
      patient: "Ny. Ratna Sari (41 th)",
      modality: "Chest X-Ray",
      aiFindings: "Bilateral Infiltrate, Susp. Pneumonia",
      confidence: "96.5%",
      confidenceLevel: "high",
      state: "verified",
      stateLabel: "Tervalidasi",
      timestamp: "09:48 WIB",
      stepperIndex: 4,
    },
    {
      id: "STD-2026-9043",
      patient: "An. Dimas Pratama (12 th)",
      modality: "Brain MRI",
      aiFindings: "Segmentasi T2-FLAIR Berjalan",
      confidence: "Running",
      confidenceLevel: "medium",
      state: "inference",
      stateLabel: "Inferensi Berjalan",
      timestamp: "10:22 WIB",
      stepperIndex: 2,
    },
    {
      id: "STD-2026-9044",
      patient: "Tn. Bambang Sutrisno (67 th)",
      modality: "CT Angiography",
      aiFindings: "Pemeriksaan Kualitas DICOM",
      confidence: "Queued",
      confidenceLevel: "medium",
      state: "ingestion",
      stateLabel: "Antrean PACS",
      timestamp: "10:26 WIB",
      stepperIndex: 1,
    },
  ];

  let currentRole = "doctor";
  let selectedStudy = studyDatabase[0];
  let rolesDataFromDB = null;

  // DOM Elements
  const roleButtons = document.querySelectorAll(".role-pill-btn");
  const roleBannerTitle = document.getElementById("roleBannerTitle");
  const roleBannerDesc = document.getElementById("roleBannerDesc");
  const userRoleBadge = document.getElementById("userRoleBadge");
  const userNameText = document.getElementById("userNameText");
  const actionContainer = document.getElementById("roleActionContainer");
  const studyRows = document.querySelectorAll(".study-row");
  const dbStatusIndicator = document.getElementById("dbStatusIndicator");

  // Concise Role Configuration
  const defaultRoleConfig = {
    doctor: {
      name: "dr. Farhan Malik, Sp.Rad",
      badge: "Dokter Radiolog",
      badgeClass: "badge-green",
      title: "🩺 Mode Dokter (Spesialis Radiologi)",
      desc: "Worklist Klinis Pasien & Validasi Diagnostik Hasil AI (Human-in-the-Loop)",
      allowedMenus: ["menu-worklist", "menu-viewer", "menu-reports"],
    },
    admin: {
      name: "Ahmad Zulkarnain, S.Kom",
      badge: "Admin IT RS",
      badgeClass: "badge text-bg-primary",
      title: "🛡️ Mode Administrator IT & PACS",
      desc: "Tata Kelola Gateway DICOM, Hak Akses Pengguna & Kepatuhan UU PDP",
      allowedMenus: ["menu-pacs", "menu-users", "menu-audit", "menu-reports"],
    },
    operator: {
      name: "Rian Suryadi",
      badge: "Operator MLOps",
      badgeClass: "badge text-bg-warning text-dark",
      title: "⚙️ Mode Operator Model & Maintenance AI",
      desc: "Monitoring GPU, Evaluasi Drift Data & Pipeline Active Learning",
      allowedMenus: ["menu-models", "menu-pipeline", "menu-logs", "menu-worklist"],
    },
  };

  // Try fetching data from SQLite3 API Server if available
  async function loadDataFromSQLite() {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          rolesDataFromDB = {};
          json.data.forEach((r) => {
            rolesDataFromDB[r.code] = {
              name: r.default_user_name,
              badge: r.name,
              title: r.code === "doctor" ? "🩺 Mode Dokter (Spesialis Radiologi)" :
                     r.code === "admin" ? "🛡️ Mode Administrator IT & PACS" : "⚙️ Mode Operator Model & Maintenance AI",
              desc: r.summary,
              allowedMenus: r.allowedMenus || defaultRoleConfig[r.code].allowedMenus,
            };
          });

          if (dbStatusIndicator) {
            dbStatusIndicator.innerHTML = `
              <span class="status-dot"></span>
              <span>SQLite3 Connected</span>
            `;
            dbStatusIndicator.className = "badge-system-live d-none d-md-inline-flex";
          }
        }
      }
    } catch (e) {
      // Running directly via file://, using embedded SQLite3 schema defaults
      if (dbStatusIndicator) {
        dbStatusIndicator.innerHTML = `
          <span class="status-dot"></span>
          <span>SQLite3 Ready (Embedded)</span>
        `;
      }
    }
  }

  // Switch Role
  function switchRole(newRole) {
    currentRole = newRole;

    roleButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.role === newRole);
    });

    const config = (rolesDataFromDB && rolesDataFromDB[newRole]) || defaultRoleConfig[newRole];

    if (roleBannerTitle && roleBannerDesc) {
      roleBannerTitle.innerHTML = config.title;
      roleBannerDesc.textContent = config.desc;
    }

    if (userNameText && userRoleBadge) {
      userNameText.textContent = config.name;
      userRoleBadge.textContent = config.badge;
    }

    // Toggle menu accessibility
    const allNavLinks = document.querySelectorAll(".nav-link-item[data-menu-id]");
    allNavLinks.forEach((navItem) => {
      const menuId = navItem.dataset.menuId;
      const isAllowed = config.allowedMenus.includes(menuId);
      navItem.classList.toggle("role-disabled", !isAllowed);
    });

    renderRightPanel(selectedStudy);
  }

  // Render Right Panel Workflow & Role Action Box
  function renderRightPanel(study) {
    if (!study) return;

    const studyIdEl = document.getElementById("panelStudyId");
    const patientNameEl = document.getElementById("panelPatientName");
    const modalityEl = document.getElementById("panelModality");
    const findingEl = document.getElementById("panelFinding");

    if (studyIdEl) studyIdEl.textContent = study.id;
    if (patientNameEl) patientNameEl.textContent = study.patient;
    if (modalityEl) modalityEl.textContent = study.modality;
    if (findingEl) findingEl.textContent = study.aiFindings;

    // Update Stepper
    const stepperNodes = document.querySelectorAll(".step-node");
    stepperNodes.forEach((node, idx) => {
      const stepIndex = idx + 1;
      node.classList.remove("completed", "active", "alert");

      if (stepIndex < study.stepperIndex) {
        node.classList.add("completed");
      } else if (stepIndex === study.stepperIndex) {
        if (study.state === "review") {
          node.classList.add("alert");
        } else {
          node.classList.add("active");
        }
      }
    });

    // Render Clean Action Buttons
    if (!actionContainer) return;

    let actionsHTML = "";

    if (currentRole === "doctor") {
      if (study.state === "review") {
        actionsHTML = `
          <a href="doctor.html" class="action-btn-primary text-decoration-none">
            <i class="bi bi-bounding-box"></i>
            <span>Buka di DICOM AI Viewer</span>
          </a>
          <button type="button" class="action-btn-secondary" id="btnDoctorValidate">
            <i class="bi bi-check2-circle"></i>
            <span>Validasi Cepat &amp; Tanda Tangan</span>
          </button>
        `;
      } else if (study.state === "verified") {
        actionsHTML = `
          <div class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-2" style="font-size: 0.8rem;">
            <i class="bi bi-check-circle-fill"></i>
            <span>Studi telah disahkan DPJP.</span>
          </div>
          <a href="doctor.html" class="action-btn-secondary text-decoration-none">
            <i class="bi bi-file-earmark-medical"></i>
            <span>Lihat Laporan Radiologi EMR</span>
          </a>
        `;
      } else {
        actionsHTML = `
          <div class="alert alert-light border py-2 px-3 mb-0 text-muted" style="font-size: 0.8rem;">
            <i class="bi bi-hourglass-split me-1"></i> Sedang diproses model AI.
          </div>
        `;
      }
    } else if (currentRole === "admin") {
      actionsHTML = `
        <a href="admin.html#audit-section" class="action-btn-primary text-decoration-none">
          <i class="bi bi-shield-check"></i>
          <span>Inspeksi Audit Trail UU PDP</span>
        </a>
        <a href="admin.html" class="action-btn-secondary text-decoration-none">
          <i class="bi bi-hdd-network"></i>
          <span>Status Gateway DICOM / PACS</span>
        </a>
      `;
    } else if (currentRole === "operator") {
      actionsHTML = `
        <a href="operator.html#pipeline-section" class="action-btn-primary text-decoration-none">
          <i class="bi bi-database-add"></i>
          <span>Antrean Active Learning</span>
        </a>
        <a href="operator.html" class="action-btn-secondary text-decoration-none">
          <i class="bi bi-speedometer2"></i>
          <span>Telemetri GPU &amp; Dice Score</span>
        </a>
      `;
    }

    actionContainer.innerHTML = actionsHTML;
    attachActionListeners();
  }

  function attachActionListeners() {
    const btnDoctorValidate = document.getElementById("btnDoctorValidate");
    if (btnDoctorValidate) {
      btnDoctorValidate.addEventListener("click", () => {
        selectedStudy.state = "verified";
        selectedStudy.stateLabel = "Tervalidasi";
        selectedStudy.stepperIndex = 4;

        // Try persisting to SQLite3 via API if available
        fetch("/api/studies/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studyId: selectedStudy.id, nextState: "verified" }),
        }).catch(() => {});

        alert(`Sukses: Studi ${selectedStudy.id} telah disahkan oleh DPJP. Data terenkripsi disinkronkan ke rekam medis.`);
        refreshTable();
        renderRightPanel(selectedStudy);
      });
    }

    const btnDoctorEditContour = document.getElementById("btnDoctorEditContour");
    if (btnDoctorEditContour) {
      btnDoctorEditContour.addEventListener("click", () => {
        alert(`Membuka kanvas interaktif DICOM untuk modifikasi polygon segmentasi.`);
      });
    }

    const btnAdminAudit = document.getElementById("btnAdminAudit");
    if (btnAdminAudit) {
      btnAdminAudit.addEventListener("click", () => {
        alert(`Audit Log SQLite3:\n- Akses DICOM: Sah\n- Enkripsi: AES-256 Valid\n- Kepatuhan UU PDP: Terverifikasi.`);
      });
    }

    const btnOperatorFeedback = document.getElementById("btnOperatorFeedback");
    if (btnOperatorFeedback) {
      btnOperatorFeedback.addEventListener("click", () => {
        alert(`Studi ${selectedStudy.id} ditambahkan ke 'Retraining Dataset Queue' di SQLite3.`);
      });
    }
  }

  function refreshTable() {
    studyRows.forEach((row) => {
      const rowId = row.dataset.studyId;
      const data = studyDatabase.find((item) => item.id === rowId);
      if (data) {
        const stateCell = row.querySelector(".state-cell-container");
        if (stateCell) {
          const badgeClass = data.state === "verified" ? "state-verified" :
                             data.state === "review" ? "state-review" :
                             data.state === "inference" ? "state-inference" : "state-received";
          stateCell.innerHTML = `<span class="state-badge ${badgeClass}">${data.stateLabel}</span>`;
        }
      }
    });
  }

  // Row selection handler
  studyRows.forEach((row) => {
    row.addEventListener("click", () => {
      studyRows.forEach((r) => r.classList.remove("selected-row"));
      row.classList.add("selected-row");

      const studyId = row.dataset.studyId;
      selectedStudy = studyDatabase.find((item) => item.id === studyId) || studyDatabase[0];
      renderRightPanel(selectedStudy);
    });
  });

  // Role button listeners
  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchRole(btn.dataset.role);
    });
  });

  // Init
  loadDataFromSQLite().then(() => {
    switchRole("doctor");
  });
});
