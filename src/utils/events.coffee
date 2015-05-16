      getEventDispatcher: () ->
        
        events = [
          'focus',
          'hover',
          'click'
        ]

        return d3.dispatch.apply(this, events)