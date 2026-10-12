
import { describe, test, expect } from '@jest/globals';
import { validarCategoria } from '../validations/categoryValidation.js';

describe('Validación de categorías', () => {
  test('Acepta un nombre válido', () => {
    expect(validarCategoria('Electrónica')).toBe(true);
  });

  test('Acepta un nombre con varias palabras', () => {
    expect(validarCategoria('Ropa')).toBe(true);
  });

  test('Acepta un nombre con tilde', () => {
    expect(validarCategoria('Papelería')).toBe(true);
  });

  test('Acepta un nombre con espacios entre palabras', () => {
    expect(validarCategoria('Artículos para el hogar')).toBe(true);
  });

  test('Rechaza un nombre vacío', () => {
    expect(validarCategoria('')).toBe(false);
  });

  test('Rechaza un nombre con solo espacios', () => {
    expect(validarCategoria('   ')).toBe(false);
  });
});
