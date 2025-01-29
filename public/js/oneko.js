function initOneko() {
	// Check for reduced motion preference
	const isReducedMotion =
		window.matchMedia('(prefers-reduced-motion: reduce)').matches === true
	if (isReducedMotion) return

	const settings = JSON.parse(localStorage.getItem('settings'))

	if (settings && !settings.enableOneko) {
		return
	}

	const nekoEl = document.createElement('div')
	let nekoPosX = 32
	let nekoPosY = 32
	let mousePosX = 0
	let mousePosY = 0
	let frameCount = 0
	let idleTime = 0
	let idleAnimation = null
	let idleAnimationFrame = 0
	let isPetting = false
	let petTime = 0
	const nekoSpeed = 10

	const spriteSets = {
		idle: [[-3, -3]],
		alert: [[-7, -3]],
		scratchSelf: [
			[-5, 0],
			[-6, 0],
			[-7, 0],
		],
		scratchWallN: [
			[0, 0],
			[0, -1],
		],
		scratchWallS: [
			[-7, -1],
			[-6, -2],
		],
		scratchWallE: [
			[-2, -2],
			[-2, -3],
		],
		scratchWallW: [
			[-4, 0],
			[-4, -1],
		],
		tired: [[-3, -2]],
		sleeping: [
			[-2, 0],
			[-2, -1],
		],
		N: [
			[-1, -2],
			[-1, -3],
		],
		NE: [
			[0, -2],
			[0, -3],
		],
		E: [
			[-3, 0],
			[-3, -1],
		],
		SE: [
			[-5, -1],
			[-5, -2],
		],
		S: [
			[-6, -3],
			[-7, -2],
		],
		SW: [
			[-5, -3],
			[-6, -1],
		],
		W: [
			[-4, -2],
			[-4, -3],
		],
		NW: [
			[-1, 0],
			[-1, -1],
		],
		pet: [
			[-2, -1],
			[-2, 0],
		],
		happy: [
			[-3, -3],
			[-2, -1],
		],
	}

	function createHeart(x, y) {
		const heart = document.createElement('div')
		heart.innerHTML = '❤️'
		heart.style.position = 'fixed'
		heart.style.left = `${x}px`
		heart.style.top = `${y}px`
		heart.style.pointerEvents = 'none'
		heart.style.userSelect = 'none'
		heart.style.zIndex = '1000'
		heart.style.fontSize = '16px'
		heart.style.transition = 'all 1s ease-out'
		document.body.appendChild(heart)

		setTimeout(() => {
			heart.style.transform = `translate(${Math.random() * 40 - 20}px, -40px)`
			heart.style.opacity = '0'
		}, 50)

		setTimeout(() => heart.remove(), 1000)
	}

	function setSprite(name, frame) {
		const sprite = spriteSets[name][frame % spriteSets[name].length]
		nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`
	}

	function resetIdleAnimation() {
		idleAnimation = null
		idleAnimationFrame = 0
	}

	function handlePetting() {
		isPetting = true
		petTime = 0
		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				createHeart(
					nekoPosX - 8 + Math.random() * 32,
					nekoPosY - 16 + Math.random() * 32,
				)
			}, i * 100)
		}
	}

	function idle() {
		if (isPetting) {
			petTime += 1
			setSprite(petTime % 3 === 0 ? 'happy' : 'pet', frameCount)
			if (petTime > 20) {
				isPetting = false
				petTime = 0
			}
			return
		}

		idleTime += 1

		if (idleTime > 30 && idleAnimation == null) {
			idleAnimation = 'sleeping'
		}

		switch (idleAnimation) {
			case 'sleeping':
				if (idleAnimationFrame < 8) {
					setSprite('tired', 0)
					break
				}
				setSprite('sleeping', Math.floor(idleAnimationFrame / 4))
				break
			case 'scratchWallN':
			case 'scratchWallS':
			case 'scratchWallE':
			case 'scratchWallW':
			case 'scratchSelf':
				setSprite(idleAnimation, idleAnimationFrame)
				if (idleAnimationFrame > 9) {
					resetIdleAnimation()
				}
				break
			default:
				setSprite('idle', 0)
				return
		}
		idleAnimationFrame += 1
	}

	function getHeaderHeight() {
		const header = document.querySelector('.navbar')
		return header ? header.offsetHeight : 0
	}

	function frame() {
		frameCount += 1
		const diffX = nekoPosX - mousePosX
		const diffY = nekoPosY - mousePosY
		const distance = Math.sqrt(diffX ** 2 + diffY ** 2)

		if (distance < nekoSpeed || distance < 48) {
			idle()
			return
		}

		idleAnimation = null
		idleAnimationFrame = 0

		if (idleTime > 1) {
			setSprite('alert', 0)
			idleTime = Math.min(idleTime, 7)
			idleTime -= 1
			return
		}

		let direction = ''
		direction += diffY / distance > 0.5 ? 'N' : ''
		direction += diffY / distance < -0.5 ? 'S' : ''
		direction += diffX / distance > 0.5 ? 'W' : ''
		direction += diffX / distance < -0.5 ? 'E' : ''

		setSprite(direction, frameCount)

		nekoPosX -= (diffX / distance) * nekoSpeed
		nekoPosY -= (diffY / distance) * nekoSpeed

		const headerHeight = getHeaderHeight()
		nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16)
		nekoPosY = Math.min(
			Math.max(headerHeight + 16, nekoPosY),
			window.innerHeight - 16,
		)

		nekoEl.style.left = `${nekoPosX - 16}px`
		nekoEl.style.top = `${nekoPosY - 16}px`
	}

	// Initialize neko element
	nekoEl.id = 'oneko'
	nekoEl.style.width = '32px'
	nekoEl.style.height = '32px'
	nekoEl.style.position = 'fixed'
	nekoEl.style.pointerEvents = 'auto'
	nekoEl.style.cursor = 'pointer'
	nekoEl.style.backgroundImage = 'url(/images/oneko.gif)'
	nekoEl.style.imageRendering = 'pixelated'
	nekoEl.style.zIndex = '2000'
	nekoEl.style.left = `${nekoPosX - 16}px`
	nekoEl.style.top = `${nekoPosY - 16}px`

	nekoEl.addEventListener('click', handlePetting)
	document.body.appendChild(nekoEl)

	document.addEventListener('mousemove', (e) => {
		mousePosX = e.clientX
		mousePosY = e.clientY
	})

	let lastFrameTimestamp

	function onAnimationFrame(timestamp) {
		if (!nekoEl.isConnected) return

		if (!lastFrameTimestamp) {
			lastFrameTimestamp = timestamp
		}

		if (timestamp - lastFrameTimestamp > 100) {
			lastFrameTimestamp = timestamp
			frame()
		}

		window.requestAnimationFrame(onAnimationFrame)
	}

	window.requestAnimationFrame(onAnimationFrame)
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initOneko)