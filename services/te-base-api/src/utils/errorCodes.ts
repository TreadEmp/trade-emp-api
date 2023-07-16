export interface IActionResponse {
    success: boolean;
    data: any;
}
export const ERRORS = [
    {
        success: false,
        data: {
            errorCode: 10001,
            errorMessage: "Error Occurred when Creating or Updating the Job.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 10002,
            errorMessage: "Job Id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 10003,
            errorMessage: "Missing job Id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 10004,
            errorMessage: "Failed to upload some of job images",
        },
    },
    {
        success: false,
        data: {
            errorCode: 10005,
            errorMessage: "Error occurred while uploading the Job images.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 11001,
            errorMessage: "Missing equipment Id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 11002,
            errorMessage:
                "Equipment id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 11003,
            errorMessage:
                "Error Occurred when Creating or Updating the equipment.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 12001,
            errorMessage: "Missing tool category id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 12002,
            errorMessage:
                "Tool category id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 12003,
            errorMessage: "Missing files.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 12004,
            errorMessage: "Missing user id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 12003,
            errorMessage:
                "Error Occurred when Creating or Updating the tool category.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13001,
            errorMessage: "Missing job category id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13002,
            errorMessage:
                "Job category id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13003,
            errorMessage:
                "Error Occurred when Creating or Updating the Job category.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13004,
            errorMessage: "Missing files.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13005,
            errorMessage: "Missing job category id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13006,
            errorMessage: "Failed to update job category image",
        },
    },
    {
        success: false,
        data: {
            errorCode: 13007,
            errorMessage:
                "Error occurred while uploading the Job category image.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 14001,
            errorMessage: "Missing experience Id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 14002,
            errorMessage:
                "Experience id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 14003,
            errorMessage:
                "Error Occurred when Creating or Updating the experience.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 15001,
            errorMessage:
                "Error Occurred when Creating or Updating the Review.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 15002,
            errorMessage: "Review Id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 15003,
            errorMessage: "Missing Review Id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 16001,
            errorMessage:
                "Error occurred when creating or updating the job request.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 16002,
            errorMessage:
                "Job request id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 16003,
            errorMessage: "Missing job request id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 17001,
            errorMessage: "User id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 17002,
            errorMessage: "Missing user role.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 17003,
            errorMessage: "Missing user id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 18001,
            errorMessage: "Internal server error.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 18002,
            errorMessage:
                "Bad Request, Invalid Query Params Please refer documentation.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 19001,
            errorMessage: "Missing bid Id.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 19002,
            errorMessage: "Bid id is either incorrect or it doesn't exist.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 19003,
            errorMessage: "Error occurred while creating or updating bid.",
        },
    },
    {
        success: false,
        data: {
            errorCode: 20001,
            errorMessage: "Error occurred while  retriving dashboard edtails",
        },
    },
    {
        success: false,
        data: {
            errorCode: 20002,
            errorMessage: "Error occurred while retriving bids made by user",
        },
    },
    {
        success: false,
        data: {
            errorCode: 20003,
            errorMessage: "Error occurred while retriving job request acceptance made by user",
        },
    },
    {
        success: false,
        data: {
            errorCode: 20004,
            errorMessage: "Error occurred while retriving jobs made by user",
        },
    },
    {
        success: false,
        data: {
            errorCode: 20005,
            errorMessage: "Error occurred while retriving job requests made by user",
        },
    },
];

export const ERROR_CODES = {
    //Jobs
    10001: 10001,
    10002: 10002,
    10003: 10003,

    //Equipments
    11001: 11001,
    11002: 11002,
    11003: 11003,

    //Tool Category
    12001: 12001,
    12002: 12002,
    12003: 12003,

    //Job Category
    13001: 13001,
    13002: 13002,
    13003: 13003,
    13004: 13004,
    13005: 13005,
    13006: 13006,
    13007: 13007,

    //Equipments
    14001: 14001,
    14002: 14002,
    14003: 14003,

    //Jobs
    15001: 15001,
    15002: 15002,
    15003: 15003,
    15004: 15004,

    //Job Requests
    16001: 16001,
    16002: 16002,
    16003: 16003,

    //User Requests
    17001: 17001,
    17002: 17002,
    17003: 17003,

    //common errors
    18001: 18001,
    18002: 18002,

    //Bids
    19001: 19001,
    19002: 19002,
    19003: 19003,

    //admin
    20001: 20001,
    20002: 20002,
    20003: 20003,
    20004: 20004,
    20005: 20005,
};

export const GET_ERROR_BY_ERROR_CODE = (errorCode: number) => {
    for (const error of ERRORS) {
        // tslint:disable-next-line: curly
        if (errorCode === error.data.errorCode)
            return error;
    }
    return null;
};