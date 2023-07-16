import { Application } from "express";
import multer from "multer";
import { _logger, authorizer } from "@tradeemp-api-common/util";
import {
    signIn,
    profile,
    // getUsersList,
    editUserDetails,
    signUp,
    getUsersList,
    validateIdToken,
    uploadProfileImage,
    getSingleUser,
} from "./user";
import {
    createUserRole,
    getUserRoleList,
    getUserRoleByRoleId,
    deleteUserRole,
    isUserRoleUnique,
    addPermissionToRole,
} from "./userRole";
const upload = multer({ dest: "src/uploads/" });
const projectPath = "auth";
const apiPrefix = "/" + process.env.API_VERSION + "/" + projectPath;

export const initApi = (app: Application) => {
    _logger.info("initializing api  endpoints of auth api");

    app.post(apiPrefix + "/sign-in", signIn);
    app.post(apiPrefix + "/sign-up", signUp);

    app.use(authorizer);
    app.get(apiPrefix + "/user-by-token", validateIdToken);
    app.get(apiPrefix + "/user", profile);
    app.get(apiPrefix + "/single-user", getSingleUser);
    app.get(apiPrefix + "/users", getUsersList);
    app.put(apiPrefix + "/user/edit", editUserDetails);
    app.post(
        apiPrefix + "/user/uploads",
        upload.array("uploadedFiles", 1),
        uploadProfileImage
    );

    //role permissions
    app.put(apiPrefix + "/userRoles/addPermissions", addPermissionToRole);
    app.get(apiPrefix + "/userRoles/isUnique", isUserRoleUnique);
    app.post(apiPrefix + "/userRoles", createUserRole);
    app.put(apiPrefix + "/userRoles", createUserRole);
    app.get(apiPrefix + "/userRoles", getUserRoleList);
    app.get(apiPrefix + "/userRoles/:id", getUserRoleByRoleId);
    app.delete(apiPrefix + "/userRoles", deleteUserRole);

    // add permission to roles
};
