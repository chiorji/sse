(function () {
  "use strict";
  const evtSource = new EventSource('/sse')
  const form = document.querySelector('.chat__input')
  const inputField = document.querySelector('.input--field')

  evtSource.onerror = function (e) {
    console.log('EventSource Error >> ', e)
  }

  evtSource.addEventListener('message', function(e) {
    console.log('Received a message', e, e.data)
  })

  evtSource.onopen = function (e) {
    console.log('EventSource Opened >> ', e)
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!inputField.value) {
      return false
    }

    fetch(`/chat?message=${inputField.value.trim()}`)
    inputField.value = ''
  })

}())