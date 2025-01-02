import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColor } from '@/hooks/useThemeColor';
import { storage, FireRef, uploadBytes, getDownloadURL } from '@/composables/firebase';

const MyTheme = useThemeColor;

interface RegisterScreenProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  desc: string;
  data_nasc: string;
  imageUrl: string;
}

const api_url = "https://starting-music.onrender.com/user/register";

export default function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormInputs>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = async (type: 'imageUrl') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3]
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setImageUrl(selectedUri);
      setValue(type, selectedUri);
    }
  };


  const uploadImage = async (uri: string, folder: string) => {
    const imageRef = FireRef(storage, `${folder}/${Date.now()}`);
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageSnapshot = await uploadBytes(imageRef, blob);
    return getDownloadURL(imageSnapshot.ref);
  };


  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      const uploadedImageUrl = await uploadImage(imageUrl, 'images');

      const response = await fetch(api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.username,
          email: data.email,
          desc: data.desc,
          senha: data.password,
          data_nasc: date.toISOString(),
          tags: [],
          cargo: "USUARIO",
          foto_perfil: uploadedImageUrl,
          banner: ''
        }),
      });

      console.log(response.body)

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Erro no cadastro", errorData.Error || "Erro no servidor.");
        return;
      }

      const jwtToken = response.headers.get('Authorization');
      const responseData = await response.json();

      if (jwtToken && responseData.user) {
        const { id, email, nome, cargo, foto_perfil, tags } = responseData.user;

        await AsyncStorage.setItem('jwtToken', jwtToken);
        await AsyncStorage.setItem('userData', JSON.stringify({
          id, email, nome, cargo, foto_perfil, tags, data_nasc: date.toISOString()
        }));

        onRegister();
      } else {
        Alert.alert("Erro", "Erro ao processar o cadastro.");
      }
    } catch (error) {
      console.error(error)
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setValue('data_nasc', currentDate.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <Controller
        control={control}
        rules={{ required: true }}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Nome"
            placeholderTextColor="#A0A0A0"
          />
        )}
      />
      {errors.username && <Text style={styles.errorText}>O nome é obrigatório.</Text>}

      <Controller
        control={control}
        rules={{ required: true }}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="E-mail"
            placeholderTextColor="#A0A0A0"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>O e-mail é obrigatório.</Text>}

      <Controller
        control={control}
        rules={{ required: true }}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="#A0A0A0"
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>A senha é obrigatória.</Text>}

      <Controller
        control={control}
        name="desc"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Descrição"
            placeholderTextColor="#A0A0A0"
          />
        )}
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>{date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity onPress={() => handleImageUpload('imageUrl')} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Selecionar Foto de Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1E1E2C',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#292938',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: MyTheme.colors.accent,
    color: '#FFFFFF',
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    cursor: 'pointer'
  },
  imagePicker: {
    backgroundColor: '#292938',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: MyTheme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: MyTheme.colors.primary,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
