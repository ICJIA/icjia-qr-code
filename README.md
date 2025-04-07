# QR Code Generator

A simple web app that generates QR codes from URLs using javascript.

## Site

https://qr.icjia.cloud

## Features

- Generate QR codes from any valid URL
- Smart URL validation and encoding with user confirmation
- Multiple download formats (PNG, JPG, WEBP, SVG)
- Copy QR codes directly to clipboard
- Light/Dark theme support with persistent preferences
- Responsive design that works on mobile and desktop
- Comprehensive error handling and user feedback
- Detailed console logging for debugging
- Toast notifications for user feedback
- Accessibility features (ARIA labels, keyboard navigation)
- High contrast mode support
- Reduced motion support

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

## Installation

### Requirements

- Node.js version 20.x or higher
- Modern web browser with JavaScript enabled

### Local Installation

1. Clone this repository:

```bash
git clone https://github.com/icjia/icjia-qr-code.git
cd icjia-qr-code
```

2. Open `index.html` in your web browser:

   - Double click the file
   - Or serve it using a local server:

     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js's http-server (needs to be installed globally)
     npm install -g http-server
     http-server
     ```

### Server Installation

1. Upload the contents to your web server:

   - Upload all files to your desired directory
   - No build process required
   - No database required

2. Access the application through your web browser:
   ```
   https://your-domain.com/path-to-app/index.html
   ```

## Development

### Console Logging

The application includes comprehensive console logging for debugging purposes. All major events and operations are logged to the console with appropriate emoji indicators:

- 🚀 App initialization
- 🔍 URL validation
- 🎨 QR code generation
- 📋 Clipboard operations
- 💾 Download operations
- ❌ Errors and warnings
- ✅ Success messages

### Error Handling

The application includes robust error handling for:

- Invalid URLs
- Missing browser features
- QR code generation failures
- Clipboard operation failures
- Download failures
- Unhandled promise rejections
- Global errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
