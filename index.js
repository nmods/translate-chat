'use strict'
const path = require('path');
const fs = require('fs');
const request = require('node-fetch');
const lang = {
	'auto': 'Automatic',
	'af': 'Afrikaans',
	'sq': 'Albanian',
	'am': 'Amharic',
	'ar': 'Arabic',
	'hy': 'Armenian',
	'az': 'Azerbaijani',
	'eu': 'Basque',
	'be': 'Belarusian',
	'bn': 'Bengali',
	'bs': 'Bosnian',
	'bg': 'Bulgarian',
	'ca': 'Catalan',
	'ceb': 'Cebuano',
	'ny': 'Chichewa',
	'zh-CN': 'Chinese (Simplified)',
	'zh-TW': 'Chinese (Traditional)',
	'co': 'Corsican',
	'hr': 'Croatian',
	'cs': 'Czech',
	'da': 'Danish',
	'nl': 'Dutch',
	'en': 'English',
	'eo': 'Esperanto',
	'et': 'Estonian',
	'tl': 'Filipino',
	'fi': 'Finnish',
	'fr': 'French',
	'fy': 'Frisian',
	'gl': 'Galician',
	'ka': 'Georgian',
	'de': 'German',
	'el': 'Greek',
	'gu': 'Gujarati',
	'ht': 'Haitian Creole',
	'ha': 'Hausa',
	'haw': 'Hawaiian',
	'he': 'Hebrew',
	'iw': 'Hebrew',
	'hi': 'Hindi',
	'hmn': 'Hmong',
	'hu': 'Hungarian',
	'is': 'Icelandic',
	'ig': 'Igbo',
	'id': 'Indonesian',
	'ga': 'Irish',
	'it': 'Italian',
	'ja': 'Japanese',
	'jw': 'Javanese',
	'kn': 'Kannada',
	'kk': 'Kazakh',
	'km': 'Khmer',
	'ko': 'Korean',
	'ku': 'Kurdish (Kurmanji)',
	'ky': 'Kyrgyz',
	'lo': 'Lao',
	'la': 'Latin',
	'lv': 'Latvian',
	'lt': 'Lithuanian',
	'lb': 'Luxembourgish',
	'mk': 'Macedonian',
	'mg': 'Malagasy',
	'ms': 'Malay',
	'ml': 'Malayalam',
	'mt': 'Maltese',
	'mi': 'Maori',
	'mr': 'Marathi',
	'mn': 'Mongolian',
	'my': 'Myanmar (Burmese)',
	'ne': 'Nepali',
	'no': 'Norwegian',
	'ps': 'Pashto',
	'fa': 'Persian',
	'pl': 'Polish',
	'pt': 'Portuguese',
	'pa': 'Punjabi',
	'ro': 'Romanian',
	'ru': 'Russian',
	'sm': 'Samoan',
	'gd': 'Scots Gaelic',
	'sr': 'Serbian',
	'st': 'Sesotho',
	'sn': 'Shona',
	'sd': 'Sindhi',
	'si': 'Sinhala',
	'sk': 'Slovak',
	'sl': 'Slovenian',
	'so': 'Somali',
	'es': 'Spanish',
	'su': 'Sundanese',
	'sw': 'Swahili',
	'sv': 'Swedish',
	'tg': 'Tajik',
	'ta': 'Tamil',
	'te': 'Telugu',
	'th': 'Thai',
	'tr': 'Turkish',
	'uk': 'Ukrainian',
	'ur': 'Urdu',
	'uz': 'Uzbek',
	'vi': 'Vietnamese',
	'cy': 'Welsh',
	'xh': 'Xhosa',
	'yi': 'Yiddish',
	'yo': 'Yoruba',
	'zu': 'Zulu'
}

module.exports = function TranslateChat(mod) {
	const config = require('./config.json')
	const CHAT_SERVER_PACKETS = [['S_CHAT', 3], ['S_WHISPER', 3], ['S_PRIVATE_CHAT', 1]];
	const CHAT_CLIENT_PACKETS = [['C_WHISPER', 1], ['C_CHAT', 1]];

	mod.game.on('leave_loading_screen', leaveLoadingScreen)

	function leaveLoadingScreen() {
		if (config.sendMode) {
			mod.command.message('Send Mode Enabled. Translating outgoing messages to ' + langName(config.sendLang) + '.')
			mod.command.message('Use "/8 translate send off" to disable it.')
		}
	}

	const incoming = (packet, version, event) => {
		if (!config.enabled) return;
		if ([event.name, event.authorName].includes(mod.game.me.name)) return;
		if (mod.game.me.is(event.gameId)) return
		if (packet == 'S_CHAT') {
			//if ([27, 213, 214, 4, 3].includes(event.channel)) return; //exclude global channels (global, megaphone, guild adv, trade, area)
			if (/@social/.test(event.message)) return;
			if (/\bWT[BTS]\b/i.test(event.message)) return;
		}
		// console.log('incoming: ' + packet + ' ' + version)
		// console.log(event)
		translate(event.message, config.targetLang, result => {
			if (!result) return
			if (event.message.toLowerCase().replace(/\s/,'')==result.text.toLowerCase().replace(/\s/,'')) return
			event.message = result.text
			event.name = event.authorName = (event.name || event.authorName) + getNiceLangString(result.src)
			mod.send(packet, version, event)
		})
	}

	const outgoing = (packet, version, event) => {
		if (packet == 'C_WHISPER') {
			event.target = event.target.replace(/ \(.*/, '')
		}
		if (!config.sendMode) return true

		translate(event.message, config.sendLang, result => {
			if (!result && packet == 'C_WHISPER') {
				mod.send('C_WHISPER', version, event);
			}
			event.message = `<FONT>${result.text}</FONT>`
			if (config.sendMore) {
				event.message = `<FONT>${result.text} (${result.orig})</FONT>`
			}
			event.name += getNiceLangString(config.sendLang)
			mod.send(packet, version, event)
			setTimeout(() => {
				mod.command.message('Original message' + getNiceLangString(config.sendLang) + ': ' + result.orig.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''))
			}, 50);
		})
		return false
	}

	for (let [packet, version] of CHAT_SERVER_PACKETS) mod.hook(packet, version, { order: 100 }, event => incoming(packet, version, event))
	for (let [packet, version] of CHAT_CLIENT_PACKETS) mod.hook(packet, version, event => outgoing(packet, version, event))

	mod.hook('C_ASK_INTERACTIVE', 2, event => {
		let replaced = event.name.replace(/\(.*/, '')
		if (replaced == event.name) return
		event.name = replaced
		return true
	})

	function getNiceLangString(arg) {
		return ' (' + lang[arg] + ')'
	}

	function langName(arg) {
		return lang[arg] + ' (' + arg + ')'
	}

	function translate(message, toLang, cb) {
		let sanitized = message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, '');
		if (sanitized === '') return

		const params = new URLSearchParams();
		params.append('sl',config.sourceLang)
		params.append('tl',toLang)
		params.append('q',sanitized)
		const url = 'https://translate.google.com/translate_a/single'
			+ '?client=at&dt=t&dt=ld&dt=qca&dt=rm&dt=bd&dj=1&hl=' + toLang + '&ie=UTF-8'
			+ '&oe=UTF-8&inputm=2&otf=2&iid=1dd3b944-fa62-4b55-b330-74909a99969e'

		const options = {
			method: 'POST',
			encoding: 'UTF-8',
			body: params,
			json: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
				'User-Agent': 'AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1'
			}
		}
		request(url,options).then(res => res.json()).then(result => {
			result.text=''
			// console.log(result)
			if (result.sentences && result.src.toLowerCase() !== toLang.toLowerCase()) {
				for (let s of result.sentences) {
					if (s.trans && s.trans !== sanitized) {
						s.trans = s.trans[0].toUpperCase()+s.trans.substring(1)
						result.text += s.trans
					}
					if (s.translit && toLang!='ru') {
						result.text = s.translit
					}
				}
				if (!result.text) return
				result.orig = sanitized

				cb(result)
			}
		}).catch(e => {
			console.log(e)
			console.log(options)
		})
	}

	mod.command.add('translate', (...args) => {
		let langCode
		switch (args[0]) {
			case undefined:
				config.enabled = !config.enabled;
				mod.command.message('Module ' + (config.enabled ? 'Enabled' : 'Disabled'));
				break
			case 'source':
				if (!args[1]) {
					mod.command.message('Source Language: ' + langName(config.sourceLang) + '.')
					return
				}
				langCode = getLanguageCode(args.slice(1).join(' '))
				if (langCode) {
					config.sourceLang = langCode;
					mod.command.message('Source Language set to: ' + langName(config.sourceLang) + '.')
				} else {
					mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. Use command "translate list" for available languages')
				}
				break
			case 'target':
				if (!args[1]) {
					mod.command.message('Target Language: ' + langName(config.targetLang) + '.')
					return
				}
				if (['any', 'auto'].includes(args[1])) {
					mod.command.message('Error: Target Language cannot be any.')
					return
				}
				langCode = getLanguageCode(args.slice(1).join(' '))
				if (langCode) {
					config.targetLang = langCode;
					mod.command.message('Target Language set to: ' + langName(config.targetLang) + '.')
				} else {
					mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. Use command "translate list" for available languages')
				}
				break
			case 'send':
				if (!args[1]) {
					config.sendMode = !config.sendMode
					mod.command.message('Send Mode: ' + (config.sendMode ? ('enabled. Language: ' + langName(config.sendLang) + '.') : 'disabled.'))
					break
				} else if (args[1] === 'more') {
					config.sendMore = !config.sendMore
					mod.command.message('Sending original message along with translation: ' + (config.sendMore ? 'en' : 'dis') + 'abled.')
					break
				} else if (args[1] === 'off') {
					config.sendMode = false;
					mod.command.message('Send Mode Disabled.');
					break
				} else if (args[1] === 'on') {
					config.sendMode = true;
					mod.command.message('Send Mode Enabled. Now translating outgoing messages to ' + langName(config.sendLang) + '.')
					break
				}
				langCode = getLanguageCode(args.slice(1).join(' '))
				if (langCode) {
					config.sendMode = true;
					config.sendLang = langCode;
					mod.command.message('Now translating outgoing messages to: ' + langName(config.sendLang) + '. Send more is ' + (config.sendMore ? 'enabled.' : 'disabled.'))
				} else {
					mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
				}
				break
			case 'list':
				mod.send("S_SHOW_AWESOMIUMWEB_SHOP", 1, {
					link: 'https://pastebin.com/raw/5HZxiqyc'
				});
				break
			default:
				mod.command.message('Error: Invalid command')
				return
		}
		saveConfig()
	});

	function getLanguageCode(arg) {
		if (['zh', 'zh-cn'].includes(arg.toLowerCase())) return 'zh-CN'
		if (arg.toLowerCase() == 'zh-tw') return 'zh-TW'
		if (arg.toLowerCase() == 'any') return 'auto'
		if (Object.keys(lang).includes(arg.toLowerCase())) return arg.toLowerCase()
		let index = Object.values(lang).findIndex(value => value.toLowerCase() == arg.toLowerCase())
		if (index != -1) return Object.keys(lang)[index]
		return undefined
	}

	function saveConfig() {
		fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 4), err => { });
	}

	this.destructor = () => { //for reloading purposes
		mod.command.remove('translate');
		mod.game.removeListener('leave_loading_screen', leaveLoadingScreen)
	};
}