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
- Accessibility features

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
