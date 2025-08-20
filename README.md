# ServiceApp

En React Native-app för servicetekniker på Ferno Norden AB för att hantera serviceärenden, kunder och påminnelser för VIPER-bårar och PowerTraxx-stolar.

## 🚀 Funktioner

- **Serviceärenden**: Skapa, hantera och spåra serviceärenden
- **Kunder**: Hantera kundinformation och kontaktuppgifter
- **Checklistor**: Standardiserade checklistor för varje utrustningstyp
- **Bilder**: Ta bilder av skador, serienummer och service
- **Signaturer**: Samla digitala signaturer
- **Påminnelser**: Schemalägg framtida service
- **Offline-stöd**: Lokal lagring med AsyncStorage
- **Rapporter**: Exportera data (kommer snart)

## 🛠 Teknisk Stack

- **React Native** med Expo
- **TypeScript** för typsäkerhet
- **React Navigation** för navigering
- **AsyncStorage** för lokal datalagring
- **React Native Paper** för UI-komponenter
- **Expo Camera** för bildtagning
- **Expo Notifications** för påminnelser

## 📱 Installation

1. Klona projektet:
```bash
git clone <repository-url>
cd ServiceAppNew
```

2. Installera dependencies:
```bash
npm install
```

3. Starta utvecklingsservern:
```bash
npm start
```

4. Öppna appen i Expo Go eller kör på simulator/emulator

## 🏗 Projektstruktur

```
src/
├── components/          # Återanvändbara komponenter
│   └── ServiceCaseCard.tsx
├── constants/           # App-konstanter och konfiguration
│   └── index.ts
├── navigation/          # Navigationslogik
│   ├── MainTabNavigator.tsx
│   └── RootNavigator.tsx
├── screens/             # App-skärmar
│   ├── CustomersScreen.tsx
│   ├── NewCustomerScreen.tsx
│   ├── NewServiceCaseScreen.tsx
│   ├── RemindersScreen.tsx
│   ├── ServiceCasesScreen.tsx
│   └── SettingsScreen.tsx
├── services/            # Datahantering och API
│   └── storage.ts
├── types/               # TypeScript interfaces
│   └── index.ts
└── utils/               # Hjälpfunktioner
    └── testData.ts
```

## 📊 Datamodeller

### Customer (Kund)
- Grundläggande kundinformation
- Kontaktuppgifter
- Anteckningar

### ServiceCase (Serviceärende)
- Koppling till kund
- Utrustningstyp (VIPER/PowerTraxx)
- Status och prioritet
- Checklista
- Bilder och signaturer

### ServiceReminder (Påminnelse)
- Schemalagd service
- Prioritet
- Koppling till kund/ärende

## 🎯 Användning

### Första gången
1. Öppna appen
2. Gå till "Inställningar"
3. Tryck på "Skapa Testdata" för att lägga till exempeldata
4. Utforska appens funktioner

### Skapa nytt serviceärende
1. Gå till "Serviceärenden"
2. Tryck på + knappen
3. Fyll i formuläret
4. Välj kund och utrustningstyp
5. Spara

### Hantera kunder
1. Gå till "Kunder"
2. Tryck på + för att lägga till ny kund
3. Fyll i kundinformation
4. Spara

## 🔧 Utveckling

### Lägga till ny funktion
1. Skapa TypeScript interface i `src/types/index.ts`
2. Lägg till storage-funktioner i `src/services/storage.ts`
3. Skapa komponenter i `src/components/`
4. Lägg till skärmar i `src/screens/`
5. Uppdatera navigation vid behov

### Testdata
Använd `createTestData()` funktionen i `src/utils/testData.ts` för att skapa exempeldata för utveckling och testning.

## 📱 Kommande Funktioner

- [ ] Detaljerad serviceärende-vy
- [ ] Kamerafunktionalitet för bildtagning
- [ ] Digital signatur
- [ ] PDF-rapporter
- [ ] Push-notifikationer
- [ ] Datasynkronisering
- [ ] Backup/restore

## 🤝 Bidrag

1. Fork projektet
2. Skapa feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branch (`git push origin feature/AmazingFeature`)
5. Öppna Pull Request

## 📄 Licens

Detta projekt är utvecklat för Ferno Norden AB.

## 👨‍💻 Utvecklare

ServiceApp är utvecklad för servicetekniker på Ferno Norden AB för att effektivisera servicearbetet med VIPER-bårar och PowerTraxx-stolar. 