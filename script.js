document
.getElementById("loginForm")
.addEventListener("submit", function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://127.0.0.1:3000/api/verifyAccess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessGranted) {
        const departmentUrlMap = {
          finance: "finance.html",
          accounts: "accounts.html",
          cfo: "cfo.html",
        };
        // Redirect to the department page with email and name as query parameters
      window.location.href = `${departmentUrlMap[data.department]}?email=${encodeURIComponent(email)}`;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unauthorized User",
          confirmButtonText: "Ok", 
          cancelButtonText: "Cancel", 
          customClass: {
            popup: "custom-popup",
            title: "custom-title",
            confirmButton: "custom-confirm-button",
          },
        });
      }
    })
    .catch((error) => console.error("Error verifying access:", error));
});