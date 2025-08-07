let selectedCode = '';
let resultTooltip = null;

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleTextSelection);

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 10) {
    selectedCode = text;
    
    chrome.runtime.sendMessage({
      action: 'setSelectedCode',
      code: selectedCode
    }).catch(() => {
      console.log('Extension context may be invalidated');
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showResult') {
    showAnalysisResult(request.result);
    sendResponse({ status: 'result displayed' });
  }
  
  else if (request.action === 'showError') {
    showAnalysisError(request.error);
    sendResponse({ status: 'error displayed' });
  }
  
  else if (request.action === 'hideResult') {
    hideResult();
    sendResponse({ status: 'result hidden' });
  }
});

function showAnalysisResult(result) {
  hideResult();
  
  const selection = window.getSelection();
  let rect = { left: 100, top: 100, bottom: 120 };
  
  if (selection.rangeCount > 0) {
    rect = selection.getRangeAt(0).getBoundingClientRect();
  }
  
  resultTooltip = document.createElement('div');
  resultTooltip.className = 'ai-complexity-result';
  resultTooltip.innerHTML = `
    <div class="result-header">
      <span class="ai-badge">🤖 AI Analysis</span>
      <button class="close-btn">&times;</button>
    </div>
    <div class="result-content">
      <div class="complexity-main">
        <strong>Time: ${result.complexity}</strong>
        ${result.space_complexity ? `<span class="space-complexity">Space: ${result.space_complexity}</span>` : ''}
      </div>
      <div class="explanation">
        ${result.explanation}
      </div>
      ${result.key_operations && result.key_operations.length ? `
        <div class="key-operations">
          <strong>Key Operations:</strong>
          <ul>
            ${result.key_operations.map(op => `<li>${op}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${result.suggestions && result.suggestions.length ? `
        <div class="suggestions">
          <strong>Suggestions:</strong>
          <ul>
            ${result.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
  
  resultTooltip.style.position = 'fixed';
  resultTooltip.style.left = `${Math.max(10, rect.left)}px`;
  resultTooltip.style.top = `${rect.bottom + 10}px`;
  resultTooltip.style.zIndex = '999999';
  
  if (parseInt(resultTooltip.style.left) + 350 > window.innerWidth) {
    resultTooltip.style.left = `${window.innerWidth - 360}px`;
  }
  
  if (parseInt(resultTooltip.style.top) + 200 > window.innerHeight) {
    resultTooltip.style.top = `${rect.top - 210}px`;
  }
  
  document.body.appendChild(resultTooltip);
  
  resultTooltip.querySelector('.close-btn').addEventListener('click', hideResult);
  
  setTimeout(hideResult, 15000);
}

function showAnalysisError(error) {
  hideResult();
  
  resultTooltip = document.createElement('div');
  resultTooltip.className = 'ai-complexity-result error';
  resultTooltip.innerHTML = `
    <div class="result-header">
      <span class="ai-badge error">❌ Analysis Error</span>
      <button class="close-btn">&times;</button>
    </div>
    <div class="result-content">
      <div class="error-message">
        ${error}
      </div>
    </div>
  `;
  
  resultTooltip.style.position = 'fixed';
  resultTooltip.style.left = '50px';
  resultTooltip.style.top = '100px';
  resultTooltip.style.zIndex = '999999';
  
  document.body.appendChild(resultTooltip);
  
  resultTooltip.querySelector('.close-btn').addEventListener('click', hideResult);
  
  setTimeout(hideResult, 8000);
}

function hideResult() {
  if (resultTooltip) {
    resultTooltip.remove();
    resultTooltip = null;
  }
}

document.addEventListener('click', (e) => {
  if (resultTooltip && !resultTooltip.contains(e.target)) {
    hideResult();
  }
});