The project uses:
            .NET 9 for the backend
            React for the frontend
            PostgreSQL for the database
            fly.io for deployment

Deployment Links:
    Backend:   https://dead-pigeons-backend.fly.dev
    Frontend:  https://pigeons-web.fly.dev

Test Users: 

    Username: Edd_Tester     Password: passwd_tester

    Username: Trevor_Parker  Password: trevpark456456
    
Test Admin:

    Username: admin          Password: admpasswd444
    

The system has one admin user.
Only the admin can access certain pages: /login, /dashboard, /addUser, /winningNumbers, /gameHistory, /userHistory, /approvePay, and /editUser.
On these pages, the admin is capable of:  logging in to their account
                                          adding new users to the database
                                          adding the current week's winning numbers
                                          viewing previous games, including the week's income and winners
                                          viewing all users' general information, previously played boards, and previous payments
                                          approving pending payments added by users
                                          editing users' data and setting their activity status

The system has multiple regular users.
Users can access these pages: /login, /dashboard, /buyBoard, /prevBoards, /prevPay, and /addPayment.
On these pages, users are capable of:   logging in to their accounts
                                        buying boards for the current game with their balance
                                        viewing their own previous boards
                                        viewing their own previous payments
                                        adding payment numbers for the admin to validate
Users are unable to access admin pages.


Currently, the project has one known issue with logging server-thrown errors on the client-side.

Note (not a bug): If a user cannot buy boards, it is likely because no new game has been created for more than a week. When a game is created, a closesAt value is set in the database, which is the following Saturday at 5 PM Danish local time.
After this time, users cannot buy boards for that game. Since the API creates a new game only when winning numbers are added, if no winning numbers have been added by the closing date, users will not be able to buy new boards.
As the game is intended to be a weekly event, this should not be an issue in normal use.

