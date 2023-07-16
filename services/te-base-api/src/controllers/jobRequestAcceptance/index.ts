import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger, getUserId } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import { BidResponseModel } from "./apiModels/jobAcceptanceResponseModel";
import { BidsDto } from "../../dto/bids/bidsDto";
import { GET_ERROR_BY_ERROR_CODE, ERROR_CODES } from "../../utils/errorCodes";
import JobRequestAcceptanceService from "../../services/jobRequestAcceptance/jobRequestAcceptanceService";
import BidsFilterDto from "../../dto/bids/bidsFilterDto";
import { JobAcceptanceDto } from "../../dto/jobRequestAcceptance/jobAcceptanceDto";

const validator = new Validator();
const acceptanceService = new JobRequestAcceptanceService();

export const createOrUpdateJobAcceptance = async (
    req: Request,
    res: Response
) => {
    try {
        const employerId = getUserId(res);
        const jobAcceptanceDto: JobAcceptanceDto = plainToClass(
            JobAcceptanceDto,
            req.body,
            {
                enableImplicitConversion: false,
            }
        );
        jobAcceptanceDto.employerId = employerId;
        if (jobAcceptanceDto.id === null || jobAcceptanceDto.id === undefined) {
            jobAcceptanceDto.id = Date.now().toString();
        }
        const errors = await validate(jobAcceptanceDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult =
            await acceptanceService.createOrUpdateJobAcceptance(
                jobAcceptanceDto
            );
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }

        const output = {
            success: true,
            data: returnResult.data,
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in createOrUpdateJobAcceptance" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};


// export const getBidList = async (req: Request, res: Response) => {
//     try {
//         const bidFilterDto = new BidsFilterDto();
//         const bidFilter = plainToClassFromExist(bidFilterDto, req.query, {
//             enableImplicitConversion: true
//         });

//         const errors = await validate(bidFilter, VALIDATION_OPTIONS);
//         if (errors.length > 0) {
//             return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
//         }
//         const data = new BidResponseModel();
//         data.pagination = await bidsService.getPaginationInfo(bidFilter);
//         data.items = await bidsService.getBidList(bidFilter);
//         res.set("X-Total-Count", data.items.length.toString());
//         return res.status(200).json({ success: true, data });
//     } catch (error) {
//         _logger.error("An Exception occurred in getJobList" + error);
//         return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
//     }
// };

// export const getBidById = async (req: Request, res: Response) => {
//     try {
//         const bidsDto = new BidsDto();
//         bidsDto.id = req.params.bidId;

//         if (validator.isEmpty(bidsDto.id)) {
//             return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19001]));
//         }

//         const errors = await validate(bidsDto, VALIDATION_OPTIONS);
//         if (errors.length > 0) {
//             return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
//         }
//         const result = await bidsService.getBidById(bidsDto);

//         if (!result.success) {
//             return res.status(400).json({
//                 success: false,
//                 data: result.data
//             });
//         }

//         return res.status(200).json({ success: true, data: result.data });
//     } catch (error) {
//         _logger.error("An exception occurred in getBidById" + error);
//         return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
//     }
// };

// export const deleteBid = async (
//     req: Request,
//     res: Response
// ) => {
//     try {
//         const bidId = req.query.bidId ? String(req.query.bidId) : undefined;
//         const bidsDto = new BidsDto();
//         bidsDto.id = bidId;
//         if (validator.isEmpty(bidsDto.id)) {
//             return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19001]));
//         }

//         const result = await bidsService.deleteBid(bidsDto);
//         if (!result.success) {
//             return res.status(400).json({
//                 success: false,
//                 data: result.data
//             });
//         }

//         const output = {
//             success: true
//         };

//         return res.status(200).json(output);

//     } catch (error) {
//         console.log(error);
//         _logger.error("exception in deleteBid" + error);
//         return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
//     }
// };
