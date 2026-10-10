import test from 'node:test';
import assert from 'node:assert/strict';
import {translate} from '../src/lib/i18n/copy';
import {flowers} from '../src/lib/flowers/catalog';
import {templates,sizes,heights} from '../src/lib/design/templates';
test('Telugu covers all template filters, flower names and color choices',()=>{
 const labels=[...templates.flatMap(t=>[t.name,t.shape,t.tone,t.arrangement]),...Object.values(sizes).map(s=>s.name),...Object.values(heights).map(h=>h.name),...flowers.flatMap(f=>[f.name,f.description,...f.colors.map(c=>c.name)])];
 for(const label of labels)assert.notEqual(translate(label,'te'),label,`Missing Telugu: ${label}`);
});
test('language changes UI counts while English and unknown text stay intact',()=>{
 assert.equal(translate('7 layers','te'),'7 వరుసలు');
 assert.equal(translate('Layer 03 selected','te'),'వరుస 03 ఎంపికైంది');
 assert.equal(translate('Studio','en'),'Studio');
 assert.equal(translate('My personal title','te'),'My personal title');
});
