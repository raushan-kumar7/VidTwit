import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const like = await Like.findOne({ videoId, userId });

  if (like) {
    await like.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like removed from video successfully"));
  } else {
    const newLike = new Like({ videoId, userId });
    await newLike.save();
    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Like added to video successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const like = await Like.findOne({ commentId, userId });

  if (like) {
    await like.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like removed from comment successfully"));
  } else {
    const newLike = new Like({ commentId, userId });
    await newLike.save();
    return res
      .status(201)
      .json(
        new ApiResponse(201, newLike, "Like added to comment successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const like = await Like.findOne({ tweetId, userId });

  if (like) {
    await like.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like removed from tweet successfully"));
  } else {
    const newLike = new Like({ tweetId, userId });
    await newLike.save();
    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Like added to tweet successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likes = await Like.find({
    userId,
    videoId: { $exists: true },
  }).populate("videoId");
  const likedVideos = likes.map((like) => like.videoId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
