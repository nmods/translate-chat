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
    1.8 (by NMods)<br>
    - removed useless dependencies<br>
    - using simple request now<br>
    - actually works<br>
    1.7 (by NMods)<br>
    - changed google translate api (old one didnt work anymore)<br>
    - disabled in global channels<br>
    - additional transliteration if google produces shit results<br>
    - added ~10 languages<br>
    - update S_CHAT and S_WHISPER to 3<br>
    1.6 (by NMods)<br>
    - added transliteration (you can now translate yourself to for example Japanese and it will show in chat)<br>
    - added ~40 languages<br>
    - code changes<br>
    - qol changes<br>
    - config changes<br>
    1.5 (by Haku)<br>
    - Added Send Mode<br>
    1.4 (by Haku)<br>
    - Autoupdate + new commands<br>
    1.3<br>
    - Renamed dependencies folder into node_modules<br>
    1.2<br>
    - Fix: Whispers and private chat not working.<br>
    1.1<br>
    - included missing dependencies<br>
    - removed trailing whitespaces which was causing unnecessary messages being received.<br>
    1.0<br>
    - initial release<br>

</details>

# Credits
- Original mod by teralove and Hakuryuudom

---

![Screenshot](https://i.imgur.com/0PoWcTD.png)
![Screenshot](https://i.imgur.com/Sxm8Uy8.png)