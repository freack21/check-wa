const number = "628xxx";
let executableChromePath =
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
// executableChromePath = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
// executableChromePath = "/usr/bin/google-chrome-stable";

const { Client, LocalAuth } = require("whatsapp-web.js");
const { log } = require("console");
const qrcode = require("qrcode-terminal");
const express = require("express");
const app = express();
const PORT = 4067;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "caches",
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    executablePath: executableChromePath,
  },
  pairWithPhoneNumber: {
    phoneNumber: number,
    showNotification: true,
  },
});

let isReady = false;

client.on("qr", (qr) => {
  log("QR RECEIVED");
  qrcode.generate(qr, { small: true });
});

client.on("code", (code) => {
  console.log("Linking code:", code);
});

client.on("ready", () => {
  log("Client is ready!");
  isReady = true;
});

client.on("disconnected", () => {
  log("Client is disconnected!");
  isReady = false;
});

client.on("auth_failure", () => {
  log("Client auth failed!");
  isReady = false;
});

client.initialize();

const numberFormatter = function (number) {
  if (!number) return "";
  let formatted = number.replace(/\D/g, "");

  if (formatted.startsWith("@")) {
    formatted = formatted.slice(1);
  }

  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  }

  if (!formatted.endsWith("@c.us")) {
    formatted += "@c.us";
  }

  return formatted;
};

const checks = async function (id) {
  let result = {
    code: 500,
    data: id,
    status: false,
    msg: "Client WA is not ready",
  };

  if (!isReady) return Promise.resolve(result);

  id = numberFormatter(id);
  if (!id || id.length < 10) id = "1234567890@c.us";

  const registered = await client.isRegisteredUser(id);

  result["code"] = 200;
  result["formatted_data"] = id;
  result["status"] = registered;
  result["msg"] = `Nomor ${!registered ? "tidak " : ""}terdaftar di WA`;

  return Promise.resolve(result);
};

app.all("/", async (req, res) => {
  res.json({
    msg: "running..",
  });
});

app.all("/check", async (req, res) => {
  const id = req.query.id || req.body.id || req.headers.id;
  const registered = await checks(id);

  res.json(registered).end();
});

app.use(async (req, res) => {
  res
    .status(404)
    .json({
      msg: "route not available",
    })
    .end();
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});
