let allRequests = [];
let allEmployee = [];
let deleteRequestId = null;
let deleteUserId = null;

async function Login() {
  let username = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  try {
    const response = await fetch("https://localhost:7128/api/Auth/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    let token = data.accessToken;
    let role = data.roleName;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if (role == "Admin") {
      window.location.href = "DashAdmin.html";
    } else if (role == "Employee") {
      window.location.href = "DashEmployee.html";
    } else {
      window.location.href = "DashTechnician.html";
    }
  } catch (error) {
    console.log("Error:", error);
  }
}
async function GetRequestsCurrantTechnicianOrEmployee() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "https://localhost:7128/api/Request/Get_Requests_Currant_Technician_Or_Employee",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    allRequests = data; // 👈 حفظ البيانات

    renderTable(allRequests);
  } catch (error) {
    console.log(error);
  }
}
async function GetAllEmployee() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "https://localhost:7128/api/User/Get_Users_Employees",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    allEmployee = data; // 👈 حفظ البيانات

    renderTableUser(allEmployee);
  } catch (error) {
    console.log(error);
  }
}
async function GetAllRequests() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "https://localhost:7128/api/Request/Get_All_Requests",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    allRequests = data; // مهم للفلترة

    renderTable(allRequests);
  } catch (error) {
    console.log(error);
  }
}
function renderTable(data) {
  const role = localStorage.getItem("role");

  let tbody;

  if (role == "Admin") {
    tbody = document.getElementById("bodyAdmin");
  } else {
    tbody = document.getElementById("body");
  }

  tbody.innerHTML = "";

  data.forEach((element) => {
    const ui = getStatusUI(element.statusName);

    tbody.innerHTML += `
      <tr class="hover:bg-surface-container-low transition-colors group">

        <td class="px-6 py-5 font-medium text-on-surface">
          ${element.id}
        </td>

        <td class="px-6 py-5">
          <div class="font-semibold text-on-surface">
            ${element.title}
          </div>
          <div class="text-sm text-on-surface-variant">
            ${element.requestDetail.location}
          </div>
        </td>

        <td class="px-6 py-5 text-on-surface">
          ${element.categoryName}
        </td>

        <td class="px-6 py-5">
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${ui.color} transition-all hover:scale-105 duration-200">

            <span class="material-symbols-outlined text-[18px]">
              ${ui.icon}
            </span>

            ${element.statusName}

          </span>
        </td>

        <td class="px-6 py-5">
          <div class="flex items-center gap-3">
            <span class="text-on-surface font-medium">
              ${element.technicianName}
            </span>
          </div>
        </td>

        <td class="px-6 py-5">
          <div class="flex items-center justify-center gap-2">

            <button
              onclick="openDetails(),getDetails('${element.id}')"
              class="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
              title="Details"
            >
              <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>

            <button
              onclick="openEditModal(),getDetails('${element.id}')"
              class="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
              title="Edit"
            >
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>

            <button
              onclick="openDeleteModal('${element.id}')"
              class="p-1.5 hover:bg-error-container rounded-lg text-error transition-colors"
              title="Delete"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>

            <button
              onclick="openHistoryModal('${element.id}')"
              class="p-1.5 hover:bg-surface-container rounded-lg text-outline transition-colors"
              title="History"
            >
              <span class="material-symbols-outlined text-[20px]">history</span>
            </button>

          </div>
        </td>

      </tr>
    `;
  });
}
function renderTableUser(data) {
  let tbody = document.getElementById("tableUser");

  tbody.innerHTML = "";

  data.forEach((element) => {
    tbody.innerHTML += `
     <tr
                    class="hover:bg-surface-container-low transition-colors group"
                  >
                    <td class="px-6 py-5 font-medium text-on-surface">
                      ${element.id}
                    </td>
                    <td class="px-6 py-5 font-semibold text-on-surface">
                      ${element.name}
                    </td>
                    <td class="px-6 py-5 text-on-surface-variant">
                      ${element.email}
                    </td>
                    <td class="px-6 py-5 text-on-surface-variant">  ${element.phoneNumber}</td>
                    <td class="px-6 py-5 text-on-surface"> ${element.location}</td>
                    <td class="px-6 py-5">
                      <div class="flex items-center justify-center gap-2">
                        <button
                        onclick="openDeleteEmployee('${element.id}')"
                          class="p-1.5 hover:bg-error-container rounded-lg text-error transition-colors"
                          title="Delete"
                        >
                          <span class="material-symbols-outlined text-[20px]"
                            >delete</span
                          >
                        </button>
                      </div>
                    </td>
                  </tr>
    `;
  });
}

function filterByStatus(status) {
  if (status === "All Statuses") {
    renderTable(allRequests);
    return;
  }

  const filtered = allRequests.filter((x) => x.statusName === status);

  renderTable(filtered);
}

async function loadStats() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "https://localhost:7128/api/Request/dashboard-stats-by-user",
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
    "https://localhost:7128/api/Request/dashboard-stats",
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
function openModal() {
  const modal = document.getElementById("requestModal");

  modal.classList.remove("hidden");

  modal.classList.add("flex");
}

function closeModal() {
  const modal = document.getElementById("requestModal");

  modal.classList.remove("flex");
  modal.classList.add("hidden");

  document.getElementById("categorySelect").selectedIndex = 0;
  document.getElementById("requestForm").reset();
}

async function loadCategories() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "https://localhost:7128/api/Catagory/Get_All_Catagory",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    const select = document.getElementById("categorySelect");

    const select2 = document.getElementById("editCategorySelect");

    const select3 = document.getElementById("editCategorySelectAdmin");

    data.forEach((category) => {
      // ===== Create Request =====
      if (select) {
        const option1 = document.createElement("option");

        option1.value = category.id;

        option1.textContent = category.name;

        select.appendChild(option1);
      }

      // ===== Edit Request =====
      if (select2) {
        const option2 = document.createElement("option");

        option2.value = category.id;

        option2.textContent = category.name;

        select2.appendChild(option2);
      }

      // ===== Admin Edit =====
      if (select3) {
        const option3 = document.createElement("option");

        option3.value = category.id;

        option3.textContent = category.name;

        select3.appendChild(option3);
      }
    });
  } catch (error) {
    console.log("Error loading categories:", error);
  }
}

document
  .getElementById("requestForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const title = this.querySelector("input[placeholder='Title']").value;
    const description = this.querySelector("textarea").value;
    const location = this.querySelector("input[placeholder='Location']").value;
    const categoryId = document.getElementById("categorySelect").value;
    const image = this.querySelector("input[type='file']").files[0];
    const employeeNotes = this.querySelector(
      "input[placeholder='EmployeeNotes']",
    ).value;

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("categoryId", categoryId);

    formData.append("requestDetail.location", location);
    formData.append("requestDetail.employeeNotes", employeeNotes);

    if (image) {
      formData.append("requestDetail.image", image);
    }

    const res = await fetch(
      "https://localhost:7128/api/Request/Create_Request",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );
    if (res.ok) {
      GetRequestsCurrantTechnicianOrEmployee();
      closeModal();
      loadStats();
    }
  });

async function getDetails(id) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://localhost:7128/api/Request/Get_Request_By_Id?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    // ===== Details Modal =====

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

    // ===== Edit Modal Inputs =====

    document.getElementById("editTitle").value = data.title || "";

    document.getElementById("editDescription").value = data.description || "";

    document.getElementById("editLocation").value =
      data.requestDetail.location || "";

    document.getElementById("editEmployeeNotes").value =
      data.requestDetail.employeeNotes || "";

    document.getElementById("editCategorySelect").value = data.categoryId || "";

    // حفظ الايدي للتعديل
    currentRequestId = data.id;
  } catch (error) {
    console.log(error);
  }
}

document
  .getElementById("editRequestForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      // البيانات الأساسية
      formData.append("Title", document.getElementById("editTitle").value);

      formData.append(
        "Description",
        document.getElementById("editDescription").value,
      );

      formData.append(
        "CategoryId",
        document.getElementById("editCategorySelect").value,
      );

      // RequestDetail
      formData.append(
        "RequestDetail.Location",
        document.getElementById("editLocation").value,
      );

      formData.append(
        "RequestDetail.EmployeeNotes",
        document.getElementById("editEmployeeNotes").value,
      );

      // الصورة
      const imageFile = document.getElementById("editImage").files[0];

      if (imageFile) {
        formData.append("RequestDetail.Image", imageFile);
      }

      const response = await fetch(
        `https://localhost:7128/api/Request/Update_Request?id=${currentRequestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        GetRequestsCurrantTechnicianOrEmployee();
        closeEditModal();
      }
    } catch (error) {
      console.log(error);
    }
  });
async function confirmDelete() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://localhost:7128/api/Request/Delete_Request?id=${deleteRequestId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
      `https://localhost:7128/api/User/Delete_User?id=${deleteUserId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      closeDeleteEmployeel();
      GetAllEmployee();
    } else {
      alert("Failed to delete request");
    }
  } catch (error) {
    console.log(error);
  }
}
async function openHistoryModal(requestId) {
  const modal = document.getElementById("historyModal");

  modal.classList.remove("hidden");

  modal.classList.add("flex");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://localhost:7128/api/Request/Get_Request_History_By_Id?requestId=${requestId}`,
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

    // الحالة
    const status = data.newStatusName || data.oldStatusName;

    // UI حسب الحالة
    const ui = getStatusUI(status);

    // كارد واحد فقط
    const card = document.createElement("div");

    card.className = `
  border-l-4 ${ui.color}
  bg-white rounded-2xl p-5 shadow-sm
`;

    // المحتوى
    card.innerHTML = `
  <div class="flex items-start justify-between">

    <!-- Left -->
    <div class="flex items-start gap-3">

      <span class="material-symbols-outlined text-3xl">
        ${ui.icon}
      </span>

      <div>

        <p class="text-xs text-gray-400">Employee</p>
        <h3 class="font-semibold text-lg">
          ${data.employeeName}
        </h3>

        <p class="text-xs text-gray-400 mt-3">Changed At</p>
        <p class="text-sm text-gray-600">
          ${data.changedAt}
        </p>

      </div>
    </div>

    <!-- Status -->
    <span class="px-4 py-2 rounded-full text-sm font-semibold ${ui.color}">
      ${data.oldStatusName} → ${data.newStatusName || "No Change"}
    </span>

  </div>

  <!-- Comment -->
  <div class="mt-4 pl-11">
    <p class="text-xs text-gray-400">Comment</p>
    <p class="text-sm text-gray-600">
      ${data.comment || "No Comment"}
    </p>
  </div>
`;

    container.appendChild(card);
  } catch (error) {
    console.log(error);
  }
}
function getStatusUI(status) {
  switch (status) {
    case "New":
      return {
        color: "bg-blue-100 text-blue-700",
        icon: "add_circle",
      };

    case "Assigned":
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: "assignment_ind",
      };

    case "InProgress":
      return {
        color: "bg-orange-100 text-orange-700",
        icon: "autorenew",
      };

    case "Resolved":
      return {
        color: "bg-purple-100 text-purple-700 border-purple-300",
        icon: "build",
      };

    case "Done":
      return {
        color: "bg-green-100 text-green-700 border-green-300",
        icon: "check_circle",
      };

    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: "help",
      };
  }
}

function closeHistoryModal() {
  const modal = document.getElementById("historyModal");

  modal.classList.remove("flex");

  modal.classList.add("hidden");
}

function closeDetails() {
  const modal = document.getElementById("detailsModal");

  modal.classList.remove("flex");
  modal.classList.add("hidden");
}
function openDetails() {
  const modal = document.getElementById("detailsModal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function openEditModal() {
  const modal = document.getElementById("editRequestModal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeEditModal() {
  const modal = document.getElementById("editRequestModal");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function openDeleteModal(id) {
  deleteRequestId = id;

  const role = localStorage.getItem("role");

  let modal;

  if (role == "Admin") {
    modal = document.getElementById("deleteModalAdmin");
  } else {
    modal = document.getElementById("deleteModal");
  }

  modal.classList.remove("hidden");

  modal.classList.add("flex");
}

function closeDeleteModal() {
  const role = localStorage.getItem("role");

  let modal;

  if (role == "Admin") {
    modal = document.getElementById("deleteModalAdmin");
  } else {
    modal = document.getElementById("deleteModal");
  }

  modal.classList.remove("flex");

  modal.classList.add("hidden");
}
function openDeleteEmployee(id) {
  deleteUserId = id;

  let modal = document.getElementById("deleteModalUser");

  modal.classList.remove("hidden");

  modal.classList.add("flex");
}

function closeDeleteEmployeel() {
  let modal = document.getElementById("deleteModalUser");

  modal.classList.remove("flex");

  modal.classList.add("hidden");
}
