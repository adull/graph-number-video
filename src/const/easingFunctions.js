const easingFunctions = {
  easeInSine: () => [
    { x1: 0.12, y1: 0, x2: 0.39, y2: 0 }
  ],
  easeOutSine: () => [
    { x1: 0.61, y1: 1, x2: 0.88, y2: 1 }
  ],
  easeInOutSine: () => [
    { x1: 0.37, y1: 0, x2: 0.63, y2: 1 }
  ],
  easeInQuad: () => [
    { x1: 0.11, y1: 0, x2: 0.5, y2: 1 }
  ],
  easeOutQuad: () => [
    { x1: 0.5, y1: 1, x2: 0.89, y2: 1 }
  ],
  easeInOutQuad: () => [
    { x1: 0.45, y1: 0, x2: 0.55, y2: 1 }
  ],
  easeCustomBounce: () => [
    { x1: 0.25, y1: 0.1, x2: 0.5, y2: 0.5 },
    { x1: 0.7, y1: 0.2, x2: 1.0, y2: 1.0 }
  ]
};

export { easingFunctions }