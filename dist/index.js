"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var ssml_split_1 = __importDefault(require("ssml-split"));
var CHARACTER_LIMIT = 5000; // https://cloud.google.com/text-to-speech/quotas
exports.synthesizeSpeechPromise = function (textToSpeechClient, ssmlPart, userRequestOptions) {
    return new Promise(function (resolve, reject) {
        var request = __assign({}, userRequestOptions, { input: {
                ssml: ssmlPart
            } });
        // console.log('Doing synthesizeSpeech...');
        return textToSpeechClient.synthesizeSpeech(request, function (err, response) {
            if (err)
                return reject(err);
            if (!(response.audioContent instanceof Buffer))
                return reject(new Error('Response from Google Text-to-Speech API is not a Buffer.'));
            // console.log('Got audioContent!');
            return resolve(response.audioContent);
        });
    });
};
exports.synthesize = function (textToSpeechClient, userRequestOptions) {
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var buffer, ssmlParts, synthesizeSpeechPromises, allAudioBuffers, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    buffer = null;
                    if (userRequestOptions.audioConfig.audioEncoding === 'AUDIO_ENCODING_UNSPECIFIED') {
                        throw new Error('Please specify an audioEncoding, like: MP3, LINEAR16, OGG_OPUS');
                    }
                    if (userRequestOptions.audioConfig.audioEncoding === 'LINEAR16') {
                        throw new Error('Package does not support LINEAR16 yet.');
                    }
                    if (userRequestOptions.audioConfig.audioEncoding === 'OGG_OPUS') {
                        throw new Error('Package does not support OGG_OPUS yet.');
                    }
                    ssmlParts = exports.splitSsml(userRequestOptions.input['ssml']);
                    console.log(ssmlParts);
                    synthesizeSpeechPromises = ssmlParts.map(function (ssmlPart) { return exports.synthesizeSpeechPromise(textToSpeechClient, ssmlPart, userRequestOptions); });
                    return [4 /*yield*/, Promise.all(synthesizeSpeechPromises)];
                case 1:
                    allAudioBuffers = _a.sent();
                    // console.log('All promises resolved.');
                    if (userRequestOptions.audioConfig.audioEncoding === 'MP3') {
                        // Concatenate the buffers into one buffer
                        buffer = Buffer.concat(allAudioBuffers, allAudioBuffers.reduce(function (len, a) { return len + a.length; }, 0));
                        // console.log('Concatenated the buffer.');
                    }
                    resolve(buffer);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    reject(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
};
exports.splitSsml = function (ssml) {
    var options = {
        synthesizer: 'google',
  softLimit: 4000,
  hardLimit: 5000, // Google Text to Speech API limitation
  breakParagraphsAboveHardLimit: true, 
    };
    try {
        const ssmlSplit = new ssml_split_1.SSMLSplit(options);
        var ssmlParts = ssmlSplit.split(ssml);
        console.log(ssmlParts);
        if (!ssmlParts || !ssmlParts.length)
            throw new Error('Got no SSML parts.');
        // Polly SSML split seems to sometimes return an empty "<speak></speak>"
        // We manually remove that from here
        var cleanSsmlParts = ssmlParts.filter(function (ssmlPart) {
            if (ssmlPart !== '<speak></speak>')
                return ssmlPart;
        });
        return cleanSsmlParts;
    }
    catch (err) {
        throw err;
    }
};
//# sourceMappingURL=index.js.map
