function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; 
  }

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
      body: JSON.stringify({mailid, type, amount, entry_date, accountNumber }),
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
        document.getElementById("fundsReceived").value = "";
        document.getElementById("fundsSent").value = "";
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
    document.getElementsByClassName("info")[0].classList.add("focus");
  
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
      document.getElementsByClassName("info")[0].classList.remove("focus");
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
          document.getElementsByClassName("info")[0].classList.remove("focus");
          emailEle.innerHTML = "";
          emailEle.innerHTML = email;
        }
      }
    });
  });

  document.getElementById("fundsForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const fundsReceived = document.getElementById("fundsReceived").value;
    const fundsSent = document.getElementById("fundsSent").value;
    const accountNumber = document.getElementById("accountNumber").value;

    make_request(email, "funds received", fundsReceived, getDate(), accountNumber);
    make_request(email, "funds sent", fundsSent, getDate(), accountNumber);
  });

});


