const service = require("../services/users.service");

// GET /users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await service.getAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// POST /users (inscription)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Champs requis : username, email, password",
      });
    }

    const created = await service.create({ username, email, password });
    return res.status(201).json(created);
  } catch (error) {
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email déjà existant" });
    }
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// POST /login  
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Champs requis : email, password" });
    }

    const result = await service.authenticate({ email, password });
    if (!result) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    res.header("Authorization", "Bearer " + result.token);

    return res.status(200).json({
      message: "Connexion réussie",
      user: result.user,
      token: result.token, 
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// GET /users/:email
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await service.getByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// PUT /users/:email
exports.updateUserByEmail = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username && !password) {
      return res.status(400).json({ message: "Champs requis : username ou password" });
    }

    const updated = await service.updateByEmail(req.params.email, { username, password });
    if (!updated) return res.status(404).json({ message: "Utilisateur introuvable" });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};

// DELETE /users/:email
exports.deleteUserByEmail = async (req, res) => {
  try {
    const ok = await service.deleteByEmail(req.params.email);
    if (!ok) return res.status(404).json({ message: "Utilisateur introuvable" });
    return res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};