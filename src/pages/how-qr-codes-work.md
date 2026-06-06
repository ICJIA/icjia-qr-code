---
layout: ../layouts/ContentLayout.astro
title: How QR codes work
description: QR codes encode data through data analysis, error correction, structure generation, and module placement.
---

QR codes use a specific encoding process to convert data into a visual pattern of black and white squares, called "modules." It happens in four broad stages.

## 1. Data analysis

- The input data is analyzed and converted to binary.
- It is classified into one of four modes: numeric, alphanumeric, byte/binary, or kanji.
- The most efficient encoding mode is selected automatically.

## 2. Error correction

- Reed&ndash;Solomon error-correction codes are added.
- Four levels are available: L (7%), M (15%), Q (25%), and H (30%).
- Higher levels make the code denser but more resilient &mdash; it can still be read when partially damaged or obscured.

This tool uses **level H (30%)**, the highest level. That is what lets a logo sit in the center without breaking the code.

## 3. Structure generation

- Data is arranged into a pattern alongside fixed function patterns.
- Three large squares in the corners (position-detection patterns) let scanners orient the code.
- Alignment and timing patterns help scanners read the code at any angle.
- Version and format information is embedded.

## 4. Module placement

- Data becomes black and white modules following specific placement rules.
- A quiet zone (margin) surrounds the finished code.
- Masking patterns keep the black/white balance optimal for scanning.

## Learn more

- [ISO/IEC 18004:2015](https://www.iso.org/standard/62021.html) &mdash; the official QR code specification
- [Thonky QR Code Tutorial](https://www.thonky.com/qr-code-tutorial/) &mdash; a thorough technical walkthrough
- [Reed&ndash;Solomon codes for coders](https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders) &mdash; the mathematical foundation
