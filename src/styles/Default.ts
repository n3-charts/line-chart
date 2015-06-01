module n3Charts.Style {
  'use strict';

  export class Default {

    static font: string = '10px Courier';
    static color: string = '#333';
    static backgroundColor: string = 'none';

    static template = {
      '.': {
        'color': Default.color,
        'background-color': Default.backgroundColor
      },
      '.axis':
      {
        'font': Default.font,
        'shape-rendering': 'crispEdges'
      },
      '.axis > path':
      {
        'fill': 'none',
        'stroke': Default.color
      },
      '.axis > .tick > text': {
        'fill': Default.color
      }
    };
  }
}
