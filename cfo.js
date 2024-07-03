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
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; 
  }
  const decodedToken = jwt_decode(token);
  const email = decodedToken.email;

  document.getElementById("email").innerHTML = email;

  let fundsReceived,
    fundsSent,
    adviceUpdated,
    purchaseVoucher,
    taxInvoices,
    previousDebtors,
    todayDebtors,
    previousCreditors,
    todayCreditors;

  document.getElementById("accountNumber").addEventListener("change", function (event) {
    const selectedValue = event.target.value;

    fetch("http://127.0.0.1:3000/api/entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
              case "Advices Updated":
                badgeNumber = 3;
                adviceUpdated = entry.amount;
                break;
              case "Purchase Voucher Sum":
                badgeNumber = 4;
                purchaseVoucher = entry.amount;
                break;
              case "Tax Invoices":
                badgeNumber = 5;
                taxInvoices = entry.amount;
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
          <div class="type">${entry.type}(<i class="fa-solid fa-indian-rupee-sign"></i>)</div>
          <div class="amount">${entry.amount} /-</div>
          <div class="user"> ${entry.mailid} </div>
        `;
            entries.appendChild(entryDiv);
          }
        });

        document.getElementById(
          "debtor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayDebtors - previousDebtors} /-`;

        document.getElementById(
          "creditor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayCreditors - previousCreditors} /-`;

        document.getElementById(
          "net-difference-payables"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${purchaseVoucher - fundsSent} /-`;

        document.getElementById(
          "net-difference-receivables"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${taxInvoices - adviceUpdated} /-`;
      })
      .catch((error) => console.error("Error fetching entries:", error));
  });

  function changePassword(currentPassword, newPassword) {
    fetch("http://127.0.0.1:3000/api/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
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
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed",
        customClass: {
          popup: "custom-popup",
          title: "custom-title",
          confirmButton: "custom-confirm-button",
        },
      });
    })
    .catch((error) => {
      console.error("Error changing password:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Try changing password later",
      });
    });
  }

  document.getElementById('user').addEventListener("click", (e) => {
    console.log("click");
    document.getElementsByClassName("user-info")[0].classList.add("focus");
  
    let currentPasswordInput = document.createElement("input");
    currentPasswordInput.type = "password";
    currentPasswordInput.placeholder = "Current Password";
    currentPasswordInput.id = "currentPasswordInput";
    currentPasswordInput.style.border = 'none';
    currentPasswordInput.style.outline = 'none';
  
    let newPasswordInput = document.createElement("input");
    newPasswordInput.type = "password";
    newPasswordInput.placeholder = "New Password";
    newPasswordInput.id = "newPasswordInput";
    newPasswordInput.style.border = 'none';
    newPasswordInput.style.outline = 'none';
    
    let close =document.createElement("span");
    close.style.setProperty("color", "var(--primary)");
    close.id = "close";
    close.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    close.addEventListener("click", (e)=>{
      document.getElementsByClassName("user-info")[0].classList.remove("focus");
      emailEle.innerHTML = "";
      emailEle.innerHTML = email;
    });
    const emailEle = document.getElementById("email");
    emailEle.innerHTML = "";
    emailEle.appendChild(currentPasswordInput);
    emailEle.appendChild(newPasswordInput);
    emailEle.appendChild(close);
  
    currentPasswordInput.focus(); // Focus the current password input
  
    newPasswordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        if (newPassword){
          changePassword(currentPassword, newPassword); 
          document.getElementsByClassName("user-info")[0].classList.remove("focus");
          emailEle.innerHTML = "";
          emailEle.innerHTML = email;
        }
      }
    });
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
