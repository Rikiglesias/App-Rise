declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export interface Region extends LatLng {
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface Camera {
    center: LatLng;
    pitch: number;
    heading: number;
    altitude?: number;
    zoom?: number;
  }

  export interface MapViewProps extends ViewProps {
    provider?: any;
    region?: Region;
    initialRegion?: Region;
    camera?: Camera;
    initialCamera?: Camera;
    style?: any;
    // Permit any additional props from the native library without failing type-check
    [key: string]: any;
  }

  export default class MapView extends React.Component<MapViewProps> {}

  export class Marker extends React.Component<any> {}
  export class Callout extends React.Component<any> {}
  export class Polygon extends React.Component<any> {}
  export class Polyline extends React.Component<any> {}
  export class Circle extends React.Component<any> {}
  export class Heatmap extends React.Component<any> {}
  export class Overlay extends React.Component<any> {}
  export class UrlTile extends React.Component<any> {}
  export class WMSTile extends React.Component<any> {}
  export class LocalTile extends React.Component<any> {}

  export class AnimatedRegion {}

  export const PROVIDER_GOOGLE: any;
  export const PROVIDER_DEFAULT: any;
  export const PROVIDER_OSMDROID: any;

  export const Geojson: React.ComponentType<any>;
}
