let executableChromePath = null;
const executableChromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome-stable",
];

const fs = require("fs");
const ENV = require("./env.json");
const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const { log } = require("console");
const qrcode = require("qrcode-terminal");
const express = require("express");
const app = express();

const PORT = ENV.port || 4067;
const myNumbers = ENV.client_numbers;

if (!executableChromePath) {
  if (ENV.executable_path) {
    executableChromePath = ENV.executable_path;
  } else {
    for (const path of executableChromePaths) {
      if (fs.existsSync(path)) {
        executableChromePath = path;
        break;
      }
    }
  }
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

let isReady = [];

const clients = myNumbers.map((myNumber, myIndex) => {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `client${myIndex}`,
    }),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      executablePath: executableChromePath,
    },
    pairWithPhoneNumber: {
      phoneNumber: myNumber,
      showNotification: true,
    },
  });

  isReady[myIndex] = false;

  client.on("qr", (qr) => {
    log(`QR for "${myNumber}" received`);
    qrcode.generate(qr, { small: true });
  });

  client.on("code", (code) => {
    log(`Pairing code for "${myNumber}":`, code);
  });

  client.on("ready", () => {
    log(`Client "${myNumber}" is ready!`);
    isReady[myIndex] = true;
  });

  client.on("disconnected", () => {
    log(`Client "${myNumber}" is disconnected!`);
    isReady[myIndex] = false;
  });

  client.on("auth_failure", () => {
    log(`Client "${myNumber}" auth failed!`);
    isReady[myIndex] = false;
  });

  client.initialize();

  return client;
});

const readyClient = () => {
  for (let i = 0; i < isReady.length; i++) {
    if (isReady[i]) {
      return {
        isReady: true,
        client: clients[i],
      };
    }
  }
  return {
    isReady: false,
    client: null,
  };
};

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
  const { isReady, client } = readyClient();

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
  if (!id) {
    return res
      .json({
        msg: "please include id in query or body",
        success: false,
        code: 400,
      })
      .end();
  }
  const registered = await checks(id);

  res.json(registered).end();
});

app.all("/login", async (req, res) => {
  const id = req.query.id || req.body.id || req.headers.id;
  if (!id) {
    return res
      .json({
        msg: "please include id in query or body",
        success: false,
        code: 400,
      })
      .end();
  }
  const registered = await checks(id);

  if (registered.status) {
    try {
      const myNumber = numberFormatter(id).split("@")[0];
      const client = new Client({
        authStrategy: new NoAuth(),
        puppeteer: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: true,
          executablePath: executableChromePath,
        },
        pairWithPhoneNumber: {
          phoneNumber: myNumber,
          showNotification: true,
        },
      });

      client.initialize().then(() => {
        client.destroy();
      }).catch(error => {
        res
          .json({
            msg: "error send pair code!",
            success: false,
            error,
            code: 500,
          })
          .end();
      });

      res
        .json({
          msg: "success send pair code!",
          success: true,
          code: 200,
        })
        .end();
    } catch (error) {
      res
        .json({
          msg: "error send pair code!",
          success: false,
          error,
          code: 500,
        })
        .end();
    }
  } else {
    res.json(registered).end();
  }
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
