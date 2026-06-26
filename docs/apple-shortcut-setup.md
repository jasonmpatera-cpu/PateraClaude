# Apple Shortcut: Automatic Receipt Processor

An Apple Shortcut that uses **Apple Intelligence** to automatically read a receipt, extract the vendor/amount/category, log it to a spreadsheet, and file it into the correct monthly folder — all from the share sheet with zero manual input.

## Requirements

- iPhone 15 Pro / iPhone 16 or later, or any M-series iPad/Mac
- iOS 18.1+ / macOS 15.1+ with Apple Intelligence enabled
- Settings → Apple Intelligence & Siri → Apple Intelligence: **ON**

## How It Works

1. You share a receipt photo/screenshot/PDF from any app
2. Apple Intelligence extracts all the text from the image
3. Apple Intelligence analyzes the text to pull out vendor, total, and category
4. The shortcut renames the file, saves it to the right monthly folder, and adds a row to your spreadsheet

**No typing required.** The whole thing runs automatically.

---

## Build the Shortcut

Open the **Shortcuts** app → tap **+** to create a new shortcut.

### Step 1: Accept Share Sheet Input

- At the very top, tap where it says **"Receive Any input from"**
- Change input type to: **Images, PDFs, Files**
- This makes the shortcut appear when you tap the share button on any receipt

### Step 2: Extract Text from Receipt (Apple Intelligence OCR)

Add action: **Extract Text from Image**
- Input: **Shortcut Input**
- This uses Apple's on-device Vision framework to OCR the receipt
- Save output as variable: `ReceiptText`

> **Note:** If "Extract Text from Image" doesn't appear, search for **"Extract Text"** in the action search bar. On older iOS versions, this may be called **"Recognize Text in Image"**.

### Step 3: Use Apple Intelligence to Analyze the Receipt

Add action: **Ask Apple Intelligence** (or **"Write with Siri"** / **"Ask ChatGPT"** depending on your iOS version)

- If you have the **ChatGPT integration** enabled in Apple Intelligence settings, use that. Otherwise, use the built-in "Summarize" or "Create Text" action with a custom prompt.

**Method A: Using "Ask ChatGPT" action (recommended)**

Add action: **Ask ChatGPT**
- Prompt:

```
Analyze this receipt text and respond with ONLY these 4 lines, nothing else:
VENDOR: [store/merchant name]
AMOUNT: [total amount as a number like 45.23]
CATEGORY: [one of: Groceries, Dining, Gas, Shopping, Healthcare, Utilities, Travel, Entertainment, Subscriptions, Other]
PAYMENT: [payment method if visible, otherwise Credit Card]

Receipt text:
[ReceiptText]
```

- Save output as variable: `AIResponse`

**Method B: Using "Prompt for Siri" / Apple Intelligence text generation**

If ChatGPT integration isn't available, add:

Add action: **Generate Text** (Apple Intelligence)
- Use the same prompt as above with `ReceiptText` inserted
- Save output as variable: `AIResponse`

### Step 4: Parse the AI Response into Variables

Now extract each field from the AI response using **Match Text** and **Replace Text** actions.

**Extract Vendor:**
Add action: **Match Text**
- Input: `AIResponse`
- Pattern: `VENDOR: (.+)`
- Save output as variable: `VendorMatch`

Add action: **Replace Text**
- Input: `VendorMatch`
- Find: `VENDOR: `
- Replace with: (empty)
- Save output as variable: `Vendor`

**Extract Amount:**
Add action: **Match Text**
- Input: `AIResponse`
- Pattern: `AMOUNT: (.+)`
- Save output as variable: `AmountMatch`

Add action: **Replace Text**
- Input: `AmountMatch`
- Find: `AMOUNT: `
- Replace with: (empty)
- Save output as variable: `Amount`

**Extract Category:**
Add action: **Match Text**
- Input: `AIResponse`
- Pattern: `CATEGORY: (.+)`
- Save output as variable: `CategoryMatch`

Add action: **Replace Text**
- Input: `CategoryMatch`
- Find: `CATEGORY: `
- Replace with: (empty)
- Save output as variable: `Category`

**Extract Payment Method:**
Add action: **Match Text**
- Input: `AIResponse`
- Pattern: `PAYMENT: (.+)`
- Save output as variable: `PaymentMatch`

Add action: **Replace Text**
- Input: `PaymentMatch`
- Find: `PAYMENT: `
- Replace with: (empty)
- Save output as variable: `PaymentMethod`

### Step 5: Set Up Date Variables

Add action: **Get Current Date**

Add action: **Format Date**
- Format: Custom → `yyyy`
- Save output as variable: `Year`

Add action: **Format Date**
- Format: Custom → `MM-MMMM`
- Save output as variable: `MonthFolder`

Add action: **Format Date**
- Format: Custom → `yyyy-MM-dd`
- Save output as variable: `DatePrefix`

### Step 6: Rename and File the Receipt

Add action: **Set Name**
- Input: **Shortcut Input** (the original receipt image/PDF)
- Name: `DatePrefix`\_`Vendor`\_$`Amount`
- Example result: `2026-06-26_Costco_$45.23.jpg`

Add action: **Save File**
- Service: **iCloud Drive**
- Subpath: `Receipts/Year/MonthFolder/`
- Ask Where to Save: **OFF**
- Overwrite If File Exists: **ON**

> This automatically creates the folder structure `Receipts/2026/06-June/` if it doesn't exist.

### Step 7: Log to Spreadsheet

Choose ONE of these options:

**Option A: Apple Numbers spreadsheet (recommended for Apple ecosystem)**

First, create a Numbers spreadsheet:
1. Open **Numbers** on your iPhone/iPad/Mac
2. Create a new blank spreadsheet
3. Save it to iCloud Drive as `Receipts/Expense Tracker.numbers`
4. Name the first table `Expenses`
5. Set headers in Row 1: `Date | Vendor | Amount | Category | Payment Method | File Name`

Then in the shortcut, add:

Add action: **Add Row to Numbers Spreadsheet**
- Spreadsheet: `Expense Tracker` (in iCloud Drive → Receipts)
- Table: `Expenses`
- Values:
  - Date → `DatePrefix`
  - Vendor → `Vendor`
  - Amount → `Amount`
  - Category → `Category`
  - Payment Method → `PaymentMethod`
  - File Name → `DatePrefix`\_`Vendor`\_$`Amount`

**Option B: CSV file (works with Excel, Google Sheets, etc.)**

Add action: **Text**
- Content: `DatePrefix,Vendor,Amount,Category,PaymentMethod,DatePrefix_Vendor_$Amount`

Add action: **Append to File**
- Service: iCloud Drive
- File Path: `Receipts/expense_log.csv`

> You can open the CSV in Excel or Google Sheets at any time.

### Step 8: Confirmation Notification

Add action: **Show Notification**
- Title: `Receipt Saved ✓`
- Body: `Vendor — $Amount → Category (MonthFolder)`

---

## Final Setup

1. Tap the shortcut name at the top → rename to **"Save Receipt"**
2. Tap the icon to choose a receipt or dollar sign icon
3. Go to **Shortcut Details** (ⓘ button):
   - Enable **"Show in Share Sheet"**
   - Input types: **Images, PDFs**
4. Done!

---

## Usage

### From any app:
1. View or screenshot a receipt
2. Tap the **Share** button (↑ icon)
3. Tap **"Save Receipt"** in the share sheet
4. Wait 2-3 seconds — Apple Intelligence reads and files it automatically
5. You'll get a notification confirming the save

### Via Siri:
- "Hey Siri, Save Receipt" → then select a photo from your library

### From the Camera:
1. Take a photo of a physical receipt
2. In the Photos app, tap Share → "Save Receipt"

---

## Folder Structure Created Automatically

```
iCloud Drive/
└── Receipts/
    ├── Expense Tracker.numbers (or expense_log.csv)
    ├── 2026/
    │   ├── 01-January/
    │   │   ├── 2026-01-15_Kroger_$87.43.jpg
    │   │   └── 2026-01-22_Shell_$45.00.jpg
    │   ├── 02-February/
    │   ├── ...
    │   └── 06-June/
    │       ├── 2026-06-20_Amazon_$129.99.png
    │       └── 2026-06-26_Costco_$45.23.jpg
    └── 2027/
        └── ...
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Extract Text" action not found | Update to iOS 18.1+. Search for "Recognize Text" as an alternative. |
| "Ask ChatGPT" not available | Enable ChatGPT in Settings → Apple Intelligence & Siri → ChatGPT. Or use the "Generate Text" Apple Intelligence action instead. |
| AI returns wrong format | Edit the prompt to be more specific. Add "Do not include any other text." |
| Amount is wrong | The AI picks the largest "total" on the receipt. If it's wrong, you can edit the Numbers row after. |
| Folder not created | iCloud Drive creates subfolders automatically via "Save File". Make sure iCloud Drive is enabled. |
| Numbers spreadsheet not found | Create it manually first at `iCloud Drive/Receipts/Expense Tracker.numbers` with a table named `Expenses`. |

## One-Time CSV Setup

If using Option B (CSV), create the header row first by running this one-time shortcut:

1. New Shortcut → Add action: **Text**
   - Content: `Date,Vendor,Amount,Category,Payment Method,File Name`
2. Add action: **Save File**
   - Path: `Receipts/expense_log.csv`
   - Service: iCloud Drive
3. Run once, then delete this shortcut
