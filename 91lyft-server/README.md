# Steps
1. Clone the repo
2. **IMPORTANT**: Install *devDependencies* first by running `npm install --only=dev`. This is to install **copyfiles** and **typescript** packages. The reason is that I am using my *forked* repo of the *official lukeautry/tsoa* repo.
3. Install *dependencies*
4. Run `npm run start-gen` to generate `routes.ts` and `swagger.json`
5. Run `npm start` to start the server. Alternatively, you can run `npm run start-dev` to run `tsc -w` and `nodemon` to keep watching for file changes but there is a *bug* when using **concurrently**.
6. Server will run locally on port **8080**. **SwaggerUI** will run at: `localhost:8080/api/docs`

# Author
- Nartc (Chau): Just a developer.
