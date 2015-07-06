describe('%name%', function() {
  beforeEach(function() {
    browser.get('http://localhost:1234/test/e2e/test_cases/%name%/');
  });

  it('should generate a graph', function() {
    expect(element(by.css('.chart')).isPresent()).toBe(true);
  });



});
