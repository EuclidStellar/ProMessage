// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Extension Installed");
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === "convertText") {
//         convertToProfessional(message.text)
//             .then((convertedText) => {
//                 sendResponse({ convertedText }); // Ensure response is sent
//             })
//             .catch((error) => {
//                 console.error("Error:", error);
//                 sendResponse({ error: "Failed to fetch response" });
//             });
//         return true; // Keeps the message port open for async response
//     }
    
//     // Add handler for ping message from content script
//     if (message.type === "ping") {
//         sendResponse({ status: "alive" });
//         return true;
//     }
// });


// async function convertToProfessional(text) {
//     const API_KEY = "L lele mera"; // Replace with your actual API key

//     try {
//         console.log("Calling Gemini API...");
//         const response = await fetch(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     contents: [
//                         {
//                             parts: [{ text: `Hey My name is Gaurav and I want you to Convert this to a professional message in a good tone without giving any placeholder brackets in the message : ${text}` }]
//                         }
//                     ]
//                 })
//             }
//         );

//         const data = await response.json();
//         console.log("API Response:", data);

//         return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
//     } catch (error) {
//         console.error("Error calling API:", error);
//         return text;
//     }
// }


// (function () {
//     // Create the floating button
//     const btn = document.createElement("div");
//     btn.innerText = "✨";
//     btn.style.position = "fixed";
//     btn.style.bottom = "20px";
//     btn.style.right = "20px";
//     btn.style.background = "#007bff";
//     btn.style.color = "white";
//     btn.style.padding = "10px";
//     btn.style.borderRadius = "50%";
//     btn.style.cursor = "pointer";
//     btn.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
//     btn.style.fontSize = "18px";
//     btn.style.display = "flex";
//     btn.style.alignItems = "center";
//     btn.style.justifyContent = "center";
//     btn.style.zIndex = "9999";
//     document.body.appendChild(btn);

//     // When button is clicked
//     btn.addEventListener("click", async function () {
//         let activeElement = document.activeElement;
    
//         // Try to find LinkedIn's message box or other common contenteditable elements
//         let contentEditableElement = document.querySelector('[contenteditable="true"]');
    
//         if (contentEditableElement) {
//             activeElement = contentEditableElement; 
//         }
    
//         let userText = "";
    
//         if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
//             userText = activeElement.value;
//         } else if (activeElement.isContentEditable) {
//             userText = activeElement.innerText || activeElement.textContent;
//         } else {
//             alert("Click inside a text field before using this feature.");
//             return;
//         }
    
//         console.log("User Text:", userText);
//         if (userText.trim() === "") {
//             alert("Please enter some text first.");
//             return;
//         }
    
//         try {
//             chrome.runtime.sendMessage({ type: "convertText", text: userText }, (response) => {
//                 if (chrome.runtime.lastError) {
//                     console.error("Runtime error:", chrome.runtime.lastError.message);
//                     alert("An error occurred with the extension. Please try refreshing the page.");
//                     return;
//                 }
                
//                 if (response && response.convertedText) {
//                     // Check if we're on LinkedIn
//                     const isLinkedIn = window.location.hostname.includes('linkedin.com');
                    
//                     if (isLinkedIn && activeElement.isContentEditable) {
//                         // Special handling for LinkedIn
//                         handleLinkedInInput(activeElement, response.convertedText);
//                     } else if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
//                         // Comprehensive approach for standard input elements
//                         handleStandardInput(activeElement, response.convertedText);
//                     } else if (activeElement.isContentEditable) {
//                         // Handle contenteditable elements like rich text editors
//                         handleContentEditableInput(activeElement, response.convertedText);
//                     }
//                 } else {
//                     console.error("No valid response received.");
//                     alert("Could not convert your text. Please try again.");
//                 }
//             });
//         } catch (error) {
//             console.error("Error sending message:", error);
//             alert("Failed to process your request. Please refresh the page.");
//         }
//     });
    
//     // Helper function specifically for LinkedIn message editor
//     function handleLinkedInInput(element, text) {
//         // Focus on the element
//         element.focus();
        
//         // Clear existing content (important for LinkedIn)
//         // LinkedIn often has <p><br></p> structure when empty
//         element.innerHTML = '';
        
//         // Create a specific LinkedIn message structure
//         const p = document.createElement('p');
//         p.textContent = text;
//         element.appendChild(p);
        
//         // Dispatch clipboard paste event - LinkedIn seems to react better to this
//         const pasteEvent = new ClipboardEvent('paste', {
//             bubbles: true,
//             cancelable: true,
//             clipboardData: new DataTransfer()
//         });
        
//         // Set clipboard data
//         Object.defineProperty(pasteEvent.clipboardData, 'getData', {
//             value: () => text
//         });
        
//         element.dispatchEvent(pasteEvent);
        
//         // Dispatch all standard events too
//         const events = ['input', 'change', 'keyup', 'keydown', 'compositionend'];
//         events.forEach(eventType => {
//             const event = new Event(eventType, { bubbles: true, cancelable: true });
//             element.dispatchEvent(event);
//         });
        
//         // LinkedIn specific: look for the send button and check if it's enabled
//         setTimeout(() => {
//             const sendButton = document.querySelector('button[aria-label="Send"][disabled]');
//             if (sendButton) {
//                 // If still disabled, try one more approach - manually trigger message events
//                 const keyEvent = new KeyboardEvent('keydown', {
//                     bubbles: true,
//                     cancelable: true,
//                     key: ' ', // Space key often triggers validation
//                     keyCode: 32
//                 });
//                 element.dispatchEvent(keyEvent);
//             }
//         }, 500);
//     }
    
//     // Helper function for standard input elements
//     function handleStandardInput(element, text) {
//         element.focus();
//         element.value = text;
        
//         // Trigger multiple events that may be listened for
//         const events = ['input', 'change', 'keyup', 'keydown', 'keypress'];
//         events.forEach(eventType => {
//             const event = new Event(eventType, { bubbles: true, cancelable: true });
//             element.dispatchEvent(event);
//         });
        
//         // For React and similar frameworks
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
//             element instanceof HTMLInputElement ? 
//             window.HTMLInputElement.prototype : 
//             window.HTMLTextAreaElement.prototype, 
//             "value"
//         ).set;
        
//         nativeInputValueSetter.call(element, text);
//         element.dispatchEvent(new Event('input', { bubbles: true }));
//     }
    
//     // Helper function for contenteditable elements
//     function handleContentEditableInput(element, text) {
//         element.focus();
        
//         // Clear existing content
//         element.innerHTML = '';
        
//         // Set new content
//         const textNode = document.createTextNode(text);
//         element.appendChild(textNode);
        
//         // Trigger a wide range of possible events
//         const events = ['input', 'change', 'keyup', 'keydown'];
//         events.forEach(eventType => {
//             const event = new Event(eventType, { bubbles: true, cancelable: true });
//             element.dispatchEvent(event);
//         });
        
//         // Add specific events for contenteditable
//         ['compositionstart', 'compositionend', 'compositionupdate'].forEach(eventType => {
//             const event = new Event(eventType, { bubbles: true });
//             element.dispatchEvent(event);
//         });
        
//         // Focus at the end of text
//         placeCaretAtEnd(element);
//     }
    
//     // Helper function to place caret at the end of contenteditable
//     function placeCaretAtEnd(el) {
//         el.focus();
//         if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
//             const range = document.createRange();
//             range.selectNodeContents(el);
//             range.collapse(false);
//             const sel = window.getSelection();
//             sel.removeAllRanges();
//             sel.addRange(range);
//         }
//     }
// })();
