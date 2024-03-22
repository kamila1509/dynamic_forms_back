const { Application } = require("express");
const {
  all,
  create,
  getUser,
  getToken,
  patch,
  removeUser,
  getForms,
  getFormsById,
  saveForm,
  saveResponseForm,
  getResponses,
  getResponsesById,
  saveUserData,
  updateForm,
  removeForm
} = require("./controller");
const isAuthenticated = require("../auth/authenticated");
const isAuthorized = require("../auth/authorized");

function routesConfig(app) {
  app.get("/token", getToken);

  app.post(
    "/users",
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    create
  );

  // lists all users
  app.get("/users", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    all,
  ]);
  // get :id user
  app.get("/users/:id", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"], allowSameUser: true }),
    getUser,
  ]);
  // updates :id user
  app.patch("/users/:id", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"], allowSameUser: true }),
    patch,
  ]);
  // deletes :id user
  app.delete("/users/:id", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    removeUser,
  ]);
  // lists all users
  app.patch("/user/:id", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    saveUserData,
  ]);

  app.get("/forms/:id", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"], allowSameUser: true }),
    getForms,
  ]);

  app.get("/forms/:id/:formId", [
   getFormsById,
  ]);

  app.post(
    "/forms/:id",
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    saveForm
  );

  app.patch(
    "/forms/:id/:formId",
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    updateForm
  );
  app.delete("/forms/:id/:formId", [
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"] }),
    removeForm,
  ]);
  
  app.post(
    "/response/:id/:formId",
    saveResponseForm
  );

  app.get(
    "/responses/:id",
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"], allowSameUser: true }),
    getResponses
    );

    app.get(
    "/responses/:id/:formId",
    isAuthenticated,
    isAuthorized({ hasRole: ["admin", "manager"], allowSameUser: true }),
    getResponsesById
    );
}

module.exports = routesConfig;
