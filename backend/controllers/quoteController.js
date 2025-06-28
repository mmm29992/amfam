const PersonalQuote = require("../models/PersonalQuote");
const BusinessQuote = require("../models/BusinessQuote");
const User = require("../models/User");



// Helper: attach user info if provided
async function resolveClientIdByEmail(email) {
  if (!email) return null;
  const client = await User.findOne({ email, userType: "client" });
  return client ? client._id : null;
}

exports.createPersonalQuote = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const data = req.body;

    const client = await User.findOne({
      email: data.email,
      userType: "client",
    });

    const [firstName, ...rest] = data.fullName.split(" ");
    const lastName = rest.join(" ") || client?.lastName;

    // Validate quoteType
    const validTypes = ["pl_auto", "pl_home", "pl_renters", "life"];
    if (!data.quoteType || !validTypes.includes(data.quoteType)) {
      return res.status(400).json({ message: "Invalid or missing quoteType" });
    }

    if (client) {
      await User.findByIdAndUpdate(client._id, {
        $set: {
          phone: data.phone || client.phone,
          firstName: firstName || client.firstName,
          lastName: lastName || client.lastName,
          address: data.address || client.address,
          dob: data.dob || client.dob,
          driversLicense: data.driversLicense || client.driversLicense,
          vehicleYear: data.vehicleYear || client.vehicleYear,
        },
      });
    }

    const quote = await PersonalQuote.create({
      ...data,
      createdBy: creatorId,
      forClientId: client?._id,
    });

    if (client) {
      if (!client.personalQuotes) client.personalQuotes = [];
      client.personalQuotes.push(quote._id);
      await client.save();
    }

    res.status(201).json({ message: "Quote saved", quote });
  } catch (err) {
    console.error("Personal quote error:", err);
    res.status(400).json({ message: "Failed to save personal quote" });
  }
};


exports.createBusinessQuote = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const data = req.body;

    const client = await User.findOne({
      email: data.ownerEmail?.toLowerCase().trim(),
      userType: "client",
    });

    const [firstName, ...rest] = data.ownerFullName.split(" ");
    const lastName = rest.join(" ") || client?.lastName;

    if (client) {
      await User.findByIdAndUpdate(client._id, {
        $set: {
          phone: data.ownerPhone || client.phone,
          firstName: firstName || client.firstName,
          lastName: lastName || client.lastName,
          address: data.ownerAddress || client.address,
          dob: data.ownerDob || client.dob,
          driversLicense: data.driversLicense || client.driversLicense,
          vehicleYear: data.vehicleYear || client.vehicleYear,
        },
      });
    }

    const quote = await BusinessQuote.create({
      ...data,
      createdBy: creatorId,
      forClientId: client?._id,
    });

    if (client) {
      if (!client.businessQuotes) client.businessQuotes = [];
      client.businessQuotes.push(quote._id);
      await client.save();
    }

    res.status(201).json({ message: "Quote saved", quote });
  } catch (err) {
    console.error("Business quote error:", err);
    res.status(400).json({ message: "Failed to save business quote" });
  }
};



exports.getAllQuotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    let personalQuotes = [];
    let businessQuotes = [];

    if (userType === "owner" || userType === "employee") {
      personalQuotes = await PersonalQuote.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "firstName lastName username");

      businessQuotes = await BusinessQuote.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "firstName lastName username");

    } else if (userType === "client") {
      personalQuotes = await PersonalQuote.find({ forClientId: userId }).sort({
        createdAt: -1,
      });
      businessQuotes = await BusinessQuote.find({ forClientId: userId }).sort({
        createdAt: -1,
      });
    }

    res.status(200).json({
      personal: personalQuotes,
      business: businessQuotes,
    });
  } catch (err) {
    console.error("Failed to fetch quotes:", err);
    res.status(500).json({ message: "Server error while fetching quotes" });
  }
};
exports.finalizeQuote = async (req, res) => {
  const { id } = req.params;
  const { finalQuoteText } = req.body;

  try {
    const quote =
      (await PersonalQuote.findByIdAndUpdate(
        id,
        { finalQuoteText },
        { new: true }
      )) ||
      (await BusinessQuote.findByIdAndUpdate(
        id,
        { finalQuoteText },
        { new: true }
      ));

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.status(200).json({ message: "Final quote saved", quote });
  } catch (err) {
    console.error("Finalize quote error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




