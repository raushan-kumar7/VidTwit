import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const totalVideos = await Video.countDocuments({ userId: channelId });
  const totalSubscribers = await Subscription.countDocuments({ channelId });
  const totalViews = await Video.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalLikes = await Like.countDocuments({
    videoId: { $exists: true },
    userId: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      {
        totalVideos,
        totalSubscribers,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes,
      },
      200,
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const filter = { userId: channelId };
  const sort = { [sortBy]: sortType === "desc" ? -1 : 1 };

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .exec();

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(videos, 200, {
      page,
      limit,
      totalVideos,
      message: "Channel videos fetched successfully",
    })
  );
});

export { getChannelStats, getChannelVideos };
