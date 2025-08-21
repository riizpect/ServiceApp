# ServiceApp

En React Native-app för servicetekniker på Ferno Norden AB för att hantera serviceärenden, kunder och påminnelser för VIPER-bårar och PowerTraxx-stolar.

## 🌐 Multi-plattform stöd

ServiceApp fungerar på:
- **📱 iOS** - Native app via App Store
- **🤖 Android** - Native app via Play Store  
- **💻 Web** - Responsiv webbapp i webbläsaren
- **📱 Expo Go** - Snabb testning på mobil

## 🚀 Funktioner

- **Serviceärenden**: Skapa, hantera och spåra serviceärenden
- **Kunder**: Hantera kundinformation och kontaktuppgifter
- **Produkter**: Produktkatalog med VIPER, PowerTraxx och andra utrustningar
- **Checklistor**: Standardiserade checklistor för varje utrustningstyp
- **Bilder**: Ta bilder av skador, serienummer och service
- **Signaturer**: Samla digitala signaturer
- **Påminnelser**: Schemalägg framtida service
- **Service-avtal**: Hantera servicekontrakt
- **Service-loggar**: Detaljerad loggning av allt arbete
- **Offline-stöd**: Lokal lagring med AsyncStorage
- **Responsiv design**: Anpassar sig för mobil, tablet och desktop
- **Multi-platform**: Fungerar på iOS, Android och Web
- **Backup/Restore**: Säkerhetskopiering och återställning av data

## 🛠 Teknisk Stack

- **React Native** med Expo
- **TypeScript** för typsäkerhet
- **React Navigation** för navigering
- **AsyncStorage** för lokal datalagring
- **React Native Paper** för UI-komponenter
- **Expo Camera** för bildtagning
- **Expo Notifications** för påminnelser
- **React Native Web** för web-stöd

## 📱 Installation

### För utveckling

1. Klona projektet:
```bash
git clone https://github.com/riizpect/ServiceApp.git
cd ServiceApp
```

2. Installera dependencies:
```bash
npm install
```

3. Starta utvecklingsservern:
```bash
npm start
```

### Plattform-specifika kommandon

```bash
# Starta alla plattformar
npm start

# Endast iOS
npm run ios

# Endast Android  
npm run android

# Endast Web
npm run web

# Expo Go
npm start
```

## 🌐 Web-användning

### Öppna i webbläsare
1. Kör `npm run web`
2. Öppna http://localhost:8081 i webbläsaren
3. Appen anpassar sig automatiskt för skärmstorlek

### Web-funktioner
- **Responsiv design** - Anpassar sig för desktop, tablet och mobil
- **Sidebar-navigation** - På större skärmar
- **Tab-navigation** - På mindre skärmar
- **Touch-optimized** - Fungerar med mus och touch
- **Keyboard-stöd** - Fullständigt tangentbordsstöd

## 📱 Mobil-användning

### iOS/Android
1. Installera Expo Go från App Store/Play Store
2. Skanna QR-koden från `npm start`
3. Appen öppnas i Expo Go

### Native build
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## 🏗 Projektstruktur

```
src/
├── components/          # Återanvändbara komponenter
│   ├── ResponsiveLayout.tsx    # Responsiv layout
│   ├── ServiceCaseCard.tsx
│   └── ...
├── navigation/          # Navigationslogik
│   ├── MainTabNavigator.tsx    # Mobil navigation
│   ├── WebNavigator.tsx        # Web navigation
│   └── RootNavigator.tsx
├── screens/             # App-skärmar
│   ├── DashboardScreen.tsx
│   ├── ServiceCasesScreen.tsx
│   └── ...
├── services/            # Datahantering och API
│   └── storage.ts
├── types/               # TypeScript interfaces
│   └── index.ts
└── utils/               # Hjälpfunktioner
    └── ...
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

### ServiceContract (Service-avtal)
- Kontraktsinformation
- Kundkoppling
- Status och förfallodatum
- Tjänster och priser

### ServiceReminder (Påminnelse)
- Schemalagd service
- Prioritet
- Koppling till kund/ärende

## 🎯 Användning

### Första gången
1. Öppna appen (mobil eller web)
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

### Responsiv design
- Använd `ResponsiveLayout` för skärmar
- Använd `ResponsiveGrid` för listor
- Testa på olika skärmstorlekar
- Använd `Platform.OS === 'web'` för web-specifik kod

### Testdata
Använd `createTestData()` funktionen i `src/services/storage.ts` för att skapa exempeldata för utveckling och testning.

## ✅ Implementerade funktioner

- [x] Detaljerad serviceärende-vy
- [x] Kamerafunktionalitet för bildtagning
- [x] Digital signatur
- [x] Backup/restore
- [x] PWA-stöd för web
- [x] Offline-stöd med lokal lagring
- [x] Responsiv design för alla plattformar
- [x] Service-avtal hantering
- [x] Påminnelser och schemaläggning
- [x] Produktkatalog och hantering
- [x] Kundarkiv och hantering
- [x] Service-loggar med bilder
- [x] Statistik och rapporter

## 🚀 Kommande funktioner

- [ ] PDF-rapporter
- [ ] Push-notifikationer
- [ ] GPS-lokalisering
- [ ] Datasynkronisering med moln
- [ ] Avancerad sökning och filtrering
- [ ] Stämningsinspelning
- [ ] Streckkodsskanning

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

## 🎉 Status

**ServiceApp är nu produktionsklar!** Alla kritiska funktioner är implementerade och appen är redo för användning.

## 🌐 Live Demo

Testa appen live på: [Länk kommer snart]

---

**Plattformar:** iOS, Android, Web  
**Språk:** Svenska  
**Företag:** Ferno Norden AB  
**Status:** ✅ PRODUCTION READY 