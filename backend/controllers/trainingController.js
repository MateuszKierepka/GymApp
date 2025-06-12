const Training = require('../models/Training');
const fetch = require('node-fetch');

// pobranie wszystkich treningow
exports.getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ userId: req.user.userId });
    res.status(200).json(trainings);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania treningów', error: error.message });
  }
};

// pobranie treningu po id
exports.getTraining = async (req, res) => {
  try {
    const training = await Training.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });
    
    if (!training) {
      return res.status(404).json({ message: 'Nie znaleziono treningu' });
    }
    
    res.status(200).json(training);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania treningu', error: error.message });
  }
};

exports.createTraining = async (req, res) => {
  try {
    const training = new Training({
      ...req.body,
      userId: req.body.userId || req.user.userId
    });
    const savedTraining = await training.save();
    res.status(201).json(savedTraining);
  } catch (error) {
    res.status(400).json({ message: 'Błąd podczas tworzenia treningu', error: error.message });
  }
};

exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!training) {
      return res.status(404).json({ message: 'Trening nie znaleziony' });
    }
    res.status(200).json(training);
  } catch (error) {
    res.status(400).json({ message: 'Błąd podczas aktualizacji treningu', error: error.message });
  }
};

exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!training) {
      return res.status(404).json({ message: 'Trening nie znaleziony' });
    }
    res.status(200).json({ message: 'Trening został usunięty' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania treningu', error: error.message });
  }
};

// generuje nowy trening za pomoca modelu Mistral w ollama i zarzadza stanem generowania
exports.generateTraining = async (req, res) => {
  try {
    const prompt = `Jesteś ekspertem w dziedzinie treningu siłowego i fitness. 
    Twoim zadaniem jest stworzenie profesjonalnego planu treningowego dla osoby średniozaawansowanej.

    Zasady tworzenia treningu:
    1. Wybierz 5-6 ćwiczeń, które angażują różne partie mięśniowe
    2. Każde ćwiczenie powinno mieć dokładnie 3 serie
    3. Używaj ćwiczeń z wykorzystaniem:
      - Sztangi (np. wyciskanie, przysiady)
      - Hantli (np. uginanie ramion, wyciskanie)
      - Ciężaru własnego ciała (np. pompki, podciąganie)
    4. Dla każdego ćwiczenia określ:
      - Ciężar w kilogramach (dostosowany do poziomu średniozaawansowanego)
      - Liczbę powtórzeń (8-12 dla większości ćwiczeń)
    5. Uwzględnij ćwiczenia na:
      - Górną część ciała (klatka piersiowa, plecy, ramiona)
      - Dolną część ciała (nogi)
      - Core (brzuch, dolny odcinek pleców)

    WAŻNE:
      - Dla ćwiczeń z ciężarem własnego ciała (np. pompki, podciąganie) ustaw weight na 1 kg
      - Dla ćwiczeń ze sztangą/hantlami podaj rzeczywisty ciężar w kg
      - Każde ćwiczenie musi mieć dokładnie 3 serie
      - Nigdy nie ustawiaj weight na null lub 0

    Zwróć odpowiedź TYLKO w formacie JSON z następującą strukturą:
    {
      "name": "Trening siłowy dla średniozaawansowanych",
      "exercises": [
        {
          "name": "Nazwa ćwiczenia",
          "sets": [
            {
              "weight": 1,
              "reps": 0
            }
          ]
        }
      ]
    }

    Pamiętaj:
      - Nie dodawaj żadnego tekstu przed ani po JSON
      - Upewnij się, że JSON jest poprawnie sformatowany
      - Używaj realistycznych ciężarów dla osoby średniozaawansowanej
      - Każde ćwiczenie musi mieć dokładnie 3 serie
      - Dla ćwiczeń z ciężarem własnego ciała zawsze ustaw weight na 1 kg`;

    console.log('Wysyłam zapytanie do Ollama...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Błąd odpowiedzi z Ollama:', response.status, response.statusText, errorText);
      throw new Error(`Błąd podczas komunikacji z Ollama: ${errorText}`);
    }

    const data = await response.json();
    
    try {
      const generatedTraining = JSON.parse(data.response);
      const training = new Training({
        ...generatedTraining,
        userId: req.user.userId
      });

      const savedTraining = await training.save();
      console.log('Trening został zapisany pomyślnie');
      res.status(201).json(savedTraining);
    } catch (parseError) {
      console.error('Błąd parsowania odpowiedzi z Ollama:', parseError);
      console.error('Otrzymana odpowiedź:', data.response);
      throw new Error('Nieprawidłowy format odpowiedzi z Ollama');
    }
  } catch (error) {
    console.error('Błąd podczas generowania treningu:', error);
    res.status(500).json({ message: 'Błąd podczas generowania treningu', error: error.message });
  }
};