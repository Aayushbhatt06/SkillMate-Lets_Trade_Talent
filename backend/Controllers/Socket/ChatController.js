const messageDb = require("../../Models/messages");
const Connection = require("../../Models/Connection");
const { connection } = require("mongoose");
const { client } = require("../../utils/client");

const getRoomId = (userA, userB) =>
  [userA.toString(), userB.toString()].sort().join("@");

const loadMessages = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    const roomId = getRoomId(id, userId);
    const cacheKey = `messages:${roomId}`;

    const cachedMessages = await client.get(cacheKey);
    if (cachedMessages) {
      return res.status(200).json({ ...JSON.parse(cachedMessages) });
    }

    const chats = await messageDb
      .find({ roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name image _id");

    const response = {
      message: "Messages fetched successfully",
      success: true,
      chats: chats,
    };
    await client.setEx(cacheKey, 15 * 60, JSON.stringify(response));
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const newMessage = async (req, res) => {
  try {
    const { id, text } = req.body;
    const userId = req.user._id;

    if (!id || !text) {
      return res
        .status(400)
        .json({ success: false, message: "id and text are required" });
    }

    const roomId = getRoomId(id, userId);

    const existingConn = await Connection.findOne({ roomId });
    if (!existingConn) {
      return res.status(403).json({
        success: false,
        message: "Connection does not exist. Cannot send message.",
      });
    }

    const chat = await messageDb.create({
      roomId,
      sender: userId,
      message: text,
      readBy: [userId],
    });

    const otherUserId = id.toString();

    const conn = await Connection.findOneAndUpdate(
      { roomId },
      {
        $set: { lastMessage: text, lastMessageAt: new Date() },
        $inc: { [`unreadCounts.${otherUserId}`]: 1 },
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Message Sent Successfully",
      success: true,
      chat,
      connection: conn,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "id is required" });
    }

    const roomId = getRoomId(id, userId);

    const msgsResult = await messageDb.updateMany(
      {
        roomId,
        readBy: { $ne: userId },
      },
      {
        $push: { readBy: userId },
      },
    );
    const conn = await Connection.findOneAndUpdate(
      { roomId },
      {
        $set: {
          [`unreadCounts.${userId.toString()}`]: 0,
        },
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Messages marked as read",
      success: true,
      modifiedCount: msgsResult.modifiedCount,
      connection: conn,
    });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { newMessage, loadMessages, markAsRead };
