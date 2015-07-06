describe('%name%', function() {
  it('should generate a graph', function() {
    browser.get('http://localhost:1234/test/e2e/test_cases/%name%/');
    expect(element(by.css('.chart')).isPresent()).toBe(true);
  });


  
});
