const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'album.js'), 'utf8');
const values = {
  'album-facebookPreset': 'square-grid',
  'album-ratio': 'auto',
  'album-previewLayout': 'auto'
};
const document = {
  getElementById(id){
    return Object.prototype.hasOwnProperty.call(values,id)
      ? {value: values[id], checked: false, setAttribute(){}}
      : null;
  },
  addEventListener(){},
  querySelector(){ return null; },
  querySelectorAll(){ return []; }
};
const context = {
  console, document, TextEncoder, Uint8Array, Blob,
  URL: {createObjectURL(){ return 'blob:test'; }, revokeObjectURL(){}},
  Image: function(){}, alert(){}, setTimeout(){},
  window: {}
};
vm.runInNewContext(source, context, {filename: 'album.js'});
const api = context.window.TANJAI_ALBUM_PRO._test;

assert.deepStrictEqual({...api.slotSize(0)}, {w:1080,h:1080});
assert.deepStrictEqual({...api.slotSize(1)}, {w:1080,h:1080});

values['album-facebookPreset'] = 'wide-top';
assert.deepStrictEqual({...api.slotSize(0)}, {w:1080,h:800});
assert.deepStrictEqual({...api.slotSize(1)}, {w:1080,h:1080});

values['album-facebookPreset'] = 'portrait-left';
assert.deepStrictEqual({...api.slotSize(0)}, {w:1280,h:1920});
assert.deepStrictEqual({...api.slotSize(3)}, {w:1080,h:1080});

assert.strictEqual(api.resolveFacebookPreset('auto',1080,1080),'square-grid');
assert.strictEqual(api.resolveFacebookPreset('auto',1600,900),'wide-top');
assert.strictEqual(api.resolveFacebookPreset('auto',900,1600),'portrait-left');
assert.strictEqual(api.presetLayout('square-grid'),'grid');
assert.strictEqual(api.presetLayout('wide-top'),'cover-top');
assert.strictEqual(api.presetLayout('portrait-left'),'cover-left');

console.log(JSON.stringify({presets:3,autoSelection:true,slotSizes:true,status:'PASS'},null,2));
