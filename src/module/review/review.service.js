import { NotFoundException } from "../../common/index.js";
import { reviewModel } from "../../DB/model/review.model.js";

export const createReview = async (body) => {

  const review = await reviewModel.create({
    name: body.name,
    rating: body.rating,
    comment: body.comment
  });

  return review;
};

export const getApprovedReviews = async () => {

  return await reviewModel
    .find({ isApproved: true })
    .sort({ createdAt: -1 });
};

export const getAllReviews = async () => {

  return await reviewModel
    .find()
    .sort({ createdAt: -1 });
};

export const approveReview = async (reviewId) => {

  const review = await reviewModel.findByIdAndUpdate(
    reviewId,
    {
      isApproved: true
    },
    {
      new: true
    }
  );

  if (!review) {
    throw NotFoundException({
      message: "Review not found"
    });
  }

  return review;
};

export const deleteReview = async (reviewId) => {

  const review = await reviewModel.findByIdAndDelete(
    reviewId
  );

  if (!review) {
    throw NotFoundException({
      message: "Review not found"
    });
  }

  return review;
};