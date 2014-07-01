      getTooltipHandlers: (options) ->
        if options.tooltip.mode is 'scrubber'
          return {
            onChartHover: angular.bind(this, this.showScrubber)
          }
        else
          return {
            onMouseOver: angular.bind(this, this.onMouseOver)
            onMouseOut: angular.bind(this, this.onMouseOut)
          }

      showScrubber: (svg, glass, axes, data, options) ->
        that = this
        glass.on('mousemove', ->
          svg.selectAll('.glass-container').attr('opacity', 1)
          that.updateScrubber(svg, d3.mouse(this), axes, data, options)
        )
        glass.on('mouseout', ->
          glass.on('mousemove', null)
          svg.selectAll('.glass-container').attr('opacity', 0)
        )

      getClosestPoint: (values, value) ->
        # Dichotomy FTW
        left = 0
        right = values.length - 1

        i = Math.round((right - left)/2)
        while true
          if value < values[i].x
            right = i
            i = i - Math.ceil((right-left)/2)
          else
            left = i
            i = i + Math.floor((right-left)/2)

          if i in [left, right]
            if Math.abs(value - values[left].x) < Math.abs(value - values[right].x)
              i = left
            else
              i = right
            break

        return values[i]

      updateScrubber: (svg, [x, y], axes, data, options) ->
        ease = (element) -> element.transition().duration(50)
        that = this
        positions = []
        data.forEach (series, index) ->
          v = that.getClosestPoint(series.values, axes.xScale.invert(x))

          item = svg.select(".scrubberItem.series_#{index}")

          right = item.select('.rightTT')
          rText = right.select('text')
          rText.text(v.x + ' : ' + v.value)

          left = item.select('.leftTT')
          lText = left.select('text')
          lText.text(v.x + ' : ' + v.value)

          sizes =
            right: that.getTextBBox(rText[0][0]).width + 5
            left: that.getTextBBox(lText[0][0]).width + 5

          side = if series.axis is 'y2' then 'right' else 'left'

          x = axes.xScale(v.x)
          if side is 'left'
            if x + that.getTextBBox(lText[0][0]).x < 0
              side = 'right'
          else if side is 'right'
            if x + sizes.right > svg.select('.glass')[0][0].getBBox().width
              side = 'left'

          if side is 'left'
            ease(right).attr('opacity', 0)
            ease(left).attr('opacity', 1)
          else
            ease(right).attr('opacity', 1)
            ease(left).attr('opacity', 0)

          positions.push({index, x, y: axes[v.axis + 'Scale'](v.value), side, sizes})

        positions = this.preventOverlapping(positions)

        data.forEach (series, index) ->
          p = positions[index]
          item = svg.select(".scrubberItem.series_#{index}")

          tt = item.select(".#{p.side}TT")

          tt.select('text')
            .attr('transform', ->
              if p.side is 'left'
                return "translate(-13, #{p.labelOffset+3})"
              else
                return "translate(14, #{p.labelOffset+3})"
            )

          tt.select('path')
            .attr('d', that.getScrubberPath(p.sizes[p.side] + 1, p.labelOffset, p.side))
          ease(item).attr('transform': "translate(#{positions[index].x}, #{positions[index].y})")


      getScrubberPath: (w, yOffset, side) ->
        h = 18
        p = 10
        w = w
        xdir = if side is 'left' then 1 else -1

        ydir = 1
        if yOffset isnt 0
          ydir = Math.abs(yOffset)/yOffset

        yOffset or= 0

        return [
          "m0 0"

          "l#{xdir} 0"
          "l0 #{yOffset + ydir}"
          "l#{-xdir*(p + 1)} 0"

          "l0 #{-h/2 - ydir}"
          "l#{-xdir*w} 0"
          "l0 #{h}"
          "l#{xdir*w} 0"
          "l0 #{-h/2 - ydir}"

          "l#{xdir*(p - 1)} 0"
          "l0 #{-yOffset + ydir}"
          "l1 0"

          "z"
        ].join('')


      preventOverlapping: (positions) ->
        h = 18

        abscissas = {}
        positions.forEach (p) ->
          abscissas[p.x] or= {left: [], right: []}
          abscissas[p.x][p.side].push(p)

        getNeighbours = (side) ->
          neighbours = []
          for x, sides of abscissas
            if sides[side].length is 0
              continue

            neighboursForX = {}
            while sides[side].length > 0
              p = sides[side].pop()
              foundNeighbour = false
              for y, neighbourhood of neighboursForX
                if +y - h <= p.y <= +y + h
                  neighbourhood.push(p)
                  foundNeighbour = true

              neighboursForX[p.y] = [p] unless foundNeighbour

            neighbours.push(neighboursForX)
          return neighbours

        offset = (neighboursForAbscissas) ->
          step = 20
          for abs, xNeighbours of neighboursForAbscissas
            for y, neighbours of xNeighbours
              n = neighbours.length
              if n is 1
                neighbours[0].labelOffset = 0
                continue

              if n%2 is 0
                start = -(step/2)*(n/2)
              else
                start = -(n-1)/2*step

              neighbours.forEach (neighbour, i) -> neighbour.labelOffset = start + step*i

          return neighboursForAbscissas

        leftNeighbours = offset(getNeighbours('left'))
        rightNeighbours = offset(getNeighbours('right'))

        return positions

      styleTooltip: (d3TextElement) ->
        return d3TextElement.attr({
          'font-family': 'monospace'
          'font-size': 10
          'fill': 'white'
          'text-rendering': 'geometric-precision'
        })

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
            'class': 'xTooltip'
            'opacity': 0
          )

        xTooltip.append('path')
          .attr('transform', "translate(0,#{(height + 1)})")

        this.styleTooltip(xTooltip.append('text')
          .style('text-anchor', 'middle')
          .attr(
            'width': w
            'height': h
            'transform': 'translate(0,' + (height + 19) + ')'
          )
        )

        yTooltip = svg.append('g')
          .attr(
            id: 'yTooltip'
            class: 'yTooltip'
            opacity: 0
          )

        yTooltip.append('path')
        this.styleTooltip(yTooltip.append('text')
          .attr(
            'width': h
            'height': w
          )
        )

        if axesOptions.y2?
          y2Tooltip = svg.append('g')
            .attr(
              'id': 'y2Tooltip'
              'class': 'y2Tooltip'
              'opacity': 0
              'transform': 'translate(' + width + ',0)'
            )

          y2Tooltip.append('path')

          this.styleTooltip(y2Tooltip.append('text')
            .attr(
              'width': h
              'height': w
            )
          )

      onMouseOver: (svg, event) ->
        this.updateXTooltip(svg, event)

        if event.series.axis is 'y2'
          this.updateY2Tooltip(svg, event)
        else
          this.updateYTooltip(svg, event)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, {x, datum, series}) ->
        xTooltip = svg.select("#xTooltip")

        xTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(#{x},0)"
          )

        textX = series.xFormatter?(datum.x) || datum.x

        label = xTooltip.select('text')
        label.text(textX)

        xTooltip.select('path')
          .attr('fill', series.color)
          .attr('d', this.getXTooltipPath(label[0][0]))

      getXTooltipPath: (textElement) ->
        w = Math.max(this.getTextBBox(textElement).width, 15)
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm-' + w/2 + ' ' + p + ' ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + '' + (-h) +
          'l' + (-w/2 + p) + ' 0 ' +
          'l' + (-p) + ' -' + h/4 + ' ' +
          'l' + (-p) + ' ' + h/4 + ' ' +
          'l' + (-w/2 + p) + ' 0z'

      updateYTooltip: (svg, {y, datum, series}) ->
        yTooltip = svg.select("#yTooltip")
        yTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(0, #{y})"
          )

        label = yTooltip.select('text')
        label.text(datum.value)
        w = this.getTextBBox(label[0][0]).width + 5

        label.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        yTooltip.select('path')
          .attr('fill', series.color)
          .attr('d', this.getYTooltipPath(w))

      updateY2Tooltip: (svg, {y, datum, series}) ->
        y2Tooltip = svg.select("#y2Tooltip")
        y2Tooltip.transition()
          .attr('opacity', 1.0)

        label = y2Tooltip.select('text')
        label.text(datum.value)
        w = this.getTextBBox(label[0][0]).width + 5
        label.attr(
          'transform': 'translate(7, ' + (parseFloat(y) + 3) + ')'
          'w': w
        )

        y2Tooltip.select('path')
          .attr(
            'fill': series.color
            'd': this.getY2TooltipPath(w)
            'transform': 'translate(0, ' + y + ')'
          )

      getYTooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + (-p) + ' ' + (-p) + ' ' +
          'l0 ' + (-h/2 + p) + ' ' +
          'l' + (-w) + ' 0 ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + (-h/2 + p) +
          'l' + (-p) + ' ' + p + 'z'

      getY2TooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + p + ' ' + p + ' ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + (-h) + ' ' +
          'l' + (-w) + ' 0 ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + (-p) + ' ' + p + 'z'

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
