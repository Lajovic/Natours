const sharp = require('sharp')

exports.getDate = (milisecondsToAdd = 0) => {
	const localGMT = -3
	const dateFusoCorrigido = Date.now() + localGMT * 60 * 60 * 1000 + milisecondsToAdd // milisegundos para segundos, para minutos, para horas
	return new Date(dateFusoCorrigido)
}

exports.cropAndSaveJPEG = async (imageFile, destPathAndFileName, arrCropToSize) => {
	try {
		await sharp(imageFile)
			.resize(arrCropToSize[0], arrCropToSize[1])
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(destPathAndFileName)
	} catch (err) {
		console.error(err);
	}
}
