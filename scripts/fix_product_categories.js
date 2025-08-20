const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const AsyncStorage = require('@react-native-async-storage/async-storage');

const STORAGE_KEY = 'product_categories';

const defaultCategories = [
  {
    name: 'Bårar',
    description: 'Ferno VIPER och andra bårar',
    icon: 'medical-bag',
    color: '#EF4444',
  },
  {
    name: 'Stolar',
    description: 'Transcend PowerTraxx och andra stolar',
    icon: 'seat',
    color: '#3B82F6',
  },
  {
    name: 'Tillbehör',
    description: 'Tillbehör för bårar och stolar',
    icon: 'puzzle',
    color: '#10B981',
  },
  {
    name: 'Reservdelar',
    description: 'Reservdelar till utrustning',
    icon: 'cog',
    color: '#F59E42',
  },
  {
    name: 'Elektronik',
    description: 'Elektroniska tillbehör',
    icon: 'cpu-64-bit',
    color: '#6366F1',
  },
  {
    name: 'Vagnar',
    description: 'Transportvagnar',
    icon: 'cart',
    color: '#F472B6',
  },
  {
    name: 'Lyftar',
    description: 'Lyftutrustning',
    icon: 'elevator-passenger',
    color: '#34D399',
  },
  {
    name: 'Övrigt',
    description: 'Övriga produkter',
    icon: 'help-circle-outline',
    color: '#6B7280',
  },
];

async function fixCategories() {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  let cats = data ? JSON.parse(data) : [];
  // Rensa dubbletter baserat på namn (case-insensitive)
  const unique = [];
  const seen = new Set();
  for (const c of cats) {
    const key = c.name.trim().toLowerCase();
    if (!seen.has(key)) {
      unique.push(c);
      seen.add(key);
    }
  }
  // Lägg till standardkategorier om de saknas
  for (const def of defaultCategories) {
    if (!unique.some(c => c.name.trim().toLowerCase() === def.name.toLowerCase())) {
      unique.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2),
        ...def,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  console.log('Kategorier fixade:', unique.map(c => c.name));
}

fixCategories(); 