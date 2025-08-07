let apiKey = '';
let selectedCode = '';

document.addEventListener('DOMContentLoaded', async () => {
  await loadStoredData();
  updateUI();
  setupEventListeners();
  await updateCodePreview();
});

async function loadStoredData() {
  const result = await chrome.storage.local.get(['mistralApiKey']);
  apiKey = result.mistralApiKey || '';
  
  if (apiKey) {
    document.getElementById('apiKey').value = '••••••••••••••••';
  }
}

function updateUI() {
  const apiKeySection = document.getElementById('apiKeySection');
  const analysisSection = document.getElementById('analysisSection');
  
  if (apiKey) {
    apiKeySection.style.display = 'none';
    analysisSection.style.display = 'block';
  } else {
    apiKeySection.style.display = 'block';
    analysisSection.style.display = 'none';
  }
}

async function updateCodePreview() {
  const codePreview = document.getElementById('codePreview');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSelectedCode' });
    selectedCode = response.code || '';
    
    if (selectedCode.trim()) {
      const preview = selectedCode.length > 200 
        ? selectedCode.substring(0, 200) + '...'
        : selectedCode;
      
      codePreview.textContent = preview;
      codePreview.classList.remove('empty');
      analyzeBtn.disabled = false;
    } else {
      codePreview.textContent = 'Select code on the webpage first';
      codePreview.classList.add('empty');
      analyzeBtn.disabled = true;
    }
  } catch (error) {
    codePreview.textContent = 'No code selected';
    codePreview.classList.add('empty');
    analyzeBtn.disabled = true;
  }
}

function setupEventListeners() {
  document.getElementById('saveApiKey').addEventListener('click', async () => {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput.value.trim();
    
    if (key && key !== '••••••••••••••••') {
      apiKey = key;
      await chrome.storage.local.set({ mistralApiKey: apiKey });
      showStatus('API key saved successfully!', 'success');
      updateUI();
    } else {
      showStatus('Please enter a valid API key', 'error');
    }
  });
  
  document.getElementById('analyzeBtn').addEventListener('click', analyzeCode);
  
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const apiKeySection = document.getElementById('apiKeySection');
    const analysisSection = document.getElementById('analysisSection');
    
    if (apiKeySection.style.display === 'none') {
      apiKeySection.style.display = 'block';
      analysisSection.style.display = 'none';
      document.getElementById('apiKey').value = '';
    } else {
      updateUI();
    }
  });
  
  document.getElementById('clearDataBtn').addEventListener('click', async () => {
    if (confirm('Clear all stored data including API key?')) {
      await chrome.storage.local.clear();
      apiKey = '';
      selectedCode = '';
      document.getElementById('apiKey').value = '';
      showStatus('All data cleared', 'info');
      updateUI();
    }
  });
  
  setInterval(updateCodePreview, 2000);
}

async function analyzeCode() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnText = analyzeBtn.querySelector('.btn-text');
  const btnLoading = analyzeBtn.querySelector('.btn-loading');
  const language = document.getElementById('language').value;
  
  if (!selectedCode.trim()) {
    showStatus('Please select some code on the webpage first', 'error');
    return;
  }
  
  if (!apiKey) {
    showStatus('Please set your Mistral API key first', 'error');
    return;
  }
  
  analyzeBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  
  showStatus('Sending code to Mistral AI for analysis...', 'info');
  
  try {
    const detectedLanguage = language === 'auto' ? detectLanguage(selectedCode) : language;
    
    console.log('Sending to API:', {
      codeLength: selectedCode.length,
      language: detectedLanguage,
      codePreview: selectedCode.substring(0, 100)
    });
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeCode',
      code: selectedCode,
      language: detectedLanguage,
      apiKey: apiKey
    });
    
    console.log('API Response:', response);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.result) {
      throw new Error('No result returned from analysis');
    }
    
    showStatus('Analysis complete! Check the webpage for results.', 'success');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, {
      action: 'showResult',
      result: response.result
    });
    
    setTimeout(() => window.close(), 1500);
    
  } catch (error) {
    console.error('Analysis error:', error);
    showStatus(`Error: ${error.message}`, 'error');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        error: error.message
      });
    } catch (tabError) {
      console.error('Could not send error to tab:', tabError);
    }
  } finally {
    analyzeBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

function detectLanguage(code) {
  const patterns = {
    python: [/def\s+\w+\s*\(/, /import\s+\w+/, /from\s+\w+\s+import/, /:\s*$/m],
    javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /=>\s*{/, /console\./],
    java: [/public\s+class/, /public\s+static\s+void\s+main/, /System\.out/],
    cpp: [/#include\s*</, /std::/, /cout\s*<</, /int\s+main\s*\(/],
    c: [/#include\s*</, /printf\s*\(/, /int\s+main\s*\(/, /malloc\s*\(/]
  };
  
  for (const [lang, regexes] of Object.entries(patterns)) {
    if (regexes.some(regex => regex.test(code))) {
      return lang;
    }
  }
  
  return 'auto';
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, type === 'success' ? 3000 : 5000);
}