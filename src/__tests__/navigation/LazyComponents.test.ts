/**
 * LazyComponents Test
 * Verifica gli export delle schermate secondarie montate in modo lazy.
 * Note: Rendering tests skipped due to Jest mock limitations with JSX
 */

import * as LazyComponents from '../../navigation/LazyLoading/LazyComponents';

describe('LazyComponents', () => {
  describe('Component Exports', () => {
    it('should export all lazy components as valid React components', () => {
      const components = [
        LazyComponents.LazyProjectsScreen,
        LazyComponents.LazyDevelopmentScreen,
      ];

      components.forEach(component => {
        expect(component).toBeDefined();
        // React.lazy() returns objects, createLazyComponent returns functions/objects
        expect(['function', 'object']).toContain(typeof component);
      });
    });
  });

  describe('Wrapped Component Exports', () => {
    it('should export all wrapped components as valid React components', () => {
      const wrappedComponents = [
        LazyComponents.WrappedProjectsScreen,
        LazyComponents.WrappedDevelopmentScreen,
      ];

      wrappedComponents.forEach(component => {
        expect(component).toBeDefined();
        // Wrapped components can be functions or objects (React components)
        expect(['function', 'object']).toContain(typeof component);
      });
    });
  });

  describe('Module Structure', () => {
    it('should export exactly the lazy screens actually mounted by AppNavigator', () => {
      const exportedKeys = Object.keys(LazyComponents).sort();

      expect(exportedKeys).toEqual([
        'LazyDevelopmentScreen',
        'LazyProjectsScreen',
        'WrappedDevelopmentScreen',
        'WrappedProjectsScreen',
      ]);
    });
  });

  describe('Component Type Consistency', () => {
    it('all Lazy* exports should be valid React components', () => {
      const lazyExports = Object.entries(LazyComponents).filter(([key]) =>
        key.startsWith('Lazy')
      );

      lazyExports.forEach(([, value]) => {
        // React.lazy() returns objects, HOCs return functions
        expect(['function', 'object']).toContain(typeof value);
      });

      expect(lazyExports.length).toBe(2);
    });

    it('all Wrapped* exports should be valid React components', () => {
      const wrappedExports = Object.entries(LazyComponents).filter(([key]) =>
        key.startsWith('Wrapped')
      );

      wrappedExports.forEach(([, value]) => {
        expect(['function', 'object']).toContain(typeof value);
      });

      expect(wrappedExports.length).toBe(2);
    });
  });
});
