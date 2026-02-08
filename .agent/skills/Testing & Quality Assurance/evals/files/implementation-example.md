// Ejemplo de Test de Integración para el Parser UML
import { describe, it, expect, beforeEach } from 'vitest';
import { UMLParser } from '../../src/parser';

describe('UMLParser Integration', () => {
    let parser: UMLParser;

    beforeEach(() => {
        parser = new UMLParser();
    });

    it('should correctly parse a basic class definition', () => {
        const input = 'class User { name: String }';
        const result = parser.parse(input);

        expect(result.classes).toHaveLength(1);
        expect(result.classes[0].name).toBe('User');
        expect(result.classes[0].attributes[0].type).toBe('String');
    });

    it('should report error for missing closing brace', () => {
        const input = 'class User { name: String';
        const result = parser.parse(input);

        expect(result.errors).toContainEqual(
            expect.objectContaining({ message: expect.stringContaining('unexpected end of file') })
        );
    });
});