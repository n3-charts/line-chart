      computeLegendLayout: (svg, series, dimensions) ->
        padding = 10
        that = this
        bbox = (t) -> that.getTextBBox(t).width

        fn = (s) -> s.label || s.y

        leftLayout = [0]
        leftItems = svg.selectAll('.legendItem.y')[0]

        i = 1
        while i < leftItems.length
          leftLayout.push bbox(leftItems[i-1]) + leftLayout[i - 1] + padding
          i++


        rightItems = svg.selectAll('.legendItem.y2')[0]
        return [leftLayout] unless rightItems.length > 0

        w = dimensions.width - dimensions.right - dimensions.left

        rightLayout = [w - bbox(rightItems[rightItems.length - 1])]

        j = rightItems.length - 2
        while j >= 0
          rightLayout.push w - bbox(rightItems[j]) - (w - rightLayout[rightLayout.length - 1]) - padding
          j--

        rightLayout.reverse()

        return [leftLayout, rightLayout]

      drawLegend: (svg, series, dimensions, handlers) ->
        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16
        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        item = legend.selectAll('.legendItem')
          .data(series)

        items = item.enter().append('g')
            .attr(
              'class': (s, i) -> "legendItem series_#{i} #{s.axis}"
              'opacity': (s, i) ->
                if s.visible is false
                  that.toggleSeries(svg, i)
                  return '0.2'

                return '1'
            )

        item.on('click', (s, i) ->
          isNowVisible = that.toggleSeries(svg, i)

          d3.select(this).attr('opacity', if isNowVisible then '1' else '0.2')
          handlers.onSeriesVisibilityChange?({series: s, index: i, newVisibility: isNowVisible})
        )

        item.append('circle')
          .attr(
            'fill': (s) -> s.color
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': d/2
          )

        item.append('path')
          .attr(
            'clip-path': 'url(#legend-clip)'
            'fill-opacity': (s) -> if s.type in ['area', 'column'] then '1' else '0'
            'fill': 'white'
            'stroke': 'white'
            'stroke-width': '2px'
            'd': (s) -> that.getLegendItemPath(s, d, d)
          )

        item.append('circle')
          .attr(
            'fill-opacity': 0
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': d/2
          )


        item.append('text')
          .attr(
            'class': (d, i) -> "legendText series_#{i}"
            'font-family': 'Courier'
            'font-size': 10
            'transform': 'translate(13, 4)'
            'text-rendering': 'geometric-precision'
          )
          .text (s) -> s.label || s.y


        [left, right] = this.computeLegendLayout(svg, series, dimensions)
        items.attr(
          'transform': (s, i) ->
            if s.axis is 'y'
              return "translate(#{left.shift()},#{dimensions.height-40})"
            else
              return "translate(#{right.shift()},#{dimensions.height-40})"
        )

        return this

      getLegendItemPath: (series, w, h) ->
        if series.type is 'column'
          path = 'M' + (-w/3) + ' ' + (-h/8) + ' l0 ' + h + ' '
          path += 'M0' + ' ' + (-h/3) + ' l0 ' + h + ' '
          path += 'M' + w/3 + ' ' + (-h/10) + ' l0 ' + h + ' '

          return path

        base_path = 'M-' + w/2 + ' 0' + h/3 + ' l' + w/3 + ' -' + h/3 + ' l' + w/3 + ' ' +  h/3 + ' l' + w/3 + ' -' + 2*h/3

        base_path + ' l0 ' + h + ' l-' + w + ' 0z' if series.type is 'area'

        return base_path

      toggleSeries: (svg, index) ->
        isVisible = false

        svg.select('.content').selectAll('.series_' + index)
          .style('display', (s) ->
            if d3.select(this).style('display') is 'none'
              isVisible = true
              return 'initial'
            else
              isVisible = false
              return 'none'
          )

        return isVisible
