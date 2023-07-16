const SETTING_PATH = 'settings/'
let permissions = [
    //roles
    {
        category: "User Roles",
        default: false,
        label: "Add user roles",
        path: "/userRoles",
        method: "POST",
        allow: true
    },
    {
        category: "User Roles",
        default: false,
        label: "Update user roles",
        path: "/userRoles",
        method: "PUT",
        allow: true
    },
    {
        category: "User Roles",
        default: false,
        label: "Get user role",
        path: "/userRoles/",
        method: "GET",
        allow: true
    },
    {
        category: "User Roles",
        default: false,
        label: "Get user roles list",
        path: "/userRoles",
        method: "GET",
        allow: true
    },
    {
        category: "User Roles",
        default: false,
        label: "Delete user roles",
        path: "/userRoles",
        method: "DELETE",
        allow: true
    },
    {
        category: "User Roles",
        default: false,
        label: "Check user role is unique",
        path: "/userRoles/isUnique",
        method: "GET",
        allow: true
    },

    //user
    {
        category: "User",
        default: false,
        label: "Get user profile",
        path: "/user",
        method: "GET",
        allow: true
    },
    {
        category: "User",
        default: false,
        label: "Edit user details",
        path: "/user/edit",
        method: "PUT",
        allow: true
    },









]