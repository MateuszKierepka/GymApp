const User = require('../models/User');

// pobieranie wszystkich uzytkowników
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// aktualizacja danych uzytkownika
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Ten adres email jest już używany' });
      }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    await user.save();

    res.status(200).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji użytkownika:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// usuwanie uzytkownika
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Użytkownik został pomyślnie usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania użytkownika:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// zmiana roli uzytkownika
exports.toggleAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.status(200).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Błąd podczas zmiany roli użytkownika:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
}; 