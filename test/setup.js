// Set timezone to UTC for consistent test results
process.env.TZ = "UTC";

// Store original Date implementation
const RealDate = Date;
const mockDate = new RealDate("2024-02-20T12:00:00Z");

// Override Date constructor
global.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      return new RealDate(mockDate);
    }
    return new RealDate(...args);
  }

  static now() {
    return mockDate.getTime();
  }
};
