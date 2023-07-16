import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import ReviewManagerRepository, { IFilterOptions, IReviewByHolderFilterOptions } from "../../dal/reviewManagerRepository";
import { ReviewDto } from "../../dto/reviews/reviewDto";
import ReviewFilterDto, { SortOrder } from "../../dto/reviews/reviewFilterDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import { FileUploadDto, FileUploadResponseDto } from "../../dto/common/fileUploadDto";
import { oneDecimal } from "../../utils/helpers";
import ReviewByHolderFilterDto from "../../dto/reviews/reviewByHolderFilterDto";
import { ReviewByHolderDto } from "../../dto/reviews/reviewByHolderDto";
const cloudinary = require("cloudinary").v2;
// const AWS = require('aws-sdk');

const getFilterOptions = (options: ReviewFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    jobId: options.jobId,
    reviewedBy: options.reviewedBy,
    holderId: options.holderId
});

const getReviewByHolderFilterOptions = (options: ReviewByHolderFilterDto): IReviewByHolderFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: options.sortBy,
    holderId: options.holderId
})

export default class ReviewService extends AbstractService {
    private reviewRepo: ReviewManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.reviewRepo = new ReviewManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateReviews(
        reviewDto: ReviewDto
    ): Promise<IActionResponse> {
        if (reviewDto.id === undefined) {
            reviewDto.id = Date.now().toString();
        }
        const review = await this.reviewRepo.createOrUpdateReviews(reviewDto);

        return review === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[15001])
            : { success: true, data: review };
    }

    public async getPaginationInfo(
        options: ReviewFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalReviewCount = await this.reviewRepo.getReviewCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalReviewCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalReviewCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getReviewList(options: ReviewFilterDto): Promise<ReviewDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const reviews = await this.reviewRepo.getReviewList(filterOptions);
        return reviews;
    }

    public async getReviewByReviewId(
        reviewDto: ReviewDto
    ): Promise<IActionResponse> {
        const review = await this.reviewRepo.getReviewByReviewId(reviewDto);
        return review === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[15002])
            : { success: true, data: review };
    }

    public async deleteReview(reviewDto: ReviewDto): Promise<IActionResponse> {
        const result = await this.reviewRepo.deleteReview(reviewDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[15002])
            : { success: true, data: result };
    }

    public async uploadReviewImages(
        files: FileUploadDto[]
    ): Promise<IActionResponse> {
        cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        });
        let path = "";
        if (process.env.NODE_ENV === "dev") {
            path = `${process.env.TRADE_EMP_JOB_REQUEST_IMAGE_PATH_DEV}`;
        } else {
            path = `${process.env.TRADE_EMP_JOB_REQUEST_IMAGE_PATH_LIVE}`;
        }

        let uploadImage = files.map(
            (element) =>
                new Promise((resolve, reject) => {
                    const options = {
                        use_filename: true,
                        unique_filename: false,
                        overwrite: true,
                    };
                    cloudinary.uploader.upload(
                        element.path,
                        {
                            upload_preset: `${process.env.TE_DEV_REVIEW_IMAGE_UPLOAD_PRESET}`,
                        },
                        (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                let response = new FileUploadResponseDto();
                                response.id = element.id;
                                response.name = element.name;
                                response.type = "." + element.type;
                                response.uploadedAt = element.uploadedAt;
                                response.url = data.secure_url;
                                response.size = element.size;
                                resolve(response);
                            }
                        }
                    );
                })
        );

        return Promise.all([...uploadImage])
            .then((imageResults: any[]) => {
                if (imageResults.length === files.length) {
                    return { success: true, data: imageResults };
                }
                return GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10004]);
            })
            .catch((e) => {
                console.error(e);
                return GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10005]);
            });
    }

    public async getReviewByHolderPaginationInfo(
        options: ReviewByHolderFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getReviewByHolderFilterOptions(options);

        const totalReviewCount = await this.reviewRepo.getReviewCountByHolder(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalReviewCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalReviewCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getReviewListByHolder(
        options: ReviewByHolderFilterDto
    ): Promise<ReviewByHolderDto[]> {
        const filterOptions = getReviewByHolderFilterOptions(options);

        const reviews = await this.reviewRepo.getReviewListByHolder(
            filterOptions
        );
        return reviews;
    }
}
