# Receipt Management Workflow

A complete system for capturing, organizing, and tracking receipts using Apple Shortcuts + Google Sheets.

## How It Works

1. **Share a receipt** (photo, screenshot, PDF) via the iOS/macOS share sheet
2. **Apple Shortcut** prompts you for vendor, amount, and category, then saves the file to an iCloud Drive folder organized by year/month
3. **Google Apps Script** (optional) watches a Google Drive folder and auto-logs receipts to a Google Sheet
4. **Python script** (optional) processes receipt images locally with OCR

## Folder Structure

```
Receipts/
├── 2026/
│   ├── 01-January/
│   ├── 02-February/
│   └── ...
```

## Components

| File | Purpose |
|------|---------|
| [`docs/apple-shortcut-setup.md`](docs/apple-shortcut-setup.md) | Step-by-step guide to build the Apple Shortcut |
| [`google-apps-script/ReceiptProcessor.js`](google-apps-script/ReceiptProcessor.js) | Google Apps Script for auto-processing |
| [`python/receipt_processor.py`](python/receipt_processor.py) | Local Python OCR + Excel logging |
| [`python/requirements.txt`](python/requirements.txt) | Python dependencies |

## Spreadsheet Columns

| Date | Vendor | Amount | Category | Payment Method | File Name | Notes |
|------|--------|--------|----------|----------------|-----------|-------|
