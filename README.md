# Receipt Management Workflow

Automatically process receipts using **Apple Intelligence** — share a receipt from any app, and it gets read by AI, logged to a spreadsheet, and filed into the correct monthly folder. Zero typing required.

## How It Works

1. Share a receipt (photo, screenshot, PDF) via the **share sheet**
2. Apple Intelligence **extracts the text** from the image (on-device OCR)
3. Apple Intelligence **analyzes the receipt** to pull out vendor, total amount, and category
4. The shortcut **renames the file** (e.g. `2026-06-26_Costco_$45.23.jpg`)
5. **Files it** into `iCloud Drive/Receipts/2026/06-June/`
6. **Adds a row** to your Numbers spreadsheet (or CSV for Excel/Google Sheets)

## Requirements

- iPhone 15 Pro / iPhone 16+ or M-series iPad/Mac
- iOS 18.1+ with Apple Intelligence enabled

## Setup Guide

**[→ Full step-by-step shortcut build instructions](docs/apple-shortcut-setup.md)**

## Folder Structure

```
iCloud Drive/Receipts/
├── Expense Tracker.numbers
├── 2026/
│   ├── 01-January/
│   ├── 02-February/
│   └── 06-June/
│       ├── 2026-06-20_Amazon_$129.99.png
│       └── 2026-06-26_Costco_$45.23.jpg
```

## Spreadsheet Columns

| Date | Vendor | Amount | Description | File Name |
|------|--------|--------|-------------|-----------|

## Optional: Server-Side Processing

For additional automation beyond the Apple Shortcut:

| File | Purpose |
|------|---------|
| [`google-apps-script/ReceiptProcessor.js`](google-apps-script/ReceiptProcessor.js) | Google Drive + Sheets auto-processing with OCR |
| [`python/receipt_processor.py`](python/receipt_processor.py) | Local Python OCR + Excel logging |
