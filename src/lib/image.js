/**
 * Turn a picked image file into a smaller JPEG data URL that fits in
 * localStorage. The longest side is scaled down to `maxSide` pixels; the
 * Home header is 390px wide, so 1200px stays sharp on 3x screens.
 */
export async function shrinkImage(file, { maxSide = 1200, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')

  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.naturalWidth * scale)
    canvas.height = Math.round(image.naturalHeight * scale)
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image could not be opened.'))
    image.src = src
  })
}
