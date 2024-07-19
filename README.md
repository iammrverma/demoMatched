#Project Title#
This project consists of various modules for managing user accounts, CFO tasks, finance operations, and tooltips. Each module is designed to handle specific functionalities as outlined below.

##Table of Contents##
Accounts Module
CFO Module
Finance Module
Tooltip Module (myTippy.js)
Installation
Usage

##Accounts Module##
The accounts.js file handles the functionalities related to user accounts.

##Features##
###Date Handling###: Retrieves the current date in YYYY-MM-DD format.
###Password Change###: Allows users to change their password.
###Entry Management###: Manages various types of financial entries.
###Token Validation###: Validates JWT tokens to authenticate users.
###UI Interactions###: Handles various user interface interactions for accounts.
##Important Functions##
###getDate()###: Returns the current date in YYYY-MM-DD format.
###changePassword(currentPassword, newPassword)###: Changes the user's password.
###make_request(mailid, type, amount, entry_date, accountNumber)###: Makes a request to add financial entries.

##CFO Module##
The cfo.js file handles tasks specific to the Chief Financial Officer (CFO) role.

##Features##
###Token Validation###: Validates JWT tokens to authenticate CFOs.
###Entry Management###: Manages various types of financial entries specific to CFOs.
###Password Change###: Allows CFOs to change their password.
##Important Functions##
###getDate()###: Returns the current date in YYYY-MM-DD format.
###changePassword(currentPassword, newPassword)###: Changes the CFO's password.
###make_request(mailid, type, amount, entry_date, accountNumber)###: Makes a request to add financial entries.

##Finance Module##
The finance.js file handles general financial operations.

##Features##
##Date Handling##: Retrieves the current date in YYYY-MM-DD format.
##Password Change##: Allows users to change their password.
##Entry Management##: Manages various types of financial entries.
##Token Validation##: Validates JWT tokens to authenticate users.
##UI Interactions##: Handles various user interface interactions for finance operations.
Important Functions
##getDate()##: Returns the current date in YYYY-MM-DD format.
##changePassword(currentPassword, newPassword)##: Changes the user's password.
##make_request(mailid, type, amount, entry_date, accountNumber)##: Makes a request to add financial entries.

Clone the repository:
`git clone `
Navigate to the project directory:
`cd Matched`
Install the required dependencies:
`npm install`
Usage
To start the project, use the following command:
`npm start`
Ensure that you have a running backend server to handle API requests. Update the IP and PORT variables in the JavaScript files to match your server configuration.
