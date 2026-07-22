import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import TextField from './TextField';

export default function UserForm({ initialData, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    roles: ['user'],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        password: '', // No pre-fill password on edit
        roles: initialData.roles || ['user'],
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleRole = (role) => {
    setFormData(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  const handleSubmit = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'El usuario es requerido');
      return;
    }
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }
    if (!initialData && !formData.password.trim()) {
      Alert.alert('Error', 'La contraseña es requerida');
      return;
    }

    onSubmit({
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      ...(formData.password && { password: formData.password }),
      roles: formData.roles,
    });
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>

          <TextField
            label="Usuario"
            value={formData.username}
            onChangeText={(text) => handleChange('username', text)}
            placeholder="Ingrese usuario"
            editable={!initialData}
          />

          <TextField
            label="Nombre Completo"
            value={formData.fullName}
            onChangeText={(text) => handleChange('fullName', text)}
            placeholder="Ingrese nombre completo"
          />

          <TextField
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Ingrese email"
            keyboardType="email-address"
          />

          {!initialData && (
            <TextField
              label="Contraseña"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              placeholder="Ingrese contraseña"
              secureTextEntry={true}
            />
          )}

          <View style={styles.rolesSection}>
            <Text style={styles.rolesLabel}>Roles:</Text>
            <View style={styles.rolesContainer}>
              {['admin', 'user', 'operador'].map(role => (
                <Pressable
                  key={role}
                  style={[
                    styles.roleCheckbox,
                    formData.roles.includes(role) && styles.roleCheckboxSelected,
                  ]}
                  onPress={() => handleToggleRole(role)}
                >
                  <Text
                    style={[
                      styles.roleCheckboxText,
                      formData.roles.includes(role) && styles.roleCheckboxTextSelected,
                    ]}
                  >
                    {role === 'admin' ? 'Administrador' : role === 'operador' ? 'Operador' : 'Usuario'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  rolesSection: {
    marginVertical: 12,
  },
  rolesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleCheckbox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  roleCheckboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleCheckboxText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  roleCheckboxTextSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
