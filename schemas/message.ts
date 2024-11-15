// this will be worked in the future, for now we will use a library called 'whatsapp-api-js' for speed up the development

import { z } from 'zod'

// base message properties
const BaseMessage = z.object({
  messaging_product: z.literal('whatsapp'),
  recipient_type: z.enum(['individual']).optional(),
  to: z.string(),
  context: z
    .object({
      message_id: z.string().optional()
    })
    .optional()
})

//  text message properties
const TextObject = z.object({
  body: z
    .string()
    .max(4096)
    .describe(
      'The text of the text message that can contain URLs and supports formatting'
    ),
  preview_url: z
    .boolean()
    .optional()
    .describe(
      'By default, WhatsApp recognizes URLs and makes them clickable, but you can also include a preview box with more information about the link. Set this field to true if you want to include a URL preview box. Default is false.'
    )
})
export const TextMessage = BaseMessage.extend({
  type: z.literal('text'),
  text: TextObject
})

// template message properties
const TextParameterObject = z.object({
  type: z.literal('text'),
  text: z.string().max(1024)
})

const CurrencyObject = z.object({
  fallback_value: z
    .string()
    .describe('The default text if localization fails.'),
  code: z.string().length(3), // ISO 4217 currency codes are 3 letters
  amount_1000: z
    .number()
    .int()
    .describe(
      'The amount multiplied by 1000. For example, 1.23 USD is represented as 1230.'
    )
})
const CurrencyParameterObject = z.object({
  type: z.literal('currency'),
  currency: CurrencyObject
})

const DateTimeObject = z.object({
  fallback_value: z
    .string()
    .describe('The default text if localization fails.'),
  day_of_week: z
    .union([
      z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
      ]),
      z.number().min(1).max(7)
    ])
    .optional(),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  day_of_month: z.number().int().min(1).max(31).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  calendar: z.enum(['GREGORIAN', 'SOLAR_HIJRI']).optional()
})
const DateTimeParameterObject = z.object({
  type: z.literal('date_time'),
  date_time: DateTimeObject
})

const MediaObject = z
  .object({
    id: z.string().optional(),
    link: z.string().url().optional(),
    caption: z
      .string()
      .optional()
      .describe(
        'The caption of the media file. Dont use it for audio or sticker media.'
      )
  })
  .refine((data) => data.id !== undefined || data.link !== undefined, {
    message: 'Either id or link must be provided'
  })
  .describe(
    'The ID of the media or the URL of the media file. The media file must be accessible to WhatsApp servers. Media files can be images, videos, audios, stickers or documents.'
  )

const ImageParameterObject = z.object({
  type: z.literal('image'),
  image: MediaObject
})
const DocumentParameterObject = z
  .object({
    type: z.literal('document'),
    document: MediaObject
  })
  .describe('Only PDFs are supported for media-based message templates.')

const ParameterObject = z.union([
  TextParameterObject,
  CurrencyParameterObject,
  DateTimeParameterObject,
  ImageParameterObject,
  DocumentParameterObject
])

const ButtonComponentObject = z.object({
  type: z.literal('button'),
  sub_type: z.enum(['quick_reply', 'url']),
  index: z
    .string()
    .min(0)
    .max(2)
    .describe('The index of the button a list of buttons.'),
  parameters: ParameterObject.array()
})

const HeaderComponentObject = z.object({
  type: z.literal('header'),
  parameters: ParameterObject.array().optional()
})
const BodyComponentObject = z.object({
  type: z.literal('body'),
  parameters: ParameterObject.array().optional()
})

const ComponentObject = z.union([
  ButtonComponentObject,
  HeaderComponentObject,
  BodyComponentObject
])

const LanguageObject = z.object({
  policy: z.enum(['deterministic']).optional(),
  code: z
    .enum([
      'af',
      'sq',
      'ar',
      'az',
      'bn',
      'bg',
      'ca',
      'zh_CN',
      'zh_HK',
      'zh_TW',
      'hr',
      'cs',
      'da',
      'nl',
      'en',
      'en_US',
      'en_GB',
      'en_LA',
      'et',
      'fil',
      'fi',
      'fr',
      'de',
      'el',
      'gu',
      'he',
      'hi',
      'hu',
      'id',
      'ga',
      'it',
      'ja',
      'kn',
      'kk',
      'ko',
      'lo',
      'lv',
      'lt',
      'mk',
      'ms',
      'mr',
      'nb',
      'fa',
      'pl',
      'pt_BR',
      'pt_PT',
      'pa',
      'ro',
      'ru',
      'sr',
      'sk',
      'sl',
      'es',
      'es_AR',
      'es_ES',
      'es_MX',
      'sw',
      'sv',
      'ta',
      'te',
      'th',
      'tr',
      'uk',
      'ur',
      'uz',
      'vi'
    ])
    .describe(
      "The code of the language or locale to use. This field accepts both language (for example, 'en') and language_locale (for example, 'en_US') formats. "
    )
})

const TemplateObject = z.object({
  name: z.string(),
  language: LanguageObject,
  components: ComponentObject.array().optional()
})

export const TemplateMessage = BaseMessage.extend({
  type: z.literal('template'),
  template: TemplateObject
})

// media messages

export const AudioMessage = BaseMessage.extend({
  type: z.literal('audio'),
  audio: MediaObject
})

export const DocumentMessage = BaseMessage.extend({
  type: z.literal('document'),
  document: MediaObject
})

export const ImageMessage = BaseMessage.extend({
  type: z.literal('image'),
  image: MediaObject
})

export const StickerMessage = BaseMessage.extend({
  type: z.literal('sticker'),
  sticker: MediaObject.describe(
    'Only static stickers are supported for third parties. They must be 512x512 pixels in size and cannot exceed 100KB. Animated stickers mst be 512x512 pixels in size and cannot exceed 500KB.'
  )
})

export const VideoMessage = BaseMessage.extend({
  type: z.literal('video'),
  video: MediaObject
})

// contact message

const AddressObject = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().length(2).optional(),
  type: z.enum(['HOME', 'WORK']).optional()
})

const EmailObject = z.object({
  email: z.string().email().optional(),
  type: z.enum(['HOME', 'WORK']).optional()
})

const NameObject = z
  .object({
    formatted_name: z.string().describe('The full name of the contact.'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    middle_name: z.string().optional(),
    suffix: z.string().optional(),
    prefix: z.string().optional()
  })
  .refine(
    (data) => {
      const { first_name, last_name, middle_name, suffix, prefix } = data
      return [first_name, last_name, middle_name, suffix, prefix].some(
        (field) => field !== undefined
      )
    },
    {
      message:
        'At least one optional field must be included along with formatted_name'
    }
  )

const OrgObject = z.object({
  company: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional()
})

const PhoneObject = z.object({
  phone: z
    .string()
    .optional()
    .describe(
      'Automatically populated with the wa_id value as a phone number if not provided.'
    ),
  type: z.enum(['CELL', 'MAIN', 'IPHONE', 'HOME', 'WORK']).optional(),
  wa_id: z.string().optional()
})

const UrlObject = z.object({
  url: z.string().url().optional(),
  type: z.enum(['HOME', 'WORK']).optional()
})

const ContactObject = z.object({
  addresses: z.array(AddressObject).optional(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  emails: z.array(EmailObject).optional(),
  name: NameObject,
  org: OrgObject.optional(),
  phones: z.array(PhoneObject).optional(),
  urls: z.array(UrlObject).optional()
})

export const ContactMessage = BaseMessage.extend({
  type: z.literal('contacts'),
  contact: ContactObject
})

// location message

const LocationObject = z.object({
  longitude: z.string().regex(/^-?([1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/),
  latitude: z.string().regex(/^-?([1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/),
  name: z.string().optional(),
  address: z.string().optional().describe('Only displayed if name is provided.')
})

export const LocationMessage = BaseMessage.extend({
  type: z.literal('location'),
  location: LocationObject
})

// reaction message

const ReactionObject = z.object({
  message_id: z.string(),
  emoji: z
    .string()
    .max(1)
    .describe('Send this as an empty string to remove the reaction.')
})
export const ReactionMessage = BaseMessage.extend({
  type: z.literal('reaction'),
  reaction: ReactionObject
})

// interactive message

const InteractiveHeaderTextObject = z.object({
  type: z.literal('text'),
  text: z.string().max(60).describe('Allows emojis but not markdown.')
})
const InteractiveHeaderImageObject = z.object({
  type: z.literal('image'),
  image: MediaObject
})
const InteractiveHeaderDocumentObject = z.object({
  type: z.literal('document'),
  document: MediaObject
})
const InteractiveHeaderVideoObject = z.object({
  type: z.literal('video'),
  video: MediaObject
})

const InteractiveBodyObject = z.object({
  text: z.string().max(1024).describe('Allows emojis AND markdown.')
})

const InteractiveFooterObject = z.object({
  text: z.string().max(60).describe('Allows emojis AND markdown.')
})

const ButtonObject = z.object({
  id: z.string().max(256),
  title: z.string().max(20).describe('Doesnt support emojis nor markdown.'),
  type: z.literal('reply').optional()
})

const RowObject = z.object({
  id: z.string().max(200),
  title: z.string().max(24),
  description: z.string().max(72).optional()
})

const ProductObject = z.object({
  product_retailer_id: z.string()
})

const SectionObject = z
  .object({
    title: z
      .string()
      .max(24)
      .optional()
      .describe('Required if more than one section is used in message.'),
    rows: z.array(RowObject).optional().describe('Required for List messages.'),
    product_items: z
      .array(ProductObject)
      .optional()
      .describe('Required for MultiProduct messages.')
  })
  .refine(
    (data) =>
      (data.rows !== undefined && data.rows.length > 0) ||
      (data.product_items !== undefined && data.product_items.length > 0),
    {
      message: 'Either rows or product_items must be provided'
    }
  )

const InteractiveActionObject = z.object({
  button: z
    .string()
    .min(1)
    .max(20)
    .optional()
    .describe(
      'Content of the button. Doesnt allow emojis nor markdown. Required for List messages'
    ),
  buttons: z
    .array(ButtonObject)
    .max(3)
    .optional()
    .describe('Required for Reply Button messages.'),
  sections: z
    .array(SectionObject)
    .min(1)
    .max(10)
    .optional()
    .describe('Required for List messages and MultiProduct messages.'),
  catalog_id: z
    .string()
    .optional()
    .describe('Required for SingleProduct and MultiProduct messages.'),
  product_retailer_id: z
    .string()
    .optional()
    .describe('Required for SingleProduct and MultiProduct messages.')
})

const InteractiveListObject = z.object({
  type: z.literal('list'),
  header: InteractiveHeaderTextObject.optional(),
  body: InteractiveBodyObject,
  footer: InteractiveFooterObject.optional(),
  action: InteractiveActionObject.required({
    button: true,
    sections: true
  })
})

const InteractiveButtonObject = z.object({
  type: z.literal('button'),
  header: z
    .union([
      InteractiveHeaderTextObject,
      InteractiveHeaderImageObject,
      InteractiveHeaderDocumentObject,
      InteractiveHeaderVideoObject
    ])
    .optional(),
  body: InteractiveBodyObject,
  footer: InteractiveFooterObject.optional(),
  action: InteractiveActionObject.required({
    buttons: true
  })
})

const InteractiveProductObject = z.object({
  type: z.literal('product'),
  body: InteractiveBodyObject.optional(),
  footer: InteractiveFooterObject.optional(),
  action: InteractiveActionObject.required({
    catalog_id: true,
    product_retailer_id: true
  })
})

const InteractiveProductListObject = z.object({
  type: z.literal('product_list'),
  header: InteractiveHeaderTextObject,
  body: InteractiveBodyObject,
  footer: InteractiveFooterObject.optional(),
  action: InteractiveActionObject.required({
    sections: true,
    catalog_id: true,
    product_retailer_id: true
  })
})

const InteractiveObject = z.union([
  InteractiveListObject,
  InteractiveButtonObject,
  InteractiveProductObject,
  InteractiveProductListObject
])

export const InteractiveMessage = BaseMessage.extend({
  type: z.literal('interactive'),
  interactive: InteractiveObject
})

// message union
export const Message = z.union([
  TextMessage,
  TemplateMessage,
  AudioMessage,
  DocumentMessage,
  ImageMessage,
  StickerMessage,
  VideoMessage,
  ContactMessage,
  LocationMessage,
  ReactionMessage,
  InteractiveMessage
])
