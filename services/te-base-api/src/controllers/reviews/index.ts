import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger, getUserId } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { ReviewDto } from "../../dto/reviews/reviewDto";
import ReviewService from "../../services/reviews/reviewService";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import ReviewFilterDto from "../../dto/reviews/reviewFilterDto";
import { ReviewByHolderResponseModel, ReviewResponseModel } from "./apiModels/reviewResponseModel";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import { FileUploadDto } from "../../dto/common/fileUploadDto";
import { readFileSync, unlinkSync } from "fs";
import ReviewByHolderFilterDto from "../../dto/reviews/reviewByHolderFilterDto";

const validator = new Validator();
const reviewService = new ReviewService();

export const createOrUpdateReviews = async (req: Request, res: Response) => {
    try {
        const employerId = getUserId(res);
        const reviewDto: ReviewDto = plainToClass(ReviewDto, req.body, {
            enableImplicitConversion: false
        });
        reviewDto.reviewedBy = employerId;
        const errors = await validate(reviewDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult = await reviewService.createOrUpdateReviews(reviewDto);
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data
            });
        }

        const output = {
            success: true,
            data: returnResult.data
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in createOrUpdateReviews" + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getReviewList = async (req: Request, res: Response) => {
    try {
        const reviewFilterDto = new ReviewFilterDto();
        const reviewFilter = plainToClassFromExist(reviewFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(reviewFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new ReviewResponseModel();
        data.pagination = await reviewService.getPaginationInfo(reviewFilter);
        data.items = await reviewService.getReviewList(reviewFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getReviewList" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getReviewByReviewId = async (req: Request, res: Response) => {
    try {
        const reviewDto = new ReviewDto();
        reviewDto.id = req.params.reviewId;

        if (validator.isEmpty(reviewDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[15003]));
        }

        const errors = await validate(reviewDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await reviewService.getReviewByReviewId(reviewDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getReviewByReviewId" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const deleteReview = async (
    req: Request,
    res: Response
) => {
    try {
        const reviewId = req.query.reviewId ? String(req.query.reviewId) : undefined;
        const reviewDto = new ReviewDto();
        reviewDto.id = reviewId;
        if (validator.isEmpty(reviewDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[15003]));
        }

        const result = await reviewService.deleteReview(reviewDto);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        const output = {
            success: true
        };

        return res.status(200).json(output);

    } catch (error) {
        _logger.error("exception in deleteReview" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const uploadReviewImages = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        if (validator.isEmpty(req.files)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const files = req.files;
        let filesToBeUploaded: FileUploadDto[] = [];
        files.forEach((element, i) => {
            let fileObject = new FileUploadDto();
            let extension = element.originalname.substring(
                element.originalname.lastIndexOf(".") + 1
            );
            fileObject.type = extension;
            fileObject.name = element.originalname;
            fileObject.data = readFileSync(element.path);
            fileObject.uploadedAt = Date.now().toString();
            fileObject.id = Date.now().toString() + i;
            fileObject.size = Number((element.size / 1024).toFixed(3));
            fileObject.path = element.path;
            filesToBeUploaded.push(fileObject);
        });

        const result = await reviewService.uploadReviewImages(
            filesToBeUploaded
        );
        files.forEach((element) => {
            unlinkSync(element.path);
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res
            .status(200)
            .json({ success: result.success, data: result.data });
    } catch (error) {
        _logger.error("exception in uploadReviewImages" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getReviewListByHolder = async (req: Request, res: Response) => {
    try {
        const reviewFilterDto = new ReviewByHolderFilterDto();
        const reviewFilter = plainToClassFromExist(reviewFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(reviewFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new ReviewByHolderResponseModel();
        data.pagination = await reviewService.getReviewByHolderPaginationInfo(reviewFilter);
        data.items = await reviewService.getReviewListByHolder(reviewFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getReviewList" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};