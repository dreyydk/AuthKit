![Banner](https://github.com/user-attachments/assets/1e040abb-b5cc-44ec-b866-c444dd090df8)

# Authify - Node.js authentication API.

Authify is an advanced, 100% open-source authentication API designed for Node.js developers looking for a faster and easier way to implement a complete authentication system in their web applications.

To use the codes in this repository, a certain level of knowledge in backend development (Rest APIs, HTTP requests, non-relational databases like MongoDB, etc.) is required.


## Feats

- User creation and management.
- Authentication sections with tokens.
- Sending emails for verifications and resets.
- Encrypting data before storing it.
- Data storage in a non-relational database.


## Tech Stack

- Node.js (heart of the API).
- Express.js (framework for the server).
- MongoDB (database).
- Mailtrap & Nodemailer (sending emails to verify/reset passwords).


## Environment Variables

To run this API you will need some variables in your .env, they are the following:

`MONGO_URI`: The address of your cluster in MongoDB Atlas.

`JWT_SECRET`: A custom key for encrypting JWT tokens.

`MAILTRAP_USER`: The username provided by Mailtrap when creating a sending domain.

`MAILTRAP_PASS`: The password provided by Mailtrap when creating a sending domain.


## Guides

A full video demonstrating this API and how to use it is still being made and will be available soon!
## Contributing

Contributions are always welcome!


## Feedback

If you have any feedback or improvements, please contact me via my email andreib.pf@gmail.com or via my LinkedIn (on my GitHub profile).


