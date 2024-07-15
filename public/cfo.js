window.addEventListener('load', ()=>{
  console.log('loaded');
  setTimeout(() => {
    const ele = document.querySelector(".animation-container");
    ele.style.display = "none"; 
  }, 1500);
});
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
    const debtorChange = document.getElementById("debtor-change");
    const creditorChange = document.getElementById("creditor-change");
    const netDifferencePayable = document.getElementById("net-difference-payables");
    const netDifferenceReceivable = document.getElementById("net-difference-receivables");
    const entriesObj = {
      "Funds Received": null,
      "Funds Sent": null,
      "Advices Updated": null,
      "Tax Invoices": null,
      "Purchase Voucher Sum": null,
      "Previous Day Debtors": null,
      "Previous Day Creditors": null,
      "Today's Creditors": null,
      "Today's Debtors": null,
    };
    fetch("http://16.171.64.239/api/entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
        let count = 0;
        data.forEach((entry) => {
          if (entry.acc_number == selectedValue) {
            entriesObj[entry.type] = [entry.amount, entry.mailid];
            count++;
          }
        });
        if (count) {
          const entries = document.getElementById("entries");
          entries.innerHTML = "";
          Object.entries(entriesObj).forEach(([key, value]) => {
            const type = key;
            const amount = value[0];
            const mailid = value[1];
            switch (type) {
              case "Funds Received":
                fundsReceived = amount;
                break;
              case "Funds Sent":
                fundsSent = amount;
                break;
              case "Advices Updated":
                adviceUpdated = amount;
                break;
              case "Purchase Voucher Sum":
                purchaseVoucher = amount;
                break;
              case "Tax Invoices":
                taxInvoices = amount;
                break;
              case "Previous Day Debtors":
                previousDebtors = amount;
                break;
              case "Today's Debtors":
                todayDebtors = amount;
                break;
              case "Previous Day Creditors":
                previousCreditors = amount;
                break;
              case "Today's Creditors":
                todayCreditors = amount;
                break;
            }

            const entryDiv = document.createElement("div");
            entryDiv.className = "entry";
            entryDiv.innerHTML = `
                <div class="type">${key}(<i class="fa-solid fa-indian-rupee-sign"></i>)</div>
                <div class="amount">${amount} /-</div>
                <div class="user"> ${mailid} </div>
              `;
            entries.appendChild(entryDiv);
          });
          debtorChange.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayDebtors - previousDebtors
            } /-`;
          creditorChange.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayCreditors - previousCreditors
            } /-`;
          netDifferencePayable.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${purchaseVoucher - fundsSent
            } /-`;
          netDifferenceReceivable.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${taxInvoices - adviceUpdated
            } /-`;
        } else {
          entries.innerHTML = "empty";
          debtorChange.innerHTML = "---";
          creditorChange.innerHTML = "---";
          netDifferencePayable.innerHTML = "---";
          netDifferenceReceivable.innerHTML = "---";
        }
      })
      .catch((error) => console.error("Error fetching entries:", error));
  });

  function changePassword(currentPassword, newPassword) {
    fetch("http://16.171.64.239/api/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
      .then(() => {
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

  document.getElementById("user").addEventListener("click", () => {
    console.log("click");
    const userInfo = document.getElementsByClassName("user-info")[0];
    userInfo.classList.add("focus");

    let currentPasswordInput = document.createElement("input");
    currentPasswordInput.type = "password";
    currentPasswordInput.placeholder = "Current Password";
    currentPasswordInput.id = "currentPasswordInput";
    currentPasswordInput.style.border = "none";
    currentPasswordInput.style.outline = "none";

    let newPasswordInput = document.createElement("input");
    newPasswordInput.type = "password";
    newPasswordInput.placeholder = "New Password";
    newPasswordInput.id = "newPasswordInput";
    newPasswordInput.style.border = "none";
    newPasswordInput.style.outline = "none";

    let close = document.createElement("span");
    close.style.setProperty("color", "var(--primary)");
    close.id = "close";
    close.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    close.addEventListener("click", () => {
      userInfo.classList.remove("focus");
      emailEle.innerHTML = "";
      emailEle.innerHTML = email;
      document.removeEventListener("click", outsideClickListener);
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
        if (newPassword) {
          changePassword(currentPassword, newPassword);
          userInfo.classList.remove("focus");
          emailEle.innerHTML = "";
          emailEle.innerHTML = email;
          document.removeEventListener("click", outsideClickListener);
        }
      }
    });

    // Define the outside click listener
    function outsideClickListener(event) {
      if (!userInfo.contains(event.target) && event.target.id !== "user") {
        userInfo.classList.remove("focus");
        emailEle.innerHTML = "";
        emailEle.innerHTML = email;
        document.removeEventListener("click", outsideClickListener);
      }
    }

    // Add the outside click listener
    document.addEventListener("click", outsideClickListener);
  });

  document.getElementById("gear").addEventListener("click", function () {
    const notificationBox = document.getElementById("notification");
    const header = document.getElementById("header");
    const financeUsers = document.getElementById("financeUsers");
    const accountsUsers = document.getElementById("accountsUsers");

    notificationBox.classList.add("open");
    header.style.display = "flex";
    console.log(token);

    fetch("http://16.171.64.239/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
        financeUsers.innerHTML = "";
        accountsUsers.innerHTML = "";

        data.forEach((user) => {
          const userEle = document.createElement("div");
          userEle.className = "userEle";
          userEle.innerHTML = `
            <div class="userEmail">${user.email}</div>
            <span class="del" data-id="${user.id}"><i class="fa-solid fa-xmark"></i></span>
          `;

          if (user.department === "finance") {
            financeUsers.appendChild(userEle);
          } else if (user.department === "accounts") {
            accountsUsers.appendChild(userEle);
          }

          // Add event listener to the delete button
          userEle.querySelector(".del").addEventListener("click", function () {
            const userId = this.getAttribute("data-id");

            fetch("http://16.171.64.239/api/user", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userId: userId }),
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
                console.log("User deleted successfully:", data);
                // Show success message
                Swal.fire({
                  icon: "success",
                  title: "Deleted",
                  text: "User deleted successfully",
                  customClass: {
                    popup: "custom-popup",
                    title: "custom-title",
                    confirmButton: "custom-confirm-button",
                  },
                });
                // Optionally, remove the user element from the DOM
                userEle.remove();
              })
              .catch((error) => {
                console.error("Error deleting user:", error);
                // Show error message
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: error.message || "Error deleting user",
                  customClass: {
                    popup: "custom-popup",
                    title: "custom-title",
                    confirmButton: "custom-confirm-button",
                  },
                });
              });
          });
        });

        // Add the plus icons with event listeners
        const financePlusIcon = document.createElement("div");
        financePlusIcon.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        financePlusIcon.addEventListener("click", () => {
          Swal.fire({
            title: "Add Finance Access",
            html: `
              <input type="text" id="addUserEmail" class="swal2-input" placeholder="Email">
              <input type="password" id="addUserPassword" class="swal2-input" placeholder="Password">
            `,
            showCancelButton: true,
            confirmButtonText: "Add",
            cancelButtonText: "Cancel",
            preConfirm: () => {
              const addUserEmail =
                Swal.getPopup().querySelector("#addUserEmail").value;
              const addUserPassword =
                Swal.getPopup().querySelector("#addUserPassword").value;
              if (!addUserEmail || !addUserPassword) {
                Swal.showValidationMessage(
                  `Please enter both email and password`
                );
              }
              return { email: addUserEmail, password: addUserPassword };
            },
            customClass: {
              popup: "custom-popup",
              title: "custom-title",
              confirmButton: "custom-confirm-button",
              cancelButton: "custom-cancel-button",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const { email, password } = result.value;
              console.log("Email:", email, "Password:", password);
              const userDepartment = "finance";
              fetch("http://16.171.64.239/api/users", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userDepartment,
                  mailid: email,
                  password: password,
                }),
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
                  console.log("User added successfully:", data);
                  // Show success message
                  Swal.fire({
                    icon: "success",
                    title: "Added",
                    text: "User added successfully",
                    customClass: {
                      popup: "custom-popup",
                      title: "custom-title",
                      confirmButton: "custom-confirm-button",
                    },
                  });
                  const userEle = document.createElement("div");
                  userEle.className = "userEle";
                  userEle.innerHTML = `
                    <div class="userEmail">${email}</div>
                    <span class="del" data-id="${data.id}"><i class="fa-solid fa-xmark"></i></span>
                  `;
                  financeUsers.appendChild(userEle);
                })
                .catch((error) => {
                  console.error("Error adding user:", error);
                  // Show error message
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Error adding user",
                    customClass: {
                      popup: "custom-popup",
                      title: "custom-title",
                      confirmButton: "custom-confirm-button",
                    },
                  });
                });
            }
          });
        });
        financeUsers.appendChild(financePlusIcon);

        const accountsPlusIcon = document.createElement("div");
        accountsPlusIcon.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        accountsPlusIcon.addEventListener("click", () => {
          Swal.fire({
            title: "Add Accounts Access",
            html: `
              <input type="text" id="addUserEmail" class="swal2-input" placeholder="Email">
              <input type="password" id="addUserPassword" class="swal2-input" placeholder="Password">
            `,
            showCancelButton: true,
            confirmButtonText: "Add",
            cancelButtonText: "Cancel",
            preConfirm: () => {
              const addUserEmail =
                Swal.getPopup().querySelector("#addUserEmail").value;
              const addUserPassword =
                Swal.getPopup().querySelector("#addUserPassword").value;
              if (!addUserEmail || !addUserPassword) {
                Swal.showValidationMessage(
                  `Please enter both email and password`
                );
              }
              return { email: addUserEmail, password: addUserPassword };
            },
            customClass: {
              popup: "custom-popup",
              title: "custom-title",
              confirmButton: "custom-confirm-button",
              cancelButton: "custom-cancel-button",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const { email, password } = result.value;
              console.log("Email:", email, "Password:", password);
              const userDepartment = "accounts";
              fetch("http://16.171.64.239/api/users", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userDepartment,
                  mailid: email,
                  password: password,
                }),
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
                  console.log("User added successfully:", data);
                  // Show success message
                  Swal.fire({
                    icon: "success",
                    title: "Added",
                    text: "User added successfully",
                    customClass: {
                      popup: "custom-popup",
                      title: "custom-title",
                      confirmButton: "custom-confirm-button",
                    },
                  });
                  // Optionally, add the new user to the DOM
                  const userEle = document.createElement("div");
                  userEle.className = "userEle";
                  userEle.innerHTML = `
                    <div class="userEmail">${email}</div>
                    <span class="del" data-id="${data.id}"><i class="fa-solid fa-xmark"></i></span>
                  `;
                  accountsUsers.appendChild(userEle);
                })
                .catch((error) => {
                  console.error("Error adding user:", error);
                  // Show error message
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Error adding user",
                    customClass: {
                      popup: "custom-popup",
                      title: "custom-title",
                      confirmButton: "custom-confirm-button",
                    },
                  });
                });
            }
          });
        });
        accountsUsers.appendChild(accountsPlusIcon);
      })
      .catch((error) => console.error("Error fetching users:", error));

    document.querySelector("#gear").classList.add("hidden");
    document.querySelector("#allUsers").style.display = "grid";

    document.getElementById("close").addEventListener("click", () => {
      const notificationBox = document.getElementById("notification");
      const header = document.getElementById("header");
      notificationBox.classList.remove("open");
      header.style.display = "none";

      document.getElementById("gear").classList.remove("hidden");
      document.querySelector("#allUsers").style.display = "none";
    });
  });
});
