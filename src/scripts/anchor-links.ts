// Toast notification function
function showToast(message: string): void {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 3000)
}

// Add click handlers to .heading-anchor elements for anchor link copying
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('.heading-anchor')

  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', (e: Event) => {
      e.preventDefault()
      const heading = anchor.closest('h1, h2, h3, h4, h5, h6')

      if (heading?.id) {
        const url = `${window.location.origin}${window.location.pathname}#${heading.id}`

        navigator.clipboard
          .writeText(url)
          .then(() => showToast('copied to clipboard!'))
          .catch(err => {
            console.error('Failed to copy link:', err)
            showToast('Failed to copy link')
          })
      }
    })
  })
})
