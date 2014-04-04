      addTooltips: (svg, dimensions, axesOptions) ->
        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        w = 24
        h = 18
        p = 5

        xTooltip = svg.append('g')
          .attr(
            'id': 'xTooltip'
            'opacity': 0
          )

        xTooltip.append('path')
          .attr('transform', "translate(0,#{(height + 1)})")

        xTooltip.append('text')
          .style('text-anchor', 'middle')
          .attr(
            'width': w
            'height': h
            'font-family': 'monospace'
            'font-size': 10
            'transform': 'translate(0,' + (height + 19) + ')'
            'fill': 'white'
            'text-rendering': 'geometric-precision'
          )

        yTooltip = svg.append('g')
          .attr(
            'id': 'yTooltip'
            'opacity': 0
          )

        yTooltip.append('path')
        yTooltip.append('text')
          .attr(
            'width': h
            'height': w
            'font-family': 'monospace'
            'font-size': 10
            'fill': 'white'
            'text-rendering': 'geometric-precision'
          )

        if axesOptions.y2?
          y2Tooltip = svg.append('g')
            .attr(
              'id': 'y2Tooltip'
              'opacity': 0
              'transform': 'translate(' + width + ',0)'
            )

          y2Tooltip.append('path')

          y2Tooltip.append('text')
            .attr(
              'width': h
              'height': w
              'font-family': 'monospace'
              'font-size': 10
              'fill': 'white'
              'text-rendering': 'geometric-precision'
            )

      onMouseOver: (svg, target) ->
        this.updateXTooltip(svg, target)

        if target.series.axis is 'y2'
          this.updateY2Tooltip(svg, target)
        else
          this.updateYTooltip(svg, target)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, target) ->
        xTooltip = svg.select("#xTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(' + target.x + ',0)'
          )

        textX = undefined
        if target.series.xFormatter?
          textX = '' + target.series.xFormatter(target.datum.x)
        else
          textX = '' + target.datum.x

        xTooltip.select('text').text(textX)
        xTooltip.select('path')
          .attr('fill', target.series.color)
          .attr('d', this.getXTooltipPath(textX))

      getXTooltipPath: (text) ->
        w = this.getTextWidth(text)
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm-' + w/2 + ' ' + p + ' ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + '-' + h +
          'l-' + (w/2 - p) + ' 0 ' +
          'l-' + p + ' -' + h/4 + ' ' +
          'l-' + p + ' ' + h/4 + ' ' +
          'l-' + (w/2 - p) + ' 0z'

      updateYTooltip: (svg, target) ->
        yTooltip = svg.select("#yTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(0, ' + target.y + ')'
          )

        textY = '' + target.datum.value
        w = this.getTextWidth(textY)
        yTooltipText = yTooltip.select('text').text(textY)

        yTooltipText.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        yTooltip.select('path')
          .attr('fill', target.series.color)
          .attr('d', this.getYTooltipPath(w))

      getYTooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l-' + p + ' -' + p + ' ' +
          'l0 -' + (h/2 - p) + ' ' +
          'l-' + w + ' 0 ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 -' + (h/2 - p) +
          'l-' + p + ' ' + p + 'z'

      updateY2Tooltip: (svg, target) ->
        y2Tooltip = svg.select("#y2Tooltip")
          .transition()
          .attr('opacity', 1.0)

        textY = '' + target.datum.value
        w = this.getTextWidth(textY)
        y2TooltipText = y2Tooltip.select('text').text(textY)
        y2TooltipText.attr(
          'transform': 'translate(7, ' + (parseFloat(target.y) + 3) + ')'
          'w': w
        )

        y2Tooltip.select('path')
          .attr(
            'fill': target.series.color
            'd': this.getY2TooltipPath(w)
            'transform': 'translate(0, ' + target.y + ')'
          )

      getY2TooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + p + ' ' + p + ' ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + w + ' 0 ' +
          'l0 -' + h + ' ' +
          'l-' + w + ' 0 ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l-' + p + ' ' + p + 'z'

      hideTooltips: (svg) ->
        svg.select("#xTooltip")
          .transition()
          .attr('opacity', 0)

        svg.select("#yTooltip")
          .transition()
          .attr('opacity', 0)

        svg.select("#y2Tooltip")
          .transition()
          .attr('opacity', 0)
