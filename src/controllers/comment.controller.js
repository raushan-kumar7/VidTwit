import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.find({ videoId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .exec();

  const totalComments = await Comment.countDocuments({ videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        page,
        limit,
        totalComments,
        "All video comments are fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId, userId, content } = req.body;

  if (!videoId || !userId || !content) {
    throw new ApiError(400, "Video ID, user ID, and content are required");
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid video ID or user ID");
  }

  const comment = new Comment({
    videoId,
    userId,
    content,
  });

  await comment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(204)
    .json(new ApiResponse(204, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
