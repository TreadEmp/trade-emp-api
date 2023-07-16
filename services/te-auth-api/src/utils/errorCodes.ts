export interface IActionResponse {
    success: boolean;
    data: any;
}
export const ERRORS = [
    {
        success: false,
        data: {
            errorCode: 1001,
            errorMessage:
                "Email already exists"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1002,
            errorMessage:
                "User not found"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1005,
            errorMessage:
                "Invitation link is expired"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1006,
            errorMessage:
                "Invalid invitation link"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1007,
            errorMessage:
                "Invalid User Id"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1008,
            errorMessage:
                "Invalid User Id"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1009,
            errorMessage:
                "Unauthorized user"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1010,
            errorMessage:
                "Missing User Id"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1011,
            errorMessage:
                "Missing Files"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1012,
            errorMessage:
                "Failed to update profile picture"
        }
    },
    {
        success: false,
        data: {
            errorCode: 1013,
            errorMessage:
                "Missing user email"
        }
    },
    {
        success: false,
        data: {
            errorCode: 2001,
            errorMessage:
                "Error Occurred when Creating User Role."
        }
    },
    {
        success: false,
        data: {
            errorCode: 2002,
            errorMessage:
                "User Role Id is either Incorrect or it doesn't exist."
        }
    },
    {
        success: false,
        data: {
            errorCode: 2003,
            errorMessage:
                "Error Occurred when Adding Permission to User Role."
        }
    },
    {
        success: false,
        data: {
            errorCode: 2004,
            errorMessage:
                "Role Name Should be Provided"
        }
    },
    {
        success: false,
        data: {
            errorCode: 2005,
            errorMessage:
                "Role Id Should be Provided"
        }
    },
    {
        success: false,
        data: {
            errorCode: 18001,
            errorMessage:
                "Internal Server Error"
        }
    },
    {
        success: false,
        data: {
            errorCode: 18002,
            errorMessage:
                "Bad Request, Please refer documentation"
        }
    }
];

export const AUTH_ERROR_CODES = {
    //user
    1001: 1001,
    1002: 1002,
    1005: 1005,
    1006: 1006,
    1007: 1007,
    1008: 1008,
    1009: 1009,
    1010: 1010,
    1011: 1011,
    1012: 1012,
    1013: 1013,

    // user roles
    2001: 2001,
    2002: 2002,
    2003: 2003,
    2004: 2004,
    2005: 2005,

    //common errors
    18001: 18001,
    18002: 18002,
};

export const GET_ERROR_BY_ERROR_CODE = (errorCode: number) => {
    for (const error of ERRORS) {
        // tslint:disable-next-line: curly
        if (errorCode === error.data.errorCode)
            return error;
    }
    return null;
};