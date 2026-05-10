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

    localStorage.setItem("token", token);

    window.location.href = "Dashboard.html";
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
    )
      .then((res) => res.json())
      .then((data) => {
        let tbody = document.getElementById("body");

        data.forEach((element) => {
          tbody.innerHTML += `
                  <tr
                class="hover:bg-surface-container-low transition-colors group"
              >
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
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFF9E6] text-[#B88600]"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-[#B88600] mr-2"
                    ></span>
                      ${element.statusName}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <span class="text-on-surface font-medium"> ${element.technicianName}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      class="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
                      title="Details"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >visibility</span
                      >
                    </button>
                    <button
                      class="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
                      title="Edit"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >edit</span
                      >
                    </button>
                    <button
                      class="p-1.5 hover:bg-error-container rounded-lg text-error transition-colors"
                      title="Delete"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >delete</span
                      >
                    </button>
                    <button
                      class="p-1.5 hover:bg-surface-container rounded-lg text-outline transition-colors"
                      title="History"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >history</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
                 `;
        });
      });
  } catch (error) {
    console.log(error);
  }
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

    data.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
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
      closeModal();
      loadStats();
    }
  });
