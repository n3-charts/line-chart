module n3Charts.Factory {
  'use strict';

  export class StyleSheet extends Utils.BaseFactory {

    update(datasets, options, attributes: ng.IAttributes) {
      // Get the current Style
      var style = Style.Default.template;
      // Get the svg root node
      var container: Factory.Container = this.factoryMgr.get('container');

      // Apply the style
      for (var selector in style) {
        if (selector === '.') {
          container.svg.style(style[selector]);
        } else if (style.hasOwnProperty(selector)) {
          container.svg.selectAll(selector)
            .style(style[selector]);
        }
      }
    }

    destroy() {
      // Get the current Style
      var style = Style.Default.template;
      // Get the svg root node
      var container: Factory.Container = this.factoryMgr.get('container');

      // Remove the style
      for (var selector in style) {
        if (selector === '.') {
          container.svg.style('');
        } else if (style.hasOwnProperty(selector)) {
          container.svg.selectAll(selector)
            .style('');
        }
      }
    }
  }
}
