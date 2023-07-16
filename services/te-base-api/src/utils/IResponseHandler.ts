interface IResponseHandler {
    status: boolean;
}

interface ISuccessHandlerModel extends IResponseHandler {
    message?: string;
}
