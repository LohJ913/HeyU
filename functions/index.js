const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();

admin.initializeApp({});

app.use(cors({ origin: true }));

app.post("/testget", async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("some-collection").get();
        const data = snapshot.docs.map(doc => doc.data());
        res.status(200).send(data);
    } catch (error) {
        console.error("Error getting Firestore data:", error);
        res.status(500).send("Error fetching data");
    }
});

app.post("/bindUserAccount", async (req, res) => {
    const { uid, email, password } = req.body; // Extract uid, email, and password from request body
    console.log(req.body); // Log the request body for debugging

    if (!uid || !email || !password) {
        return res.status(400).send("Missing uid, username, or password.");
    }

    try {
        // Fetch the user by uid
        const userRecord = await admin.auth().getUser(uid);

        // Link the email/password credential to the anonymous user
        const updatedUser = await admin.auth().updateUser(uid, {
            email: email,
            password: password,
            emailVerified: false
        });

        const userProfileRef = admin.firestore().collection("profiles").doc(uid);
        await userProfileRef.update({
            email: email,
            password: password
        });

        console.log("Account successfully linked to username and password.");
        return res.status(200).json({
            message: "Account successfully linked to username and password.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error linking username/password:", error);
        return res.status(500).json({
            error: `Error linking username/password: ${error.message || "Unknown error occurred."}`
        });
    }
});

exports.requests = functions.https.onRequest(app);
