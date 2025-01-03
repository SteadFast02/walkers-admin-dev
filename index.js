jQuery(function () {
  checkLogin();
  loadPage("analytics");
});
let PARTNERSHIP_IMAGE = null;
let TASK_IMAGE = null;
let ADV_IMAGE = null;
let ALERT_ID_TO_REMOVE = null;
let TASK_ID_TO_REMOVE = null;
let ADV_ID_TO_REMOVE = null;
let PARTNERSHIP_ID_TO_REMOVE = null;
let SORT_KEY = "default,asc";
let PAGE_USERS = 0;

function loadPage(page) {
  if (page == "tasks") {
    loadTaskPage(page);
  } else if (page == "swap-user-info") {
    loadSwapInfoPage(page);
  } else if (page == "advertisment") {
    loadAdvPage(page);
  } else if (page == "referal") {
    loadReferalPage(page);
  } else if (page == "leaderboard") {
    loadLeaderboardPage(page);
  } else if (page == "analytics") {
    loadAnalyticsPage(page);
  } else if (page == "partnerships") {
    loadIRLPage(page);
  } else if (page == "review-tasks") {
    loadReviewTasks(page);
  } else if (page == "alerts") {
    loadAlertsPage(page);
  } else if (page == "test-users") {
    loadGenerateTestUsersPage(page);
  }
}

function checkLogin() {
  const token = localStorage.getItem("t");
  if (!token) {
    window.location.href = "https://walkers-alpha.vercel.app/login.html";
    return;
  }
}
// comment 

function loadAlertsPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getAlerts();
    });
}

function loadGenerateTestUsersPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTestUsers();
    });
}

function loadReviewTasks(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTaskStatuses();
    });
}

function getTestUsers() {
  fetch(REQUEST.ip + "/api/v1/admin/users/loginType/login_admin_generated", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#tableTestUsers").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendTestUsers(i, data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function loadSwapInfoPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      fetch(REQUEST.ip + "/api/v1/admin/points-swap-info", {
        headers: {
          Authorization: localStorage.getItem("t"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          $("#swapUsersInfo").empty();
          if (isValidObject(data)) {
            for (var i = 0; i < data.length; i++) {
              $("#swapUsersInfo").append(
                "<tr><td style='vertical-align: middle;'>" +
                  data[i].totalUsers +
                  "</td><td style='vertical-align: middle;'>" +
                  data[i].totalSwapableCharacters +
                  " </td><td style='vertical-align: middle;'>" +
                  moment(data[i].createdDate).format("DD/MM/yyyy HH:mm") +
                  "</td></tr>"
              );
            }
          }
        })
        .catch((error) => console.error(error));
    });
}

function getAlerts() {
  fetch(REQUEST.ip + "/api/v1/admin/alerts", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#alertsContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendAlerts(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function getTaskStatuses() {
  fetch(REQUEST.ip + "/api/v1/admin/task-status/status/admin_review", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#taskStatusContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendTasksStatus(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function appendTasksStatus(t) {
  let twitterUsername = checkForValidation(t.user.twitterUsername);
  if (twitterUsername != "") {
    twitterUsername =
      "<a href='https://twitter.com/" +
      t.user.twitterUsername +
      "' target='_blank'>" +
      t.user.twitterUsername +
      "</a>";
  }

  let btn =
    "<button type='button'  id='approve" +
    t.id +
    "' class='btn btn-block btn-success btn-sm' onclick='approveTask(\"" +
    t.id +
    "\")'>Approve</button>";
  let btnReject =
    "<button type='button' id='reject" +
    t.id +
    "' class='btn btn-block btn-danger btn-sm' onclick='rejectTask(\"" +
    t.id +
    "\")'>Reject</button>";
  let date = moment(t.createdDate).format("DD/MM/yyyy HH:mm");
  $("#taskStatusContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.task.name +
      "</td><td style='vertical-align: middle;'>" +
      t.task.description +
      "</td><td style='vertical-align: middle;'>" +
      t.user.firstname +
      " </td><td style='vertical-align: middle;'>" +
      twitterUsername +
      " </td><td style='vertical-align: middle;'>" +
      date +
      " </td><td>" +
      btn +
      " " +
      btnReject +
      "</td></tr>"
  );
}

function approveTask(taskStatusId) {
  $("#approve" + taskStatusId).prop("disabled", true);
  const formData = new URLSearchParams();
  formData.append("taskStatusId", taskStatusId);

  fetch(REQUEST.ip + "/api/v1/admin/tasks/approve-task", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      getTaskStatuses();
    })
    .catch((error) => {
      getTaskStatuses();
    });
}

function rejectTask(taskStatusId) {
  $("#reject" + taskStatusId).prop("disabled", true);

  const formData = new URLSearchParams();
  formData.append("taskStatusId", taskStatusId);

  fetch(REQUEST.ip + "/api/v1/admin/tasks/reject-task", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      getTaskStatuses();
    })
    .catch((error) => {
      getTaskStatuses();
    });
}

function loadIRLPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getParnerships();

      $("#partnershipImageUpload").on("change", function (event) {
        uploadFile(event, "irl");
      });

      $("#reservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });
    });
}

function loadAnalyticsPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getStats();
      getUsers();
    });
}

function getStats() {
  const date = new Date();
  const timeZoneOffsetMinutes = date.getTimezoneOffset();
  const timeZoneOffsetHours = timeZoneOffsetMinutes / 60;

  fetch(REQUEST.ip + "/api/v1/admin/users-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#usersCount").empty().append(data.totalUsers);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/tasks-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#tasksCount").empty().append(data.totalTasks);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/partnerships-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#partnershipCount").empty().append(data.totalPartnerships);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/walk-distance", {
    headers: {
      "time-diff": timeZoneOffsetHours * -1,
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#walkingDistance")
        .empty()
        .append(checkForValidationDistance(data.totalDistance));
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/full-walk-distance", {
    headers: {
      "time-diff": timeZoneOffsetHours * -1,
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#fullWalkingDistance")
        .empty()
        .append(checkForValidationDistance(data.totalDistance));
    })
    .catch((error) => console.error(error));
}

function loadTaskPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTasks();
      fetchTaskNames();

      $("#taskImageUpload").on("change", function (event) {
        uploadFile(event, "task");
      });

      $("#reservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
        minDate: new Date(),
      });
    });
}

function loadAdvPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getAdv();

      $("#advImageUpload").on("change", function (event) {
        uploadAdvFile(event, "adv");
      });

      $("#advUpdatedImageUpload").on("change", function (event) {
        uploadUpdatedAdvFile(event, "advupdate");
      });

      $("#advreservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
        minDate: new Date(),
      });

      $("#reservationtimeupdate").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
        minDate: new Date(),
      });
    });
}

function loadReferalPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getReferal();
      getReferralAmount();
      checkReferralBoostStatus();
    });
}

function loadLeaderboardPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      loadTaskTypes().then(() => {});
    });
}

let taskCurrentPage = 1;
let taskPageSize = 5;

function getTasks(page = 1, size = 5) {
  taskCurrentPage = page;

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/tasks/pagination?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      $("#taskContent").empty();

      if (data && Array.isArray(data.content)) {
        data.content.forEach((task) => {
          appendTasks(task);
        });
      }

      if (data.totalPages) {
        generateTaskPagination(data.totalPages);
      }
    })
    .catch((error) => console.error("Error fetching tasks:", error));
}

function generateTaskPagination(totalPages) {
  const pagination = $("#taskpagination");
  pagination.empty();
  if (totalPages < 2) {
    pagination.empty();
    return;
  }

  const prevDisabled = taskCurrentPage === 1 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="getTasks(${
        taskCurrentPage - 1
      }, ${taskPageSize})">Previous</a>
    </li>`
  );

  for (let i = 1; i < totalPages; i++) {
    const activeClass = i === taskCurrentPage ? "active" : "";
    pagination.append(
      `<li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="getTasks(${i}, ${taskPageSize})">${i}</a>
      </li>`
    );
  }

  const nextDisabled = taskCurrentPage === totalPages - 1 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="getTasks(${
        taskCurrentPage + 1
      }, ${taskPageSize})">Next</a>
    </li>`
  );
}

let CurrentPage = 0;
let PageSize = 5;

function getReferal(page = 0, size = 5) {
  CurrentPage = page;

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/referal-list/pagination?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      $("#referalContent").empty();

      if (data && Array.isArray(data.content)) {
        data.content.forEach((task) => {
          appendReferals(task);
        });
      }

      if (data.totalPages) {
        generatePagination(data.totalPages);
      }
    })
    .catch((error) => console.error("Error fetching tasks:", error));
}

function generatePagination(totalPages) {
  const pagination = $("#pagination");
  pagination.empty();

  if (totalPages < 1) {
    return;
  }

  const prevDisabled = CurrentPage === 0 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="getReferal(${
        CurrentPage - 1
      }, ${PageSize})">Previous</a>
    </li>`
  );

  for (let i = 0; i < totalPages; i++) {
    const activeClass = i === CurrentPage ? "active" : "";
    pagination.append(
      `<li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="getReferal(${i}, ${PageSize})">${
        i + 1
      }</a>
      </li>`
    );
  }

  const nextDisabled = CurrentPage === totalPages - 1 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="getReferal(${
        CurrentPage + 1
      }, ${PageSize})">Next</a>
    </li>`
  );
}

function getReferralAmount() {
  fetch("https://javaapi.abhiwandemos.com/api/v1/admin/referral-config", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return response.json();
    })
    .then((data) => {
      const referralAmount = data;
      document.getElementById(
        "lastreferral"
      ).innerText = `CURRENT REFERRAL: ${referralAmount}`;
    })
    .catch((error) => console.error(error));
}

let advCurrentPage = 0;
let advPageSize = 5;

function getAdv(page = 0, size = 5) {
  console.log("===========", page, size);
  advCurrentPage = page;
  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/ads/list/paginated?page=${page}&size=${size}`,
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      $("#advContent").empty();

      if (data && Array.isArray(data.content)) {
        data.content.forEach((adv) => {
          appendAdvs(adv);
        });
      }

      if (data.totalPages) {
        generateAdvPagination(data.totalPages);
      }
    })
    .catch((error) => console.error("Error fetching advertisements:", error));
}

function generateAdvPagination(totalPages) {
  const pagination = $("#advpagination");
  pagination.empty();

  if (totalPages < 1) {
    return;
  }

  const prevDisabled = advCurrentPage === 0 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="getAdv(${
        advCurrentPage - 1
      }, ${advPageSize})">Previous</a>
    </li>`
  );

  for (let i = 0; i < totalPages; i++) {
    const activeClass = i === advCurrentPage ? "active" : "";
    pagination.append(
      `<li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="getAdv(${i}, ${advPageSize})">${
        i + 1
      }</a>
      </li>`
    );
  }

  const nextDisabled = advCurrentPage === totalPages - 1 ? "disabled" : "";
  pagination.append(
    `<li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="getAdv(${
        advCurrentPage + 1
      }, ${advPageSize})">Next</a>
    </li>`
  );
}

function addAdv() {
  let fromTo = $("#advreservationtime").val();
  fromTo = fromTo.split("-");
  const advName = $("#advName").val().trim();
  const Adv_link = $("#linkUrl").val().trim();
  if (advName === "") {
    alert("Please enter a name for the advertisement.");
    return;
  }
  const linkPattern =
    /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*(\?[^\s]*)?(#\S*)?$/;
  if (!linkPattern.test(Adv_link)) {
    alert("Please enter a valid link (URL).");
    return;
  }
  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);
  const data = {
    image: ADV_IMAGE,
    linkUrl: Adv_link,
    name: advName,
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
  };
  data.testUserAdv = false;
  if ($("#forTestUserSlct :selected").val() == "yes") {
    data.testUserAdv = true;
  }
  if (!data.image) {
    alert("Please Provide image");
    return;
  }

  // fetch(REQUEST.ip + 'https://javaapi.abhiwandemos.com/api/v1/ads', {
  fetch("https://javaapi.abhiwandemos.com/api/v1/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      const currentDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
      $("#advreservationtime").val(`${currentDateTime} - ${currentDateTime}`);

      $("#advName").val("");
      $("#advImageUpload").val("");
      $("#linkUrl").val("");
      console.log("data");
      getAdv();
    })
    .catch((error) => console.error(error));
}

const fetchTaskNames = async () => {
  try {
    const taskNameDropdown = document.getElementById("taskName");

    // Clear existing options
    taskNameDropdown.innerHTML = '<option value="">Select Task Name</option>';

    const response = await fetch(
      "https://javaapi.abhiwandemos.com/api/v1/admin/tasks-list",
      {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("t"),
        },
      }
    );
    const data = await response.json();
    const taskNames = data.map((task) => Object.keys(task)[0]);

    taskNames.forEach((task) => {
      const option = document.createElement("option");
      option.value = task;
      option.textContent = task;
      taskNameDropdown.appendChild(option);
    });

    // Add "Add New Task" option
    const addNewOption = document.createElement("option");
    addNewOption.value = "addNew";
    addNewOption.textContent = "Add New Task +";
    addNewOption.style.color = "green";
    addNewOption.style.fontWeight = "bold";
    taskNameDropdown.appendChild(addNewOption);

    // Attach change event listener to dropdown
    taskNameDropdown.addEventListener("change", handleDropdownChange);
  } catch (error) {
    console.error("Error fetching task names:", error);
  }
};

const handleDropdownChange = () => {
  const taskNameDropdown = document.getElementById("taskName");
  const newTaskInput = document.getElementById("newTaskName");

  if (taskNameDropdown.value === "addNew") {
    newTaskInput.style.display = "block"; // Show input for new task name
  } else {
    newTaskInput.style.display = "none"; // Hide input if not adding new task
    newTaskInput.value = ""; // Clear any previously entered value
  }
};

function addTask() {
  const taskNameDropdown = document.getElementById("taskName");
  const newTaskInput = document.getElementById("newTaskName");
  const taskName = $("#taskName").val().trim();
  const taskDescription = $("#taskDescription").val();
  const selectedTaskName = taskNameDropdown.value;
  const taskNameToUse =
    selectedTaskName === "addNew"
      ? newTaskInput.value.trim()
      : selectedTaskName;

  // Validation
  if (!taskNameToUse) {
    alert("Please enter a valid task name.");
    return;
  }
  if (taskName === "") {
    alert("Please enter a name for the task.");
    return;
  }
  if (taskName.length > 50) {
    alert(
      "Task name exceeds the maximum limit of 50 characters. Please shorten the name."
    );
    return;
  }
  if (taskDescription.length > 500) {
    alert(
      "Task description exceeds the maximum limit of 500 characters. Please refine the description."
    );
    return;
  }
  const reward = $("#taskReward").val().trim();
  if (reward < 0) {
    alert("Please enter a valid positive integer for the reward (XP).");
    return;
  }
  let fromTo = $("#reservationtime").val();
  fromTo = fromTo.split("-");

  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);

  const twitterTaskSelected =
    $("#forTwitterUserSlct :selected").val() === "yes";
  const twitterPostLink =
    twitterTaskSelected && $("#twitterUsername").val()
      ? $("#twitterUsername").val()
      : "NA";

  const data = {
    image: TASK_IMAGE,
    name: taskNameToUse,
    description: taskDescription,
    reward: reward,
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
    testUserTask: $("#forTestUserSlct :selected").val() === "yes",
    twitterTask: twitterTaskSelected,
    twitterPostLink: twitterPostLink,
  };

  if (!data.image) {
    alert("Please Provide Image");
    return;
  }
  if (!twitterPostLink) {
    alert("Please Provide Twitter Post Link");
    return;
  }
  // fetch(REQUEST.ip + "/api/v1/admin/tasks", {
  fetch("https://javaapi.abhiwandemos.com/api/v1/admin/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Task Added Successfully");
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      const currentDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
      $("#reservationtime").val(`${currentDateTime} - ${currentDateTime}`);

      $("#taskName").val("");
      $("#newTaskName").val("");
      $("#taskImageUpload").val("");
      $("#taskDescription").val("");
      $("#taskReward").val("");
      $("#forTestUserSlct").val("");
      $("#forTwitterUserSlct").val("no");
      $("#forTestUserSlct").val("no");
      $("#twitterUsername").val("");
      taskNameDropdown.value = "";
      newTaskInput.style.display = "none"; // Hide the new task input field
      newTaskInput.value = ""; // Clear the new task input field
      fetchTaskNames();
      getTasks();
    })
    .catch((error) => console.error(error));
}

function handleTwitterUserSelection() {
  const twitterUserSelect = document.getElementById("forTwitterUserSlct").value;
  const inputContainer = document.getElementById("twitterUserInputContainer");

  if (twitterUserSelect === "yes") {
    if (!document.getElementById("twitterUsername")) {
      const inputBox = document.createElement("input");
      inputBox.type = "url";
      inputBox.className = "form-control mt-2";
      inputBox.id = "twitterUsername";
      inputBox.value = "";
      inputBox.required = true;
      inputBox.placeholder = "Enter Twitter Postlink";
      inputContainer.appendChild(inputBox);
    }
  } else {
    if (document.getElementById("twitterUsername")) {
      inputContainer.removeChild(document.getElementById("twitterUsername"));
    }
  }
}

function appendAlerts(t) {
  $("#alertsContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.title +
      "</td><td style='vertical-align: middle;'>" +
      t.description +
      " </td><td style='vertical-align: middle;'>" +
      moment(t.createdDate).format("DD/MM/yyyy HH:mm") +
      "</td><td style='text-align:center'>  <button type='button' onclick='openModalRemoveAlert(\"" +
      t.id +
      '", "' +
      t.title +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-alerts'>x</button></td></tr>"
  );
}

function openModalRemoveAlert(id, txt) {
  ALERT_ID_TO_REMOVE = id;
  $("#alertModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalRemoveTask(id, txt) {
  TASK_ID_TO_REMOVE = id;
  $("#taskModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalRemoveAdv(id, txt) {
  ADV_ID_TO_REMOVE = id;
  $("#advRemoveModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalViewAdv(advData) {
  console.log(advData);
  $("#advUpdateName").val(advData.name);
  $("#advUpdateLink").val(advData.linkUrl);
  $("#reservationtimeupdate").val(
    moment(advData.startTime).format("DD/MM/YYYY HH:mm") +
      " - " +
      moment(advData.endTime).format("DD/MM/YYYY HH:mm")
  );
  if (advData.image) {
    $("#advImagePreview").attr("src", advData.image).show();
  } else {
    $("#advImagePreview").hide();
  }
  $("#modal-default-Updateadv").modal("show");
  $("#updateAdvButton")
    .off("click")
    .on("click", function () {
      updateAdv(advData.id);
    });
}

function updateAdv(advId) {
  // Parse the date and time range
  let fromTo = $("#reservationtimeupdate").val().split(" - ");
  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);

  // Collect data for the update request
  const data = {
    image: $("#advUpdatedImageUpload")[0].files[0]
      ? URL.createObjectURL($("#advUpdatedImageUpload")[0].files[0])
      : null,
    linkUrl: $("#advUpdateLink").val(),
    name: $("#advUpdateName").val(),
    startTime: dateFromObj.toISOString(),
    endTime: dateToObj.toISOString(),
    testUserAdv: $("#forTestUserSlct :selected").val() === "yes",
  };

  // Make the API request to update advertisement
  fetch("https://javaapi.abhiwandemos.com/api/v1/ads/" + advId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update advertisement");
      }
      return response.json();
    })
    .then((updatedData) => {
      console.log("Advertisement updated successfully:", updatedData);
      // Refresh the advertisement list or UI (Implement getAdv if needed)
      getAdv();
    })
    .catch((error) => console.error("Error updating advertisement:", error));
}

function removeTask() {
  fetch(
    "https://javaapi.abhiwandemos.com/api/v1/admin/tasks/" + TASK_ID_TO_REMOVE,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then(() => {
      $("#modal-default-tasks").modal("hide");
      fetchTaskNames();
      getTasks();
    })
    .catch((error) => {
      console.log(error);
    });
}

function removeAdv() {
  fetch(
    "https://javaapi.abhiwandemos.com/api/v1/ads/delete/" + ADV_ID_TO_REMOVE,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then(() => {
      $("#modal-default-advremove").modal("hide");
      getAdv();
    })
    .catch((error) => {
      console.log(error);
    });
  getAdv();
}

function openModalRemovePartnership(id, txt) {
  PARTNERSHIP_ID_TO_REMOVE = id;
  $("#partnershipModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function removePartnership() {
  fetch(REQUEST.ip + "/api/v1/admin/partnerships/" + PARTNERSHIP_ID_TO_REMOVE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then(() => {
      $("#modal-default-partnerships").modal("hide");
      getParnerships();
    })
    .catch((error) => {
      console.log(error);
    });
}

function removeAlert() {
  fetch(REQUEST.ip + "/api/v1/admin/alerts/" + ALERT_ID_TO_REMOVE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then(() => {
      $("#modal-default-alerts").modal("hide");
      getAlerts();
    })
    .catch((error) => {
      error;
    });
}

function appendAdvs(a) {
  Name = a.name ? a.name : "NA";
  var isForTestUser = a.testUserAdv ? "Yes" : "No";
  var img = a.image
    ? "<img style='width:70px; height:60px; object-fit: cover; border: 1px solid #ccc; cursor: pointer;' src='" +
      a.image +
      "' onclick='openAdvImageModal(\"" +
      a.image +
      "\")'/>"
    : "";

  var buttonText = a.active ? "Disable" : "Enable";
  var buttonColor = a.active
    ? "background-color: red; color: white;"
    : "background-color: green; color: white;";

  var linkurl = a.linkUrl
    ? "<a href='" + a.linkUrl + "' target='_blank''>" + a.linkUrl + "</a>"
    : "NA";
  $("#advContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      Name +
      "</td><td style='vertical-align: middle;'>" +
      moment(a.startTime).format("DD/MM/YYYY HH:mm") +
      "</td><td style='vertical-align: middle;'>" +
      moment(a.endTime).format("DD/MM/YYYY HH:mm") +
      "</td><td style='vertical-align: middle;'>" +
      linkurl +
      "</td><td style='text-align: center;'>" +
      img +
      "</td><td style='text-align:center'>" +
      "<button onclick='openModalViewAdv(" +
      JSON.stringify(a) +
      ")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-Updateadv'><i class='fas fa-eye'></i> View</button>" +
      "</td><td style='text-align:center'>" +
      "<button id='toggleButton-" +
      a.id +
      "' type='button' onclick='toggleButtonState(" +
      JSON.stringify(a) +
      ")' class='btn btn-default' style='" +
      buttonColor +
      "'>" +
      buttonText +
      "</button>" +
      "</td><td style='text-align:center'>" +
      "<button type='button' onclick='openModalRemoveAdv(\"" +
      a.id +
      '", "' +
      a.name +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-advremove'>x</button>" +
      "</td></tr>"
  );
}

function openAdvImageModal(imageUrl) {
  $("#advModalImage").attr("src", imageUrl);
  $("#advImageModal").modal("show");
}

function toggleButtonState(a) {
  const newState = !a.active;
  const button = document.getElementById("toggleButton-" + a.id);
  button.style.backgroundColor = newState ? "red" : "green";
  button.innerText = newState ? "Disable" : "Enable";
  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/ads/status/${a.id}?isActive=${newState}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then(() => {
      a.active = newState;
      loadAdvPage("advertisment");
    })
    .catch((error) => {
      button.style.backgroundColor = a.active ? "red" : "green";
      button.innerText = a.active ? "Disable" : "Enable";
    });
}

function appendTasks(t) {
  var isForTestUser = t.testUserTask ? "Yes" : "No";
  var isForTwitterUser = t.twitterTask ? "Yes" : "No";
  var twitterPostLink = t.twitterPostLink || "NA";

  var fullDescription = t.description;
  var truncatedDescription = t.description.split(" ").slice(0, 5).join(" ");
  if (t.description.split(" ").length > 5) {
    truncatedDescription +=
      " ... <button class='btn btn-link btn-sm' onclick='showTaskDescriptionModal(\"" +
      t.name.replace(/"/g, "&quot;") +
      '", "' +
      fullDescription.replace(/"/g, "&quot;").replace(/'/g, "&#39;") +
      "\")'>more</button>";
  }

  var img = "";
  if (isValidObject(t.image)) {
    img =
      "<img style='width:50px; height:auto; cursor:pointer;' src='" +
      t.image +
      "' onclick='showTaskImageModal(\"" +
      t.image.replace(/"/g, "&quot;") +
      "\")'/>";
  }

  var twitterLinkContent =
    twitterPostLink !== "NA"
      ? "<a href='" +
        twitterPostLink +
        "' target='_blank'>" +
        twitterPostLink +
        "</a>"
      : twitterPostLink;

  $("#taskContent").append(
    "<tr>" +
      "<td>" +
      t.name +
      "</td>" +
      "<td>" +
      truncatedDescription +
      "</td>" +
      "<td>" +
      t.reward +
      "</td>" +
      "<td>" +
      twitterLinkContent +
      "</td>" +
      "<td>" +
      isForTwitterUser +
      "</td>" +
      "<td>" +
      isForTestUser +
      "</td>" +
      "<td>" +
      moment(t.startDate).format("DD/MM/YYYY HH:mm") +
      "</td>" +
      "<td>" +
      moment(t.endDate).format("DD/MM/YYYY HH:mm") +
      "</td>" +
      "<td>" +
      img +
      "</td>" +
      "<td>" +
      "<button type='button' onclick='openModalRemoveTask(\"" +
      t.id +
      '", "' +
      t.name +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-tasks'>x</button>" +
      "</td>" +
      "</tr>"
  );
}

// Function to show the full description in a modal
function showTaskDescriptionModal(taskName, fullDescription) {
  $("#taskDescriptionModalTitle").text(taskName + " Description");
  $("#taskDescriptionModalBody").text(fullDescription);
  $("#taskDescriptionModal").modal("show");
}

// Function to show the image in a modal
function showTaskImageModal(imageUrl) {
  $("#taskImageModalBody").html(
    "<img src='" + imageUrl + "' class='img-fluid' />"
  );
  $("#taskImageModal").modal("show");
}

function appendReferals(t) {
  // Fallback to "Unknown" if firstname is empty
  let firstname = t.userResponse.firstname ? t.userResponse.firstname : "NA";
  let email = t.userResponse.email ? t.userResponse.email : "NA";
  let referralCount = t.referralCount ? t.referralCount : 0;

  $("#referalContent").append(
    `<tr>
      <td style='vertical-align: middle;'>${firstname}</td>
      <td style='vertical-align: middle;'>${email}</td>
      <td style='vertical-align: middle;'>${referralCount}</td>
    </tr>`
  );
}

function openImage(image) {
  window.open(image, "_blank");
}

function getParnerships() {
  fetch(REQUEST.ip + "/api/v1/admin/partnerships", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#partnershipContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendPartnerships(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function appendPartnerships(p) {
  var isPrimary = p.primary;
  if (isPrimary) {
    isPrimary = "Yes";
  } else {
    isPrimary = "No";
  }

  $("#partnershipContent").append(
    "<tr>" +
      "<td style='vertical-align: middle;'>" +
      p.description +
      " </td><td style='vertical-align: middle;'>" +
      p.url +
      " </td><td style='vertical-align: middle;'>" +
      moment(p.startDate).format("DD/MM/yyyy HH:mm") +
      " </td><td style='vertical-align: middle;'>" +
      moment(p.endDate).format("DD/MM/yyyy HH:mm") +
      " </td><td style='vertical-align: middle;'>" +
      p.type +
      "</td><td style='vertical-align: middle;'>" +
      isPrimary +
      "</td><td style='text-align: center;'><img style='width:50px' src='" +
      p.image +
      "'/></td><td style='text-align:center'>  <button type='button' onclick='openModalRemovePartnership(\"" +
      p.id +
      '", "' +
      p.description +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-partnerships'>x</button></td></tr>"
  );
}

function addPartnership() {
  let fromTo = $("#reservationtime").val();
  fromTo = fromTo.split("-");

  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);

  const data = {
    description: $("#partnershipDescription").val(),
    url: $("#partnershipURL").val(),
    type: $("#typeSlct :selected").val(),
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
    image: PARTNERSHIP_IMAGE,
  };

  data.primary = false;
  if ($("#primarySlct :selected").val() == "yes") {
    data.primary = true;
  }

  fetch(REQUEST.ip + "/api/v1/admin/partnerships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      getParnerships();
    })
    .catch((error) => console.error(error));
}

function addAlert() {
  const data = {
    description: $("#alertDescription").val(),
    title: $("#alertName").val(),
  };

  fetch(REQUEST.ip + "/api/v1/admin/alerts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      getAlerts();
    })
    .catch((error) => console.error(error));
}

function uploadAdvFile(event, type) {
  const file = event.target.files[0];
  if (!file) {
    alert("Image not provided in valid format");
    $("#advImageUpload").val("");
    return;
  }

  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    alert(
      "Invalid file type. Please upload an image with a valid format (jpg, jpeg, png, etc.)."
    );
    $("#advImageUpload").val("");
    return;
  }

  if (file.size > 500000) {
    alert("File size is too large");
    $("#advImageUpload").val("");
    return;
  }
  const img = new Image();

  const objectUrl = URL.createObjectURL(file);

  img.onload = function () {
    const width = img.width;

    const height = img.height;

    console.log("Image Dimensions: ", width, height);

    URL.revokeObjectURL(objectUrl); // Free up memory

    if (width !== 300 || height !== 80) {
      alert(
        `Minimum dimensions are 300px (width) x 80px (height). Current dimensions are ${width}px (width) x ${height}px (height).`
      );

      $("#advImageUpload").val("");

      return;
    }

    // Proceed to upload the file if validation passes

    const formData = new FormData();

    formData.append("file", file);

    fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
      headers: {
        Authorization: localStorage.getItem("t"),
      },

      method: "POST",

      body: formData,
    })
      .then((response) => response.json())

      .then((data) => {
        if (type === "adv") {
          ADV_IMAGE = data.url;
        } else {
          ADV_IMAGE = data.url;
        }

        alert("Image uploaded successfully.");
      })

      .catch((error) => console.error("Error uploading image:", error));
  };

  img.onerror = function () {
    alert("Unable to process the image. Please try again with a valid image.");

    $("#advImageUpload").val("");
  };

  img.src = objectUrl;
}

function uploadUpdatedAdvFile(event, type) {
  const file = event.target.files[0];
  if (!file) {
    alert("image not provided in valid format");
    $("#advUpdatedImageUpload").val("");
    return;
  }

  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    alert(
      "Invalid file type. Please upload an image with a valid format (jpg, jpeg, png, etc.)."
    );
    $("#advUpdatedImageUpload").val("");
    return;
  }

  if (file.size > 500000) {
    alert("File size is too large");
    $("#advUpdatedImageUpload").val("");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (type == "adv") {
        ADV_IMAGE = data.url;
      } else {
        ADV_IMAGE = data.url;
      }
    })
    .catch((error) => console.error(error));
}

function uploadFile(event, type) {
  const file = event.target.files[0];
  if (!file) {
    alert("image not provided in valid format");
    $("#taskImageUpload").val("");
    return;
  }

  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    alert(
      "Invalid file type. Please upload an image with a valid format (jpg, jpeg, png, etc.)."
    );
    $("#taskImageUpload").val("");
    return;
  }

  if (file.size > 500000) {
    alert("File size is too large");
    $("#taskImageUpload").val("");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (type == "irl") {
        PARTNERSHIP_IMAGE = data.url;
      } else {
        TASK_IMAGE = data.url;
      }
    })
    .catch((error) => console.error(error));
}

function getUsersLeft() {
  PAGE_USERS = PAGE_USERS - 1;
  if (PAGE_USERS < 0) {
    PAGE_USERS = 0;
  }
  getUsers();
}
function getUsersRight() {
  PAGE_USERS = PAGE_USERS + 1;
  getUsers();
}

function getUsersPaging(page) {
  PAGE_USERS = page;
  getUsers();
}

function getUsers() {
  fetch(
    REQUEST.ip + "/api/v1/admin/users/loginType/login_token?sort=" + SORT_KEY,
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      $("#tableUsers").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendUsers(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function sort(column) {
  if (isValidObject(SORT_KEY) && SORT_KEY.includes("asc")) {
    SORT_KEY = column + ",desc";
  } else {
    SORT_KEY = column + ",asc";
  }

  getUsers();
  headline(column);
}

function headline(column) {
  var headers = document
    .getElementById("usersTable")
    .getElementsByTagName("th");

  for (var i = 0; i < headers.length; i++) {
    headers[i].classList.remove("sorted");
    headers[i].style.color = "black";
  }

  var clickedHeader = document.querySelector(
    "#usersTable th[onclick=\"sort('" + column + "')\"]"
  );
  clickedHeader.classList.add("sorted");
  clickedHeader.style.color = "#a2a2a2";
}

function appendTestUsers(i, u) {
  let btn =
    "<button type='button' class='btn btn-success btn-sm' id='qrcode" +
    u.id +
    "' onclick='generateQrCode(\"" +
    u.id +
    "\")'>Generate Qr Code for login</button>";
  $("#tableTestUsers").append(
    "<tr><td>" +
      u.no +
      "</td><td style='vertical-align: middle;'>" +
      checkForValidation(u.firstname) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.level) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.expEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.pointsEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.totalSteps) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidationDistance(u.totalDistance) +
      " </td><td style='text-align: center;'>" +
      btn +
      "</td></tr>"
  );
}

function generateTestUser() {
  const formData = new URLSearchParams();
  formData.append("firstname", $("#firstnameTestUser").val());

  fetch(REQUEST.ip + "/api/v1/admin/generate-test-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
    body: formData,
  })
    .then((data) => {
      getTestUsers();
    })
    .catch((error) => console.error(error));
}

function generateQrCode(userId) {
  $("#qrcode" + userId).attr("disabled", true);
  fetch(REQUEST.ip + "/api/v1/admin/generate-qrcode/user/" + userId, {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#qrcode" + userId).attr("disabled", false);
      window.open(data.url, "_blank");
    })
    .catch((error) => {
      $("#qrcode" + userId).attr("disabled", false);
    });
}

function isWithinLast24Hours(timestamp) {
  var currentTime = Date.now();

  var timeDifference = currentTime - timestamp;

  var isWithin24Hours = timeDifference < 24 * 60 * 60 * 1000;

  return isWithin24Hours;
}

function appendUsers(u) {
  let twitterUsername = checkForValidation(u.twitterUsername);
  if (twitterUsername != "") {
    twitterUsername =
      "<a href='https://twitter.com/" +
      u.twitterUsername +
      "' target='_blank'>" +
      u.twitterUsername +
      "</a>";
  }

  let bkgColor = "";
  let isLast24 = isWithinLast24Hours(u.createdDate);
  if (isLast24) {
    bkgColor = "background-color: green";
  }

  let walkersSize = 0;
  try {
    walkersSize = u.walkers.length;
  } catch (ignored) {}

  let swapablePoints = 0;
  try {
    swapablePoints = u.levelInfo.swapablePointsEarned;
    swapablePoints = swapablePoints.toFixed(1);
  } catch (ignored) {}

  $("#tableUsers").append(
    "<tr><td style='" +
      bkgColor +
      "'>" +
      u.no +
      "</td><td style='vertical-align: middle;'>" +
      checkForValidation(u.firstname) +
      "</td><td style='vertical-align: middle;'>" +
      twitterUsername +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.email) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.level) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.expEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.pointsEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.totalSteps) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidationDistance(u.totalDistance) +
      " </td><td style='vertical-align: middle;'>" +
      walkersSize +
      " </td><td style='vertical-align: middle;'>" +
      swapablePoints +
      " </td></tr>"
  );
}

function isValidObject(obj) {
  if (obj == null || obj == undefined || obj == "undefined" || obj === "") {
    return false;
  }
  return true;
}

function checkForValidation(obj) {
  if (isValidObject(obj)) {
    return obj;
  }
  return "";
}

function checkForValidationDistance(meters) {
  if (isValidObject(meters)) {
    if (meters > 1000) {
      return (meters / 1000).toFixed(1) + " km";
    } else if (meters <= 0) {
      return 0;
    }
    return meters + " m";
  }
  return "";
}

function referalToggleSlider() {
  const slider = document.getElementById("slider");
  const status = document.getElementById("sliderStatus");
  slider.classList.toggle("on");
  if (slider.classList.contains("on")) {
    status.innerText = "Enable";
  } else {
    status.innerText = "Disable";
  }
}

function appendLeaderboard(data) {
  const leaderboardContent = document.getElementById("leaderboardContent");
  const row = document.createElement("tr");
  const rankCell = document.createElement("td");
  rankCell.textContent = data.rank;

  const firstnameCell = document.createElement("td");
  firstnameCell.textContent = data.user.firstname || "NA";

  const emailCell = document.createElement("td");
  emailCell.textContent = data.user.email;

  const earnedXPCell = document.createElement("td");
  earnedXPCell.textContent = data.earnedXP;

  row.appendChild(rankCell);
  row.appendChild(firstnameCell);
  row.appendChild(emailCell);
  row.appendChild(earnedXPCell);

  leaderboardContent.appendChild(row);
}

function updateToggleState(taskName, isVisible) {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");

  slider.classList.toggle("on", isVisible);
  sliderStatus.innerText = isVisible ? "Public" : "Private";
}

function loadTaskTypes() {
  return fetch(`https://javaapi.abhiwandemos.com/api/v1/admin/tasks-list`, {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch task types");
      }
      return response.json();
    })
    .then((data) => {
      const taskTypeSelect = document.getElementById("taskType");
      const slider = document.getElementById("slider");
      const sliderStatus = document.getElementById("sliderStatus");

      taskTypeSelect.innerHTML = "";

      const taskVisibilityMap = {};

      data.forEach((task) => {
        const taskName = Object.keys(task)[0];
        const isVisible = task[taskName];
        taskVisibilityMap[taskName] = isVisible;
        const option = document.createElement("option");
        option.value = taskName;
        option.textContent = taskName;
        taskTypeSelect.appendChild(option);
      });

      if (data.length > 0) {
        const firstTask = Object.keys(data[0])[0];
        taskTypeSelect.value = firstTask;
        updateToggleState(firstTask, taskVisibilityMap[firstTask]);
        updateLeaderboard();
      }

      taskTypeSelect.addEventListener("change", (event) => {
        const selectedTask = event.target.value;
        updateToggleState(selectedTask, taskVisibilityMap[selectedTask]);
      });
    })
    .catch((error) => console.error("Error loading task types:", error));
}

function updateLeaderboard() {
  const taskType = document.getElementById("taskType").value;
  fetch(`https://javaapi.abhiwandemos.com/api/v1/admin/tasks-list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  });

  const isVisible =
    document.getElementById("sliderStatus").innerText === "Public";

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/tasks/leaderboard?taskName=${taskType}&isVisible=${isVisible}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch leaderboard data");
      }
    })
    .then((data) => {
      $("#leaderboardContent").empty();
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          appendLeaderboard(data[i]);
        }
      } else {
        console.error("Invalid data format received:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching leaderboard data:", error);
    });
}

function leaderBoardToggleSlider() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");
  const taskType = document.getElementById("taskType").value;
  const isVisible = slider.classList.contains("on");

  slider.classList.toggle("on", !isVisible);
  sliderStatus.innerText = !isVisible ? "Public" : "Private";

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/${taskType}/leaderboard/visibility?visible=${!isVisible}`,
    {
      method: "PATCH",
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update leaderboard visibility");
      }
    })
    .then((data) => {
      loadTaskTypes();
      updateLeaderboard();
      const dropdown = document.getElementById("taskType");
      dropdown.value = taskType;
    })
    .catch((error) => {
      console.error("Error updating visibility:", error);
    });
}

function confirmReferal() {
  const referralAmount = document.getElementById("referal").value.trim();
  if (isNaN(referralAmount) || referralAmount === "") {
    alert("Please enter a valid number for the referral amount.");
    return;
  }

  if (Number(referralAmount) < 0) {
    alert("Please enter a valid positive Amount.");
    return;
  }

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/referral-config?referralValue=${Number(
      referralAmount
    )}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(
          `Failed to confirm referral. Status: ${response.status}`
        );
      }
    })
    .then((responseData) => {
      alert("Referral amount confirmed successfully!");
      document.getElementById("referal").value = "";
      getReferralAmount();
    })
    .catch((error) => {
      console.error("Error confirming referral:", error);
      alert(
        `There was an error confirming the referral: ${error.message}. Please try again.`
      );
    });
}

var isReferralBoostEnabled = false;

function checkReferralBoostStatus() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");

  fetch(
    "https://javaapi.abhiwandemos.com/api/v1/admin/referral-xp-boost-status",
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        slider.classList.add("on");
        sliderStatus.textContent = "Enable";
        isReferralBoostEnabled = true;
      } else {
        slider.classList.remove("on");
        sliderStatus.textContent = "Disable";
        isReferralBoostEnabled = false;
      }
    })
    .catch((error) => {
      console.error("Error fetching referral XP boost status:", error);
      alert("Error loading referral XP boost status. Please try again.");
    });
}

function referalToggleSlider() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");

  const apiUrl = isReferralBoostEnabled
    ? "https://javaapi.abhiwandemos.com/api/v1/admin/disable-referral-xp-boost"
    : "https://javaapi.abhiwandemos.com/api/v1/admin/enable-referral-xp-boost";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => {
      if (response.ok) {
        isReferralBoostEnabled = !isReferralBoostEnabled;
        isReferralBoostEnabled ? alert("Enabled") : alert("Disabled");
        slider.classList.toggle("on", isReferralBoostEnabled);
        sliderStatus.textContent = isReferralBoostEnabled
          ? "Enable"
          : "Disable";
      } else {
        throw new Error("Failed to toggle referral XP boost");
      }
    })
    .catch((error) => {
      console.error("Error toggling referral XP boost:", error);
      alert(
        "There was an error toggling the referral XP boost. Please try again."
      );
    });
}
