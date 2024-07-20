function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  
  function make_request(type, amount, entry_date, accountNumber) {
    const mailid = document.getElementById('fmail').innerText;
    let localEntries = JSON.parse(localStorage.getItem(`${accountNumber}`)) || [];
    localEntries.push({ mailid, type, amount, entry_date, accountNumber });
    localStorage.setItem(`${accountNumber}`, JSON.stringify(localEntries));
  }
  document.getElementById("fundsForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const fundsReceived = document.getElementById("fundsReceived").value;
    const fundsSent = document.getElementById("fundsSent").value;
    const accountNumber = document.getElementById("fAccountNumber").value;

    make_request("Funds Received", fundsReceived, getDate(), accountNumber);
    make_request("Funds Sent", fundsSent, getDate(), accountNumber);
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
  });
});