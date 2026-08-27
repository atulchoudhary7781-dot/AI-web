// Debug script to test document display logic

// Simulate what happens when user sends a document
const attachedFile = {
  name: 'test-document.pdf',
  type: 'application/pdf',
  size: 102400
}

const fileBase64 = null // PDF won't have base64

// This is how we create message in page.tsx
const userMessage = {
  id: '123',
  role: 'user',
  content: `📎 ${attachedFile.name}`,
  timestamp: new Date(),
  // Image data (none for PDF)
  ...(fileBase64 && attachedFile?.type.startsWith('image/') ? {
    image: fileBase64,
    imageMimeType: attachedFile.type
  } : {}),
  // Document info (should be added for non-image)
  ...(attachedFile && !attachedFile?.type.startsWith('image/') ? {
    fileName: attachedFile.name,
    fileType: attachedFile.type,
    fileSize: attachedFile.size
  } : {})
}

console.log('=== DEBUG: User Message Structure ===')
console.log(JSON.stringify(userMessage, null, 2))
console.log('\n=== CHECKS ===')
console.log('message.fileName:', userMessage.fileName)
console.log('message.image:', userMessage.image)
console.log('message.content:', userMessage.content)
console.log('content includes 📎:', userMessage.content?.includes('📎'))

// Check the display condition
const shouldShowDoc = (userMessage.fileName || (userMessage.content && userMessage.content.includes('📎'))) && !userMessage.image
console.log('\nShould show document:', shouldShowDoc)

if (!shouldShowDoc) {
  console.log('\n❌ DOCUMENT WILL NOT SHOW!')
  console.log('Possible issues:')
  if (!userMessage.fileName) console.log('- fileName is missing')
  if (userMessage.image) console.log('- image is set (blocks document)')
  if (!userMessage.content?.includes('📎')) console.log('- content does not have 📎')
}
