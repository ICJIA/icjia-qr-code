# QR Code Generator

A modern, accessible QR code generator application built with vanilla JavaScript and Vite.

## Site

https://qr.icjia.cloud

## Features

- Generate QR codes from URLs
- Dark/Light theme support
- Multiple download formats (PNG, JPG, WEBP, SVG)
- Copy to clipboard functionality
- URL validation and encoding
- Responsive design

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

## Technical Details

### Build Process

The application uses Vite as its build tool, providing:

- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds
- Built-in support for TypeScript, JSX, CSS modules
- Legacy browser support through @vitejs/plugin-legacy

### Module System

- Uses ES6 modules (ESM) for better tree-shaking and module resolution
- Dynamic imports for code-splitting
- Native ES6 module syntax (`import`/`export`)
- Full support for modern JavaScript features

### Babel Configuration

The project uses Babel for:

- ES6+ feature transpilation
- Module transformation for testing environment
- Support for Jest with ES modules
- Custom configuration for test files

Babel presets and plugins:

```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-modules-commonjs"]
}
```

### Testing Environment

- Jest for unit testing
- ES module support in tests
- Automated test running with watch mode
- Coverage reporting
- Custom test runner configuration for ES modules

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/icjia-qr-code.git
   cd icjia-qr-code
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Development

To start the development server:

```bash
yarn dev
```

This will start the Vite development server at http://localhost:3000.

## Building for Production

To build the application for production:

```bash
yarn build
```

The built files will be in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
yarn preview
```

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Browser Support

The application supports all modern browsers. Legacy browser support is provided through the `@vitejs/plugin-legacy` plugin.

## Recent Updates

- Enhanced URL validation and encoding with user confirmation
- Added multiple download format options (PNG, JPG, WEBP, SVG)
- Improved error handling and user feedback
- Added comprehensive console logging
- Improved accessibility features
- Added support for high contrast mode
- Added support for reduced motion preferences
- Improved toast notification system
- Added automatic app state reset when entering new URLs

## What is a QR Code?

A QR (Quick Response) code is a two-dimensional barcode that can store data such as website URLs, plain text, and other information. When scanned, it provides quick access to the encoded information. QR codes consist of black squares arranged in a square pattern on a white background.

### How QR Codes Work

QR codes are a kind of two-dimensional barcode. QR codes use a specific encoding process to convert data into visual patterns:

1. **Data Analysis**

   - Input data is analyzed and converted to binary
   - Data is classified into one of four modes: numeric, alphanumeric, byte/binary, or kanji
   - Most efficient encoding mode is selected automatically

2. **Error Correction**

   - Reed-Solomon error correction codes are added
   - Four levels available: L (7%), M (15%), Q (25%), H (30%)
   - Higher correction levels make QR code more dense but more reliable
   - Allows QR codes to be readable even when partially damaged or obscured

3. **Structure Generation**

   - Data is arranged in a specific pattern with function patterns
   - Includes position detection patterns (three large squares in corners)
   - Alignment and timing patterns help scanners read code at any angle
   - Version information and format data are embedded

4. **Module Placement**
   - Data is converted into black and white modules
   - Follows specific placement rules to ensure optimal scanning
   - Includes quiet zone (margin) around the code
   - Uses masking patterns to ensure optimal black/white balance

For detailed technical specifications and deeper understanding:

- [ISO/IEC 18004:2015 Standard](https://www.iso.org/standard/62021.html) - Official QR code specification
- [Thonky QR Code Tutorial](https://www.thonky.com/qr-code-tutorial/) - Comprehensive technical explanation
- [QR Code Generator Library](https://github.com/kazuhikoarase/qrcode-generator) - Reference implementation
- [Reed-Solomon Error Correction](https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders) - Mathematical foundation

### Scanning QR Codes

#### iPhone Users

- Open the Camera app
- Point your camera at the QR code
- Tap the notification banner that appears to open the link
- No additional app required for iOS 11 and later

#### Android Users

- Recent Android phones: Use the built-in Camera app
- Google Lens: Available through Google Assistant or as standalone app
- Alternative: Install a QR code scanner from the Play Store

#### Other Devices

- Most tablet cameras support QR code scanning
- Desktop/laptop users can use webcams with browser-based QR readers
- Many banking and payment apps include built-in QR scanners

### Best Practices for QR Codes

1. **Testing**: Always test your QR code with multiple devices before sharing
2. **Size**: Ensure the QR code is large enough to scan (minimum 2x2 cm / 0.8x0.8 inches)
3. **Contrast**: Maintain high contrast between dark and light elements
4. **Quiet Zone**: Leave white space around the QR code for better scanning

## URL Validation and Testing

The application includes comprehensive URL validation and testing to ensure QR codes are only generated for valid, well-formed URLs. This is crucial because QR codes often appear in printed materials, signage, or other physical media where invalid URLs cannot be easily corrected after publication.

### Validation Features

- Protocol validation (only HTTP/HTTPS allowed)
- Strict TLD validation (.com, .org, .net, .edu, .gov)
- Special character handling and URL encoding
- Domain format verification
- Whitespace and malformed URL detection
- Double trailing slash detection and correction
- Multiple consecutive slash normalization

### Automated Testing

The test suite (`test/url-validation.test.js`) includes 37 automated tests across multiple categories:

1. **URL Validation Tests (30 cases)**

   - 15 valid URL tests with random generation
   - 15 invalid URL tests with various error cases
   - Tests for protocols, TLDs, paths, and query parameters

2. **URL Encoding Tests (4 cases)**

   - Double trailing slash handling
   - URL with spaces
   - URL with special characters (non-ASCII)
   - Multiple consecutive slashes

3. **Double Trailing Slash Tests (3 cases)**
   - Basic double trailing slash
   - Path with double trailing slash
   - Query parameters with double trailing slash

### Test Coverage

The test suite covers:

- Protocol validation (http://, https://, ftp://)
- TLD validation (.com, .org, .net, .edu, .gov)
- Path components and normalization
- Query parameter handling
- Special character encoding
- Common malformed patterns
- Unicode character handling
- URL normalization rules

### Running Tests

```bash
yarn test           # Run tests once
yarn test:watch    # Run tests in watch mode
```

The test output provides:

- Detailed pass/fail status for each test case
- Success rate percentage
- Visual indicators (✅/❌) for quick status assessment
- Comprehensive test summaries by category

### Why Testing Matters

QR codes are often used in:

- Printed marketing materials
- Business cards
- Physical signage
- Product packaging
- Educational materials

Invalid URLs in these contexts can lead to:

- Poor user experience
- Lost business opportunities
- Wasted print materials
- Damaged brand reputation
- Unnecessary reprinting costs

Our comprehensive test suite ensures that generated QR codes will reliably direct users to their intended destinations, protecting both the creator and end-user from common URL-related issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
