TTS gateway
===

###API use:
 1. port: 3001
 2. path: /api/parse
 3. query parameters:

|key|value|    
|:---|---|
|text|`required` URL encoded text.|
|askId|`optional` Your tts key|
|service|`optional` 'acapela' for premium tts| 
|voice|`optional` the premium tts voice see: http://www.acapela-vaas.com/ReleasedDocumentation/voices_list.php|

###Eve use

 1. port: `3000`
 2. path: `agents/ttsAgent`
 3. Post request 
  4. header: `Content-Type`:`application/json`
  5. data:
  
           {
             "jsonrpc":"2.0",
             "method":"getCredentials",
             "params":{"userId":"5538bae26769ccc4a6749e64"}
           }