const express = require ('express');
const catwaysRoutes = require('./src/routes/catways');
const reservationsRoutes = require('./src/routes/reservation');
const userRoutes = require('./src/routes/users');
const cookieParser = require('cookie-parser');
const { checkJWT, checkJWTView } = require("./src/middlewares/private");
const axios = require("axios");
const path = require ("path");
const app = express();

//Middleware de parsing 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Pages (views)
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    res.render('login', { error: undefined, message: undefined });
});
app.get('/dashboard', checkJWTView, (req, res) => {
    res.render('dashboard', { user: req.decoded.user, error: undefined });
});
app.get('/catways', checkJWTView, (req, res) => {
    res.render('catways', {
        catways: [],
        selectedCatway: undefined,
        reservations: [],
        error: undefined,
        message: undefined
    });
});

// POST /login 
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post("http://localhost:3000/users/login", {
      email,
      password,
    });

    const token = response.data.token;

    res.cookie("token", token, { httpOnly: true });

    return res.redirect("/dashboard");
  } catch (e) {
    
    return res.status(401).render("login", {
      error: "Identifiants invalides",
      message: undefined,
    });
  }
});

//Public
app.use(express.static(path.join(__dirname, "public")));

//Routes test
app.get('/health', (req, res) => {
    res.status(200).json ({ message: 'API OK'});
});

// VIEWS -> ACTIONS (forms) -> API via axios
app.post('/catways/create', checkJWTView, async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.post('http://localhost:3000/catways', req.body, {
      headers: { 'x-access-token': token },
    });

    return res.redirect('/catways');
  } catch (e) {
    return res.status(401).render('catways', {
      catways: [],
      selectedCatway: undefined,
      reservations: [],
      error: 'Erreur création catway',
      message: undefined,
    });
  }
});

app.post('/catways/:id/update', checkJWTView, async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.put(`http://localhost:3000/catways/${req.params.id}`, req.body, {
      headers: { 'x-access-token': token },
    });

    return res.redirect('/catways');
  } catch (e) {
    return res.redirect('/catways');
  }
});

app.post('/catways/:id/delete', checkJWTView, async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.delete(`http://localhost:3000/catways/${req.params.id}`, {
      headers: { 'x-access-token': token },
    });

    return res.redirect('/catways');
  } catch (e) {
    return res.redirect('/catways');
  }
});

app.post('/reservations/create', checkJWTView, async (req, res) => {
  try {
    const token = req.cookies.token;
    const { selectedCatway, clientName, boatName, startDate, endDate } = req.body;

    await axios.post(
      `http://localhost:3000/catways/${selectedCatway}/reservations`,
      { clientName, boatName, startDate, endDate },
      { headers: { 'x-access-token': token } }
    );

    return res.redirect('/catways');
  } catch (e) {
    return res.redirect('/catways');
  }
});

app.use('/catways', checkJWT, catwaysRoutes);
app.use('/catways/:id/reservations', checkJWT, reservationsRoutes);
app.use('/users', userRoutes);

// route logout
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login');
});

module.exports = app;