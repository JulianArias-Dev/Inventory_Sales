import { describe, test, expect } from '@jest/globals';
import { validarLogin } from '../validations/loginValidation';

describe('Validación del formulario Login', () => {
  test('Rechaza un usuario vacío', () => {
    expect(validarLogin('', 'Admin123!')).toBe(false);
  });

  test('Rechaza una contraseña vacía', () => {
    expect(validarLogin('Admin', '')).toBe(false);
  });

  test('Acepta los campos completos', () => {
    expect(validarLogin('Admin', 'Admin123!')).toBe(true);
  });
});
