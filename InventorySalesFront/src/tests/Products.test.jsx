import { describe, test, expect } from '@jest/globals';
import { validarProducto } from '../validations/productValidation.js';

describe('Validación de productos', () => {

  describe('Nombre', () => {
    test('Acepta un nombre válido', () => {
      expect(validarProducto('Jeans Azules', '125000', '50', '1')).toBe(true);
    });

    test('Rechaza un nombre vacío', () => {
      expect(validarProducto('', '125000', '50', '1')).toBe(false);
    });

    test('Rechaza un nombre con solo espacios', () => {
      expect(validarProducto('   ', '125000', '50', '1')).toBe(false);
    });
  });

  describe('Precio', () => {
    test('Rechaza un precio vacío', () => {
      expect(validarProducto('Jeans Azules', '', '50', '1')).toBe(false);
    });

    test('Rechaza un precio igual a cero', () => {
      expect(validarProducto('Jeans Azules', '0', '50', '1')).toBe(false);
    });

    test('Rechaza un precio negativo', () => {
      expect(validarProducto('Jeans Azules', '-100', '50', '1')).toBe(false);
    });
  });

  describe('Stock', () => {
    test('Acepta un stock igual a cero', () => {
      expect(validarProducto('Jeans Azules', '125000', '0', '1')).toBe(true);
    });

    test('Rechaza un stock negativo', () => {
      expect(validarProducto('Jeans Azules', '125000', '-5', '1')).toBe(false);
    });

    test('Rechaza un stock decimal', () => {
      expect(validarProducto('Jeans Azules', '125000', '2.5', '1')).toBe(false);
    });
  });

  describe('Categoría', () => {
    test('Rechaza una categoría vacía', () => {
      expect(validarProducto('Jeans Azules', '125000', '50', '')).toBe(false);
    });
  });

  describe('Múltiples campos inválidos', () => {
    test('Rechaza un producto con nombre y precio vacíos', () => {
      expect(validarProducto('', '', '50', '1')).toBe(false);
    });

    test('Rechaza un producto con precio negativo y stock negativo', () => {
      expect(validarProducto('Jeans Azules', '-100', '-5', '1')).toBe(false);
    });

    test('Rechaza un producto con nombre vacío, stock negativo y categoría vacía', () => {
      expect(validarProducto('', '125000', '-5', '')).toBe(false);
    });
  });

}); 