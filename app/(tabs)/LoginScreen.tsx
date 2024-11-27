import React from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useThemeColor } from '@/hooks/useThemeColor';

const MyTheme = useThemeColor;

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

interface LoginFormInputs {
  username: string;
  password: string;
}

const api_url = "https://starting-music.onrender.com/user/login/";

export default function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.username, senha: data.password }),
      });

      if (!response.ok) {
        Alert.alert("Erro de login", "Credenciais inválidas ou erro no servidor.");
        return;
      }

      const jwtToken = response.headers.get('Authorization') || '';
      const responseData = await response.json();

      if (jwtToken && responseData.user) {
        const { id, email, nome, cargo, foto_perfil, tags, desc, data_nasc, banner_perfil } = responseData.user;

        await AsyncStorage.setItem('jwtToken', jwtToken);
        await AsyncStorage.setItem('userData', JSON.stringify({
          id, email, nome, cargo, foto_perfil, tags, desc, data_nasc, banner_perfil,
        }));

        onLogin();
      } else {
        Alert.alert("Erro", "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageBox}>
        {/* <Image
          style={styles.image}
          source={require('@/assets/images/logo.png') ||
            { uri: 'https://starting-music-artista.vercel.app/_vercel/image?url=/logo.svg&w=1536&q=100' }}
          resizeMode="contain"
        /> */}
      </View>
      <Text style={styles.title}>Login do Usuário</Text>
      <Controller
        control={control}
        rules={{ required: true }}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || ''}
            placeholder="E-mail"
            placeholderTextColor="#A0A0A0"
          />
        )}
      />
      {errors.username && <Text style={styles.errorText}>O usuário é obrigatório.</Text>}

      <Controller
        control={control}
        rules={{ required: true }}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || ''}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="#A0A0A0"
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>A senha é obrigatória.</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta ainda?</Text>
        <TouchableOpacity onPress={onRegister}>
          <Text style={styles.registerButton}>Cadastro</Text>
        </TouchableOpacity>
      </View>
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
  imageBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 130,
    height: 130,
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
  button: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  registerButton: {
    color: '#6A5ACD',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
  },
});
