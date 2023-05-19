let currentStep = 1
let totalSteps = 3

function updateStep() {
    for (let i = 1; i <= totalSteps; i++) {
        let step = document.getElementById('step-' + i)
        let circle = document.getElementById('step-circle-' + i)
        step.classList.remove('active')
        circle.classList.remove('active-step')

        if (i === currentStep) {
            step.classList.add('active')
            circle.classList.add('active-step')
        }
    }
}

document.getElementById('prev').addEventListener('click', function () {
    if (currentStep > 1) {
        currentStep--
        updateStep()
    }
})

document.getElementById('next').addEventListener('click', function () {
    if (currentStep < totalSteps) {
        currentStep++
        updateStep()
    }
})

updateStep()


let drawing = false
let rectanglesTraining = []
let rectanglesTest = []
let currentSecond = 0
let trainingLoaded = false
let testLoaded = false
let selectedLabel = ''
let json = ''
let trainingVideo = null
let testVideo = null
let fps = 30
let type = 'training'
let rect = null
let usedLabels = []
let drawWidth, drawHeight, startX, startY

const trainingVideoElement = document.getElementById('trainingVideo')
const testVideoElement = document.getElementById('testVideo')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const list = document.getElementById('list')

ctx.fillStyle = '#212121'
ctx.fillRect(0, 0, canvas.width, canvas.height)


document.onkeydown = (e) => {
    if (e.code == 'KeyA' && document.activeElement != document.getElementById('text-field-hero-input'))
        previousFrame()
    else if (e.code == 'KeyD' && document.activeElement != document.getElementById('text-field-hero-input'))
        nextFrame()
    else if (e.code == 'Space' && document.activeElement != document.getElementById('text-field-hero-input'))
        resetFrame()
}

document.getElementById('nextFrame').addEventListener('click', nextFrame)
document.getElementById('previousFrame').addEventListener('click', previousFrame)
document.getElementById('reset').addEventListener('click', resetFrame)

//load file to video tag
document.getElementById('videoFile').addEventListener('change', (e) => {

    if (type == 'training') {
        trainingVideo = e.target.files[0]
        trainingVideoElement.src = URL.createObjectURL(trainingVideo)
    } else if (type == 'test') {
        testVideo = e.target.files[0]
        testVideoElement.src = URL.createObjectURL(testVideo)
    }

})

// seek these nuts
trainingVideoElement.addEventListener('seeked', drawFrame)
testVideoElement.addEventListener('seeked', drawFrame)

//show first frame when loaded
trainingVideoElement.addEventListener('loadeddata', e => videoLoaded(e, 'training'))
testVideoElement.addEventListener('loadeddata', e => videoLoaded(e, 'test'))

function videoLoaded(e, videoType) {

    // Compute the video and canvas aspect ratios
    var videoRatio = e.target.videoWidth / e.target.videoHeight
    var canvasRatio = canvas.width / canvas.height

    // Compute the new video dimensions, preserving aspect ratio
    if (videoRatio > canvasRatio) {
        // The video is wider than the canvas, size it to match the canvas width
        drawWidth = canvas.width
        drawHeight = canvas.width / videoRatio
    } else {
        // The video is narrower than the canvas, size it to match the canvas height
        drawHeight = canvas.height
        drawWidth = canvas.height * videoRatio
    }

    // Calculate the position to start drawing the video (centering it)
    startX = (canvas.width - drawWidth) / 2
    startY = (canvas.height - drawHeight) / 2

    drawFrame()

    document.getElementById('previousFrame').disabled = false
    document.getElementById('nextFrame').disabled = false
    document.getElementById('reset').disabled = false
    document.getElementById('addLabel').disabled = false

    if (videoType == 'training') trainingLoaded = true
    else if (videoType == 'test') testLoaded = true

}

// switch
document.getElementById('basic-switch').addEventListener('click', () => {

    usedLabels = []

    if (type == 'training') {

        type = 'test'
        document.getElementById('basic-switch').classList.replace('mdc-switch--unselected', 'mdc-switch--selected')
        document.getElementById('basic-switch-label').innerHTML = 'Test'
        list.innerHTML = ''
        document.getElementById('text-field-hero-input').value = ''

        rectanglesTest.forEach(element => {

            if (!usedLabels.includes(element.label)) {

                const listItem = document.createElement('li')
                listItem.id = 'item'
                listItem.classList.add('mdc-deprecated-list-item')

                const rippleSpan = document.createElement('span')
                rippleSpan.classList.add('mdc-deprecated-list-item__ripple')

                const textSpan = document.createElement('span')
                textSpan.classList.add('mdc-deprecated-list-item__text')
                textSpan.textContent = element.label.toUpperCase()

                listItem.appendChild(rippleSpan)
                listItem.appendChild(textSpan)
                list.appendChild(listItem)

                usedLabels.push(element.label)

            }

        })

        if (list.getElementsByTagName('li').length > 0) {
            list.getElementsByTagName('li')[0].classList.add('mdc-deprecated-list-item--selected')
            selectedLabel = list.getElementsByTagName('li')[0].getElementsByTagName('span')[1].innerText.toUpperCase()
        }

        if (testVideo != null) {
            testVideoElement.src = URL.createObjectURL(testVideo)
            canvas.width = ((window.innerHeight - 400) * testVideo.videoWidth) / testVideo.videoHeight
            canvas.height = window.innerHeight - 400
            currentSecond = 0
            drawFrame()
        } else {
            canvas.width = 1024
            canvas.height = 576
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#212121'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            document.getElementById('frameCount').innerHTML = ''
        }

    } else {

        type = 'training'
        document.getElementById('basic-switch').classList.replace('mdc-switch--selected', 'mdc-switch--unselected')
        document.getElementById('basic-switch-label').innerHTML = 'Training'
        list.innerHTML = ''

        rectanglesTraining.forEach(element => {

            if (!usedLabels.includes(element.label)) {

                const listItem = document.createElement('li')
                listItem.id = 'item'
                listItem.classList.add('mdc-deprecated-list-item')

                const rippleSpan = document.createElement('span')
                rippleSpan.classList.add('mdc-deprecated-list-item__ripple')

                const textSpan = document.createElement('span')
                textSpan.classList.add('mdc-deprecated-list-item__text')
                textSpan.textContent = element.label.toUpperCase()

                listItem.appendChild(rippleSpan)
                listItem.appendChild(textSpan)
                list.appendChild(listItem)

                usedLabels.push(element.label)

            }

        })

        if (list.getElementsByTagName('li').length > 0) {
            list.getElementsByTagName('li')[0].classList.add('mdc-deprecated-list-item--selected')
            selectedLabel = list.getElementsByTagName('li')[0].getElementsByTagName('span')[1].innerText.toUpperCase()
        }

        if (trainingVideo != null) {
            trainingVideoElement.src = URL.createObjectURL(trainingVideo)
            canvas.width = ((window.innerHeight - 400) * trainingVideo.videoWidth) / trainingVideo.videoHeight
            canvas.height = window.innerHeight - 400
            currentSecond = 0
            drawFrame()
        } else {
            canvas.width = 1024
            canvas.height = 576
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#212121'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            document.getElementById('frameCount').innerHTML = ''
        }
    }
})

//start drawing rect
canvas.addEventListener('mousedown', (e) => {

    if ((type == 'training' && !trainingLoaded) || (type == 'test' && !testLoaded) || selectedLabel == '') return

    drawing = true

    if (type == 'training')
        rectanglesTraining.push({ x: e.offsetX, y: e.offsetY, width: 0, height: 0, label: selectedLabel, frame: currentSecond / fps, type: type })
    else if (type == 'test')
        rectanglesTest.push({ x: e.offsetX, y: e.offsetY, width: 0, height: 0, label: selectedLabel, frame: currentSecond / fps, type: type })
})

//draw rect
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return
    if (type == 'training') rect = rectanglesTraining[rectanglesTraining.length - 1]
    else if (type == 'test') rect = rectanglesTest[rectanglesTest.length - 1]
    rect.width = e.offsetX - rect.x
    rect.height = e.offsetY - rect.y
    drawFrame()
})

//stop drawing rect
canvas.addEventListener('mouseup', (e) => {

    drawing = false

    if (rect !== null && (rect.width <= 10 || rect.height <= 10)) { // CORRECTION: Check if the drawn rectangle is too small and remove it
        if (type === 'training') rectanglesTraining.pop()
        else if (type === 'test') rectanglesTest.pop()
    }

})


//export json
document.getElementById('export').addEventListener('click', async () => {

    if (trainingVideo == null || testVideo == null) {
        alert('SELECT BOTH VIDEOS')
        return
    }

    document.getElementById('export').disabled = true

    rectanglesTraining.forEach((element, index) => {
        if (element != null && element.width > 10 && element.height > 10)
            json += `{"videoGcsUri": "gs://objectron_bucket/replace_${type}", "temporal_bounding_box_annotations": [{"displayName": "${element.label}", "instance_id": "-1", "time_offset": "${element.frame.toFixed(6)}s", "xMin": "${remap(element.x, 0, document.getElementById('canvas').width, 0, 1).toFixed(6)}", "yMin": "${remap(element.y, 0, document.getElementById('canvas').height, 0, 1).toFixed(6)}", "xMax": "${(remap(element.x, 0, document.getElementById('canvas').width, 0, 1) + remap(element.width, 0, document.getElementById('canvas').width, 0, 1)).toFixed(6)}", "yMax": "${(remap(element.y, 0, document.getElementById('canvas').height, 0, 1) + remap(element.height, 0, document.getElementById('canvas').height, 0, 1)).toFixed(6)}"}], "dataItemResourceLabels": {"aiplatform.googleapis.com/ml_use": "${element.type}"}}\n`
    })

    rectanglesTest.forEach((element, index) => {
        if (element != null && element.width > 10 && element.height > 10)
            json += `{"videoGcsUri": "gs://objectron_bucket/replace_${type}", "temporal_bounding_box_annotations": [{"displayName": "${element.label}", "instance_id": "-1", "time_offset": "${element.frame.toFixed(6)}s", "xMin": "${remap(element.x, 0, document.getElementById('canvas').width, 0, 1).toFixed(6)}", "yMin": "${remap(element.y, 0, document.getElementById('canvas').height, 0, 1).toFixed(6)}", "xMax": "${(remap(element.x, 0, document.getElementById('canvas').width, 0, 1) + remap(element.width, 0, document.getElementById('canvas').width, 0, 1)).toFixed(6)}", "yMax": "${(remap(element.y, 0, document.getElementById('canvas').height, 0, 1) + remap(element.height, 0, document.getElementById('canvas').height, 0, 1)).toFixed(6)}"}], "dataItemResourceLabels": {"aiplatform.googleapis.com/ml_use": "${element.type}"}}\n`
    })

    const formData = new FormData()
    if (type == 'training') formData.append('trainingVideo', trainingVideo, trainingVideo.name)
    else if (type == 'test') formData.append('testVideo', testVideo, testVideo.name)
    formData.append('json', json)

    try {
        const response = await fetch('http://localhost:8080/uploadVideo', {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`)
    } catch (error) {
        console.error('Error during data submission:', error)
        // Additional error handling, such as displaying an error message to the user
    } finally {
        //document.getElementById('export').disabled = false
        location.reload()
    }

})

list.addEventListener('click', (e) => {
    list.querySelectorAll('#item').forEach((element) => element.classList.remove('mdc-deprecated-list-item--selected'))
    e.target.classList.add('mdc-deprecated-list-item--selected')
    selectedLabel = e.target.getElementsByTagName('span')[1].innerText.toUpperCase()
})

//add label
document.getElementById('addLabel').addEventListener('click', () => {

    if (document.getElementById('text-field-hero-input').value == '') return

    //list.innerHTML += '<li id="item" class="mdc-deprecated-list-item"><span class="mdc-deprecated-list-item__ripple"></span><span class="mdc-deprecated-list-item__text">' + document.getElementById('text-field-hero-input').value.toUpperCase() + '</span></li>'

    const listItem = document.createElement('li')
    listItem.id = 'item'
    listItem.classList.add('mdc-deprecated-list-item')

    const rippleSpan = document.createElement('span')
    rippleSpan.classList.add('mdc-deprecated-list-item__ripple')

    const textSpan = document.createElement('span')
    textSpan.classList.add('mdc-deprecated-list-item__text')
    textSpan.textContent = document.getElementById('text-field-hero-input').value.toUpperCase()

    listItem.appendChild(rippleSpan)
    listItem.appendChild(textSpan)
    list.appendChild(listItem)

    document.getElementById('removeLabel').disabled = false
    document.getElementById('export').disabled = false

    if (list.getElementsByTagName('li').length == 1) {
        list.getElementsByTagName('li')[0].classList.add('mdc-deprecated-list-item--selected')
        selectedLabel = list.getElementsByTagName('li')[0].getElementsByTagName('span')[1].innerText.toUpperCase()
    }

    document.getElementById('text-field-hero-input').value = ''
})

//remove label
document.getElementById('removeLabel').addEventListener('click', () => {

    for (const element of list.children) {

        if (element.classList.contains('mdc-deprecated-list-item--selected')) {

            if (type == 'training')
                rectanglesTraining.forEach((element2, index) => element2.label == element.getElementsByTagName('span')[1].innerText.toUpperCase() ? rectanglesTraining.splice(index, 1) : null)
            else if (type == 'test')
                rectanglesTest.forEach((element2, index) => element2.label == element.getElementsByTagName('span')[1].innerText.toUpperCase() ? rectanglesTest.splice(index, 1) : null)

            list.removeChild(element)

            break

        }
    }

    if (list.getElementsByTagName('li').length > 0) {
        list.getElementsByTagName('li')[0].classList.add('mdc-deprecated-list-item--selected')
        selectedLabel = list.getElementsByTagName('li')[0].getElementsByTagName('span')[1].innerText.toUpperCase()
    } else {
        document.getElementById('removeLabel').disabled = true
        document.getElementById('export').disabled = true
    }
})

//show frame
function drawFrame() {

    if (type == 'training') {

        console.log(trainingVideoElement)
        console.log(trainingVideo)

        document.getElementById('frameCount').innerHTML = currentSecond + 1 + '/' + Math.round(trainingVideo.duration * fps) + ' (' + fps + 'fps)'
        trainingVideo.currentTime = currentSecond / fps  // Convert frame number to time and move slider
        ctx.drawImage(trainingVideoElement, startX, startY, drawWidth, drawHeight)

        for (const rect of rectanglesTraining)
            if (rect.frame == currentSecond / fps && rect != null) {
                ctx.lineJoin = 'round'
                ctx.lineWidth = 1
                ctx.strokeStyle = 'lightblue'
                ctx.font = '16px Courier'
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
                ctx.strokeText(rect.label, rect.x + rect.width + 2, rect.y + rect.height - 5)
            }

    } else if (type == 'test') {

        document.getElementById('frameCount').innerHTML = currentSecond + 1 + '/' + Math.round(testVideo.duration * fps) + ' (' + fps + 'fps)'
        testVideo.currentTime = currentSecond / fps  // Convert frame number to time and move slider
        ctx.drawImage(testVideoElement, startX, startY, drawWidth, drawHeight)

        for (const rect of rectanglesTest)
            if (rect.frame == currentSecond / fps && rect != null) {
                ctx.lineJoin = 'round'
                ctx.lineWidth = 1
                ctx.strokeStyle = 'lightblue'
                ctx.font = '16px Courier'
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
                ctx.strokeText(rect.label, rect.x + rect.width + 2, rect.y + rect.height - 5)
            }

    }
}

// prev frame
function previousFrame() {

    if (currentSecond > 0) {

        currentSecond -= 1

        if (type == 'training') {
            trainingVideo.currentTime = currentSecond / fps
            trainingVideo.dispatchEvent(new Event('seeked'))
        } else if (type == 'test') {
            testVideo.currentTime = currentSecond / fps
            testVideo.dispatchEvent(new Event('seeked'))
        }

    }

}

//next frame
function nextFrame() {

    if (currentSecond < (type == 'training' ? trainingVideo.duration : testVideo.duration) * 30) {  // Approximate number of frames assuming 30fps

        currentSecond += 1

        if (type == 'training') {
            trainingVideo.currentTime = currentSecond / fps
            trainingVideo.dispatchEvent(new Event('seeked'))
        } else if (type == 'test') {
            testVideo.currentTime = currentSecond / fps
            testVideo.dispatchEvent(new Event('seeked'))
        }

    }

}

//reset
function resetFrame() {
    if (type == 'training') rectanglesTraining[currentSecond] = null
    else if (type == 'test') rectanglesTest[currentSecond] = null
    video.dispatchEvent(new Event('seeked'))
}

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
}