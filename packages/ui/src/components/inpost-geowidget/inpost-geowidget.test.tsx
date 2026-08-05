import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InPostGeowidget } from './inpost-geowidget';

vi.mock('./use-inpost-script', () => ({
  useInPostScript: () => ({ isLoaded: true, error: null }),
}));

describe('InPostGeowidget', () => {
  it('renders inpost-geowidget custom element and handles point select event', () => {
    const onPointSelect = vi.fn();
    const { container } = render(
      <InPostGeowidget token="test-token" onPointSelect={onPointSelect} />
    );

    const widgetEl = container.querySelector('inpost-geowidget');
    expect(widgetEl).not.toBeNull();
    expect(widgetEl?.getAttribute('token')).toBe('test-token');

    // Dispatch custom event inpostgeowidget
    const mockPoint = { name: 'WAW01M', address: { line1: 'Test', line2: 'City' } };
    const customEvent = new CustomEvent('inpostgeowidget', {
      detail: mockPoint,
      bubbles: true,
    });

    fireEvent(widgetEl!, customEvent);

    expect(onPointSelect).toHaveBeenCalledWith(mockPoint);
  });
});
