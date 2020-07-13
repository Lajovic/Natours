const multer = require('multer')
const { AppError } = require('../business/errorBusiness')
// const path = require('path')

// Para guardar no buffer de memória
const userPhotoStorage = multer.memoryStorage()

// Para guardar no HD diretamente
// const userPhotoStorage = multer.diskStorage({
// 	destination: path.resolve(__dirname, '..', 'public', 'img', 'users'), // null é um parâmetro de erro, para mais detalhes ver documentação do multer
// 	filename: (req, file, cb) => {
// 		const ext = file.mimetype.split('/')[1] // Exemplo de file.mimetype: image/jpeg
// 		const fullFileName = `user-${req.user.id}-${Date.now()}.${ext}`
// 		cb(null, fullFileName)
// 	},
// })

const filterByImage = (req, file, cb) => {
	if (!file.mimetype.startsWith('image'))
		return cb(new AppError('Not an image! Please upload only images.', 400), false)
	cb(null, true)
}
module.exports = multer({
	storage: userPhotoStorage,
	fileFilter: filterByImage,
})
