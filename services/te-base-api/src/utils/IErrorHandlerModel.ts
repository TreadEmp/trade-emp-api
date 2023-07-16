
interface IErrorHandlerModel extends IResponseHandler {
    errorCode: number;
    errorMessage: string;
}

interface IFormattedErrorHandlerModel extends IResponseHandler {
    data : {
        errorCode: number;
        errorMessage: string;
    }
}