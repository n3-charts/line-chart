      showScrubber: (svg, glass, axes, data, options, columnWidth) ->
        that = this
        glass.on('mousemove', ->
          svg.selectAll('.glass-container').attr('opacity', 1)
          that.updateScrubber(svg, d3.mouse(this), axes, data, options, columnWidth)
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

      updateScrubber: (svg, [x, y], axes, data, options, columnWidth) ->
        ease = (element) -> element.transition().duration(50)
        that = this
        positions = []

        data.forEach (series, index) ->
          item = svg.select(".scrubberItem.series_#{index}")

          if options.series[index].visible is false
            item.attr('opacity', 0)
            return

          item.attr('opacity', 1)

          v = that.getClosestPoint(series.values, axes.xScale.invert(x))

          text = v.x + ' : ' + v.y
          if options.tooltip.formatter
            text = options.tooltip.formatter(v.x, v.y, options.series[index])

          right = item.select('.rightTT')
          rText = right.select('text')
          rText.text(text)

          left = item.select('.leftTT')
          lText = left.select('text')
          lText.text(text)

          sizes =
            right: that.getTextBBox(rText[0][0]).width + 5
            left: that.getTextBBox(lText[0][0]).width + 5

          side = if series.axis is 'y2' then 'right' else 'left'

          x = axes.xScale(v.x)
          if side is 'left'
            side = 'right' if x + that.getTextBBox(lText[0][0]).x - 10 < 0
          else if side is 'right'
            side = 'left' if x + sizes.right > that.getTextBBox(svg.select('.glass')[0][0]).width

          if side is 'left'
            ease(right).attr('opacity', 0)
            ease(left).attr('opacity', 1)
          else
            ease(right).attr('opacity', 1)
            ease(left).attr('opacity', 0)

          positions[index] = {index, x: x, y: axes[v.axis + 'Scale'](v.y + v.y0), side, sizes}

        positions = this.preventOverlapping(positions)

        tickLength = Math.max(15, 100/columnWidth)

        data.forEach (series, index) ->
          if options.series[index].visible is false
            return

          p = positions[index]
          item = svg.select(".scrubberItem.series_#{index}")

          tt = item.select(".#{p.side}TT")

          xOffset = (if p.side is 'left' then series.xOffset else (-series.xOffset))

          tt.select('text')
            .attr('transform', ->
              if p.side is 'left'
                return "translate(#{-3 - tickLength - xOffset}, #{p.labelOffset+3})"
              else
                return "translate(#{4 + tickLength + xOffset}, #{p.labelOffset+3})"
            )

          tt.select('path')
            .attr(
              'd',
              that.getScrubberPath(
                p.sizes[p.side] + 1,
                p.labelOffset,
                p.side,
                tickLength + xOffset
              )
            )

          ease(item).attr(
            'transform': """
              translate(#{positions[index].x + series.xOffset}, #{positions[index].y})
            """
          )


      getScrubberPath: (w, yOffset, side, padding) ->
        h = 18
        p = padding
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
              neighbours = neighbours.sort (a, b) -> a.y - b.y
              if n%2 is 0
                start = -(step/2)*(n/2)
              else
                start = -(n-1)/2*step

              neighbours.forEach (neighbour, i) -> neighbour.labelOffset = start + step*i
          return


        offset(getNeighbours('left'))
        offset(getNeighbours('right'))

        return positions
