const express = require("express");
const port = 8001;
const db = require("./config/mongoose");
const local = require("./config/pass");
const passport = require("passport");
const socket = require("socket.io");
const admin = require("./models/admin");
const chat = require("./models/chats");
const path = require("path");
const session = require("express-session");
const cookie = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookie());
app.use(
	cors({
		origin: "http://localhost:8000",
		credentials: true,
	}),
);

app.use(
	session({
		name: "admin",
		secret: "login",
		resave: true,
		saveUninitialized: false,
		cookie: {
			maxAge: 123 * 56 * 555,
		},
	}),
);
app.use(passport.session());
app.use(passport.initialize());
app.use(passport.setUser);

app.use("/imgs", express.static(__dirname + "/imgs"));
app.use(express.static("assets"));
app.use("/", require("./routes/index"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const server = app.listen(port, (err) => {
	if (err) {
		console.log(err);
		return false;
	}
	console.log("Server is running on Port", port);
});

const io = socket(server);
const usp = io.of("/user");

usp.on("connection", async (socket) => {
	console.log("User is Connected");
	let id = socket.handshake.auth.token;
	await admin.findByIdAndUpdate(id, { isOnline: true });
	socket.broadcast.emit("onlineStatus", { userId: id });

	socket.on("disconnect", async () => {
		console.log("User is Disconnected.");
		await admin.findByIdAndUpdate(id, { isOnline: false });
		socket.broadcast.emit("offlineStatus", { userId: id });
	});

	socket.on("viewUser", async (data) => {
		let user = await admin.findById(data.otherId);
		socket.emit("getUser", { data: user });
	});

	socket.on("newChat", async (data) => {
		socket.broadcast.emit("loadNewChat", { data: data });
	});

	socket.on("fetchChats", async (data) => {
		let chats = await chat.find({
			$or: [
				{ senderId: data.senderId, receiverId: data.receiverId },
				{ senderId: data.receiverId, receiverId: data.senderId },
			],
		});
		socket.emit("loadChats", { chats: chats });
	});

	socket.on("sortUsers", async (data) => {
		let fdata = await admin.findById(data.id);
		if (fdata.isOnline == true) {
			let adminData = await admin
				.find({ _id: { $nin: [data.id] } })
				.sort({ totalChat: -1 });

			socket.broadcast.emit("loadUser", { data: adminData });
		}
	});

	socket.on("fetchDetail", async (data) => {
		let fdata = await admin.findById(data);
		socket.emit("loadDetail", { data: fdata });
	});
});
