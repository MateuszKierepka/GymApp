# GymApp

## Opis projektu

GymApp to nowoczesna aplikacja webowa służąca do zarządzania treningami i monitorowania postępów w fitnessie. Aplikacja wykorzystuje najnowsze technologie oraz najlepsze praktyki programistyczne.

### Główne funkcjonalności

- **Zarządzanie treningami**

  - Tworzenie i edycja planów treningowych
  - Historia treningów
  - Generacja treningów z wykorzystaniem AI (Ollama + Mistral)
  - Tryb live treningu
  - Eksport treningów do PDF

- **Zarządzanie użytkownikami**

  - Rejestracja i logowanie użytkowników
  - System ról (użytkownik, administrator)
  - Reset hasła, gdy użytkownik zapomniał starego hasła
  - Edycja danych profilowych

- **Panel administracyjny**
  - Przeglądanie listy wszystkich użytkowników
  - Nadawanie i odbieranie uprawnień administratora
  - Usuwanie kont użytkowników

### Wymagania projektowe

Projekt spełnia następujące wymagania:

1. **Architektura**

   - Frontend: Angular
   - Backend: Express.js
   - Baza danych: MongoDB

2. **Bezpieczeństwo**

   - Haszowanie haseł
   - Autoryzacja i uwierzytelnianie
   - Zabezpieczenie endpointów
   - Walidacja po stronie klienta i serwera

3. **Funkcjonalność**
   - Pełne operacje CRUD
   - REST API
   - Responsywny interfejs użytkownika
   - Walidacja formularzy

## Instalacja i uruchomienie

Przed rozpoczęciem instalacji upewnij się, że masz zainstalowane:

- [Node.js](https://nodejs.org/) (zalecana wersja LTS)
- [Docker](https://www.docker.com/)
- [Angular CLI](https://angular.io/cli)

1. Sklonuj repozytorium:

   ```bash
   git clone https://github.com/MateuszKierepka/GymApp.git
   ```

2. Przejdź do katalogu projektu:

   ```bash
   cd GymApp
   ```

### Instalacja obrazów Docker i uruchomienie kontenerów

1. Uruchom wszystkie kontenery za pomocą Docker Compose:

   ```bash
   docker compose up -d
   ```

2. Zainstaluj model Mistral w kontenerze Ollama:

   ```bash
   docker exec -it ollama ollama pull mistral
   ```

### Backend

1. Przejdź do katalogu `backend`:

   ```bash
   cd backend
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom backend:

   ```bash
   npm start
   ```

### Frontend

1. Przejdź do katalogu `frontend`:

   ```bash
   cd frontend
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom frontend:

   ```bash
   ng s
   ```

### Dostęp do aplikacji

- Frontend dostępny pod adresem: `http://localhost:4200`
- Backend dostępny pod adresem: `http://localhost:3000`

## Technologie

### Frontend

- Angular 17
- TypeScript
- Angular Material
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt

## Struktura projektu

```
GymApp/
├── frontend/           # Aplikacja Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── account/    # Komponent zarządzania kontem
│   │   │   ├── admin/      # Komponenty panelu administracyjnego
│   │   │   ├── auth/       # Komponenty autoryzacji
│   │   │   ├── guards/     # Strażnicy routingu
│   │   │   ├── models/     # Interfejsy i typy
│   │   │   ├── training/   # Komponenty treningów
│   │   │   ├── shared/     # Komponenty współdzielone
│   │   │   └── services/   # Serwisy Angular
│   │   └── ...
│   └── ...
└── backend/           # Serwer Express.js
    ├── controllers/   # Kontrolery
    ├── models/       # Modele MongoDB
    ├── routes/       # Definicje tras API
    ├── middleware/   # Middleware
    ├── utils/        # Narzędzia pomocnicze
    └── config/       # Konfiguracja
```
