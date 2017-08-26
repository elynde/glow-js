var GlowUtils = require('../GlowUtils');

test('format duration', () => {
  expect(GlowUtils.durationToText(1,0)).toBe('1 hour');
  expect(GlowUtils.durationToText(2,0)).toBe('2 hours');
  expect(GlowUtils.durationToText(1,1)).toBe('1 hour and 1 minute');
  expect(GlowUtils.durationToText(1,2)).toBe('1 hour and 2 minutes');
  expect(GlowUtils.durationToText(2,1)).toBe('2 hours and 1 minute');
  expect(GlowUtils.durationToText(2,2)).toBe('2 hours and 2 minutes');
});
