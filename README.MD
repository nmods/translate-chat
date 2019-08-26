# translate-chat
translates incoming chat text into another language<br />
NMods's version, see original here: https://github.com/teralove/translate-chat

# Requires Caali's proxy
- https://discord.gg/maqBmJV

## Info
- Default is translate text into English.
- Uses Google Translate, so don't expect the translations to be 100% accurate.
- Use language codes to set ('en' = English, 'es' = Spanish, etc.) [Click here](https://pastebin.com/raw/fe0ZQynE) for list of codes.
  - You can also set by language name (english, spanish, french, etc.)
- The in-game font may not support characters for all languages.
- Translations take a second to process so if chat is getting spammed then incoming translated text may be out of order.

## Usage
### `translate`
- Toggle off/on
- Default is on

### `translate source (language)`
- sets the source language. Default: any

### `translate target (language)`
- sets the target language. Default: en

### `translate send (language)`
- Use this to translate outgoing messages into another language.

#### `translate send more`
- Toggle showing original message after translated one. Default: disabled

### `translate list`
- Open list of available languages

## Changelog
<details>
    1.7 (by NMods)
    - changed google translate api (old one didnt work anymore)
    - disabled in global channels
    - additional transliteration if google produces shit results
    - added ~10 languages
    - update S_CHAT and S_WHISPER to 3
    1.6 (by NMods)
    - added transliteration (you can now translate yourself to for example Japanese and it will show in chat)
    - added ~40 languages
    - code changes
    - qol changes
    - config changes
    1.5 (by Haku)
    - Added Send Mode
    1.4 (by Haku)
    - Autoupdate + new commands
    1.3
    - Renamed dependencies folder into node_modules
    1.2
    - Fix: Whispers and private chat not working.
    1.1
    - included missing dependencies
    - removed trailing whitespaces which was causing unnecessary messages being received.
    1.0
    - initial release

</details>

# Credits
- Original mod by teralove and Hakuryuudom

---

![Screenshot](https://i.imgur.com/0PoWcTD.png)
![Screenshot](https://i.imgur.com/Sxm8Uy8.png)