import { describe, test, expect } from '@jest/globals';

import {
    validarNombreCliente,
    validarEmailCliente,
    validarProductosVenta,
    validarCantidadProducto,
    validarVenta
} from '../validations/saleValidation.js';

describe('Validación de ventas', () => {

    describe('Nombre del cliente', () => {
        test('Acepta un nombre válido', () => {
            expect(validarNombreCliente('Carlos Pérez')).toBe(true);
        });

        test('Rechaza un nombre vacío', () => {
            expect(validarNombreCliente('')).toBe(false);
        });

        test('Rechaza un nombre con solo espacios', () => {
            expect(validarNombreCliente('   ')).toBe(false);
        });
    });

    describe('Email del cliente', () => {
        test('Acepta un email válido', () => {
            expect(validarEmailCliente('carlos@gmail.com')).toBe(true);
        });

        test('Rechaza un email vacío', () => {
            expect(validarEmailCliente('')).toBe(false);
        });

        test('Rechaza un email sin arroba', () => {
            expect(validarEmailCliente('carlosgmail.com')).toBe(false);
        });

        test('Rechaza un email sin dominio completo', () => {
            expect(validarEmailCliente('carlos@gmail')).toBe(false);
        });
    });

    describe('Productos de la venta', () => {
        test('Acepta una lista con productos', () => {
            expect(validarProductosVenta([
                { productId: 1, cantidad: 2 }
            ])).toBe(true);
        });

        test('Rechaza una lista vacía', () => {
            expect(validarProductosVenta([])).toBe(false);
        });
    });

    describe('Cantidad y stock', () => {
        test('Acepta una cantidad disponible en stock', () => {
            expect(validarCantidadProducto(3, 10)).toBe(true);
        });

        test('Acepta comprar todo el stock disponible', () => {
            expect(validarCantidadProducto(10, 10)).toBe(true);
        });

        test('Rechaza una cantidad igual a cero', () => {
            expect(validarCantidadProducto(0, 10)).toBe(false);
        });

        test('Rechaza una cantidad negativa', () => {
            expect(validarCantidadProducto(-2, 10)).toBe(false);
        });

        test('Rechaza una cantidad superior al stock', () => {
            expect(validarCantidadProducto(11, 10)).toBe(false);
        });

        test('Rechaza una cantidad decimal', () => {
            expect(validarCantidadProducto(2.5, 10)).toBe(false);
        });

        test('Rechaza una cantidad no numérica', () => {
            expect(validarCantidadProducto('abc', 10)).toBe(false);
        });

        test('Rechaza un stock negativo', () => {
            expect(validarCantidadProducto(1, -5)).toBe(false);
        });

        test('Rechaza un stock no numérico', () => {
            expect(validarCantidadProducto(1, 'abc')).toBe(false);
        });
    });

    describe('Múltiples campos inválidos', () => {
        test('Rechaza una venta con nombre y email vacíos', () => {
            expect(validarVenta('', '', [
                { productId: 1, cantidad: 2 }
            ])).toBe(false);
        });

        test('Rechaza una venta con email inválido y sin productos', () => {
            expect(validarVenta('Carlos Pérez', 'email-invalido', [])).toBe(false);
        });

        test('Rechaza una venta con nombre vacío, email inválido y sin productos', () => {
            expect(validarVenta('', 'email-invalido', [])).toBe(false);
        });
    });

    describe('Venta completa', () => {
        test('Acepta una venta con todos los datos válidos', () => {
            expect(validarVenta(
                'Carlos Pérez',
                'carlos@gmail.com',
                [{ productId: 1, cantidad: 2 }]
            )).toBe(true);
        });
    });

});