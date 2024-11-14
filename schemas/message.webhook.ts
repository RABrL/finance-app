import { z } from "zod";

const ServerContacts = z.object({
	profile: z.object({
		name: z.string().optional(),
	}),
	wa_id: z.string(),
});

const ServerError = z.object({
	code: z.number(),
	title: z.string(),
	message: z.string(),
	error_data: z.object({
		details: z.string(),
	}),
});

const ServerInitiation = z.enum([
	"authentication",
	"marketing",
	"utility",
	"service",
	"referral_conversion",
]);

const ServerConversation = z.object({
	id: z.string(),
	expiration_timestamp: z.string().optional(),
	origin: z.object({
		type: ServerInitiation,
	}),
});

const ServerPricing = z.object({
	pricing_model: z.literal("CBP"),
	billable: z.boolean().optional(),
	category: ServerInitiation,
});

const MetadataObject = z.object({
	display_phone_number: z.string(),
	phone_number_id: z.string(),
});

const BaseValueObject = z.object({
	messaging_product: z.literal("whatsapp"),
	metadata: MetadataObject,
});
// messages

// BaseMessage schema
const BaseMessage = z.object({
	from: z.string(),
	id: z.string(),
	timestamp: z.string(),
	context: z
		.object({
			forwarded: z.boolean().optional(),
			frequently_forwarded: z.boolean().optional(),
			from: z.string().optional(),
			id: z.string().optional(),
			referred_product: z
				.object({
					catalog_id: z.string(),
					product_retailer_id: z.string(),
				})
				.optional(),
		})
		.optional(),
	identity: z
		.object({
			acknowledged: z.boolean(),
			created_timestamp: z.string(),
			hash: z.string(),
		})
		.optional(),
	referral: z
		.object({
			source_url: z.string(),
			source_id: z.string(),
			source_type: z.enum(["ad", "post"]),
			headline: z.string(),
			body: z.string(),
			ctwa_clid: z.string(),
			media_type: z.enum(["image", "video"]),
		})
		.and(
			z.union([
				z.object({
					media_type: z.literal("image"),
					image_url: z.string(),
				}),
				z.object({
					media_type: z.literal("video"),
					video_url: z.string(),
					thumbnail_url: z.string(),
				}),
			]),
		)
		.optional(),
});

// Text Message
export const TextServerMessage = BaseMessage.extend({
	type: z.literal("text"),
	text: z.object({
		body: z.string(),
	}),
});

const ServerMediaObject = z.object({
	mime_type: z.string(),
	sha256: z.string(),
	id: z.string(),
	caption: z.string().optional(),
});

// Audio Message
const AudioServerMessage = BaseMessage.extend({
	type: z.literal("audio"),
	audio: ServerMediaObject,
});

// Document Message
const DocumentServerMessage = BaseMessage.extend({
	type: z.literal("document"),
	document: ServerMediaObject.extend({
		filename: z.string(),
	}),
});

// Image Message
const ImageServerMessage = BaseMessage.extend({
	type: z.literal("image"),
	image: ServerMediaObject,
});

// Sticker Message
const StickerServerMessage = BaseMessage.extend({
	type: z.literal("sticker"),
	sticker: ServerMediaObject.extend({
		animated: z.boolean().optional(),
	}),
});

// Video Message
const VideoServerMessage = BaseMessage.extend({
	type: z.literal("video"),
	video: ServerMediaObject,
});

// Location Message
const LocationServerMessage = BaseMessage.extend({
	type: z.literal("location"),
	location: z.object({
		latitude: z.string(),
		longitude: z.string(),
		name: z.string().optional(),
		address: z.string().optional(),
	}),
});

// Contacts Message
const ContactsServerMessage = BaseMessage.extend({
	type: z.literal("contacts"),
	contacts: z.array(
		z.object({
			addresses: z
				.array(
					z.object({
						city: z.string().optional(),
						country: z.string().optional(),
						country_code: z.string().optional(),
						state: z.string().optional(),
						street: z.string().optional(),
						type: z.string().optional(),
						zip: z.string().optional(),
					}),
				)
				.optional(),
			birthday: z.string().optional(),
			emails: z
				.array(
					z.object({
						email: z.string().optional(),
						type: z.string().optional(),
					}),
				)
				.optional(),
			name: z.object({
				formatted_name: z.string(),
				first_name: z.string().optional(),
				last_name: z.string().optional(),
				middle_name: z.string().optional(),
				suffix: z.string().optional(),
				prefix: z.string().optional(),
			}),
			org: z
				.object({
					company: z.string().optional(),
					department: z.string().optional(),
					title: z.string().optional(),
				})
				.optional(),
			phones: z
				.array(
					z.object({
						phone: z.string().optional(),
						wa_id: z.string().optional(),
						type: z.string().optional(),
					}),
				)
				.optional(),
			urls: z
				.array(
					z.object({
						url: z.string().optional(),
						type: z.string().optional(),
					}),
				)
				.optional(),
		}),
	),
});

// Button Message
const ButtonServerMessage = BaseMessage.extend({
	type: z.literal("button"),
	button: z.object({
		text: z.string(),
		payload: z.string(),
	}),
});

// Reaction Message
const ReactionServerMessage = BaseMessage.extend({
	type: z.literal("reaction"),
	reaction: z.object({
		emoji: z.string(),
		messsage_id: z.string(),
	}),
});

// Order Message
const OrderServerMessage = BaseMessage.extend({
	type: z.literal("order"),
	order: z.object({
		catalog_id: z.string(),
		product_items: z.array(
			z.object({
				product_retailer_id: z.string(),
				quantity: z.string(),
				item_price: z.string(),
				currency: z.string(),
			}),
		),
		text: z.string().optional(),
	}),
});

// System Message
const SystemServerMessage = BaseMessage.extend({
	type: z.literal("system"),
	system: z.object({
		body: z.string(),
		new_wa_id: z.union([z.number(), z.string()]),
		type: z.enum(["user_changed_number", "user_identity_changed"]),
	}),
});

// Request Welcome Message
const RequestWelcomeServerMessage = BaseMessage.extend({
	type: z.literal("request_welcome"),
});

// Unknown Message
const UnknownServerMessage = BaseMessage.extend({
	type: z.literal("unknown"),
	errors: z.array(
		z.object({
			code: z.number(),
			details: z.literal("Message type is not currently supported"),
			title: z.literal("Unsupported message type"),
		}),
	),
});

// Interactive Message
const InteractiveServerMessage = BaseMessage.extend({
	type: z.literal("interactive"),
	interactive: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("button_reply"),
			button_reply: z.object({
				id: z.string(),
				title: z.string(),
			}),
		}),
		z.object({
			type: z.literal("list_reply"),
			list_reply: z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
			}),
		}),
		z.object({
			type: z.literal("nfm_reply"),
			nfm_reply: z.union([
				z.object({
					name: z.literal("address_message"),
					body: z.string().optional(),
					response_json: z.unknown(),
				}),
				z.object({
					name: z.literal("flow"),
					body: z.literal("Sent"),
					response_json: z.unknown(),
				}),
				z.object({
					name: z.string().optional(),
					body: z.string().optional(),
					response_json: z.unknown(),
				}),
			]),
		}),
	]),
});

// ServerMessage schema (union of all message types)
export const ServerMessage = z.discriminatedUnion("type", [
	TextServerMessage,
	AudioServerMessage,
	DocumentServerMessage,
	ImageServerMessage,
	StickerServerMessage,
	VideoServerMessage,
	LocationServerMessage,
	ContactsServerMessage,
	ButtonServerMessage,
	ReactionServerMessage,
	OrderServerMessage,
	SystemServerMessage,
	RequestWelcomeServerMessage,
	InteractiveServerMessage,
	UnknownServerMessage,
]);

// messages

const MessagesValueObject = BaseValueObject.extend({
	messages: z.array(ServerMessage),
	contacts: z.array(ServerContacts).optional(),
});

const BaseStatusUpdate = z.object({
	status: z.enum(["sent", "delivered", "read", "failed"]),
	id: z.string(),
	timestamp: z.string(),
	recipient_id: z.string(),
	biz_opaque_callback_data: z.string().optional(),
});
const ConversationStatusUpdate = BaseStatusUpdate.extend({
	conversation: ServerConversation.optional(),
	pricing: ServerPricing.optional(),
});
const ErrorsStatusUpdate = BaseStatusUpdate.extend({
	errors: z.array(ServerError).optional(),
});
const StatusesValueObject = BaseValueObject.extend({
	statuses: z.array(z.union([ConversationStatusUpdate, ErrorsStatusUpdate])),
});

const ValueObject = MessagesValueObject.or(StatusesValueObject);

const ChangeObject = z.object({
	field: z.literal("messages"),
	value: ValueObject,
});

const EntryObject = z.object({
	id: z.string(),
	changes: z.array(ChangeObject),
});

export const WebhookMessageRequestBody = z.object({
	object: z.literal("whatsapp_business_account"),
	entry: z.array(EntryObject),
});
