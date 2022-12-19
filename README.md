# AppAuth

A simple email based JWT token issuer and authentication service

## Building

Use the supplied Makefile
```bash
make
```
A docker image named `seglh/appauth` will be built.

## Configuration
All configuration is managed via envrionment variables. See `./config.js` for defaults. 


## Known issues
Currently the application has problems when used on a local IP address over citrix (Safelinks issue).
### Mitigation

#### Login via the link in the login email
Copy-paste the login token from the URL into the corresponding form rather than clicking on the link in the login email.

#### Approval of new users
Manual approval of new users directly in the database:
- Login into the host server.
- Connect to mongodb container `docker exec -it authapp_mongo mongo`
- Update the user to be approved: `db.users.update({ email: useremail@organisation.net }, { $set: { approvedBy: youremail@organisation.net, approvedLevel: 1, approvedAt: new Date() } });`

## License
[Apache2](http://www.apache.org/licenses/LICENSE-2.0)
