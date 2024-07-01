function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get("name"),
    email: params.get("email"),
  };
}
function getDate() {
  const currentDate = new Date();

  // Get the current date components
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function handleRequestAction(requestId, action, requestElement, requestDepartment, requestMailid) {
  if (action === "accept") {
    fetch("http://127.0.0.1:3000/api/acceptAccess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestDepartment, requestMailid }),
    }).then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete request");
      }
      return response.json();
    }).then(data => {
      console.log(data);
      requestElement.remove();
    })
      .catch(error => {
        console.error("Error accepting request:", error);
      });
  }
  fetch("http://127.0.0.1:3000/api/deleteAccessRequest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete request");
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      // Remove the request element from the DOM
      requestElement.remove();
    })
    .catch(error => {
      console.error("Error deleting request:", error);
    });
}



document.addEventListener("DOMContentLoaded", function () {
  const { email } = getQueryParams();
  const department = "cfo";

  document.getElementById("date").innerHTML = getDate();

  console.log("Name: ", name);
  console.log("Email: ", email);
  let fundsReceived,
    fundsSent,
    adviceSum,
    purchaseVoucher,
    taxAdviceRaised,
    previousDebtors,
    todayDebtors,
    previousCreditors,
    todayCreditors;

  // fetch("http://127.0.0.1:3000/api/accessRequests", {
  //   method: "GET",
  //   headers: {
  //     "x-department": department,
  //     "x-email": email,
  //   },
  // })
  //   .then(response => {
  //     if (!response.ok) {
  //       throw new Error("Unauthorized....");
  //     }
  //     return response.json();
  //   })
  //   .then(data => {
  //     if (Array.isArray(data) && data.length > 0) {
  //       const bell = document.getElementById("bell");
  //       bell.innerHTML = `<i class="fa-solid fa-bell"></i>`;
  //       document.getElementById('notification_badge').classList.remove('hidden');
  //       const requestsDiv = document.getElementById("requests");
  //       requestsDiv.innerHTML = "";
  //       data.forEach(request => {
  //         console.log(request);
  //         const child = document.createElement('div');
  //         child.classList.add('request');
  //         child.innerHTML = `
  //             <div class="request_mail">${request.mailid}</div>
  //             <div class="info">
  //               <div class="for">${request.department}</div>
  //               <span class="accept-button" data-id="${request.id}" data-department="${request.department}" data-email="${request.mailid}"><i class="fa-solid fa-check"></i></span>
  //               <span class="reject-button" data-id="${request.id}" data-department="${request.department}" data-email="${request.mailid}"><i class="fa-solid fa-xmark"></i></span>
  //             </div>
  //         `;
  //         requestsDiv.appendChild(child);
  //       });

  //       document.querySelectorAll(".accept-button").forEach(button => {
  //         button.addEventListener("click", function () {
  //           const requestElement = this.closest('.request');
  //           handleRequestAction(this.dataset.id, "accept", requestElement, this.dataset.department, this.dataset.email);
  //         });
  //       });

  //       document.querySelectorAll(".reject-button").forEach(button => {
  //         button.addEventListener("click", function () {
  //           const requestElement = this.closest('.request');
  //           console.log(this);
  //           handleRequestAction(this.dataset.id, "reject", requestElement);
  //           console.log("rejected");
  //         });
  //       });
  //     } else {
  //       console.error("Data is not an array:", data);
  //     }
  //   })
  //   .catch(error => {
  //     console.error("Error fetching access requests:", error);
  //   });

  document.getElementById("accountNumber").addEventListener("change", function (event) {
    const selectedValue = event.target.value;
    const department = "cfo"; // Set the department as "cfo" for access

    fetch("http://127.0.0.1:3000/api/entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-department": department,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        const entries = document.getElementById("entries");
        entries.innerHTML = "";
        data.forEach((entry) => {
          if (
            entry.acc_number == selectedValue &&
            getDate() == new Date(entry.entry_date).toLocaleDateString("en-CA")
          ) {
            let type = entry.type;
            let badgeNumber;
            switch (type) {
              case "funds received":
                badgeNumber = 1;
                fundsReceived = entry.amount;
                break;
              case "funds sent":
                badgeNumber = 2;
                fundsSent = entry.amount;
                break;
              case "Advice Sum":
                badgeNumber = 3;
                adviceSum = entry.amount;
                break;
              case "Purchase Voucher Sum":
                badgeNumber = 4;
                purchaseVoucher = entry.amount;
                break;
              case "Tax Advice Raised Sum":
                badgeNumber = 5;
                taxAdviceRaised = entry.amount;
                break;
              case "Previous Day Debtors":
                badgeNumber = 6;
                previousDebtors = entry.amount;
                break;
              case "Today's Debtors":
                badgeNumber = 7;
                todayDebtors = entry.amount;
                break;
              case "Previous Day Creditors":
                badgeNumber = 8;
                previousCreditors = entry.amount;
                break;
              case "Today's Creditors":
                badgeNumber = 9;
                todayCreditors = entry.amount;
                break;
            }
            const entryDiv = document.createElement("div");
            entryDiv.className = "entry";
            entryDiv.innerHTML = `
          <div class="info">
            <span class="badge">${badgeNumber}</span>
            <div class="type">${entry.type}</div>
            <div class="amount"><i class="fa-solid fa-indian-rupee-sign"></i> ${entry.amount} /-</div>
          </div>
          <div class="user"> ${entry.mailid} </div>
        `;
            entries.appendChild(entryDiv);
          }
        });

        document.getElementById(
          "debtor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayDebtors - previousDebtors} /-<span class="badge">7 - 6</span>`;

        document.getElementById(
          "creditor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayCreditors - previousCreditors} /-<span class="badge">9 - 8</span>`;

        document.getElementById(
          "outstanding-payables"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${purchaseVoucher - fundsSent} /-<span class="badge">4 - 2</span>`;

        document.getElementById(
          "net-tax-liability"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${taxAdviceRaised - adviceSum} /-<span class="badge">5 - 3</span>`;
      })
      .catch((error) => console.error("Error fetching entries:", error));

    function getDate() {
      // Implement your function to get the current date in the desired format
      return new Date().toLocaleDateString("en-CA");
    }

  });

  document.getElementById("bell").addEventListener("click", function (event) {
    const notificationBox = document.getElementById("notification");
    const header = document.getElementById("header");
    notificationBox.classList.add("open");
    header.style.display = "flex";

    document.querySelector("#bell").classList.add("hidden");
    document.querySelector("#notification_badge").classList.add("hidden");
    document.querySelector("#requests").classList.remove("hidden");
  });

  document.getElementById("close").addEventListener("click", () => {
    const notificationBox = document.getElementById("notification");
    const header = document.getElementById("header");
    notificationBox.classList.remove("open");
    header.style.display = "none";

    document.getElementById("bell").classList.remove("hidden");
    document.querySelector("#requests").classList.add("hidden");
  });
});
