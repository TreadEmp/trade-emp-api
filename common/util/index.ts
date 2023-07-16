'use strict';
import { logger } from "./helpers/logger";
import { _authorize, _getRole, _unAuthorize, _getUserId, _getUserEmail } from "./helpers/authorizer";
import { map, mapRequestToDto, mapResponseToDto } from "./helpers/mapper";
import { _removeEmpty } from "./helpers/removeEmpty";

export const _logger = logger;
export const authorizer = _authorize;
export const unAuthorize = _unAuthorize
export const getRole = _getRole
export const getUserId = _getUserId
export const getUserEmail = _getUserEmail;
export const removeEmpty = _removeEmpty
export const mapper = {
    map, mapRequestToDto, mapResponseToDto
}