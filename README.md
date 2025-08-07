# 🤖 AI Code Complexity Analyzer

A Chrome/Edge extension that uses **Mistral AI** to analyze the time complexity of code snippets on any webpage. Select code, click analyze, and get AI-powered complexity analysis!

## ✨ Features

- 🎯 **On-Demand Analysis**: Click to analyze, no automatic triggers
- 🧠 **AI-Powered**: Uses Mistral Large for accurate complexity analysis  
- 🌍 **Multi-Language**: Python, JavaScript, Java, C++, Go, Rust, and more
- 🔒 **Secure**: API key stored locally in browser
- 📊 **Rich Results**: Time complexity, space complexity, explanations, and optimization suggestions
- 🎨 **Beautiful UI**: Modern popup with language selector

## 🚀 Installation

### Step 1: Get Your Mistral API Key
1. Go to [console.mistral.ai](https://console.mistral.ai/)
2. Sign up/login and create an API key
3. Copy your API key (you'll need it for the extension)

### Step 2: Install Extension
1. Download or clone this repository
2. Open your browser and go to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable "Developer mode" 
4. Click "Load unpacked" and select the extension folder
5. Pin the extension to your toolbar

### Step 3: Setup
1. Click the extension icon
2. Enter your Mistral API key and click "Save"
3. You're ready to analyze code!

## 📖 How to Use

1. **Select Code**: Highlight any code snippet on any webpage (GitHub, Stack Overflow, etc.)
2. **Click Extension**: Click the extension icon in your toolbar  
3. **Choose Language**: Select the programming language (or use auto-detect)
4. **Click Analyze**: Hit the "🚀 Analyze Complexity" button
5. **View Results**: See the AI analysis appear on the webpage

## 🎯 Example Analysis

For this Python code:
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

**AI Analysis Result:**
- **Time Complexity**: O(log n)  
- **Space Complexity**: O(1)
- **Explanation**: Binary search divides the search space in half with each iteration
- **Key Operations**: Array indexing, comparison operations
- **Suggestions**: Consider edge cases for empty arrays

## 🛠️ Supported Languages

- Python
- JavaScript/TypeScript  
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- And more...

## ⚙️ Extension Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Popup UI  │────│ Background   │────│  Mistral    │
│             │    │ Service      │    │     AI      │
│ • Language  │    │ Worker       │    │             │
│ • Analyze   │    │              │    │ API         │
│ • Settings  │    │ • API calls  │    │             │
└─────────────┘    │ • Storage    │    └─────────────┘
                   └──────────────┘
                          │
                   ┌──────────────┐
                   │ Content      │
                   │ Script       │
                   │              │
                   │ • Selection  │
                   │ • Results    │
                   │ • Display    │
                   └──────────────┘
```

## 🔧 Configuration

### Language Detection
The extension can auto-detect languages or you can manually select:
- Auto-detection uses pattern matching
- Manual selection overrides detection
- Supports 12+ programming languages

### API Settings  
- API key stored securely in browser local storage
- 30-second timeout for API calls
- Automatic error handling and retry logic
- Rate limiting protection

## 🛡️ Security & Privacy

- ✅ API key stored locally (never transmitted except to Mistral)
- ✅ No code stored on servers (only sent to Mistral for analysis)
- ✅ HTTPS-only API communication
- ✅ No tracking or analytics
- ✅ Open source - audit the code yourself

## 📝 Error Handling

The extension handles various error cases:
- Invalid API keys
- Network timeouts
- Rate limiting  
- Malformed responses
- Code too long/short
- Service unavailability

## 🤝 Contributing

Feel free to:
- Report bugs via GitHub issues
- Suggest new features
- Submit pull requests
- Add language support
- Improve UI/UX

## 📄 License

MIT License - feel free to use and modify!

## 🔗 Links

- [Mistral AI Console](https://console.mistral.ai/)
- [Mistral API Documentation](https://docs.mistral.ai/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)

---

**Made with ❤️ and AI** • Powered by Mistral Large