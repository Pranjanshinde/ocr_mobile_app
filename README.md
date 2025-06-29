# ocr_mobile_app
📸 Invoice OCR Scanner (React Native + Expo)
This mobile app allows users to scan physical purchase invoices using their phone camera, extract structured data like item details and taxes using Google Vision API, and export that data to an Excel file compatible with Logic ERP.

🚀 Features
Capture invoice using mobile camera

Extract data using Google Cloud Vision OCR API

Parse details like:

Item Description

HSN Code

Quantity

Unit Price

GST %

GST Amount

Total Amount

Export parsed data to Excel (.xlsx)

Share Excel file using native sharing dialog

📱 Built With
React Native (via Expo)

Google Vision API for OCR

xlsx for Excel file creation

expo-camera, expo-sharing, expo-file-system for core mobile functionality

🛠 How to Run
1. Prerequisites
Node.js v18 or earlier (for expo CLI compatibility)

Expo CLI:

bash
Copy
Edit
npm install -g expo
Google Cloud Vision API Key with billing enabled.

2. Clone and Install Dependencies
bash
Copy
Edit
git clone https://github.com/your-username/invoice-ocr-app.git
cd invoice-ocr-app
npm install
3. Set Your Google Vision API Key
Replace YOUR_GOOGLE_VISION_API_KEY in the code with your actual key:

js
Copy
Edit
const GOOGLE_VISION_API_KEY = "YOUR_GOOGLE_VISION_API_KEY";
4. Run the App
Start Expo:

bash
Copy
Edit
npx expo start
Scan the QR code using Expo Go App on your mobile.

🧪 How to Use
Launch the app.

Click on "Open Camera to Scan Invoice".

Take a clear photo of the invoice.

The app will extract and display the OCR text.

Parsed invoice data will be listed in a table.

Click "Export to Excel" to save and share the file.

⚠️ Notes
Make sure Google Cloud billing is enabled for your API key.

For full functionality (camera + file sharing), use a development build instead of Expo Go if needed.

Avoid blurry or skewed images for best OCR results.

