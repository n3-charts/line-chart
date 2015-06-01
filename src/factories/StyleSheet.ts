module n3Charts.Factory {
  'use strict';

  export class StyleSheet extends Utils.BaseFactory {

    private style = Style.Default.template;

    update(datasets, options, attributes: ng.IAttributes) {
      // Get the svg root node
      var container: Factory.Container = this.factoryMgr.get('container');

      this.updateStyle(container.svg, this.style);
    }

    destroy() {
      // Get the svg root node
      var container: Factory.Container = this.factoryMgr.get('container');

      this.destroyStyle(container.svg, this.style);
    }

    updateStyle(selection: D3.Selection, style) {
      // Update the style
      for (var selector in style) {
        if (selector === '.') {
          selection.style(style[selector]);
        } else if (style.hasOwnProperty(selector)) {
          selection.selectAll(selector)
            .style(style[selector]);
        }
      }
    }

    destroyStyle(selection: D3.Selection, style) {
      var key: string = undefined;
      // Remove the style
      for (var selector in style) {
        if (selector === '.') {
          for (key in style[selector]) {
            if (style[selector].hasOwnProperty(key)) {
              selection.style(key, '');
            }
          }
        } else if (style.hasOwnProperty(selector)) {
          for (key in style[selector]) {
            if (style[selector].hasOwnProperty(key)) {
              selection.selectAll(selector)
                .style(key, '');
            }
          }
        }
      }
    }
  }
}
