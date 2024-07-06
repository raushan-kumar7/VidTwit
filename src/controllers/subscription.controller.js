import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscription = await Subscription.findOne({ channelId, userId });

  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Subscription removed successfully"));
  } else {
    const newSubscription = new Subscription({
      channelId,
      userId,
    });
    await newSubscription.save();
    return res
      .status(201)
      .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
  }
});

// Get the list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.find({ channelId }).populate(
    "userId",
    "name email"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// Get the list of channels a user is subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const subscriptions = await Subscription.find({
    userId: subscriberId,
  }).populate("channelId", "name email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
