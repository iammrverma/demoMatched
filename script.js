document.getElementById("loginForm").addEventListener("submit", function (event) {
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
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.accessGranted) {
        localStorage.setItem("token", data.token);
        const departmentUrlMap = {
          finance: "finance.html",
          accounts: "accounts.html",
          cfo: "cfo.html",
        };
        const redirectUrl = departmentUrlMap[data.department];
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error("Invalid department received");
        }
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
    .catch((error) => {
      console.error("Error verifying access:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to login. Please try again later.",
        confirmButtonText: "Ok",
        customClass: {
          popup: "custom-popup",
          title: "custom-title",
          confirmButton: "custom-confirm-button",
        },
      });
    });
});
