const whatsappNumber = '5493516653800'

const defaultWhatsappMessage =
  'Hola Felipe, quiero consultar por un plan de entrenamiento.'

export const createWhatsappUrl = (message = defaultWhatsappMessage) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

export const WHATSAPP_URL = createWhatsappUrl()

export const INSTAGRAM_URL = 'https://www.instagram.com/feliiferrer/'
