
// Process base64 in chunks to prevent memory issues (stack overflow)
export function binaryToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let base64 = '';
  const chunkSize = 1024; // Process in smaller chunks
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    base64 += btoa(String.fromCharCode.apply(null, [...chunk]));
  }
  
  return base64;
}
