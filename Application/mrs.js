let allRequests = [];
let allEmployee = [];
let deleteRequestId = null;
let deleteUserId = null;
let currentRequestId = null;
let allTechnicians = [];
let currentEmployeeId = null;
let editEmployeeModal;
let requestidforstates = null;
let currentNotesRequestId = null;

// ─── Modal Helpers (Bootstrap version) ───────────────────────────────────────
function showModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex", "show");
  }
}

function hideModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex", "show");
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function Login() {
  let username = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  try {
    const response = await fetch("http://localhost:8080/api/Auth/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) return;

    const data = await response.json();
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("role", data.roleName);

    if (data.roleName === "Admin") window.location.href = "DashAdmin.html";
    else if (data.roleName === "Employee")
      window.location.href = "DashEmployee.html";
    else window.location.href = "DashTechnician.html";
  } catch (error) {
    console.log("Error:", error);
  }
}

function openAddNotesModal(id) {
  currentNotesRequestId = id;
  document.getElementById("technicianNotesInput").value = "";
  document.getElementById("addNotesModal").style.display = "flex";
}

function closeAddNotesModal() {
  document.getElementById("addNotesModal").style.display = "none";
}

async function submitAddNotes() {
  const notes = document.getElementById("technicianNotesInput").value.trim();

  if (!notes) {
    alert("Please write some notes first!");
    return;
  }
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `http://localhost:8080/api/Request/Add_Technician_Notes?requestId=${currentNotesRequestId}&notes=${encodeURIComponent(notes)}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      closeAddNotesModal();
    } else {
      alert("Something went wrong!");
    }
  } catch (err) {
    console.error(err);
  }
}
// ─── Fetch Requests ───────────────────────────────────────────────────────────
async function GetRequestsCurrantTechnicianOrEmployee() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  try {
    const response = await fetch(
      "http://localhost:8080/api/Request/Get_Requests_Currant_Technician_Or_Employee",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    allRequests = data;
    if (role === "Technician") {
      renderTableForTc(allRequests);
    } else {
      renderTable(allRequests);
    }
  } catch (error) {
    console.log(error);
  }
}

async function GetAllEmployee() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "http://localhost:8080/api/User/Get_Users_Employees",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    allEmployee = data;
    renderTableUser(allEmployee);
  } catch (error) {
    console.log(error);
  }
}
async function GetAllTechnicians() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "http://localhost:8080/api/User/Get_Users_Technicians",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    allTechnicians = data;
    renderTableTechnicians(allTechnicians);
  } catch (error) {
    console.log(error);
  }
}

async function GetAllRequests() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      "http://localhost:8080/api/Request/Get_All_Requests",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    allRequests = data;
    renderTable(allRequests);
  } catch (error) {
    console.log(error);
  }
}
async function GetAllTitleRequests() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:8080/api/Request/Get_All_Requests",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    const select = document.getElementById("requestSelect");

    // تنظيف القديم
    select.innerHTML = "";

    data.forEach((element) => {
      if (element.status == 1) {
        const option = document.createElement("option");

        option.value = element.id;
        option.textContent = `${element.title} - ${element.categoryName}`;

        select.appendChild(option);
      }
    });
  } catch (error) {
    console.log(error);
  }
}
async function GetAllNameTechnicians() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:8080/api/User/Get_Users_Technicians",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    const select = document.getElementById("technicianSelect");

    // تنظيف القديم
    select.innerHTML = "";

    data.forEach((element) => {
      const option = document.createElement("option");

      option.value = element.id;
      option.textContent = element.name;

      select.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

// ─── Render Table ─────────────────────────────────────────────────────────────
function renderTable(data) {
  const role = localStorage.getItem("role");
  const tbody = document.getElementById(
    role === "Admin" ? "bodyAdmin" : "body",
  );
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach((element) => {
    const ui = getStatusUI(element.statusName);

    tbody.innerHTML += `
      <tr
        style="transition: background 0.2s; cursor:default;"
        onmouseover="this.style.backgroundColor='var(--surface-container-low)'"
        onmouseout="this.style.backgroundColor=''"
      >
        <td style="padding:14px 24px; color:var(--on-surface); font-weight:500; vertical-align:middle;">
        ${element.id}
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="font-weight:600; color:var(--on-surface);">${element.title}</div>
          <div style="font-size:0.8rem; color:var(--on-surface-variant); margin-top:2px;">${element.requestDetail.location}</div>
      </td>

        <td style="padding:14px 24px; color:var(--on-surface); vertical-align:middle;">
        ${element.categoryName}
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <span class="status-badge ${ui.cls}"
                onmouseover="this.style.transform='scale(1.07)'"
              onmouseout="this.style.transform='scale(1)'">
            <span class="material-symbols-outlined" style="font-size:16px; line-height:1;">${ui.icon}</span>
          ${element.statusName}
        </span>
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <span style="font-weight:500; color:var(--on-surface);">${element.technicianName}</span>
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">

          <button
              onclick="openDetails(); getDetails('${element.id}')"
              class="action-btn primary-action"
            title="Details"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">visibility</span>
          </button>

          <button
              onclick="openEditModal(); getDetails('${element.id}')"
              class="action-btn primary-action"
            title="Edit"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">edit</span>
          </button>

          <button
            onclick="openDeleteModal('${element.id}')"
              class="action-btn danger-action"
            title="Delete"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">delete</span>
          </button>

          <button
            onclick="openHistoryModal('${element.id}')"
              class="action-btn ghost-action"
            title="History"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">history</span>
          </button>

        </div>
      </td>
    </tr>
  `;
  });
}
function renderTableForTc(data) {
  const tbody = document.getElementById("bodyTc");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach((element) => {
    const ui = getStatusUI(element.statusName);

    tbody.innerHTML += `
      <tr
        style="transition: background 0.2s; cursor:default;"
        onmouseover="this.style.backgroundColor='var(--surface-container-low)'"
        onmouseout="this.style.backgroundColor=''"
      >
        <td style="padding:14px 24px; color:var(--on-surface); font-weight:500; vertical-align:middle;">
        ${element.id}
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="font-weight:600; color:var(--on-surface);">${element.title}</div>
          <div style="font-size:0.8rem; color:var(--on-surface-variant); margin-top:2px;">${element.requestDetail.location}</div>
      </td>

        <td style="padding:14px 24px; color:var(--on-surface); vertical-align:middle;">
        ${element.categoryName}
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <span class="status-badge ${ui.cls}"
                onmouseover="this.style.transform='scale(1.07)'"
              onmouseout="this.style.transform='scale(1)'">
            <span class="material-symbols-outlined" style="font-size:16px; line-height:1;">${ui.icon}</span>
          ${element.statusName}
        </span>
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <span style="font-weight:500; color:var(--on-surface);">${element.employeeName}</span>
      </td>

        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">

          <button
              onclick="openDetails(); getDetails('${element.id}')"
              class="action-btn primary-action"
            title="Details"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">visibility</span>
          </button>

          <button
              onclick="openEditStatusModal('${element.id}')"
              class="action-btn primary-action"
            title="Edit"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">edit</span>
          </button>

           <button
            onclick="openAddNotesModal('${element.id}')"
              class="action-btn ghost-action"
            title="History"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">add</span>
          </button>

          <button
            onclick="openHistoryModal('${element.id}')"
              class="action-btn ghost-action"
            title="History"
          >
              <span class="material-symbols-outlined" style="font-size:19px;">history</span>
          </button>

        </div>
      </td>
    </tr>
  `;
  });
}
document
  .getElementById("editStatusForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const statusMap = {
      New: 1,
      Assigned: 2,
      InProgress: 3,
      Resolved: 4,
      Done: 5,
    };

    const selectedStatus = document.getElementById("statusSelect").value;
    const comment = document.getElementById("statusComment").value;

    const body = {
      newStatus: statusMap[selectedStatus],
      comment: comment || null,
    };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/Request/Update_Status?id=${requestidforstates}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (response.ok) {
        closeEditStatusModal();
        GetRequestsCurrantTechnicianOrEmployee();
      } else {
        alert("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
    }
  });

// ─── Render Users Table ───────────────────────────────────────────────────────
function renderTableUser(data) {
  const tbody = document.getElementById("tableUser");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach((element) => {
    tbody.innerHTML += `
     <tr
        style="transition: background 0.2s;"
        onmouseover="this.style.backgroundColor='var(--surface-container-low)'"
        onmouseout="this.style.backgroundColor=''"
                  >
        <td style="padding:14px 24px; font-weight:500; color:var(--on-surface); vertical-align:middle;">${element.id}</td>
        <td style="padding:14px 24px; font-weight:600; color:var(--on-surface); vertical-align:middle;">${element.name}</td>
        <td style="padding:14px 24px; color:var(--on-surface-variant); vertical-align:middle;">${element.email}</td>
        <td style="padding:14px 24px; color:var(--on-surface-variant); vertical-align:middle;">${element.phoneNumber}</td>
        <td style="padding:14px 24px; color:var(--on-surface); vertical-align:middle;">${element.location}</td>
        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="display:flex; align-items:center; justify-content:center;">
            <button onclick="openDeleteEmployee('${element.id}')" class="action-btn danger-action" title="Delete">
              <span class="material-symbols-outlined" style="font-size:19px;">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
    `;
  });
}
// ─── Render Technicians Table ───────────────────────────────────────────────────────
function renderTableTechnicians(data) {
  const tbody = document.getElementById("tableTechnician");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach((element) => {
    const categoriesHTML = element.categories
      .map(
        (cat) => `
      <span class="badge bg-secondary me-1 mb-1">${cat.name}</span>
    `,
      )
      .join("");

    tbody.innerHTML += `
     <tr
        style="transition: background 0.2s;"
        onmouseover="this.style.backgroundColor='var(--surface-container-low)'"
        onmouseout="this.style.backgroundColor=''"
      >
        <td style="padding:14px 24px; font-weight:500; color:var(--on-surface); vertical-align:middle;">${element.id}</td>
        <td style="padding:14px 24px; font-weight:600; color:var(--on-surface); vertical-align:middle;">${element.name}</td>
        <td style="padding:14px 24px; color:var(--on-surface-variant); vertical-align:middle;">${element.email}</td>
        <td style="padding:14px 24px; color:var(--on-surface-variant); vertical-align:middle;">${element.phoneNumber}</td>
        <td style="padding:14px 24px; color:var(--on-surface); vertical-align:middle;">${element.location}</td>
        <td style="padding:14px 24px; color:var(--on-surface); vertical-align:middle;">
          <button
            class="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="popover"
            data-bs-placement="left"
            data-bs-html="true"
            data-bs-content="${categoriesHTML.replace(/"/g, "&quot;")}"
            data-bs-trigger="hover"
            style="transition: all 0.2s;"
            onmouseover="this.classList.remove('btn-outline-secondary'); this.classList.add('btn-secondary');"
            onmouseout="this.classList.remove('btn-secondary'); this.classList.add('btn-outline-secondary');"
          >
            ${element.categories.length} 
            ${element.categories.length === 1 ? "Category" : "Categories"}
          </button>
        </td>
        <td style="padding:14px 24px; vertical-align:middle;">
          <div style="display:flex; align-items:center; justify-content:center;">
            <button onclick="openDeleteTechnicians('${element.id}')" class="action-btn danger-action" title="Delete">
              <span class="material-symbols-outlined" style="font-size:19px;">delete</span>
            </button>
            <button 
              onclick="openEditEmployee('${element.id}')" 
              class="action-btn primary-action"
              title="Edit"
            >
              <span class="material-symbols-outlined" style="font-size:19px;">edit</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  // ✅ فعّل الـ Popovers
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    new bootstrap.Popover(el, {
      container: "body",
    });
  });
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    new bootstrap.Popover(el);
  });
}
// ─── Filter ───────────────────────────────────────────────────────────────────
function filterByStatus(status) {
  if (status === "All Statuses") {
    renderTable(allRequests);
    return;
  }
  renderTable(allRequests.filter((x) => x.statusName === status));
}

// ─── Stats ────────────────────────────────────────────────────────────────────
async function loadStats() {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "http://localhost:8080/api/Request/dashboard-stats-by-user",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  document.getElementById("Total").innerText = data.totalRequests;
  document.getElementById("New").innerText = data.newRequests;
  document.getElementById("Progress").innerText = data.inProgressRequests;
  document.getElementById("Done").innerText = data.doneRequests;
}

async function loadStatsAdmin() {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "http://localhost:8080/api/Request/dashboard-stats",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  document.getElementById("TotalAdmin").innerText = data.totalRequests;
  document.getElementById("NewAdmin").innerText = data.newRequests;
  document.getElementById("ProgressAdmin").innerText = data.inProgressRequests;
  document.getElementById("DoneAdmin").innerText = data.doneRequests;
}
document
  .getElementById("assignTechnicianForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const requestId = document.getElementById("requestSelect").value;
    const technicianId = document.getElementById("technicianSelect").value;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/Request/Assign_Technician?requestId=${requestId}&technicianId=${technicianId}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        closeAssignTechnicianModal();
        GetAllRequests();
        GetAllTitleRequests();
        GetAllNameTechnicians();
      } else {
        console.log("Failed to assign technician");
      }
    } catch (error) {
      console.log(error);
    }
  });
// ─── Modal Open / Close ───────────────────────────────────────────────────────
function openModal() {
  showModal("requestModal");
}
function closeModal() {
  hideModal("requestModal");
  document.getElementById("categorySelect").selectedIndex = 0;
  document.getElementById("requestForm").reset();
}

function openDetails() {
  showModal("detailsModal");
}
function closeDetails() {
  hideModal("detailsModal");
}

function openEditModal() {
  showModal("editRequestModal");
}
function closeEditModal() {
  hideModal("editRequestModal");
}

function openDeleteModal(id) {
  deleteRequestId = id;
  const role = localStorage.getItem("role");
  showModal(role === "Admin" ? "deleteModalAdmin" : "deleteModal");
}
function closeDeleteModal() {
  const role = localStorage.getItem("role");
  hideModal(role === "Admin" ? "deleteModalAdmin" : "deleteModal");
}

function openDeleteEmployee(id) {
  deleteUserId = id;
  showModal("deleteModalUser");
}
function closeDeleteEmployeel() {
  hideModal("deleteModalUser");
}
function openDeleteTechnicians(id) {
  deleteUserId = id;
  showModal("deleteModalTechnicians");
}
function closeDeleteTechnicians() {
  hideModal("deleteModalTechnicians");
}

document.addEventListener("DOMContentLoaded", () => {
  editEmployeeModal = new bootstrap.Modal(
    document.getElementById("editEmployeeModal"),
  );
});

function openEditEmployee(id) {
  currentEmployeeId = id;

  editEmployeeModal.show();
}

function closeEditEmployeeModal() {
  editEmployeeModal.hide();
}

function openAssignTechnicianModal() {
  const modal = document.getElementById("assignTechnicianModal");
  modal.style.display = "flex";
}

function closeAssignTechnicianModal() {
  const modal = document.getElementById("assignTechnicianModal");
  modal.style.display = "none";
}
function openEditStatusModal(id) {
  requestidforstates = id;
  const modal = document.getElementById("editStatusModal");
  modal.style.display = "flex";
}

function closeEditStatusModal() {
  const modal = document.getElementById("editStatusModal");
  modal.style.display = "none";
}
/// ─── Categories ───────────────────────────────────────────────────────────────
async function loadCategories() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      "http://localhost:8080/api/Catagory/Get_All_Catagory",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();

    // ─── Checkboxes for #category ────────────────────────────
    const categoryContainer = document.getElementById("category");
    if (categoryContainer) {
      categoryContainer.innerHTML = ""; // clear old
      data.forEach((category) => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-check";

        wrapper.innerHTML = `
          <input 
            class="form-check-input" 
            type="checkbox" 
            value="${category.id}" 
            id="cat_${category.id}"
            name="categoryCheckbox"
          />
          <label class="form-check-label" for="cat_${category.id}">
            ${category.name}
          </label>
        `;
        categoryContainer.appendChild(wrapper);
      });
    }

    // ─── Regular selects (باقي الـ dropdowns) ────────────────
    const selectors = [
      "categorySelect",
      "editCategorySelect",
      "categorySelect2",
    ];
    data.forEach((category) => {
      selectors.forEach((selId) => {
        const sel = document.getElementById(selId);
        if (!sel) return;
        const opt = document.createElement("option");
        opt.value = category.id;
        opt.textContent = category.name;
        sel.appendChild(opt);
      });
    });
  } catch (error) {
    console.log("Error loading categories:", error);
  }
}

// ─── Create Request ───────────────────────────────────────────────────────────
document
  .getElementById("requestForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append(
      "title",
      this.querySelector("input[placeholder='Title']").value,
    );
    formData.append("description", this.querySelector("textarea").value);
    formData.append(
      "categoryId",
      document.getElementById("categorySelect").value,
    );
    formData.append(
      "requestDetail.location",
      this.querySelector("input[placeholder='Location']").value,
    );
    formData.append(
      "requestDetail.employeeNotes",
      this.querySelector("input[placeholder='EmployeeNotes']").value,
    );
    const image = this.querySelector("input[type='file']").files[0];
    if (image) formData.append("requestDetail.image", image);

    const res = await fetch(
      "http://localhost:8080/api/Request/Create_Request",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );
    if (res.ok) {
      GetRequestsCurrantTechnicianOrEmployee();
      closeModal();
      loadStats();
    }
  });

// ─── Get Details ──────────────────────────────────────────────────────────────
async function getDetails(id) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/Request/Get_Request_By_Id?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();

    document.getElementById("title").innerText = data.title || "";
    document.getElementById("description").innerText = data.description || "";
    document.getElementById("employee").innerText = data.employeeName || "";
    document.getElementById("technician").innerText = data.technicianName || "";
    document.getElementById("category").innerText = data.categoryName || "";
    document.getElementById("status").innerText = data.statusName || "";
    document.getElementById("createdAt").innerText = data.createdAt || "";
    document.getElementById("location").innerText =
      data.requestDetail.location || "";
    document.getElementById("employeeNotes").innerText =
      data.requestDetail.employeeNotes || "";
    document.getElementById("technicianNotes").innerText =
      data.requestDetail.technicianNotes || "";
    document.getElementById("requestImage").src =
      data.requestDetail.imageUrl || "";

    document.getElementById("editTitle").value = data.title || "";
    document.getElementById("editDescription").value = data.description || "";
    document.getElementById("editLocation").value =
      data.requestDetail.location || "";
    document.getElementById("editEmployeeNotes").value =
      data.requestDetail.employeeNotes || "";
    document.getElementById("editCategorySelect").value = data.categoryId || "";

    currentRequestId = data.id;
  } catch (error) {
    console.log(error);
  }
}

// ─── Edit Request ─────────────────────────────────────────────────────────────
document
  .getElementById("editRequestForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("Title", document.getElementById("editTitle").value);
      formData.append(
        "Description",
        document.getElementById("editDescription").value,
      );
      formData.append(
        "CategoryId",
        document.getElementById("editCategorySelect").value,
      );
      formData.append(
        "RequestDetail.Location",
        document.getElementById("editLocation").value,
      );
      formData.append(
        "RequestDetail.EmployeeNotes",
        document.getElementById("editEmployeeNotes").value,
      );
      const imageFile = document.getElementById("editImage").files[0];
      if (imageFile) formData.append("RequestDetail.Image", imageFile);

      const response = await fetch(
        `http://localhost:8080/api/Request/Update_Request?id=${currentRequestId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (response.ok) {
        GetRequestsCurrantTechnicianOrEmployee();
        GetAllRequests();
        closeEditModal();
      }
    } catch (error) {
      console.log(error);
    }
  });

// ─── Delete Request ───────────────────────────────────────────────────────────
async function confirmDelete() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/Request/Delete_Request?id=${deleteRequestId}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) {
      closeDeleteModal();
      GetRequestsCurrantTechnicianOrEmployee();
      GetAllRequests();
      loadStats();
    } else {
      alert("Failed to delete request");
    }
  } catch (error) {
    console.log(error);
  }
}

async function confirmDeleteUser() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/User/Delete_User?id=${deleteUserId}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) {
      closeDeleteEmployeel();
      GetAllEmployee();
      closeDeleteTechnicians();
      GetAllTechnicians();
    } else alert("Failed to delete user");
  } catch (error) {
    console.log(error);
  }
}

// ─── History Modal ────────────────────────────────────────────────────────────
async function openHistoryModal(requestId) {
  showModal("historyModal");
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/Request/Get_Request_History_By_Id?requestId=${requestId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    const container = document.getElementById("historyContainer");
    container.innerHTML = "";

    const status = data.newStatusName || data.oldStatusName;
    const ui = getStatusUI(status);

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <span class="material-symbols-outlined history-icon ${ui.cls}" style="font-size:2rem;">${ui.icon}</span>
      <div>
            <p style="font-size:0.75rem; color:#aaa; margin:0;">Employee</p>
            <h3 style="font-weight:700; font-size:1.05rem; margin:2px 0 0;">${data.employeeName}</h3>
            <p style="font-size:0.75rem; color:#aaa; margin:12px 0 0;">Changed At</p>
            <p style="font-size:0.875rem; color:#555; margin:2px 0 0;">${data.changedAt}</p>
      </div>
    </div>
        <span class="status-badge ${ui.cls}" style="white-space:nowrap;">
      ${data.oldStatusName} → ${data.newStatusName || "No Change"}
    </span>
  </div>
      <div style="margin-top:16px; padding-left:44px;">
        <p style="font-size:0.75rem; color:#aaa; margin:0;">Comment</p>
        <p style="font-size:0.875rem; color:#555; margin:4px 0 0;">${data.comment || "No Comment"}</p>
  </div>
`;
    container.appendChild(card);
  } catch (error) {
    console.log(error);
  }
}

function closeHistoryModal() {
  hideModal("historyModal");
}

// ─── Status UI ────────────────────────────────────────────────────────────────
function getStatusUI(status) {
  switch (status) {
    case "New":
      return { cls: "status-new", icon: "add_circle" };
    case "Assigned":
      return { cls: "status-assigned", icon: "assignment_ind" };
    case "InProgress":
      return { cls: "status-progress", icon: "autorenew" };
    case "Resolved":
      return { cls: "status-resolved", icon: "build" };
    case "Done":
      return { cls: "status-done", icon: "check_circle" };
    default:
      return { cls: "status-default", icon: "help" };
  }
}
document
  .getElementById("editEmployeeForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categorySelect = document.getElementById("categorySelect2");
    const token = localStorage.getItem("token");

    const selectedOptions = Array.from(categorySelect.selectedOptions);
    const categoryIds = selectedOptions.map((opt) => opt.value);

    try {
      const response = await fetch(
        `http://localhost:8080/api/TC/UpdateTCByTechnicianId?TechnicianId=${currentEmployeeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryIds), // ✅ array مباشرة
        },
      );

      if (response.ok) {
        closeEditEmployeeModal();
        GetAllTechnicians();
      }
    } catch (error) {
      console.error("Error updating categories:", error);
    }
  });
