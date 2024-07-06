function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); //zero-based months
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if(!token) window.location.href = "index.html";

  const decodedToken = jwt_decode(token);
  const email = decodedToken.email;

  document.getElementById("email").innerHTML = email;

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

  function make_request(mailid, type, amount, entry_date, accountNumber) {
    fetch("http://127.0.0.1:3000/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ mailid, type, amount, entry_date, accountNumber }),
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
          text: "Entry Made Successfully",
          customClass: {
            popup: "custom-popup",
            title: "custom-title",
            confirmButton: "custom-confirm-button",
          },
        });
      })
      .catch((error) => {
        console.error("Error adding entry:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while making the entry",
        });
      });
  }

  document.getElementById('user').addEventListener("click", (e) => {
    console.log("click");
    const info = document.getElementsByClassName("info")[0];
    info.classList.add("focus");
  
    let currentPasswordInput = document.createElement("input");
    currentPasswordInput.type = "password";
    currentPasswordInput.placeholder = "Current Password";
    currentPasswordInput.id = "currentPasswordInput";
    currentPasswordInput.style.border = 'none';
    currentPasswordInput.style.outline = 'none';
    currentPasswordInput.style.boxShadow = 'none';
  
    let newPasswordInput = document.createElement("input");
    newPasswordInput.type = "password";
    newPasswordInput.placeholder = "New Password";
    newPasswordInput.id = "newPasswordInput";
    newPasswordInput.style.border = 'none';
    newPasswordInput.style.outline = 'none';
    newPasswordInput.style.boxShadow = 'none';
    
    let close =document.createElement("span");
    close.style.setProperty("color", "var(--primary)");
    close.id = "close";
    close.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    close.addEventListener("click", (e)=>{
      info.classList.remove("focus");
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
        if (newPassword){
          changePassword(currentPassword, newPassword); 
          info.classList.remove("focus");
          emailEle.innerHTML = "";
          emailEle.innerHTML = email;
          document.removeEventListener("click", outsideClickListener);
        }
      }
    });
    function outsideClickListener(event) {
      if (!info.contains(event.target) && event.target.id !== 'user') {
        info.classList.remove("focus");
        emailEle.innerHTML = "";
        emailEle.innerHTML = email;
        document.removeEventListener("click", outsideClickListener);
      }
    }
  
    // Add the outside click listener
    document.addEventListener("click", outsideClickListener);
  });

  document.getElementById("entryForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const accountNumber = document.getElementById("accountNumber").value;
      const entry_map = {
        "Advices Updated": document.getElementById("advice-updated").value,
        "Purchase Voucher Sum":
          document.getElementById("purchase-voucher").value,
        "Tax Invoices":
          document.getElementById("tax-invoice").value,
        "Previous Day Debtors":
          document.getElementById("debtors-previous").value,
        "Today's Debtors": document.getElementById("debtors-today").value,
        "Previous Day Creditors":
          document.getElementById("creditors-previous").value,
        "Today's Creditors": document.getElementById("creditors-today").value,
      };
      for(const key in entry_map){
        if (entry_map[key].length > 9) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Supported values upto 9 digits",
          });
          return;
        }
      }
      for (const key in entry_map) {
        if (entry_map.hasOwnProperty(key)) {
          try {
            make_request(email,key,entry_map[key],getDate(),accountNumber);
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Entry Made Successfully",
              customClass: {
                popup: "custom-popup",
                title: "custom-title",
                confirmButton: "custom-confirm-button",
              },
            });
            document.getElementById("advice-updated").value = "";
            document.getElementById("purchase-voucher").value = "";
            document.getElementById("tax-invoice").value = "";
            document.getElementById("debtors-previous").value = "";
            document.getElementById("debtors-today").value = "";
            document.getElementById("creditors-previous").value = "";
            document.getElementById("creditors-today").value = "";
          } catch (e) {
            console.error("An error occurred while making the request: ", e);
            // Show error notification
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "An error occurred while making the entry",
            });
          }
        }
      }
    });

    
});
