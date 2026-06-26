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
Analyze this receipt text and respond with ONLY these 3 lines, nothing else:
VENDOR: [store/merchant name]
AMOUNT: [total amount as a number like 45.23]
DESCRIPTION: [brief description of what was purchased, 5 words max]

Receipt text:
[ReceiptText]
```

- Long-press the result → **Set Variable** → name it `AIResponse`

**Method B: Using "Prompt for Siri" / Apple Intelligence text generation**

If ChatGPT integration isn't available, add:

Add action: **Generate Text** (Apple Intelligence)
- Use the same prompt as above with `ReceiptText` inserted
- Long-press the result → **Set Variable** → name it `AIResponse`

### Step 4: Parse the AI Response into Variables

The AI response will look like this:
```
VENDOR: Costco
AMOUNT: 45.23
DESCRIPTION: Bulk groceries and household items
```

We'll use **Split Text**, **Get Item from List**, and **Replace Text** to pull out each value.

The **Replace Text** action in Shortcuts reads as:

> Replace `___` with `___` in `___`

Here's how to fill in each blank for every field:

---

**Split into lines:**

1. Add action: **Split Text**
   - Tap the blue **"Text"** input and select the `AIResponse` variable
   - Tap **"By"** and choose: **New Lines**

---

**Extract Vendor (line 1):**

2. Add action: **Get Item from List**
   - Tap input and select the **Split Text** result
   - Tap **"First Item"** and change to: **Item At Index** → type `1`

3. Add action: **Replace Text**
   - The action reads: Replace `___` with `___` in `___`
   - **First blank** (Replace): type `VENDOR: `
   - **Second blank** (with): leave it empty — just tap it and don't type anything
   - **Third blank** (in): tap it and select the **Item from List** result from step 2
   - This strips the "VENDOR: " label, leaving just the vendor name

4. Long-press the Replace Text result → **Set Variable** → name it `Vendor`

---

**Extract Amount (line 2):**

5. Add action: **Get Item from List**
   - Tap input and select the **Split Text** result (scroll up to find it — use the one from step 1)
   - Change to: **Item At Index** → type `2`

6. Add action: **Replace Text**
   - **First blank** (Replace): type `AMOUNT: `
   - **Second blank** (with): leave empty
   - **Third blank** (in): tap and select the **Item from List** result from step 5

7. Long-press the Replace Text result → **Set Variable** → name it `Amount`

---

**Extract Description (line 3):**

8. Add action: **Get Item from List**
   - Tap input and select the **Split Text** result (from step 1)
   - Change to: **Item At Index** → type `3`

9. Add action: **Replace Text**
   - **First blank** (Replace): type `DESCRIPTION: `
   - **Second blank** (with): leave empty
   - **Third blank** (in): tap and select the **Item from List** result from step 8

10. Long-press the Replace Text result → **Set Variable** → name it `Description`

---

> **Tip — Setting variables:** Long-press the colored result bubble at the bottom of any action → tap **Set Variable** → type a name. You can then use that variable later by tapping any input field and selecting it from the variables bar above the keyboard.

### Step 5: Set Up Date Variables

1. Add action: **Date**
   - This gives you the current date and time

2. Add action: **Format Date**
   - Tap input and select the Date result
   - Date Format: **Custom**
   - Custom Format: `yyyy`
   - Long-press the result → **Set Variable** → name it `Year`

3. Add action: **Format Date**
   - Tap input and select the Date result (from step 1, not step 2)
   - Date Format: **Custom**
   - Custom Format: `MM-MMMM`
   - Long-press the result → **Set Variable** → name it `MonthFolder`

4. Add action: **Format Date**
   - Tap input and select the Date result (from step 1)
   - Date Format: **Custom**
   - Custom Format: `yyyy-MM-dd`
   - Long-press the result → **Set Variable** → name it `DatePrefix`

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
5. Set headers in Row 1: `Date | Vendor | Amount | Description | File Name`

Then in the shortcut, add:

Add action: **Add Row to Numbers Spreadsheet**
- Spreadsheet: `Expense Tracker` (in iCloud Drive → Receipts)
- Table: `Expenses`
- Values:
  - Date → `DatePrefix`
  - Vendor → `Vendor`
  - Amount → `Amount`
  - Description → `Description`
  - File Name → `DatePrefix`\_`Vendor`\_$`Amount`

**Option B: CSV file (works with Excel, Google Sheets, etc.)**

Add action: **Text**
- Content: `DatePrefix,Vendor,Amount,Description,DatePrefix_Vendor_$Amount`

Add action: **Append to File**
- Service: iCloud Drive
- File Path: `Receipts/expense_log.csv`

> You can open the CSV in Excel or Google Sheets at any time.

### Step 8: Confirmation Notification

Add action: **Show Notification**
- Title: `Receipt Saved ✓`
- Body: `Vendor — $Amount — Description (MonthFolder)`

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
   - Content: `Date,Vendor,Amount,Description,File Name`
2. Add action: **Save File**
   - Path: `Receipts/expense_log.csv`
   - Service: iCloud Drive
3. Run once, then delete this shortcut
