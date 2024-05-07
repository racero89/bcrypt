const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const app = express();
const PORT = 3000;
const users = [
  {
    id: 1,
    username: "usuario1",
    password: " contraseña1",
    name: "usuario Uno",
  },
  {
    id: 2,
    username: "usuario2",
    password: " contraseña2",
    name: "usuario Dos",
  },
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "Secreto",
    resave: false,
    saveUnitialized: true,
    cookie: { secure: false },
  })
);

function generateToken(user) {
  return jwt.sign({ user: user.id }, "Secreto", {
    xpiresIn: "1h",
  });
}

function verifyToken(req, res, next) {
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ mensaje: "token no realizado" });
  }

  jwt.verify(token, "Tu_secreto _esta _guardado", (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: "token invalido" });
    }
    req.use = decoded.use;
    next();
  });
}

app.get("/", (req, res) => {
  const loginform = `
    <form action="/login" method="post">
    <label for="username">Usuario:</label>
    <input type = "text" id="username" name="username" required><br>

    <label for ="password">Contraseña</label>
    <input type="password" id="password" name"password" require></br>

    <button type="submit">Iniciar sesión</button>
    </form>
    <a href="/dashboard">dashboard</a>
     `;
  res.send(loginform);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = generateToken(user);
    req.session.token = token;
    res.redirect("/dashboard");
  } else {
    res.status(401).json({ mensaje: "No correcto" });
  }
});

app.get("/dashboard", verifyToken, (req, res) => {
  const userId = req.user;
  const user = users.find((user) => user.id === userId);
  if (user) {
    res.send(`
    <h1>Bienvenido,${user.name}</h1>
    <p>ID: ${user.id}</p>
    <P>Username: ${user.username}</P>
    <a href="/">Home</a>
    <form action="/logout" method="post">
    <button type="submit">cerra sesion</button>
    </form>
    `);
  } else {
    res.status(401).json({ mensaje: "usuario no encontrado" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Servidor escuchando puerto ${PORT}");
});
