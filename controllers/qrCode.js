const asyncHandler = require("express-async-handler");
const { generateQRHash } = require("../utility/generateHash");
const { redis } = require("../config/redis");

exports.topup = asyncHandler(async (req, res) => {
  const { uid, cash } = req.query;
  if (!uid || !cash) {
    return res
      .status(400)
      .json({ success: false, message: "Missing uid or cash query parameter" });
  }

  try {
    const hash = await generateQRHash(uid, cash);

    await redis.set(
      hash,
      JSON.stringify({ uid, cash, status: "pending" }),
      "EX",
      60 * 5
    );
    
    return res.status(200).json({
      success: true,
      message: "QR code generated successfully",
      url: "https://droplet.ngixx.in.th/api/v1/qrcode/" + hash,
    })
  } catch (error) {
    console.error("Error generating QR code:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate QR code" });
  }
});

exports.recieve = asyncHandler(async (req, res) => {
  const { trans_id } = req.query;
  if (!trans_id) {
    return res.status(400).render("pages/status", {
      locals: {
        uid: uid,
        cash: cash,
        status: "error",
      },
    });
  }

  // Lookup on redis
  const hashData = await redis.get(trans_id);
  if (hashData === null) {
    return res.status(404).render("status", {
      locals: {
        status: "expired",
      },
    });
  }
  const { uid, cash, status } = JSON.parse(hashData);
  if (status !== "pending") {
    return res.status(400).render("status", {
      locals: {
        uid: uid,
        cash: cash,
        status: "already processed",
        showDetails: true,
        transactionDetails: {
          uid: uid,
          cash: cash,
        },
      },
    });
  } else {
    await redis.set(
      trans_id,
      JSON.stringify({ uid, cash, status: "completed" }),
      "EX",
      60 * 5
    );
    console.log(`Received UID: ${uid}, Cash: ${cash}`);
    res.status(200).render("status", {
      locals: {
        status: "success",
        showDetails: true,
        transactionDetails: {
          uid: uid,
          cash: cash,
        },
      },
    });
  }
});

exports.getStatus = asyncHandler(async (req, res) => {
  const { trans_id } = req.query;
  if (!trans_id) {
    return res.status(400).json({
      success: false,
      message: "Please provide transaction id",
    });
  }

  const hashRaw = await redis.get(trans_id);
  if (hashRaw === null) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found or expired",
    });
  }

  const hashData = JSON.parse(hashRaw);
  return res.status(200).json({
    success: true,
    message: "Transaction found",
    data: {
      uid: hashData.uid,
      cash: hashData.cash,
      status: hashData.status,
    },
  });
});
