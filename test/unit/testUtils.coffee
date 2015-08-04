utils = angular.module 'testUtils', []

# Late friday, no better idea for a name
utils.factory 'pepito', ($compile, $rootScope, fakeMouse) ->
  return {
    directive: (html, preDigestHook) ->
      elm = angular.element(html)

      outerScope = $rootScope
      $compile(elm)(outerScope)

      innerScope = elm.isolateScope()

      e = this.wrap(elm[0])
      preDigestHook?(e)
      outerScope.$digest()

      return {
        outerScope: outerScope
        innerScope: innerScope
        element: e
      }

    wrap: (_domElement) ->
      _aElement = angular.element(_domElement)
      that = this
      return {
        domElement: _domElement
        aElement: _aElement

        click: -> fakeMouse.clickOn(_domElement)
        clickAndBubbleUp: -> fakeMouse.clickOn(_domElement, true)


        child: (tagName) ->
          elements = _aElement.find(tagName)

          if elements.length is 0
            throw new Error "No element found with tag #{tagName}"
          else if elements.length > 1
            throw new Error "More than one element found with tag name #{tagName}"

          return that.wrap(elements[0])

        children: (tagName) ->
          if tagName
            return (that.wrap(e) for e in _aElement.find(tagName))
          else
            return (that.wrap(e) for e in _aElement.children())

        childrenByClass: (c) ->
          elements = _domElement.getElementsByClassName(c)
          return (that.wrap(e) for e in elements)

        childByClass: (c) ->
          e = _domElement.getElementsByClassName(c)
          if e.length is 0
            throw new Error "Element with class name #{c} not found"
          else if e.length > 1
            throw new Error "More than one element found with class name #{c}"

          return that.wrap(e[0])
        isHidden: -> _aElement.hasClass('ng-hide')
        isVisible: -> _aElement.hasClass('ng-hide') is false
        hasClass: (c) -> _aElement.hasClass(c)
        innerHTML: -> _domElement.innerHTML
        value: -> _domElement.value
        getStyle: (attr) ->
          return _domElement.getAttribute('style') unless attr
          return _domElement.style[attr]
        getAttribute: (key) -> _domElement.getAttribute(key)
      }
  }

utils.factory 'fakeWindow', ($window) ->

  e = document.createEvent('UIEvent')

  return {
    # We could add cool stuff here, e.g resize
    # to a dimension 800x400
    resize: () ->
      e.initEvent 'resize', true, false
      $window.dispatchEvent e
  }

utils.factory 'fakeMouse', ->
  defaults =
    alt : false
    bubbles : true
    button : 0
    cancelable : true
    clientX : 0
    clientY : 0
    ctrl : false
    detail : 1
    key : 0
    meta : false
    relatedTarget : null
    screenX : 0
    screenY : 0
    shift : false
    view : window

  eventPath = (element) ->
    path = [element]
    tmp = element
    while tmp.parentNode
      tmp = tmp.parentNode
      path.push(tmp)

    # Prevents non-attached elements from firing "global" events
    path.push(window) if tmp is document

    return path

  bubbleUp = (element, type, args) ->
    element = element.domElement || element
    dispatch(elm, type, args) for elm in eventPath(element)

  # Dispatch a WheelEvent on the HtmlNode element
  wheel = (element, deltaX, deltaY) ->
    deltaX = deltaX || 0.0
    deltaY = deltaY || 0.0
    args = {deltaX: deltaX, deltaY: deltaY, deltaMode: WheelEvent.DOM_DELTA_PIXEL}
    type = 'wheel'
    event = new WheelEvent(type, angular.extend(defaults, args))

    element.dispatchEvent(event)
    return event

  # Dispatch a MouseEvent of type type on the HtmlNode element
  dispatch = (element, type, args) ->
    element = element.domElement || element
    args = args || {}
    event = new MouseEvent(type, angular.extend(defaults, args))

    element.dispatchEvent(event)
    return event

  return {
    clickOn: (element, bubbles) ->
      if bubbles
        bubbleUp(element, 'click')
      else
        dispatch(element, 'click')

    hoverIn: (element) -> bubbleUp(element, 'mouseover')
    hoverOut: (element) -> bubbleUp(element, 'mouseout')
    mouseOver: (element) -> dispatch(element, 'mouseover')
    mouseMove: (element) -> dispatch(element, 'mousemove')
    wheel: wheel
  }

utils.factory 'focus', ->
  return {
    on: (element) ->
      event = document.createEvent("FocusEvent")
      event.initEvent("focus")
      element.dispatchEvent(event)

    off: (element) ->
      event = document.createEvent("FocusEvent")
      event.initEvent("blur")
      element.dispatchEvent(event)
  }

utils.factory 'fakeKeyboard', ->
  key = (keyCode, target) ->
    target or= document

    eventObj = if document.createEventObject
        document.createEventObject()
      else
        document.createEvent("Events")

    if eventObj.initEvent?
      eventObj.initEvent("keydown", true, true)

    eventObj.keyCode = keyCode

    if target.dispatchEvent?
      target.dispatchEvent(eventObj)
    else
      target.fireEvent("onkeydown", eventObj)

    # return keyboard to allow chaining
    return keyboard

  keyboard = {
    key
    backspace: (target) -> key(8, target)
    enter: (target) -> key(13, target)
    escape: (target) -> key(27, target)
    space: (target) -> key(32, target)
    left: (target) -> key(37, target)
    up: (target) -> key(38, target)
    right: (target) -> key(39, target)
    down: (target) -> key(40, target)
  }
  return keyboard
