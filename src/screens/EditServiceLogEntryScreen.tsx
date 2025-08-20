import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  Switch,
  Chip,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ServiceLogEntry, ServiceCase } from '../types';
import { serviceLogStorage, serviceCaseStorage } from '../services/storage';
import { COLORS, SERVICE_LOG_TYPES, SERVICE_LOG_ICONS, SERVICE_LOG_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { ImagePickerComponent } from '../components/ImagePicker';
import { useTheme } from '../contexts/ThemeContext';

interface EditServiceLogEntryScreenProps {
  navigation: any;
  route: any;
}

export const EditServiceLogEntryScreen: React.FC<EditServiceLogEntryScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { entryId, serviceCaseId } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serviceCase, setServiceCase] = useState<ServiceCase | null>(null);
  const [entry, setEntry] = useState<ServiceLogEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'note' as keyof typeof SERVICE_LOG_TYPES,
    content: '',
    location: '',
    tags: [] as string[],
    isImportant: false,
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadData();
  }, [entryId, serviceCaseId]);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      
      // Ladda både service case och entry parallellt
      const [serviceCaseData, entryData] = await Promise.all([
        serviceCaseStorage.getById(serviceCaseId),
        serviceLogStorage.getById(entryId)
      ]);

      if (!serviceCaseData) {
        Alert.alert('Fel', 'Kunde inte hitta serviceärendet');
        navigation.goBack();
        return;
      }

      if (!entryData) {
        Alert.alert('Fel', 'Kunde inte hitta loggposten');
        navigation.goBack();
        return;
      }

      setServiceCase(serviceCaseData);
      setEntry(entryData);
      
      // Fyll i formuläret med befintlig data
      setFormData({
        title: entryData.title || '',
        type: entryData.type || 'note',
        content: entryData.content || '',
        location: entryData.location || '',
        tags: entryData.tags || [],
        isImportant: entryData.isImportant || false,
        images: entryData.images || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Fel', 'Kunde inte ladda data');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel krävs';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Innehåll krävs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !entry) {
      return;
    }

    setLoading(true);
    try {
      const updatedEntry: ServiceLogEntry = {
        ...entry,
        title: formData.title.trim(),
        type: formData.type,
        content: formData.content.trim(),
        location: formData.location.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isImportant: formData.isImportant,
        images: formData.images.length > 0 ? formData.images : undefined,
        timestamp: new Date(), // Uppdatera timestamp
      };

      await serviceLogStorage.save(updatedEntry);
      Alert.alert('Framgång', 'Loggposten har uppdaterats', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Fel', 'Kunde inte spara loggposten');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Ta bort loggpost',
      'Är du säker på att du vill ta bort denna loggpost? Detta går inte att ångra.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await serviceLogStorage.delete(entryId);
              Alert.alert('Framgång', 'Loggposten har tagits bort', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Fel', 'Kunde inte ta bort loggposten');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Laddar loggpost...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry || !serviceCase) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Data hittades inte</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Title style={[styles.title, { color: colors.text }]}>Redigera Loggpost</Title>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Uppdatera service loggpost
            </Text>
            {serviceCase && (
              <Text style={[styles.serviceCaseInfo, { color: colors.textSecondary }]}>
                Serviceärende: {serviceCase.title}
              </Text>
            )}
          </View>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Grundinformation</Title>
              
              <TextInput
                label="Titel *"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                error={!!errors.title}
              />
              {errors.title && <HelperText type="error">{errors.title}</HelperText>}

              <View style={styles.typeContainer}>
                <Text style={[styles.typeLabel, { color: colors.text }]}>Typ av loggpost</Text>
                <SegmentedButtons
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as keyof typeof SERVICE_LOG_TYPES })}
                  buttons={Object.entries(SERVICE_LOG_TYPES).map(([key, label]) => ({
                    value: key,
                    label,
                    icon: SERVICE_LOG_ICONS[key as keyof typeof SERVICE_LOG_ICONS],
                  }))}
                  style={styles.segmentedButtons}
                />
              </View>

              <TextInput
                label="Innehåll *"
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                multiline
                numberOfLines={4}
                error={!!errors.content}
              />
              {errors.content && <HelperText type="error">{errors.content}</HelperText>}

              <TextInput
                label="Plats"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                placeholder="t.ex. Akutmottagning, Våning 2"
              />
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Taggar</Title>
              
              <View style={styles.tagInputContainer}>
                <TextInput
                  label="Lägg till tagg"
                  value={newTag}
                  onChangeText={setNewTag}
                  style={[styles.tagInput, { backgroundColor: colors.surface }]}
                  mode="outlined"
                  placeholder="t.ex. viktigt, reparation, underhåll"
                  onSubmitEditing={addTag}
                />
                <IconButton
                  icon="plus"
                  mode="contained"
                  onPress={addTag}
                  disabled={!newTag.trim()}
                  style={styles.addTagButton}
                />
              </View>

              {formData.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      onClose={() => removeTag(tag)}
                      style={styles.tagChip}
                      textStyle={{ color: colors.text }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Bilder</Title>
              
              <ImagePickerComponent
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Inställningar</Title>
              
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Viktig loggpost</Text>
                <Switch
                  value={formData.isImportant}
                  onValueChange={(value) => setFormData({ ...formData, isImportant: value })}
                  color={colors.primary}
                />
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              labelStyle={styles.buttonText}
            >
              Spara Ändringar
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={[styles.cancelButton, { borderColor: colors.border }]}
              labelStyle={[styles.buttonText, { color: colors.text }]}
            >
              Avbryt
            </Button>

            <Button
              mode="outlined"
              onPress={handleDelete}
              disabled={loading}
              style={[styles.deleteButton, { borderColor: '#EF4444' }]}
              labelStyle={[styles.buttonText, { color: '#EF4444' }]}
            >
              Ta Bort Loggpost
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCaseInfo: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  deleteButton: {
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 