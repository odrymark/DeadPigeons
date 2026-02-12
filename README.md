**Showcase Images:**

<img width="1917" height="957" alt="image" src="https://github.com/user-attachments/assets/b493574f-fe43-493e-87f6-47b4534770e8" />

---

<img width="1914" height="954" alt="image" src="https://github.com/user-attachments/assets/a5c1a84b-27fe-4c29-af3e-a454429a0a0d" />

---

<img width="1920" height="958" alt="image" src="https://github.com/user-attachments/assets/d7f19bd8-eadb-4150-b682-00ec3cc180c9" />

---



The project uses:
- .NET 9 for the backend
- React for the frontend
- PostgreSQL as the database
- fly.io for deployment

Deployment Links:
- **Frontend**: [https://pigeons-web.fly.dev](https://pigeons-web.fly.dev)
- **Backend API**: [https://dead-pigeons-backend.fly.dev](https://dead-pigeons-backend.fly.dev)

Test Users: 

    Username: Edd_Tester     Password: passwd_tester
    Username: Trevor_Parker  Password: trevpark456456
    
Test Admin:

    Username: admin          Password: admpasswd444
    

### Admin User
The system includes **one admin user**.

**Admin-only pages**:  
`/login` | `/dashboard` | `/addUser` | `/winningNumbers` | `/gameHistory` | `/userHistory` | `/approvePay` | `/editUser`

On these pages, the admin can:  
- Log in to their account  
- Add new users to the database  
- Add the current week's winning numbers  
- View previous games, including weekly income and winners  
- View all users' general information, previously played boards, and previous payments  
- Approve pending payments added by users  
- Edit users' data and set their activity status  

---

### Regular Users
The system supports **multiple regular users**.

**User-accessible pages**:  
`/login` | `/dashboard` | `/buyBoard` | `/prevBoards` | `/prevPay` | `/addPayment`

On these pages, users can:  
- Log in to their accounts  
- Buy boards for the current game using their balance  
- View their own previous boards  
- View their own previous payments  
- Add payment numbers for admin validation  

**Regular users cannot access admin-only pages.**

---

Currently, the project has one known issue with logging server-thrown errors on the client-side.

Note (not a bug): If a user cannot buy boards, it is likely because no new game has been created for more than a week. When a game is created, a closesAt value is set in the database, which is the following Saturday at 5 PM Danish local time.
After this time, users cannot buy boards for that game. Since the API creates a new game only when winning numbers are added, if no winning numbers have been added by the closing date, users will not be able to buy new boards.
As the game is intended to be a weekly event, this should not be an issue in normal use.

