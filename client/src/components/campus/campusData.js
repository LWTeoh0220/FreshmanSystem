// Image-based Map Collision Data
// All coordinates are percentages (0.0 to 100.0) relative to the image size.
// This allows the collision map to scale perfectly regardless of the image's actual resolution.

export const MAP_DATA = {
  imageUrl: '/campus_map.png',
  startX: 50, // Initial player X position (percentage)
  startY: 32, // Initial player Y position (percentage)
};

export const COLLISION_BOXES = [
  // Borders (Restored)
  { x: 0, y: 0, w: 5, h: 100, name: 'Left Border' },
  { x: 0, y: 0, w: 100, h: 5, name: 'Top Border' },
  { x: 95, y: 0, w: 5, h: 100, name: 'Right Border' },
  { x: 0, y: 95, w: 100, h: 5, name: 'Bottom Edge' },

  {
    "x": 9.33,
    "y": 6.82,
    "w": 13.52,
    "h": 9.71,
    "name": "Custom Wall"
  },
  {
    "x": 9.21,
    "y": 18.15,
    "w": 13.6,
    "h": 9.52,
    "name": "Custom Wall"
  },
  {
    "x": 9.29,
    "y": 16.46,
    "w": 1.15,
    "h": 1.5,
    "name": "Custom Wall"
  },
  {
    "x": 24.87,
    "y": 6.94,
    "w": 15.03,
    "h": 9.83,
    "name": "Custom Wall"
  },
  {
    "x": 24.91,
    "y": 16.65,
    "w": 14.12,
    "h": 10.02,
    "name": "Custom Wall"
  },
  {
    "x": 40.99,
    "y": 7.19,
    "w": 10.11,
    "h": 9.21,
    "name": "Custom Wall"
  },
  {
    "x": 40.99,
    "y": 16.34,
    "w": 14.28,
    "h": 9.33,
    "name": "Custom Wall"
  },
  {
    "x": 56.39,
    "y": 16.53,
    "w": 14.2,
    "h": 9.52,
    "name": "Custom Wall"
  },
  {
    "x": 55.12,
    "y": 16.46,
    "w": 1.67,
    "h": 9.52,
    "name": "Custom Wall"
  },
  {
    "x": 77.14,
    "y": 19.41,
    "w": 13.8,
    "h": 15.97,
    "name": "Custom Wall"
  },
  {
    "x": 76.21,
    "y": 40.52,
    "w": 15.9,
    "h": 49.14,
    "name": "Custom Wall"
  },
  {
    "x": 60.14,
    "y": 35.01,
    "w": 8.61,
    "h": 9.33,
    "name": "Custom Wall"
  },
  {
    "x": 65.97,
    "y": 44.22,
    "w": 2.78,
    "h": 3.01,
    "name": "Custom Wall"
  },
  {
    "x": 42.74,
    "y": 34.99,
    "w": 14.55,
    "h": 7.64,
    "name": "Custom Wall"
  },
  {
    "x": 26.36,
    "y": 34.93,
    "w": 13.09,
    "h": 7.89,
    "name": "Custom Wall"
  },
  {
    "x": 26.36,
    "y": 42.76,
    "w": 2.86,
    "h": 4.26,
    "name": "Custom Wall"
  },
  {
    "x": 9.37,
    "y": 36.3,
    "w": 13.64,
    "h": 11.4,
    "name": "Custom Wall"
  },
  {
    "x": 9.38,
    "y": 53.03,
    "w": 14.04,
    "h": 10.9,
    "name": "Custom Wall"
  },
  {
    "x": 9.82,
    "y": 71.06,
    "w": 13.76,
    "h": 12.46,
    "name": "Custom Wall"
  },
  {
    "x": 23.58,
    "y": 74,
    "w": 8.84,
    "h": 9.33,
    "name": "Custom Wall"
  },
  {
    "x": 37.14,
    "y": 60.91,
    "w": 16.85,
    "h": 10.58,
    "name": "Custom Wall"
  },
  {
    "x": 54.03,
    "y": 59.85,
    "w": 13.84,
    "h": 11.65,
    "name": "Custom Wall"
  },
  {
    "x": 57.2,
    "y": 71.5,
    "w": 12.38,
    "h": 13.78,
    "name": "Custom Wall"
  },
  {
    "x": 57.21,
    "y": 85.15,
    "w": 7.73,
    "h": 8.14,
    "name": "Custom Wall"
  },
  {
    "x": 35.77,
    "y": 76.87,
    "w": 18.04,
    "h": 12.71,
    "name": "Custom Wall"
  },
  {
    "x": 44.25,
    "y": 47.87,
    "w": 4.01,
    "h": 6.64,
    "name": "Custom Wall"
  },
  {
    "x": 25.91,
    "y": 67.16,
    "w": 3.81,
    "h": 5.45,
    "name": "Custom Wall"
  },
  {
    "x": 25.91,
    "y": 51.57,
    "w": 3.61,
    "h": 13.65,
    "name": "Custom Wall"
  },
  {
    "x": 92.99,
    "y": 22.46,
    "w": 5.67,
    "h": 3.01,
    "name": "Custom Wall"
  },
  {
    "x": 93.31,
    "y": 25.34,
    "w": 6.58,
    "h": 3.26,
    "name": "Custom Wall"
  },
  {
    "x": 93.82,
    "y": 28.79,
    "w": 6.07,
    "h": 3.07,
    "name": "Custom Wall"
  },
  {
    "x": 94.02,
    "y": 31.67,
    "w": 5.87,
    "h": 3.19,
    "name": "Custom Wall"
  },
  {
    "x": 94.18,
    "y": 34.86,
    "w": 5.71,
    "h": 2,
    "name": "Custom Wall"
  },
  {
    "x": 94.38,
    "y": 36.93,
    "w": 1.9,
    "h": 0.56,
    "name": "Custom Wall"
  },
  {
    "x": 96.4,
    "y": 36.64,
    "w": 3.37,
    "h": 0.81,
    "name": "Custom Wall"
  },
  {
    "x": 51.05,
    "y": 10.95,
    "w": 2.22,
    "h": 5.64,
    "name": "Custom Wall"
  },
  {
    "x": 53.27,
    "y": 12.39,
    "w": 3.69,
    "h": 4.32,
    "name": "Custom Wall"
  },
  {
    "x": 57.07,
    "y": 13.9,
    "w": 5,
    "h": 2.63,
    "name": "Custom Wall"
  },
  {
    "x": 62.11,
    "y": 14.9,
    "w": 3.57,
    "h": 1.69,
    "name": "Custom Wall"
  },
  {
    "x": 5.12,
    "y": 87.97,
    "w": 3.05,
    "h": 8.77,
    "name": "Custom Wall"
  },
  {
    "x": 8.22,
    "y": 89.66,
    "w": 4.64,
    "h": 8.14,
    "name": "Custom Wall"
  }
];

export const QUESTION_SETS = {};
export const TILE_COLORS = {};