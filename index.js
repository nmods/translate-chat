'use strict'

//const lang = ['af', 'sq', 'ar', 'az', 'eu', 'bn', 'be', 'bg', 'ca', 'zh-CN', 'zh-TW', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'iw', 'hi', 'hu', 'is', 'id', 'ga', 'it', 'ja', 'kn', 'ko', 'la', 'lv', 'lt', 'mk', 'ms', 'mt', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sw', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'cy', 'yi', 'any']
const path = require('path');
const fs = require('fs');
const lang = {
    af: 'Afrikaans',
    sq: 'Albanian',
    am: 'Amharic',
    ar: 'Arabic',
    hy: 'Armenian',
    az: 'Azeerbaijani',
    eu: 'Basque',
    be: 'Belarusian',
    bn: 'Bengali',
    bs: 'Bosnian',
    bg: 'Bulgarian',
    ca: 'Catalan',
    ceb: 'Cebuano',
    'zh-CN': 'Chinese (Simplified)',
    'zh': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    co: 'Corsican',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    nl: 'Dutch',
    en: 'English',
    eo: 'Esperanto',
    et: 'Estonian',
    fi: 'Finnish',
    fr: 'French',
    fy: 'Frisian',
    gl: 'Galician',
    ka: 'Georgian',
    de: 'German',
    el: 'Greek',
    gu: 'Gujarati',
    ht: 'Haitian Creole',
    ha: 'Hausa',
    haw: 'Hawaiian',
    he: 'Hebrew',
    iw: 'Hebrew',
    hi: 'Hindi',
    hmn: 'Hmong',
    hu: 'Hungarian',
    is: 'Icelandic',
    ig: 'Igbo',
    id: 'Indonesian',
    ga: 'Irish',
    it: 'Italian',
    ja: 'Japanese',
    jw: 'Javanese',
    kn: 'Kannada',
    kk: 'Kazakh',
    km: 'Khmer',
    ko: 'Korean',
    ku: 'Kurdish',
    ky: 'Kyrgyz',
    lo: 'Lao',
    la: 'Latin',
    lv: 'Latvian',
    lt: 'Lithuanian',
    lb: 'Luxembourgish',
    mk: 'Macedonian',
    mg: 'Malagasy',
    ms: 'Malay',
    ml: 'Malayalam',
    mt: 'Maltese',
    mi: 'Maori',
    mr: 'Marathi',
    mn: 'Mongolian',
    my: 'Myanmar (Burmese)',
    ne: 'Nepali',
    no: 'Norwegian',
    ny: 'Nyanja (Chichewa)',
    ps: 'Pashto',
    fa: 'Persian',
    pl: 'Polish',
    pt: 'Portuguese, Brazilian',
    pa: 'Punjabi',
    ro: 'Romanian',
    ru: 'Russian',
    sm: 'Samoan',
    gd: 'Scots Gaelic',
    sr: 'Serbian',
    st: 'Sesotho',
    sn: 'Shona',
    sd: 'Sindhi',
    si: 'Sinhala (Sinhalese)',
    sk: 'Slovak',
    sl: 'Slovenian',
    so: 'Somali',
    es: 'Spanish',
    su: 'Sundanese',
    sw: 'Swahili',
    sv: 'Swedish',
    tl: 'Tagalog (Filipino)',
    tg: 'Tajik',
    ta: 'Tamil',
    te: 'Telugu',
    th: 'Thai',
    tr: 'Turkish',
    uk: 'Ukrainian',
    ur: 'Urdu',
    uz: 'Uzbek',
    vi: 'Vietnamese',
    cy: 'Welsh',
    xh: 'Xhosa',
    yi: 'Yiddish',
    yo: 'Yoruba',
    zu: 'Zulu',
    any: 'Any'
}

module.exports = function TranslateChat(mod) {
    const translate = require('node-google-translate-skidz');
    const latinize = require('latinize');
    const config = require('./config.json')

    mod.game.on('leave_loading_screen', leaveLoadingScreen)

    function leaveLoadingScreen() {
        if (config.sendMode) {
            mod.command.message('Send Mode Enabled. Translating outgoing messages to ' + langName(config.sendLang) + '.')
            mod.command.message('Use "/8 translate send off" to disable it.')
        }
    }

    mod.hook('S_CHAT', 2, { order: 100 }, (event) => {
        if (!config.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        if (/@social/.test(event.message)) return;

        getTranslation(event, config.targetLang, function (query) {
            if (query != undefined) {
                mod.send('S_CHAT', 2, Object.assign({}, event, { message: query.translation, authorName: event.authorName + getNiceLangString(query) }));
            }
        });
    });

    mod.hook('S_WHISPER', 2, { order: 100 }, (event) => {
        if (!config.enabled) return;
        if (event.authorName === mod.game.me.name) return;

        getTranslation(event, config.targetLang, function (query) {
            if (query != undefined) {
                mod.send('S_WHISPER', 2, Object.assign({}, event, { message: query.translation, authorName: event.authorName + getNiceLangString(query) }));
            }
        });
    });

    mod.hook('S_PRIVATE_CHAT', 1, { order: 100 }, (event) => {
        if (!config.enabled) return;
        if (event.authorName === mod.game.me.name) return;

        getTranslation(event, config.targetLang, function (query) {
            if (query != undefined) {
                mod.send('S_PRIVATE_CHAT', 1, Object.assign({}, event, { message: query.translation, authorName: event.authorName + getNiceLangString(query) }));
            }
        });
    });

    mod.hook('C_WHISPER', 1, event => {
        event.target = event.target.replace(/\(.*/, '').replace(/\s+$/, '')
        if (config.sendMode) {
            getTranslation(event, config.sendLang, function (query) {

                if (query != undefined) {
                    if (mod.region === 'na') {
                        query.translation = latinize(query.translation).replace(/[^\x00-\x7F]/g, "").replace(/\s+$/, '')
                    }
                    let original = config.sendMore ? ' (' + query.sentences[0].orig + ')' : ''
                    mod.send('C_WHISPER', 1, Object.assign({}, event, {
                        message: '<FONT>' + query.translation + original + '</FONT>',
                        target: event.target.replace(/\(.*/, '').replace(/\s+$/, '')
                    }))
                    mod.command.message('Original message' + getNiceLangString(query) + ': ' + event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''))
                } else {
                    mod.send('C_WHISPER', 1, event);
                }
            })
            return false;
        }
        return true;
    })

    mod.hook('C_CHAT', 1, event => {
        if (config.sendMode) {
            if (/@social/.test(event.message)) return undefined
            getTranslation(event, config.sendLang, function (query) {
                if (query != undefined) {
                    if (mod.region === 'na') {
                        query.translation = latinize(query.translation).replace(/[^\x00-\x7F]/g, "").replace(/\s+$/, '')
                    }
                    let original = config.sendMore ? ' (' + query.sentences[0].orig + ')' : ''
                    mod.send('C_CHAT', 1, Object.assign({}, event, { message: '<FONT>' + query.translation + original + '</FONT>' }))
                    mod.command.message('Original message' + getNiceLangString(query) + ': ' + event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''))
                } else {
                    mod.send('C_CHAT', 1, event);
                }
            })
            return false;
        }
    })

    mod.hook('C_ASK_INTERACTIVE', 2, event => {
        let replaced = event.name.replace(/\(.*/, '')
        if (replaced == event.name) return
        event.name = replaced
        return true
    })

    function getNiceLangString(query) {
        let niceName = lang[query.ld_result.srclangs[0]]
        if (!niceName) console.log(query)
        return ' (' + niceName + ')'
    }

    function langName(arg) {
        return lang[arg] + ' (' + arg + ')'
    }

    function getTranslation(event, toLang, callback) {
        let sanitized = event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, '');
        if (sanitized === '') {
            callback(undefined);
        } else {
            translate({
                text: sanitized,
                source: config.sourceLang,
                target: toLang
            }, function (result) {
                //console.log(result)
                try {
                    if (result.translation !== sanitized && result.ld_result.srclangs[0] !== toLang) {
                        if (result.sentences[1] && result.sentences[1].translit) {
                            result.translation = result.sentences[1].translit
                        }
                        if (result.translation != '') callback(result)
                        else mod.command.message('Error: Your message could not be sent because it contains illegal characters.')
                    } else {
                        callback(undefined);
                    }
                } catch (error) {
                    console.log(error)
                    console.log(result)
                }
            });
        }
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
                    mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
                }
                break
            case 'target':
                if (!args[1]) {
                    mod.command.message('Target Language: ' + langName(config.targetLang) + '.')
                    return
                }
                if (args[1] === 'any') {
                    mod.command.message('Error: Target Language cannot be any.')
                    return
                }
                langCode = getLanguageCode(args.slice(1).join(' '))
                if (langCode) {
                    config.targetLang = langCode;
                    mod.command.message('Target Language set to: ' + langName(config.targetLang) + '.')
                } else {
                    mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
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
                    mod.command.message('Now translating outgoing messages to: ' + langName(config.sendLang) + '.')
                } else {
                    mod.command.message('Error : ' + args.slice(1).join(' ') + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
                }
                break
            case 'list':
                mod.send("S_SHOW_AWESOMIUMWEB_SHOP", 1, {
                    link: 'https://pastebin.com/raw/fe0ZQynE'
                });
                break
            default:
                mod.command.message('Error: Invalid command')
                return
        }
        saveConfig()
    });

    function getLanguageCode(arg) {
        if (Object.keys(lang).includes(arg.toLowerCase())) return arg.toLowerCase()
        let index = Object.values(lang).findIndex(value => value.toLowerCase() == arg.toLowerCase())
        if (index != -1) return Object.keys(lang)[index]
        return undefined
    }

    function saveConfig() {
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(
            config, null, 4), err => {
                //console.log('[Translate-chat] - Config file generated');
            });
    }

    this.destructor = () => { //for reloading purposes
        mod.command.remove('translate');
        mod.game.removeListener('leave_loading_screen', leaveLoadingScreen)
    };
}