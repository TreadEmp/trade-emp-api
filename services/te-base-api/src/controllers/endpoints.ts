import { _logger, authorizer } from "@tradeemp-api-common/util";
import multer from "multer";
import {
    getJobList,
    createOrUpdateJobs,
    getJobByJobId,
    deleteJob,
    getLatestJobs,
    uploadJobImages,
    getJobListForAdmin,
    getSingleJobByAdmin,
} from "./jobs";
import {
    createOrUpdateEquipments,
    getEquipmentList,
    getEquipmentById,
    deleteEquipment,
} from "./equipments";
import {
    createOrUpdateToolCategory,
    getToolCategoryList,
    deleteToolCategory,
    getToolCategoryById,
} from "./toolCategory";
import {
    createOrUpdateJobCategory,
    getJobCategoryList,
    getJobCategoryById,
    deleteJobCategory,
    uploadJobCategoryImage,
} from "./jobCategory";
import {
    createOrUpdateExperiences,
    deleteExperience,
    getExperienceById,
    getExperienceList,
} from "./experiences";
import {
    createOrUpdateReviews,
    deleteReview,
    getReviewByReviewId,
    getReviewList,
    getReviewListByHolder,
    uploadReviewImages,
} from "./reviews";
import {
    createOrUpdateJobRequests,
    deleteJobRequest,
    getJobRequestById,
    getJobRequestList,
    getJobRequestListForAdmin,
    getLatestJobRequests,
    getSingleJobRequestByAdmin,
    uploadJobRequestImages,
} from "./jobRequest";
import {
    getSingleUserByAdmin,
    getUserForAdminJobFilter,
    getUserFullProfile,
} from "./users";
import { createOrUpdateBids, deleteBid, getBidById, getBidList } from "./bids";
import {
    adminGetAllAcceptanceByJobRequestId,
    adminGetAllBidsByJobId,
    getAdminDashboardDetails,
    getUserBidsByAdmin,
    getUserJobAcceptanceByAdmin,
    getUserJobRequestsByAdmin,
    getUserJobsByAdmin,
} from "./admin";
import { createOrUpdateJobAcceptance } from "./jobRequestAcceptance";

const upload = multer({ dest: "src/uploads/" });
const projectPath = "trade-emp";
const apiPrefix = "/" + process.env.API_VERSION + "/" + projectPath;

export const initApi = (app) => {
    _logger.info("initializing api endpoints");
    app.use(authorizer);

    /* ----- Admin Routes ----- */
    app.get(apiPrefix + "/jobs/admin", getJobListForAdmin);
    app.get(apiPrefix + "/jobs/admin/:jobId", getSingleJobByAdmin);
    app.get(apiPrefix + "/user/admin-job-filter", getUserForAdminJobFilter); //admin job/job-request filter
    app.get(apiPrefix + "/admin/dashboard", getAdminDashboardDetails); //admin dashboard

    app.get(apiPrefix + "/job-requests/admin", getJobRequestListForAdmin); //get job request list for admin
    app.get(
        apiPrefix + "/job-requests/admin/:jobId",
        getSingleJobRequestByAdmin
    );
    app.get(
        apiPrefix + "/user/job-request-acceptance/admin/:userId",
        getUserJobAcceptanceByAdmin
    );
    app.get(apiPrefix + "/user/jobs/admin/:userId", getUserJobsByAdmin);
    app.get(
        apiPrefix + "/user/job-requests/admin/:userId",
        getUserJobRequestsByAdmin
    );
    app.get(apiPrefix + "/user/bids/admin/:userId", getUserBidsByAdmin);
    app.get(apiPrefix + "/users/admin/:userId", getSingleUserByAdmin);

    app.get(
        apiPrefix + "/users/bids-by-job/admin/:jobId",
        adminGetAllBidsByJobId
    );
    app.get(
        apiPrefix + "/users/acceptance-by-job-request/admin/:jobRequestId",
        adminGetAllAcceptanceByJobRequestId
    );

    /* ----- Job Routes ----- */
    app.post(apiPrefix + "/jobs", createOrUpdateJobs);
    app.put(apiPrefix + "/jobs", createOrUpdateJobs);
    app.get(apiPrefix + "/jobs", getJobList);
    app.get(apiPrefix + "/job/:jobId", getJobByJobId);
    app.delete(apiPrefix + "/jobs", deleteJob);
    app.post(
        apiPrefix + "/jobs/uploads",
        upload.array("uploadedFiles", 5),
        uploadJobImages
    );
    app.get(apiPrefix + "/jobs/latest", getLatestJobs);

    /* ----- Equipment Routes ----- */
    app.post(apiPrefix + "/equipments", createOrUpdateEquipments);
    app.put(apiPrefix + "/equipments", createOrUpdateEquipments);
    app.get(apiPrefix + "/equipments", getEquipmentList);
    app.get(apiPrefix + "/equipment/:equipmentId", getEquipmentById);
    app.delete(apiPrefix + "/equipments", deleteEquipment);

    /* ----- Experience Routes ----- */
    app.post(apiPrefix + "/experiences", createOrUpdateExperiences);
    app.put(apiPrefix + "/experiences", createOrUpdateExperiences);
    app.get(apiPrefix + "/experiences", getExperienceList);
    app.get(apiPrefix + "/experiences/:experienceId", getExperienceById);
    app.delete(apiPrefix + "/experiences", deleteExperience);

    /* ----- Tool Category Routes ----- */
    app.post(apiPrefix + "/tool-categories", createOrUpdateToolCategory);
    app.put(apiPrefix + "/tool-categories", createOrUpdateToolCategory);
    app.get(apiPrefix + "/tool-categories", getToolCategoryList);
    app.get(apiPrefix + "/tool-category/:toolCategoryId", getToolCategoryById);
    app.delete(apiPrefix + "/tool-categories", deleteToolCategory);

    /* ----- Job Category Routes ----- */
    app.post(apiPrefix + "/job-categories", createOrUpdateJobCategory);
    app.put(apiPrefix + "/job-categories", createOrUpdateJobCategory);
    app.get(apiPrefix + "/job-categories", getJobCategoryList);
    app.get(apiPrefix + "/job-category/:jobCategoryId", getJobCategoryById);
    app.delete(apiPrefix + "/job-categories", deleteJobCategory);
    app.post(
        apiPrefix + "/job-categories/uploads",
        upload.single("uploadedFiles"),
        uploadJobCategoryImage
    );

    /* ----- Review Routes ----- */
    app.post(apiPrefix + "/reviews", createOrUpdateReviews);
    app.put(apiPrefix + "/reviews", createOrUpdateReviews);
    app.get(apiPrefix + "/reviews", getReviewList);
    app.get(apiPrefix + "/review/:reviewId", getReviewByReviewId);
    app.delete(apiPrefix + "/reviews", deleteReview);
    app.post(
        apiPrefix + "/reviews/uploads",
        upload.array("uploadedFiles", 10),
        uploadReviewImages
    );
    app.get(apiPrefix + "/reviews-by-holder", getReviewListByHolder);

    /* ----- Job Request Routes ----- */
    app.post(apiPrefix + "/job-requests", createOrUpdateJobRequests);
    app.put(apiPrefix + "/job-requests", createOrUpdateJobRequests);
    app.get(apiPrefix + "/job-requests", getJobRequestList);
    app.get(apiPrefix + "/job-request/:jobRequestId", getJobRequestById);
    app.delete(apiPrefix + "/job-requests", deleteJobRequest);
    app.post(
        apiPrefix + "/job-requests/uploads",
        upload.array("uploadedFiles", 10),
        uploadJobRequestImages
    );
    app.get(apiPrefix + "/job-requests/latest", getLatestJobRequests);

    /* ----- User RoutesjobRequestAcceptance ----- */
    app.get(apiPrefix + "/user/full-profile", getUserFullProfile);

    /* ----- Bid Routes ----- */
    app.post(apiPrefix + "/bids", createOrUpdateBids);
    app.put(apiPrefix + "/bids", createOrUpdateBids);
    app.get(apiPrefix + "/bids", getBidList);
    app.get(apiPrefix + "/bid/:bidId", getBidById);
    app.delete(apiPrefix + "/bids", deleteBid);

    /* ----- job request acceptance Routes ----- */
    app.post(
        apiPrefix + "/job-request-acceptance",
        createOrUpdateJobAcceptance
    );
    app.put(apiPrefix + "/job-request-acceptance", createOrUpdateJobAcceptance);
    // app.get(apiPrefix + "/bids", getBidList);
    // app.get(apiPrefix + "/bid/:bidId", getBidById);
    // app.delete(apiPrefix + "/bids", deleteBid);
};
